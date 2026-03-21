package service_test

import (
	"context"
	"testing"

	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/service"
	mock_repository "backend/test/mocks/repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func TestAuthService_Register(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	authService := service.NewAuthService(srv, mockUserRepo, mockSettingRepo)

	ctx := context.Background()
	req := &v1.RegisterRequest{
		Email:    "test@example.com",
		Password: "123456",
	}

	mockUserRepo.EXPECT().GetByEmail(ctx, req.Email).Return(model.User{}, gorm.ErrRecordNotFound)
	mockTm.EXPECT().Transaction(ctx, gomock.Any()).Return(nil)

	err := authService.Register(ctx, req)

	assert.NoError(t, err)
}

func TestAuthService_Register_UserExists(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	authService := service.NewAuthService(srv, mockUserRepo, mockSettingRepo)

	ctx := context.Background()
	req := &v1.RegisterRequest{
		Email:    "existing@example.com",
		Password: "123456",
	}

	mockUserRepo.EXPECT().GetByEmail(ctx, req.Email).Return(model.User{
		Model: gorm.Model{ID: 1},
	}, nil)

	err := authService.Register(ctx, req)

	assert.Error(t, err)
}

func TestAuthService_Login(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	authService := service.NewAuthService(srv, mockUserRepo, mockSettingRepo)

	ctx := context.Background()
	req := &v1.LoginRequest{
		Username: "testuser",
		Password: "password",
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatal("failed to hash password")
	}

	mockSettingRepo.EXPECT().GetAll(ctx).Return([]model.Setting{}, nil)
	mockUserRepo.EXPECT().GetByUsernameOrEmail(ctx, req.Username, req.Username).Return(model.User{
		Model:          gorm.Model{ID: 1},
		Username:       req.Username,
		HashedPassword: string(hashedPassword),
	}, nil)

	token, err := authService.Login(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, token)
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	authService := service.NewAuthService(srv, mockUserRepo, mockSettingRepo)

	ctx := context.Background()
	req := &v1.LoginRequest{
		Username: "nonexistent",
		Password: "password",
	}

	mockSettingRepo.EXPECT().GetAll(ctx).Return([]model.Setting{}, nil)
	mockUserRepo.EXPECT().GetByUsernameOrEmail(ctx, req.Username, req.Username).Return(model.User{}, gorm.ErrRecordNotFound)

	_, err := authService.Login(ctx, req)

	assert.Error(t, err)
}

func TestUserService_GetUserByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock_repository.NewMockUserRepository(ctrl)
	mockRoleRepo := mock_repository.NewMockRoleRepository(ctrl)
	mockMenuRepo := mock_repository.NewMockMenuRepository(ctrl)
	mockAvatarStorage := mock_repository.NewMockAvatarStorage(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)
	userService := service.NewUserService(srv, mockUserRepo, mockRoleRepo, mockMenuRepo, mockAvatarStorage)

	ctx := context.Background()
	userId := "123"

	mockUserRepo.EXPECT().Get(ctx, userId).Return(model.User{
		Model:     gorm.Model{ID: 123},
		UserID:    "123",
		Username:  "testuser",
		AvatarURL: "local://avatar.png",
	}, nil)
	mockUserRepo.EXPECT().GetRoles(ctx, "123").Return([]string{}, nil)
	mockAvatarStorage.EXPECT().GetURL(ctx, "local://avatar.png").Return("", nil)

	user, err := userService.Get(ctx, userId)

	assert.NoError(t, err)
	assert.Equal(t, "123", user.UserID)
}
