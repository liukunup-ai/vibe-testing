//go:build wireinject
// +build wireinject

package wire

import (
	"backend/internal/handler"
	"backend/internal/job"
	"backend/internal/repository"
	"backend/internal/server"
	"backend/internal/service"
	"backend/pkg/app"
	"backend/pkg/audit"
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
)

var jobSet = wire.NewSet(
	job.NewJob,
	job.NewUserJob,
)
var serverSet = wire.NewSet(
	server.NewHTTPServer,
	server.NewJobServer,
)

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
		newApp,
	))
}
