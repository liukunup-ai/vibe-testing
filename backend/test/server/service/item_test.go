package service_test

import (
	"context"
	"testing"

	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/service"
	"backend/test/mocks/repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestItemService_List(t *testing.T) {
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

	mockItems := []model.Item{
		{
			Model: gorm.Model{ID: 1},
			Name:  "Item 1",
			Owner: "user1",
		},
		{
			Model: gorm.Model{ID: 2},
			Name:  "Item 2",
			Owner: "user2",
		},
	}

	mockItemRepo.EXPECT().List(ctx, req).Return(mockItems, int64(2), nil)

	result, err := itemService.List(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, int64(2), result.Total)
	assert.Len(t, result.List, 2)
	assert.Equal(t, "Item 1", result.List[0].Name)
}

func TestItemService_Get(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	itemId := uint(1)

	mockItem := model.Item{
		Model: gorm.Model{ID: 1},
		Name:  "Test Item",
		Owner: "testuser",
	}

	mockItemRepo.EXPECT().Get(ctx, itemId).Return(mockItem, nil)

	result, err := itemService.Get(ctx, itemId)

	assert.NoError(t, err)
	assert.Equal(t, "Test Item", result.Name)
	assert.Equal(t, "testuser", result.Owner)
}

func TestItemService_Create(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	req := &v1.ItemRequest{
		Name:  "New Item",
		Desc:  "Test Description",
		Owner: "testuser",
	}

	mockItemRepo.EXPECT().Create(ctx, gomock.Any()).Return(nil)

	err := itemService.Create(ctx, req)

	assert.NoError(t, err)
}

func TestItemService_Update(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	itemId := uint(1)
	req := &v1.ItemRequest{
		Name:  "Updated Item",
		Desc:  "Updated Description",
		Owner: "updateduser",
	}

	mockItemRepo.EXPECT().Update(ctx, itemId, gomock.Any()).Return(nil)

	err := itemService.Update(ctx, itemId, req)

	assert.NoError(t, err)
}

func TestItemService_Delete(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemRepo := mock_repository.NewMockItemRepository(ctrl)
	mockTm := mock_repository.NewMockTransaction(ctrl)
	srv := service.NewService(logger, sf, j, em, mockTm)
	itemService := service.NewItemService(srv, mockItemRepo)

	ctx := context.Background()
	itemId := uint(1)

	mockItemRepo.EXPECT().Delete(ctx, itemId).Return(nil)

	err := itemService.Delete(ctx, itemId)

	assert.NoError(t, err)
}
