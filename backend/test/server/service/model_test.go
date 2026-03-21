package service_test

import (
	"context"
	"testing"
	"time"

	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/service"
	"backend/pkg/crypto"
	mock_repository "backend/test/mocks/repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestModelService_Create_EncryptsKey(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	req := &v1.ModelRequest{
		Provider: v1.ModelProviderOpenAI,
		Name:     "GPT-4",
		BaseURL:  "https://api.openai.com/v1",
		ModelID:  "gpt-4",
		APIKey:   "sk-secret-api-key",
		Timeout:  60,
	}

	mockModelRepo.EXPECT().Create(ctx, gomock.Any()).DoAndReturn(
		func(ctx context.Context, m *model.Model) error {
			assert.NotEmpty(t, m.ApiKeyEncrypted)
			assert.NotEqual(t, req.APIKey, m.ApiKeyEncrypted)
			return nil
		},
	)

	err = modelService.Create(ctx, req)

	assert.NoError(t, err)
}

func TestModelService_Create_WithoutKey(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	req := &v1.ModelRequest{
		Provider: v1.ModelProviderOllama,
		Name:     "Ollama Local",
		BaseURL:  "http://localhost:11434",
		ModelID:  "llama2",
	}

	mockModelRepo.EXPECT().Create(ctx, gomock.Any()).DoAndReturn(
		func(ctx context.Context, m *model.Model) error {
			assert.Empty(t, m.ApiKeyEncrypted)
			return nil
		},
	)

	err = modelService.Create(ctx, req)

	assert.NoError(t, err)
}

func TestModelService_Get_OmitsKey(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	modelID := uint(1)

	mockModelRepo.EXPECT().Get(ctx, modelID).Return(model.Model{
		Model:           gorm.Model{ID: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Provider:        v1.ModelProviderOpenAI,
		Name:            "GPT-4",
		BaseURL:         "https://api.openai.com/v1",
		ModelID:         "gpt-4",
		ApiKeyEncrypted: "encrypted-key-should-not-appear",
		Timeout:         60,
	}, nil)

	data, err := modelService.Get(ctx, modelID)

	assert.NoError(t, err)
	assert.NotNil(t, data)
	assert.Equal(t, uint(1), data.ID)
	assert.Equal(t, "GPT-4", data.Name)
	assert.NotContains(t, data.Name, "encrypted-key")
}

func TestModelService_Update_ReEncrypts(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	modelID := uint(1)
	req := &v1.ModelRequest{
		Name:   "GPT-4-Updated",
		APIKey: "new-secret-api-key",
	}

	mockModelRepo.EXPECT().Update(ctx, modelID, gomock.Any()).DoAndReturn(
		func(ctx context.Context, id uint, m *model.Model) error {
			assert.NotEmpty(t, m.ApiKeyEncrypted)
			assert.NotEqual(t, req.APIKey, m.ApiKeyEncrypted)
			assert.Equal(t, "GPT-4-Updated", m.Name)
			return nil
		},
	)

	err = modelService.Update(ctx, modelID, req)

	assert.NoError(t, err)
}

func TestModelService_Delete(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	modelID := uint(1)

	mockModelRepo.EXPECT().Delete(ctx, modelID).Return(nil)

	err = modelService.Delete(ctx, modelID)

	assert.NoError(t, err)
}

func TestModelService_Delete_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	modelID := uint(999)

	mockModelRepo.EXPECT().Delete(ctx, modelID).Return(gorm.ErrRecordNotFound)

	err = modelService.Delete(ctx, modelID)

	assert.Error(t, err)
}

func TestModelService_List_Pagination(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	req := &v1.ModelSearchRequest{
		Page:     1,
		PageSize: 10,
	}

	provider := v1.ModelProviderOpenAI
	mockModelRepo.EXPECT().List(ctx, req).Return([]model.Model{
		{
			Model:    gorm.Model{ID: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			Provider: v1.ModelProviderOpenAI,
			Name:     "GPT-4",
			BaseURL:  "https://api.openai.com/v1",
			ModelID:  "gpt-4",
			Timeout:  60,
		},
		{
			Model:    gorm.Model{ID: 2, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			Provider: provider,
			Name:     "GPT-3.5",
			BaseURL:  "https://api.openai.com/v1",
			ModelID:  "gpt-3.5-turbo",
			Timeout:  30,
		},
	}, int64(2), nil)

	data, err := modelService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, data)
	assert.Equal(t, int64(2), data.Total)
	assert.Len(t, data.List, 2)
	assert.Equal(t, "GPT-4", data.List[0].Name)
	assert.Equal(t, "GPT-3.5", data.List[1].Name)
}

func TestModelService_List_FilterByName(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	req := &v1.ModelSearchRequest{
		Page:     1,
		PageSize: 10,
		Name:     "gpt",
	}

	mockModelRepo.EXPECT().List(ctx, req).Return([]model.Model{
		{
			Model:    gorm.Model{ID: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			Provider: v1.ModelProviderOpenAI,
			Name:     "GPT-4",
			BaseURL:  "https://api.openai.com/v1",
			ModelID:  "gpt-4",
			Timeout:  60,
		},
	}, int64(1), nil)

	data, err := modelService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, data)
	assert.Equal(t, int64(1), data.Total)
	assert.Len(t, data.List, 1)
}

func TestModelService_List_Empty(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelRepo := mock_repository.NewMockModelRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	mockSettingRepo := mock_repository.NewMockSettingRepository(ctrl)
	srv := service.NewService(logger, sf, j, em, cfg, mockTm, aud, mockSettingRepo)

	encSvc, err := crypto.NewModelEncryptionService("12345678901234567890123456789012")
	assert.NoError(t, err)

	modelService := service.NewModelService(srv, mockModelRepo, encSvc)

	ctx := context.Background()
	req := &v1.ModelSearchRequest{
		Page:     1,
		PageSize: 10,
	}

	mockModelRepo.EXPECT().List(ctx, req).Return([]model.Model{}, int64(0), nil)

	data, err := modelService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, data)
	assert.Equal(t, int64(0), data.Total)
	assert.Len(t, data.List, 0)
}
