package server

import (
	apiV1 "backend/api/v1"
	"backend/docs"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/pkg/jwt"
	"backend/pkg/log"
	"backend/pkg/server/http"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func NewHTTPServer(
	logger *log.Logger,
	conf *viper.Viper,
	jwt *jwt.JWT,
	e *casbin.SyncedEnforcer,
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	roleHandler *handler.RoleHandler,
	menuHandler *handler.MenuHandler,
	apiHandler *handler.ApiHandler,
	settingHandler *handler.SettingHandler,
	itemHandler *handler.ItemHandler,
	projectHandler *handler.ProjectHandler,
	caseHandler *handler.TestCaseHandler,
	suiteHandler *handler.TestSuiteHandler,
	planHandler *handler.TestPlanHandler,
	recordHandler *handler.TestRecordHandler,
	deviceHandler *handler.DeviceHandler,
	userFeedbackHandler *handler.UserFeedbackHandler,
	bugHandler *handler.BugHandler,
	requirementHandler *handler.RequirementHandler,
	aiProviderHandler *handler.AIProviderHandler,
	aiAnalysisResultHandler *handler.AIAnalysisResultHandler,
) *http.Server {
	gin.SetMode(gin.DebugMode)
	s := http.NewServer(
		gin.Default(),
		logger,
		http.WithServerHost(conf.GetString("http.host")),
		http.WithServerPort(conf.GetInt("http.port")),
		http.WithCertFiles(conf.GetString("http.cert_file"), conf.GetString("http.key_file")),
	)

	// swagger doc
	docs.SwaggerInfo.BasePath = "/"
	s.GET("/swagger/*any", ginSwagger.WrapHandler(
		swaggerfiles.Handler,
		//ginSwagger.URL(fmt.Sprintf("http://localhost:%d/swagger/doc.json", conf.GetInt("app.http.port"))),
		ginSwagger.DefaultModelsExpandDepth(-1),
		ginSwagger.PersistAuthorization(true),
	))

	s.Use(
		middleware.CORSMiddleware(),
		middleware.ResponseLogMiddleware(logger),
		middleware.RequestLogMiddleware(logger),
		//middleware.SignMiddleware(log),
	)
	s.GET("/", func(ctx *gin.Context) {
		logger.WithContext(ctx).Info("hello")
		apiV1.HandleSuccess(ctx, map[string]interface{}{
			":)": "Thank you for using nunu!",
		})
	})

	// Serve local avatar files
	s.Static("/storage/avatar", "./storage/avatar")

	s.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"time":    time.Now().UTC().Format(time.RFC3339),
			"version": "v1",
		})
	})

	v1 := s.Group("/v1")
	{
		// No route group has permission
		noAuthRouter := v1.Group("/")
		{
			noAuthRouter.GET("/settings", settingHandler.GetSiteSetting)
			noAuthRouter.POST("/register", authHandler.Register)
			noAuthRouter.POST("/login", authHandler.Login)
			noAuthRouter.POST("/forgot-password", authHandler.ForgotPassword)
			noAuthRouter.POST("/reset-password", authHandler.ResetPassword)
			noAuthRouter.POST("/refresh-token", authHandler.RefreshToken)
			noAuthRouter.POST("/auth/oidc", authHandler.OIDCAuth)
		}

		// Non-strict permission routing group
		noStrictAuthRouter := v1.Group("/").Use(middleware.NoStrictAuth(jwt, logger))
		{
			// User
			noStrictAuthRouter.GET("/users/:id", userHandler.GetUserByID)
		}

		// Strict permission routing group
		strictAuthRouter := v1.Group("/", middleware.StrictAuth(jwt, logger), middleware.AuthMiddleware(e))
		{
			// User
			strictAuthRouter.GET("/users/profile", userHandler.GetProfile)
			strictAuthRouter.PUT("/users/profile", userHandler.UpdateProfile)
			strictAuthRouter.POST("/users/profile/avatar", userHandler.UploadAvatar)
			strictAuthRouter.GET("/users/menu", userHandler.GetMenu)
			strictAuthRouter.PUT("/users/password", userHandler.UpdatePassword)
			strictAuthRouter.POST("/logout", authHandler.Logout)

			// Admin User
			strictAuthRouter.GET("/admin/users", userHandler.ListUsers)
			strictAuthRouter.POST("/admin/users", userHandler.CreateUser)
			strictAuthRouter.PUT("/admin/users/:id", userHandler.UpdateUser)
			strictAuthRouter.DELETE("/admin/users/:id", userHandler.DeleteUser)
			strictAuthRouter.POST("/admin/users/:id/send-reset-email", userHandler.SendResetEmail)
			strictAuthRouter.POST("/admin/users/:id/revoke-sessions", userHandler.RevokeSessions)
			strictAuthRouter.PUT("/admin/users/:id/status", userHandler.UpdateStatus)
			strictAuthRouter.PUT("/admin/users/:id/reset-avatar", userHandler.ResetAvatar)

			// Admin Role
			strictAuthRouter.GET("/admin/roles", roleHandler.ListRoles)
			strictAuthRouter.POST("/admin/roles", roleHandler.CreateRole)
			strictAuthRouter.PUT("/admin/roles/:id", roleHandler.UpdateRole)
			strictAuthRouter.DELETE("/admin/roles/:id", roleHandler.DeleteRole)
			// Admin Role Permission API
			strictAuthRouter.GET("/admin/roles/permissions", roleHandler.GetRolePermissions)
			strictAuthRouter.PUT("/admin/roles/permissions", roleHandler.UpdateRolePermissions)
			strictAuthRouter.GET("/admin/roles/:id/apis", roleHandler.GetRoleApis)
			strictAuthRouter.PUT("/admin/roles/:id/apis", roleHandler.UpdateRoleApis)

			// Admin Menu
			strictAuthRouter.GET("/admin/menus", menuHandler.ListMenus)
			strictAuthRouter.POST("/admin/menus", menuHandler.CreateMenu)
			strictAuthRouter.PUT("/admin/menus/:id", menuHandler.UpdateMenu)
			strictAuthRouter.DELETE("/admin/menus/:id", menuHandler.DeleteMenu)

			// Admin API
			strictAuthRouter.GET("/admin/apis", apiHandler.ListApis)
			strictAuthRouter.POST("/admin/apis", apiHandler.CreateApi)
			strictAuthRouter.PUT("/admin/apis/:id", apiHandler.UpdateApi)
			strictAuthRouter.DELETE("/admin/apis/:id", apiHandler.DeleteApi)
			strictAuthRouter.GET("/admin/apis/:id/roles", apiHandler.GetApiRoles)
			strictAuthRouter.PUT("/admin/apis/:id/roles", apiHandler.UpdateApiRoles)

			// Admin Setting
			strictAuthRouter.GET("/admin/settings", settingHandler.GetSetting)
			strictAuthRouter.PUT("/admin/settings", settingHandler.UpdateSetting)
			strictAuthRouter.POST("/admin/settings/test-email", settingHandler.TestEmail)

			// Item
			strictAuthRouter.GET("/items", itemHandler.ListItems)
			strictAuthRouter.POST("/items", itemHandler.CreateItem)
			strictAuthRouter.PUT("/items/:id", itemHandler.UpdateItem)
			strictAuthRouter.DELETE("/items/:id", itemHandler.DeleteItem)
			strictAuthRouter.GET("/items/:id", itemHandler.GetItem)

			// Project
			strictAuthRouter.GET("/projects", projectHandler.ListProjects)
			strictAuthRouter.POST("/projects", projectHandler.CreateProject)
			strictAuthRouter.PUT("/projects/:id", projectHandler.UpdateProject)
			strictAuthRouter.DELETE("/projects/:id", projectHandler.DeleteProject)
			strictAuthRouter.GET("/projects/:id", projectHandler.GetProject)

			// TestCase
			strictAuthRouter.GET("/testcases", caseHandler.ListTestCases)
			strictAuthRouter.POST("/testcases", caseHandler.CreateTestCase)
			strictAuthRouter.PUT("/testcases/:id", caseHandler.UpdateTestCase)
			strictAuthRouter.DELETE("/testcases/:id", caseHandler.DeleteTestCase)
			strictAuthRouter.GET("/testcases/:id", caseHandler.GetTestCase)

			// TestSuite
			strictAuthRouter.GET("/testsuites", suiteHandler.ListTestSuites)
			strictAuthRouter.POST("/testsuites", suiteHandler.CreateTestSuite)
			strictAuthRouter.PUT("/testsuites/:id", suiteHandler.UpdateTestSuite)
			strictAuthRouter.DELETE("/testsuites/:id", suiteHandler.DeleteTestSuite)
			strictAuthRouter.GET("/testsuites/:id", suiteHandler.GetTestSuite)

			// TestPlan
			strictAuthRouter.GET("/testplans", planHandler.ListTestPlans)
			strictAuthRouter.POST("/testplans", planHandler.CreateTestPlan)
			strictAuthRouter.PUT("/testplans/:id", planHandler.UpdateTestPlan)
			strictAuthRouter.DELETE("/testplans/:id", planHandler.DeleteTestPlan)
			strictAuthRouter.GET("/testplans/:id", planHandler.GetTestPlan)

			// TestRecord
			strictAuthRouter.GET("/testrecords", recordHandler.ListTestRecords)
			strictAuthRouter.POST("/testrecords", recordHandler.CreateTestRecord)
			strictAuthRouter.DELETE("/testrecords/:id", recordHandler.DeleteTestRecord)
			strictAuthRouter.GET("/testrecords/:id", recordHandler.GetTestRecord)

			// Device
			strictAuthRouter.GET("/devices", deviceHandler.ListDevices)
			strictAuthRouter.POST("/devices", deviceHandler.CreateDevice)
			strictAuthRouter.PUT("/devices/:id", deviceHandler.UpdateDevice)
			strictAuthRouter.DELETE("/devices/:id", deviceHandler.DeleteDevice)
			strictAuthRouter.GET("/devices/:id", deviceHandler.GetDevice)
			strictAuthRouter.POST("/devices/heartbeat", deviceHandler.DeviceHeartbeat)

			// UserFeedback
			strictAuthRouter.GET("/feedbacks", userFeedbackHandler.ListUserFeedbacks)
			strictAuthRouter.POST("/feedbacks", userFeedbackHandler.CreateUserFeedback)
			strictAuthRouter.PUT("/feedbacks/:id", userFeedbackHandler.UpdateUserFeedback)
			strictAuthRouter.DELETE("/feedbacks/:id", userFeedbackHandler.DeleteUserFeedback)
			strictAuthRouter.GET("/feedbacks/:id", userFeedbackHandler.GetUserFeedback)

			// Bug
			strictAuthRouter.GET("/bugs", bugHandler.ListBugs)
			strictAuthRouter.POST("/bugs", bugHandler.CreateBug)
			strictAuthRouter.PUT("/bugs/:id", bugHandler.UpdateBug)
			strictAuthRouter.DELETE("/bugs/:id", bugHandler.DeleteBug)
			strictAuthRouter.GET("/bugs/:id", bugHandler.GetBug)

			// Requirement
			strictAuthRouter.GET("/requirements", requirementHandler.ListRequirements)
			strictAuthRouter.POST("/requirements", requirementHandler.CreateRequirement)
			strictAuthRouter.PUT("/requirements/:id", requirementHandler.UpdateRequirement)
			strictAuthRouter.DELETE("/requirements/:id", requirementHandler.DeleteRequirement)
			strictAuthRouter.GET("/requirements/:id", requirementHandler.GetRequirement)

			// AIProvider
			strictAuthRouter.GET("/aiproviders", aiProviderHandler.ListAIProviders)
			strictAuthRouter.POST("/aiproviders", aiProviderHandler.CreateAIProvider)
			strictAuthRouter.PUT("/aiproviders/:id", aiProviderHandler.UpdateAIProvider)
			strictAuthRouter.DELETE("/aiproviders/:id", aiProviderHandler.DeleteAIProvider)
			strictAuthRouter.GET("/aiproviders/:id", aiProviderHandler.GetAIProvider)

			// AIAnalysisResult
			strictAuthRouter.GET("/aianalyses", aiAnalysisResultHandler.ListAIAnalysisResults)
			strictAuthRouter.POST("/aianalyses", aiAnalysisResultHandler.CreateAIAnalysisResult)
			strictAuthRouter.PUT("/aianalyses/:id", aiAnalysisResultHandler.UpdateAIAnalysisResult)
			strictAuthRouter.DELETE("/aianalyses/:id", aiAnalysisResultHandler.DeleteAIAnalysisResult)
			strictAuthRouter.GET("/aianalyses/:id", aiAnalysisResultHandler.GetAIAnalysisResult)
		}
	}

	return s
}
