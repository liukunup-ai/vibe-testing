package repository

import (
	"context"
	"fmt"
	"time"

	"backend/internal/model"
	"backend/pkg/log"
	"backend/pkg/redis"
	"backend/pkg/storage"
	"backend/pkg/zapgorm2"

	"go.uber.org/zap"

	"github.com/casbin/casbin/v2"
	casbinmodel "github.com/casbin/casbin/v2/model"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/dgraph-io/ristretto/v2"
	"github.com/glebarez/sqlite"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const ctxTxKey = "TxKey"

type Repository struct {
	db     *gorm.DB
	e      *casbin.SyncedEnforcer
	cache  *ristretto.Cache[string, interface{}]
	logger *log.Logger
}

func NewRepository(
	db *gorm.DB,
	e *casbin.SyncedEnforcer,
	cache *ristretto.Cache[string, interface{}],
	logger *log.Logger,
) *Repository {
	// Initialize redis and storage packages with logger
	redis.Init(logger.Logger)
	storage.Init(logger.Logger)

	repo := &Repository{
		db:     db,
		e:      e,
		cache:  cache,
		logger: logger,
	}

	// Load runtime config (Redis, Storage) from database on startup
	ctx := context.Background()
	if err := repo.UpdateRuntimeConfig(ctx); err != nil {
		logger.Warn("failed to load runtime config on startup", zap.Error(err))
	}

	return repo
}

type Transaction interface {
	Transaction(ctx context.Context, fn func(ctx context.Context) error) error
}

func NewTransaction(r *Repository) Transaction {
	return r
}

// DB return tx
// If you need to create a Transaction, you must call DB(ctx) and Transaction(ctx,fn)
func (r *Repository) DB(ctx context.Context) *gorm.DB {
	v := ctx.Value(ctxTxKey)
	if v != nil {
		if tx, ok := v.(*gorm.DB); ok {
			return tx
		}
	}
	return r.db.WithContext(ctx)
}

func (r *Repository) Transaction(ctx context.Context, fn func(ctx context.Context) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		ctx = context.WithValue(ctx, ctxTxKey, tx)
		return fn(ctx)
	})
}

func NewDB(conf *viper.Viper, l *log.Logger) *gorm.DB {
	var (
		db  *gorm.DB
		err error
	)

	logger := zapgorm2.New(l.Logger)
	driver := conf.GetString("db.driver")
	dsn := conf.GetString("db.dsn")

	switch driver {
	case "mysql":
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger,
		})
	case "postgres":
		db, err = gorm.Open(postgres.New(postgres.Config{
			DSN:                  dsn,
			PreferSimpleProtocol: true,
		}), &gorm.Config{})
	case "sqlite":
		db, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	default:
		panic("unknown db driver")
	}
	if err != nil {
		panic(err)
	}
	db = db.Debug()

	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	return db
}

func NewCasbinEnforcer(db *gorm.DB) *casbin.SyncedEnforcer {
	a, _ := gormadapter.NewAdapterByDB(db)
	m, err := casbinmodel.NewModelFromString(`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`)

	if err != nil {
		panic(err)
	}
	e, _ := casbin.NewSyncedEnforcer(m, a)
	e.StartAutoLoadPolicy(10 * time.Second) // 每10秒自动加载策略，防止启动多服务进程策略不一致
	e.EnableAutoSave(true)
	return e
}

func NewCache() *ristretto.Cache[string, interface{}] {
	cache, err := ristretto.NewCache(&ristretto.Config[string, interface{}]{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		panic(fmt.Errorf("failed to create Ristretto cache: %w", err))
	}
	return cache
}

// UpdateRuntimeConfig updates Redis and Storage clients from database settings
func (r *Repository) UpdateRuntimeConfig(ctx context.Context) error {
	settings, err := r.getAllSettings(ctx)
	if err != nil {
		return err
	}

	// Update Redis
	redisCfg := redis.ParseConfig(settings)
	redis.Configure(redisCfg)

	// Update Storage
	storageCfg := storage.ParseConfig(settings)
	storage.Configure(storageCfg)

	return nil
}

func (r *Repository) getAllSettings(ctx context.Context) (map[string]string, error) {
	var settings []model.Setting
	if err := r.db.WithContext(ctx).Find(&settings).Error; err != nil {
		return nil, err
	}
	settingMap := make(map[string]string)
	for _, s := range settings {
		settingMap[s.Key] = s.Value
	}
	return settingMap, nil
}
