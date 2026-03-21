//go:build wireinject
// +build wireinject

package wire

import (
	"fmt"

	"backend/internal/handler"
	"backend/internal/job"
	"backend/internal/repository"
	"backend/internal/server"
	"backend/internal/service"
	"backend/pkg/app"
	"backend/pkg/audit"
	"backend/pkg/crypto"
	"backend/pkg/email"
	"backend/pkg/jwt"
	"backend/pkg/log"
	"backend/pkg/server/http"
	"backend/pkg/sid"

	"github.com/google/wire"
	"github.com/spf13/viper"
)

var repositorySet = wire.NewSet(
	repository.NewDB,
	repository.NewCache,
	repository.NewRepository,
	repository.NewTransaction,
	repository.NewTokenStore,
	repository.NewCasbinEnforcer,
	repository.NewUserRepository,
	repository.NewAvatarStorage,
	repository.NewRoleRepository,
	repository.NewMenuRepository,
	repository.NewApiRepository,
	repository.NewSettingRepository,
	// more biz repository
	repository.NewItemRepository,
	repository.NewModelRepository,
)

var serviceSet = wire.NewSet(
	service.NewService,
	service.NewAuthService,
	service.NewUserService,
	service.NewRoleService,
	service.NewMenuService,
	service.NewApiService,
	service.NewSettingService,
	// more biz service
	service.NewItemService,
	service.NewModelService,
)

var handlerSet = wire.NewSet(
	handler.NewHandler,
	handler.NewAuthHandler,
	handler.NewUserHandler,
	handler.NewRoleHandler,
	handler.NewMenuHandler,
	handler.NewApiHandler,
	handler.NewSettingHandler,
	// more biz handler
	handler.NewItemHandler,
	handler.NewModelHandler,
)

var jobSet = wire.NewSet(
	job.NewJob,
	job.NewUserJob,
)
var serverSet = wire.NewSet(
	server.NewHTTPServer,
	server.NewJobServer,
)

// NewModelEncryptionService provider
func NewModelEncryptionService(*viper.Viper) (*crypto.ModelEncryptionService, error) {
	key := viper.GetString("app.model_encryption_key")
	if key == "" {
		key = "default-32-byte-key-for-dev!!" // fallback for development
	}
	// Ensure key is exactly 32 bytes
	if len(key) < 32 {
		key = fmt.Sprintf("%-32s", key)[:32]
	} else if len(key) > 32 {
		key = key[:32]
	}
	return crypto.NewModelEncryptionService(key)
}

// build App
func newApp(
	httpServer *http.Server,
	jobServer *server.JobServer,
) *app.App {
	return app.NewApp(
		app.WithServer(httpServer, jobServer),
		app.WithName("demo-server"),
	)
}

func NewWire(*viper.Viper, *log.Logger) (*app.App, func(), error) {
	panic(wire.Build(
		repositorySet,
		serviceSet,
		handlerSet,
		jobSet,
		serverSet,
		sid.NewSid,
		jwt.NewJwt,
		email.NewService,
		audit.NewAudit,
		NewModelEncryptionService,
		newApp,
	))
}
