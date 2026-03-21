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

func TestRoleHandler_ListRoles(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().List(gomock.Any(), gomock.Any()).Return(&v1.RoleSearchResponseData{
		Total: 2,
		List: []v1.RoleDataItem{
			{ID: 1, Name: "Admin", CasbinRole: "admin"},
			{ID: 2, Name: "User", CasbinRole: "user"},
		},
	}, nil)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/roles", roleHandler.ListRoles)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/roles").
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
	objData.Value("total").IsEqual(2)
	objData.Value("list").Array().Length().IsEqual(2)
}

func TestRoleHandler_CreateRole(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	params := v1.RoleRequest{Name: "New Role", CasbinRole: "newrole"}

	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().Create(gomock.Any(), &params).Return(nil)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/roles", roleHandler.CreateRole)

	e := newHttpExcept(t, router)
	obj := e.POST("/admin/roles").
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

func TestRoleHandler_UpdateRole(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	roleId := uint(1)
	params := v1.RoleRequest{Name: "Updated Role", CasbinRole: "updatedrole"}

	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().Update(gomock.Any(), roleId, &params).Return(nil)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/roles/:id", roleHandler.UpdateRole)

	e := newHttpExcept(t, router)
	obj := e.PUT("/admin/roles/1").
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

func TestRoleHandler_DeleteRole(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	roleId := uint(1)
	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().Delete(gomock.Any(), roleId).Return(nil)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.DELETE("/admin/roles/:id", roleHandler.DeleteRole)

	e := newHttpExcept(t, router)
	obj := e.DELETE("/admin/roles/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

// GetRolePermissions tests
func TestRoleHandler_GetRolePermissions(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	casbinRole := "admin"
	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().GetPermissions(gomock.Any(), casbinRole).Return(&v1.GetRolePermissionResponseData{
		List:  []string{"user:read", "user:write"},
		Total: 2,
	}, nil)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	testRouter.GET("/admin/roles/permissions", roleHandler.GetRolePermissions)

	// Use POST with JSON body since handler uses ShouldBind
	testRouter.POST("/admin/roles/permissions", roleHandler.GetRolePermissions)

	obj := newHttpExcept(t, testRouter).POST("/admin/roles/permissions").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{"casbinRole": casbinRole}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("total").IsEqual(2)
	objData.Value("list").Array().Length().IsEqual(2)
}

func TestRoleHandler_GetRolePermissions_InvalidRequest(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleService := mock_service.NewMockRoleService(ctrl)
	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)

	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	testRouter.POST("/admin/roles/permissions", roleHandler.GetRolePermissions)

	obj := newHttpExcept(t, testRouter).POST("/admin/roles/permissions").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{}).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}

func TestRoleHandler_GetRolePermissions_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	casbinRole := "admin"
	mockRoleService := mock_service.NewMockRoleService(ctrl)
	mockRoleService.EXPECT().GetPermissions(gomock.Any(), casbinRole).Return(nil, v1.ErrInternalServerError)

	roleHandler := handler.NewRoleHandler(hdl, mockRoleService)
	testRouter := gin.New()
	testRouter.Use(middleware.CORSMiddleware(), middleware.StrictAuth(jwt, logger))
	testRouter.POST("/admin/roles/permissions", roleHandler.GetRolePermissions)

	obj := newHttpExcept(t, testRouter).POST("/admin/roles/permissions").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{"casbinRole": casbinRole}).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object()
	obj.Value("success").IsEqual(false)
}
