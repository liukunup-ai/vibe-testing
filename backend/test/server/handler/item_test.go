package handler

import (
	v1 "backend/api/v1"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/test/mocks/service"
	"net/http"
	"testing"

	"github.com/golang/mock/gomock"
	"gorm.io/gorm"
)

func TestItemHandler_ListItems(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockItemService := mock_service.NewMockItemService(ctrl)
	mockItemService.EXPECT().List(gomock.Any(), gomock.Any()).Return(&v1.ItemSearchResponseData{
		Total: 2,
		List: []v1.ItemDataItem{
			{
				Id:    1,
				Name:  "Test Item 1",
				Owner: userId,
				Desc:  "Test Description",
			},
			{
				Id:    2,
				Name:  "Test Item 2",
				Owner: userId,
				Desc:  "Test Description 2",
			},
		},
	}, nil)

	itemHandler := handler.NewItemHandler(hdl, mockItemService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/items", itemHandler.ListItems)

	e := newHttpExcept(t, router)
	obj := e.GET("/items").
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

func TestItemHandler_CreateItem(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	params := v1.ItemRequest{
		Name:  "New Item",
		Desc:  "New Description",
		Owner: userId,
	}

	mockItemService := mock_service.NewMockItemService(ctrl)
	mockItemService.EXPECT().Create(gomock.Any(), &params).Return(nil)

	itemHandler := handler.NewItemHandler(hdl, mockItemService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/items", itemHandler.CreateItem)

	e := newHttpExcept(t, router)
	obj := e.POST("/items").
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

func TestItemHandler_UpdateItem(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	itemId := uint(1)
	params := v1.ItemRequest{
		Name:  "Updated Item",
		Desc:  "Updated Description",
		Owner: userId,
	}

	mockItemService := mock_service.NewMockItemService(ctrl)
	mockItemService.EXPECT().Update(gomock.Any(), itemId, &params).Return(nil)

	itemHandler := handler.NewItemHandler(hdl, mockItemService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/items/:id", itemHandler.UpdateItem)

	e := newHttpExcept(t, router)
	obj := e.PUT("/items/1").
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

func TestItemHandler_GetItem(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	itemId := uint(1)
	mockItemService := mock_service.NewMockItemService(ctrl)
	mockItemService.EXPECT().Get(gomock.Any(), itemId).Return(model.Item{
		Model: gorm.Model{
			ID: 1,
		},
		Name:  "Test Item",
		Owner: userId,
		Desc:  "Test Description",
	}, nil)

	itemHandler := handler.NewItemHandler(hdl, mockItemService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/items/:id", itemHandler.GetItem)

	e := newHttpExcept(t, router)
	obj := e.GET("/items/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("id").IsEqual(1)
	objData.Value("name").IsEqual("Test Item")
}

func TestItemHandler_DeleteItem(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	itemId := uint(1)
	mockItemService := mock_service.NewMockItemService(ctrl)
	mockItemService.EXPECT().Delete(gomock.Any(), itemId).Return(nil)

	itemHandler := handler.NewItemHandler(hdl, mockItemService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.DELETE("/items/:id", itemHandler.DeleteItem)

	e := newHttpExcept(t, router)
	obj := e.DELETE("/items/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}
