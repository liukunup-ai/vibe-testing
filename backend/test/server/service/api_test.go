package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/service"
	mock_repository "backend/test/mocks/repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// ==================== Get Tests ====================

func TestApiService_Get_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)

	expectedApi := model.Api{
		Model:    gorm.Model{ID: apiID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Group:    "User",
		Name:     "GetUser",
		Path:     "/api/user/:id",
		Method:   "GET",
		IsPublic: false,
	}

	mockApiRepo.EXPECT().Get(ctx, apiID).Return(expectedApi, nil)

	result, err := apiService.Get(ctx, apiID)

	assert.NoError(t, err)
	assert.Equal(t, apiID, result.ID)
	assert.Equal(t, "User", result.Group)
	assert.Equal(t, "GetUser", result.Name)
	assert.Equal(t, "/api/user/:id", result.Path)
	assert.Equal(t, "GET", result.Method)
}

func TestApiService_Get_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(999)

	mockApiRepo.EXPECT().Get(ctx, apiID).Return(model.Api{}, gorm.ErrRecordNotFound)

	result, err := apiService.Get(ctx, apiID)

	assert.Error(t, err)
	assert.Equal(t, gorm.ErrRecordNotFound, err)
	assert.Equal(t, uint(0), result.ID)
}

func TestApiService_Get_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	dbError := errors.New("database connection error")

	mockApiRepo.EXPECT().Get(ctx, apiID).Return(model.Api{}, dbError)

	result, err := apiService.Get(ctx, apiID)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
	assert.Equal(t, uint(0), result.ID)
}

// ==================== List Tests ====================

func TestApiService_List_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	req := &v1.ApiSearchRequest{
		Page:     1,
		PageSize: 10,
		Group:    "User",
		Name:     "Get",
		Path:     "/api",
		Method:   "GET",
	}

	apis := []model.Api{
		{
			Model:    gorm.Model{ID: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			Group:    "User",
			Name:     "GetUser",
			Path:     "/api/user/:id",
			Method:   "GET",
			IsPublic: false,
		},
		{
			Model:    gorm.Model{ID: 2, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			Group:    "User",
			Name:     "ListUsers",
			Path:     "/api/users",
			Method:   "GET",
			IsPublic: true,
		},
	}

	mockApiRepo.EXPECT().List(ctx, req).Return(apis, int64(2), nil)
	mockApiRepo.EXPECT().CountRolePermissions(ctx, "/api/user/:id", "GET").Return(int64(3), nil)
	mockApiRepo.EXPECT().CountRolePermissions(ctx, "/api/users", "GET").Return(int64(5), nil)

	result, err := apiService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, int64(2), result.Total)
	assert.Len(t, result.List, 2)
	assert.Equal(t, "GetUser", result.List[0].Name)
	assert.Equal(t, int64(3), result.List[0].RoleCount)
	assert.Equal(t, int64(5), result.List[1].RoleCount)
}

func TestApiService_List_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	req := &v1.ApiSearchRequest{
		Page:     1,
		PageSize: 10,
	}
	dbError := errors.New("database connection error")

	mockApiRepo.EXPECT().List(ctx, req).Return([]model.Api{}, int64(0), dbError)

	result, err := apiService.List(ctx, req)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
	assert.Nil(t, result)
}

func TestApiService_List_Empty(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	req := &v1.ApiSearchRequest{
		Page:     1,
		PageSize: 10,
	}

	mockApiRepo.EXPECT().List(ctx, req).Return([]model.Api{}, int64(0), nil)

	result, err := apiService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, int64(0), result.Total)
	assert.Len(t, result.List, 0)
}

// ==================== Create Tests ====================

func TestApiService_Create_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	req := &v1.ApiRequest{
		Group:    "User",
		Name:     "CreateUser",
		Path:     "/api/user",
		Method:   "POST",
		IsPublic: false,
	}

	// Use Any() to match the model.Api struct
	mockApiRepo.EXPECT().Create(ctx, gomock.Any()).Return(nil)

	err := apiService.Create(ctx, req)

	assert.NoError(t, err)
}

func TestApiService_Create_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	req := &v1.ApiRequest{
		Group:    "User",
		Name:     "CreateUser",
		Path:     "/api/user",
		Method:   "POST",
		IsPublic: false,
	}
	dbError := errors.New("duplicate entry")

	mockApiRepo.EXPECT().Create(ctx, gomock.Any()).Return(dbError)

	err := apiService.Create(ctx, req)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
}

// ==================== Update Tests ====================

func TestApiService_Update_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	req := &v1.ApiRequest{
		Group:    "User",
		Name:     "UpdateUser",
		Path:     "/api/user/:id",
		Method:   "PUT",
		IsPublic: true,
	}

	mockApiRepo.EXPECT().Update(ctx, apiID, gomock.Any()).Return(nil)

	err := apiService.Update(ctx, apiID, req)

	assert.NoError(t, err)
}

func TestApiService_Update_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	req := &v1.ApiRequest{
		Group:    "User",
		Name:     "UpdateUser",
		Path:     "/api/user/:id",
		Method:   "PUT",
		IsPublic: true,
	}
	dbError := errors.New("record not found")

	mockApiRepo.EXPECT().Update(ctx, apiID, gomock.Any()).Return(dbError)

	err := apiService.Update(ctx, apiID, req)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
}

// ==================== Delete Tests ====================

func TestApiService_Delete_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)

	mockApiRepo.EXPECT().Delete(ctx, apiID).Return(nil)

	err := apiService.Delete(ctx, apiID)

	assert.NoError(t, err)
}

func TestApiService_Delete_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	dbError := errors.New("record not found")

	mockApiRepo.EXPECT().Delete(ctx, apiID).Return(dbError)

	err := apiService.Delete(ctx, apiID)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
}

// ==================== GetRoles Tests ====================

func TestApiService_GetRoles_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	expectedRoles := []uint{1, 2, 3}

	mockApiRepo.EXPECT().GetRoleIds(ctx, apiID).Return(expectedRoles, nil)

	result, err := apiService.GetRoles(ctx, apiID)

	assert.NoError(t, err)
	assert.Equal(t, expectedRoles, result)
	assert.Len(t, result, 3)
}

func TestApiService_GetRoles_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	dbError := errors.New("database error")

	mockApiRepo.EXPECT().GetRoleIds(ctx, apiID).Return([]uint{}, dbError)

	result, err := apiService.GetRoles(ctx, apiID)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
	assert.Nil(t, result)
}

func TestApiService_GetRoles_Empty(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)

	mockApiRepo.EXPECT().GetRoleIds(ctx, apiID).Return([]uint{}, nil)

	result, err := apiService.GetRoles(ctx, apiID)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Len(t, result, 0)
}

// ==================== UpdateRoles Tests ====================

func TestApiService_UpdateRoles_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	roleIds := []uint{1, 2, 3}

	mockApiRepo.EXPECT().UpdateRoles(ctx, apiID, roleIds).Return(nil)

	err := apiService.UpdateRoles(ctx, apiID, roleIds)

	assert.NoError(t, err)
}

func TestApiService_UpdateRoles_Error(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	roleIds := []uint{1, 2, 3}
	dbError := errors.New("update failed")

	mockApiRepo.EXPECT().UpdateRoles(ctx, apiID, roleIds).Return(dbError)

	err := apiService.UpdateRoles(ctx, apiID, roleIds)

	assert.Error(t, err)
	assert.Equal(t, dbError, err)
}

func TestApiService_UpdateRoles_Empty(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockApiRepo := mock_repository.NewMockApiRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	apiService := service.NewApiService(srv, mockApiRepo)

	ctx := context.Background()
	apiID := uint(1)
	roleIds := []uint{}

	mockApiRepo.EXPECT().UpdateRoles(ctx, apiID, roleIds).Return(nil)

	err := apiService.UpdateRoles(ctx, apiID, roleIds)

	assert.NoError(t, err)
}
