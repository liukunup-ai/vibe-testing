package handler

import (
	"backend/api/v1"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/test/mocks/service"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"gorm.io/gorm"
)

func TestApiHandler_GetApi(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	expectedApi := model.Api{
		Model: gorm.Model{ID: 1},
		Name:  "Test API",
		Path:  "/api/test",
	}

	mockApiService.EXPECT().Get(gomock.Any(), uint(1)).Return(expectedApi, nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.GET("/admin/apis/:id", apiHandler.GetApi)

	obj := newHttpExcept(t, testRouter).GET("/v1/admin/apis/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("id").IsEqual(uint(1))
}

func TestApiHandler_GetApi_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Get(gomock.Any(), gomock.Any()).Return(model.Api{}, v1.ErrBadRequest)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.GET("/admin/apis/:id", apiHandler.GetApi)

	obj := newHttpExcept(t, testRouter).GET("/v1/admin/apis/999").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}

func TestApiHandler_ListApis(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	expectedApis := []v1.ApiDataItem{
		{ID: 1, Name: "API 1", Path: "/api/1"},
		{ID: 2, Name: "API 2", Path: "/api/2"},
	}
	expectedResponse := &v1.ApiSearchResponseData{
		List:  expectedApis,
		Total: 2,
	}

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().List(gomock.Any(), gomock.Any()).Return(expectedResponse, nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.GET("/admin/apis", apiHandler.ListApis)

	obj := newHttpExcept(t, testRouter).GET("/v1/admin/apis").
		WithQuery("page", 1).
		WithQuery("pageSize", 10).
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("total").IsEqual(int64(2))
	objData.Value("list").Array().Length().IsEqual(2)
}

func TestApiHandler_CreateApi(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	req := v1.ApiRequest{
		Name: "New API",
		Path: "/api/new",
	}

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.POST("/admin/apis", apiHandler.CreateApi)

	obj := newHttpExcept(t, testRouter).POST("/v1/admin/apis").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

func TestApiHandler_CreateApi_EmptyName(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	req := v1.ApiRequest{
		Name: "", // Empty name - handler doesn't validate
		Path: "/api/new",
	}

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.POST("/admin/apis", apiHandler.CreateApi)

	obj := newHttpExcept(t, testRouter).POST("/v1/admin/apis").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
}

func TestApiHandler_UpdateApi(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Update(gomock.Any(), uint(1), gomock.Any()).Return(nil)

	req := v1.ApiRequest{
		Name: "Updated API",
		Path: "/api/updated",
	}

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.PUT("/admin/apis/:id", apiHandler.UpdateApi)

	obj := newHttpExcept(t, testRouter).PUT("/v1/admin/apis/1").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

func TestApiHandler_UpdateApi_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Update(gomock.Any(), gomock.Any(), gomock.Any()).Return(v1.ErrBadRequest)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.PUT("/admin/apis/:id", apiHandler.UpdateApi)

	obj := newHttpExcept(t, testRouter).PUT("/v1/admin/apis/999").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(v1.ApiRequest{
			Name: "Test",
			Path: "/test",
		}).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}

func TestApiHandler_DeleteApi(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().Delete(gomock.Any(), gomock.Any()).Return(nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.DELETE("/admin/apis/:id", apiHandler.DeleteApi)

	obj := newHttpExcept(t, testRouter).DELETE("/v1/admin/apis/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

func TestApiHandler_GetApiRoles(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	expectedApiIds := []uint{1, 2, 3}

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().GetRoles(gomock.Any(), uint(1)).Return(expectedApiIds, nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.GET("/admin/apis/:id/roles", apiHandler.GetApiRoles)

	obj := newHttpExcept(t, testRouter).GET("/v1/admin/apis/1/roles").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	// Check that data is an object with roleIds field
	dataObj := obj.Value("data").Object()
	roleIdsArray := dataObj.Value("roleIds").Array()
	roleIdsArray.Length().IsEqual(3)
	roleIdsArray.Element(0).IsEqual(1)
	roleIdsArray.Element(1).IsEqual(2)
	roleIdsArray.Element(2).IsEqual(3)
}
func TestApiHandler_UpdateApiRoles(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	newApiIds := []uint{1, 2, 3, 4}

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().UpdateRoles(gomock.Any(), uint(1), newApiIds).Return(nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.PUT("/admin/apis/:id/roles", apiHandler.UpdateApiRoles)

	obj := newHttpExcept(t, testRouter).PUT("/v1/admin/apis/1/roles").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(v1.UpdateApiRolesRequest{
			RoleIds: newApiIds,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

func TestApiHandler_UpdateApiRoles_InvalidCount(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	newApiIds := []uint{} // Empty array - handler doesn't validate

	mockApiService := mock_service.NewMockApiService(ctrl)
	mockApiService.EXPECT().UpdateRoles(gomock.Any(), uint(1), newApiIds).Return(nil)

	apiHandler := handler.NewApiHandler(hdl, mockApiService)
	testRouter := gin.New()
	v1Group := testRouter.Group("/v1")
	v1Group.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	v1Group.PUT("/admin/apis/:id/roles", apiHandler.UpdateApiRoles)

	obj := newHttpExcept(t, testRouter).PUT("/v1/admin/apis/1/roles").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(v1.UpdateApiRolesRequest{
			RoleIds: newApiIds,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
}

