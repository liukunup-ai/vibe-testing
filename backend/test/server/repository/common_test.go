package repository_test

import (
	"os"
	"testing"

	"backend/internal/model"
	"backend/pkg/log"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	testDB     *gorm.DB
	testLogger *log.Logger
	testCfg    *viper.Viper
)

func TestMain(m *testing.M) {
	// Setup test database (in-memory SQLite)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database: " + err.Error())
	}
	testDB = db

	// Auto migrate tables
	err = db.AutoMigrate(
		&model.User{},
		&model.Role{},
		&model.Api{},
		&model.Menu{},
		&model.Item{},
		&model.Setting{},
	)
	if err != nil {
		panic("failed to migrate database: " + err.Error())
	}

	// Setup logger
	cfg := viper.New()
	cfg.Set("log.level", "warn")
	testLogger = log.NewLog(cfg)
	testCfg = cfg

	// Run tests
	code := m.Run()

	// Cleanup
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.Close()
	}

	os.Exit(code)
}

func setupDB(t *testing.T) *gorm.DB {
	require.NotNil(t, testDB)
	return testDB
}
