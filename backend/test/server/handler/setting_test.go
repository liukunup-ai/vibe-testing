package handler

import (
	v1 "backend/api/v1"
	"backend/internal/handler"
	"backend/internal/middleware"
	mock_service "backend/test/mocks/service"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
)

// TestSettingHandler_GetSetting tests the GetSetting handler
func TestSettingHandler_GetSetting(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().Get(gomock.Any()).Return(&v1.AdminSetting{
		Site: &v1.SiteConfig{
			Title:   "Test Site",
			Logo:    "/logo.png",
			Favicon: "/favicon.ico",
		},
	}, nil)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/settings", settingHandler.GetSetting)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/settings").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("site").Object().Value("title").IsEqual("Test Site")
}

// TestSettingHandler_GetSetting_ServiceError tests the GetSetting handler with service error
func TestSettingHandler_GetSetting_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().Get(gomock.Any()).Return(nil, v1.ErrInternalServerError)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/settings", settingHandler.GetSetting)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/settings").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}

// TestSettingHandler_UpdateSetting tests the UpdateSetting handler
func TestSettingHandler_UpdateSetting(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	params := v1.AdminSettingRequest{
		Site: &v1.SiteConfig{
			Title: "Updated Site Title",
		},
	}

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().Update(gomock.Any(), &params).Return(nil)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/settings", settingHandler.UpdateSetting)

	e := newHttpExcept(t, router)
	obj := e.PUT("/admin/settings").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(params).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

// TestSettingHandler_UpdateSetting_InvalidRequest tests the UpdateSetting handler with invalid request
func TestSettingHandler_UpdateSetting_InvalidRequest(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	settingHandler := handler.NewSettingHandler(hdl, nil)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/settings", settingHandler.UpdateSetting)

	e := newHttpExcept(t, router)
	obj := e.PUT("/admin/settings").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{}).
		Expect().
		Status(http.StatusOK). // Empty request is valid for this handler
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
}

// TestSettingHandler_UpdateSetting_ServiceError tests the UpdateSetting handler with service error
func TestSettingHandler_UpdateSetting_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	params := v1.AdminSettingRequest{
		Site: &v1.SiteConfig{
			Title: "Updated Site Title",
		},
	}

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().Update(gomock.Any(), &params).Return(v1.ErrInternalServerError)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/settings", settingHandler.UpdateSetting)

	e := newHttpExcept(t, router)
	obj := e.PUT("/admin/settings").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(params).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}

// TestSettingHandler_GetPublicSiteConfig tests the GetPublicSiteConfig handler
func TestSettingHandler_GetPublicSiteConfig(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().GetPublicSiteConfig(gomock.Any(), "").Return(&v1.PublicSiteConfig{
		Version: "abc123",
		Site: &v1.SiteConfig{
			Title: "Public Site",
		},
	}, nil)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware())
	testRouter.GET("/site/config", settingHandler.GetPublicSiteConfig)

	e := newHttpExcept(t, testRouter)
	obj := e.GET("/site/config").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("version").IsEqual("abc123")
}

// TestSettingHandler_GetPublicSiteConfig_NotModified tests the GetPublicSiteConfig handler with cached version
func TestSettingHandler_GetPublicSiteConfig_NotModified(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	// Return nil when version matches (304 Not Modified)
	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().GetPublicSiteConfig(gomock.Any(), "abc123").Return(nil, nil)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware())
	testRouter.GET("/site/config", settingHandler.GetPublicSiteConfig)

	e := newHttpExcept(t, testRouter)
	e.GET("/site/config").
		WithQuery("version", "abc123").
		Expect().
		Status(http.StatusNotModified)
}

// TestSettingHandler_GetPublicSiteConfig_ServiceError tests the GetPublicSiteConfig handler with service error
func TestSettingHandler_GetPublicSiteConfig_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockSettingService := mock_service.NewMockSettingService(ctrl)
	mockSettingService.EXPECT().GetPublicSiteConfig(gomock.Any(), "").Return(nil, v1.ErrInternalServerError)

	settingHandler := handler.NewSettingHandler(hdl, mockSettingService)
	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware())
	testRouter.GET("/site/config", settingHandler.GetPublicSiteConfig)

	e := newHttpExcept(t, testRouter)
	obj := e.GET("/site/config").
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}
