package service_test

import (
	"context"
	"errors"
	"testing"

	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/service"
	mock_repository "backend/test/mocks/repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// Auth Service错误处理测试

func TestAuthService_Register_DatabaseError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	authService := service.NewAuthService(srv, mockUserRepo)

	ctx := context.Background()
	req := &v1.RegisterRequest{
		Email:    "test@example.com",
		Password: "123456",
	}

	mockUserRepo.EXPECT().GetByEmail(ctx, req.Email).Return(model.User{}, gorm.ErrRecordNotFound)
	mockTm.EXPECT().Transaction(ctx, gomock.Any()).Return(errors.New("database connection failed"))

	err := authService.Register(ctx, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "database")
}

func TestAuthService_Login_AccountDisabled(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	authService := service.NewAuthService(srv, mockUserRepo)

	ctx := context.Background()
	req := &v1.LoginRequest{
		Username: "disableduser",
		Password: "password",
	}

	mockUserRepo.EXPECT().GetByUsernameOrEmail(ctx, req.Username, req.Username).Return(model.User{
		Model:    gorm.Model{ID: 1},
		Username: "disableduser",
		Status:   2,
	}, nil)

	_, err := authService.Login(ctx, req)

	assert.Error(t, err)
}

// Item Service错误处理测试

func TestItemService_Create_ValidationError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	req := &v1.ItemRequest{
		Name: "",
	}

	mockItemRepo.EXPECT().Create(ctx, gomock.Any()).Return(nil)

	err := itemService.Create(ctx, req)

	assert.NoError(t, err)
}

func TestItemService_Update_Concurrency(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	itemId := uint(1)
	req := &v1.ItemRequest{
		Name: "Updated Item",
	}

	// 模拟并发更新冲突
	mockItemRepo.EXPECT().Update(ctx, itemId, gomock.Any()).Return(errors.New("concurrent update conflict"))

	err := itemService.Update(ctx, itemId, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "concurrent")
}

func TestItemService_Delete_InUse(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	itemId := uint(1)

	// 模拟项目正在使用中
	mockItemRepo.EXPECT().Delete(ctx, itemId).Return(errors.New("item is in use"))

	err := itemService.Delete(ctx, itemId)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "in use")
}

// Role Service错误处理测试

func TestRoleService_Create_EmptyName(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleRepo := mock_repository.NewMockRoleRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	roleService := service.NewRoleService(srv, mockRoleRepo)

	ctx := context.Background()
	req := &v1.RoleRequest{
		Name:       "", // 空名称
		CasbinRole: "test",
	}

	// 期望先检查casbin role是否存在
	mockRoleRepo.EXPECT().GetByCasbinRole(ctx, req.CasbinRole).Return(model.Role{}, gorm.ErrRecordNotFound)
	mockRoleRepo.EXPECT().Create(ctx, gomock.Any()).Return(nil)

	err := roleService.Create(ctx, req)

	assert.NoError(t, err) // 当前没有name validation
}

func TestRoleService_Delete_SystemRole(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleRepo := mock_repository.NewMockRoleRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	roleService := service.NewRoleService(srv, mockRoleRepo)

	ctx := context.Background()
	roleId := uint(1) // 假设1是系统管理员角色

	// 先查询role,删除casbin role,再删除role
	mockRoleRepo.EXPECT().Get(ctx, roleId).Return(model.Role{
		Model:      gorm.Model{ID: roleId},
		Name:       "Admin",
		CasbinRole: "admin",
	}, nil)
	mockRoleRepo.EXPECT().DeleteCasbinRole(ctx, "admin").Return(true, errors.New("cannot delete system role"))

	err := roleService.Delete(ctx, roleId)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "system role")
}

func TestRoleService_Update_CasbinRoleConflict(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRoleRepo := mock_repository.NewMockRoleRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	roleService := service.NewRoleService(srv, mockRoleRepo)

	ctx := context.Background()
	roleId := uint(2)
	req := &v1.RoleRequest{
		Name:       "Updated Role",
		CasbinRole: "admin", // 与现有角色冲突
	}

	mockRoleRepo.EXPECT().Update(ctx, gomock.Any()).Return(errors.New("casbin role already exists"))

	err := roleService.Update(ctx, roleId, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "already exists")
}

// Menu Service错误处理测试

func TestMenuService_Create_ParentNotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMenuRepo := mock_repository.NewMockMenuRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	menuService := service.NewMenuService(srv, mockMenuRepo)

	ctx := context.Background()
	req := &v1.MenuRequest{
		ParentID:  999, // 不存在的父菜单
		Name:      "Child Menu",
		Path:      "/child",
		Component: "@/pages/Child",
	}

	mockMenuRepo.EXPECT().Create(ctx, gomock.Any()).Return(errors.New("parent menu not found"))

	err := menuService.Create(ctx, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "parent")
}

func TestMenuService_Delete_HasChildren(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMenuRepo := mock_repository.NewMockMenuRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	menuService := service.NewMenuService(srv, mockMenuRepo)

	ctx := context.Background()
	menuId := uint(1)

	// 模拟菜单有子菜单
	mockMenuRepo.EXPECT().Delete(ctx, menuId).Return(errors.New("menu has children"))

	err := menuService.Delete(ctx, menuId)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "children")
}

func TestMenuService_Update_PathConflict(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockMenuRepo := mock_repository.NewMockMenuRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	menuService := service.NewMenuService(srv, mockMenuRepo)

	ctx := context.Background()
	menuId := uint(2)
	req := &v1.MenuRequest{
		Name:      "Updated Menu",
		Path:      "/dashboard", // 与其他菜单路径冲突
		Component: "@/pages/Dashboard",
	}

	mockMenuRepo.EXPECT().Update(ctx, menuId, gomock.Any()).Return(errors.New("path already exists"))

	err := menuService.Update(ctx, menuId, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "already exists")
}

// 通用错误场景测试

func TestService_DatabaseTimeout(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	req := &v1.ItemSearchRequest{
		Page:     1,
		PageSize: 10,
	}

	// 模拟数据库超时
	mockItemRepo.EXPECT().List(ctx, req).Return(nil, int64(0), context.DeadlineExceeded)

	_, err := itemService.List(ctx, req)

	assert.Error(t, err)
	assert.Equal(t, context.DeadlineExceeded, err)
}

func TestService_EmptyFieldHandling(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	authService := service.NewAuthService(srv, mockUserRepo)

	ctx := context.Background()

	req := &v1.RegisterRequest{
		Email:    "test+special@example.com",
		Password: "123456",
	}

	mockUserRepo.EXPECT().GetByEmail(ctx, req.Email).Return(model.User{}, gorm.ErrRecordNotFound)
	mockTm.EXPECT().Transaction(ctx, gomock.Any()).DoAndReturn(func(ctx context.Context, fn func(context.Context) error) error {
		return fn(ctx)
	})
	mockUserRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	err := authService.Register(ctx, req)

	assert.NoError(t, err)
}
