package handler

import (
	"net/http"
	"testing"
	"time"

	v1 "backend/api/v1"
	"backend/internal/handler"
	"backend/internal/middleware"
	mock_service "backend/test/mocks/service"

	"github.com/golang/mock/gomock"
)

func TestModelHandler_ListModels(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	provider := v1.ModelProviderOpenAI
	mockModelService.EXPECT().List(gomock.Any(), &v1.ModelSearchRequest{
		Page:     1,
		PageSize: 10,
	}).Return(&v1.ModelSearchResponseData{
		List: []v1.ModelDataItem{
			{
				ID:        1,
				Provider:  provider,
				Name:      "GPT-4",
				BaseURL:   "https://api.openai.com/v1",
				ModelID:   "gpt-4",
				Timeout:   60,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        2,
				Provider:  provider,
				Name:      "GPT-3.5",
				BaseURL:   "https://api.openai.com/v1",
				ModelID:   "gpt-3.5-turbo",
				Timeout:   30,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		Total: 2,
	}, nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/models", modelHandler.ListModels)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/models").
		WithQuery("page", "1").
		WithQuery("pageSize", "10").
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

func TestModelHandler_ListModels_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().List(gomock.Any(), gomock.Any()).Return(nil, v1.ErrInternalServerError)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/models-list-err", modelHandler.ListModels)

	e := newHttpExcept(t, router)
	e.GET("/admin/models-list-err").
		WithQuery("page", "1").
		WithQuery("pageSize", "10").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_GetModel(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Get(gomock.Any(), uint(1)).Return(&v1.ModelDataItem{
		ID:        1,
		Provider:  v1.ModelProviderOpenAI,
		Name:      "GPT-4",
		BaseURL:   "https://api.openai.com/v1",
		ModelID:   "gpt-4",
		Timeout:   60,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/models/:id", modelHandler.GetModel)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/models/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("id").IsEqual(1)
	objData.Value("name").IsEqual("GPT-4")
}

func TestModelHandler_GetModel_OmitsKey(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Get(gomock.Any(), uint(1)).Return(&v1.ModelDataItem{
		ID:        1,
		Provider:  v1.ModelProviderOpenAI,
		Name:      "GPT-4",
		BaseURL:   "https://api.openai.com/v1",
		ModelID:   "gpt-4",
		Timeout:   60,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/models-omit/:id", modelHandler.GetModel)

	e := newHttpExcept(t, router)
	obj := e.GET("/admin/models-omit/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	objData := obj.Value("data").Object()
	objData.NotContainsKey("apiKey")
}

func TestModelHandler_GetModel_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Get(gomock.Any(), uint(999)).Return(nil, v1.ErrNotFound)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.GET("/admin/models-404/:id", modelHandler.GetModel)

	e := newHttpExcept(t, router)
	e.GET("/admin/models-404/999").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_CreateModel(t *testing.T) {
	params := &v1.ModelRequest{
		Provider: v1.ModelProviderOpenAI,
		Name:     "GPT-4",
		BaseURL:  "https://api.openai.com/v1",
		ModelID:  "gpt-4",
		APIKey:   "sk-secret-key",
		Timeout:  60,
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Create(gomock.Any(), params).Return(nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models", modelHandler.CreateModel)

	e := newHttpExcept(t, router)
	obj := e.POST("/admin/models").
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

func TestModelHandler_CreateModel_InvalidRequest(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	modelHandler := handler.NewModelHandler(hdl, nil)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models-create-invalid", modelHandler.CreateModel)

	e := newHttpExcept(t, router)
	e.POST("/admin/models-create-invalid").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{}).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_CreateModel_ServiceError(t *testing.T) {
	params := &v1.ModelRequest{
		Provider: v1.ModelProviderOpenAI,
		Name:     "GPT-4",
		BaseURL:  "https://api.openai.com/v1",
		ModelID:  "gpt-4",
		APIKey:   "sk-secret-key",
		Timeout:  60,
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Create(gomock.Any(), params).Return(v1.ErrInternalServerError)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models-create-err", modelHandler.CreateModel)

	e := newHttpExcept(t, router)
	e.POST("/admin/models-create-err").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(params).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_UpdateModel(t *testing.T) {
	params := &v1.ModelRequest{
		Provider: v1.ModelProviderOpenAI,
		Name:     "GPT-4-Updated",
		BaseURL:  "https://api.openai.com/v1",
		ModelID:  "gpt-4-updated",
		APIKey:   "sk-new-secret-key",
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Update(gomock.Any(), uint(1), params).Return(nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/models/:id", modelHandler.UpdateModel)

	e := newHttpExcept(t, router)
	obj := e.PUT("/admin/models/1").
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

func TestModelHandler_UpdateModel_InvalidID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	modelHandler := handler.NewModelHandler(hdl, nil)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/models-invalid-id/:id", modelHandler.UpdateModel)

	e := newHttpExcept(t, router)
	e.PUT("/admin/models-invalid-id/invalid").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{"name": "test"}).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_UpdateModel_ServiceError(t *testing.T) {
	params := &v1.ModelRequest{
		Provider: v1.ModelProviderOpenAI,
		Name:     "GPT-4-Updated",
		BaseURL:  "https://api.openai.com/v1",
		ModelID:  "gpt-4-updated",
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Update(gomock.Any(), uint(1), params).Return(v1.ErrInternalServerError)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.PUT("/admin/models-update-err/:id", modelHandler.UpdateModel)

	e := newHttpExcept(t, router)
	e.PUT("/admin/models-update-err/1").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(params).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_DeleteModel(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Delete(gomock.Any(), uint(1)).Return(nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.DELETE("/admin/models/:id", modelHandler.DeleteModel)

	e := newHttpExcept(t, router)
	obj := e.DELETE("/admin/models/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
}

func TestModelHandler_DeleteModel_InvalidID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	modelHandler := handler.NewModelHandler(hdl, nil)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.DELETE("/admin/models-del-invalid/:id", modelHandler.DeleteModel)

	e := newHttpExcept(t, router)
	e.DELETE("/admin/models-del-invalid/invalid").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_DeleteModel_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().Delete(gomock.Any(), uint(1)).Return(v1.ErrInternalServerError)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.DELETE("/admin/models-del-err/:id", modelHandler.DeleteModel)

	e := newHttpExcept(t, router)
	e.DELETE("/admin/models-del-err/1").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_TestConnection_Success(t *testing.T) {
	req := &v1.TestConnectionRequest{
		Provider: "1",
		BaseURL:  "https://api.openai.com/v1",
		APIKey:   "sk-test-key",
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().TestConnection(gomock.Any(), req).Return(&v1.TestConnectionResponse{
		Success: true,
		Message: "connection successful",
		Models:  []string{"gpt-4", "gpt-3.5-turbo"},
	}, nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models/test-connection", modelHandler.TestConnection)

	e := newHttpExcept(t, router)
	obj := e.POST("/admin/models/test-connection").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	obj.Value("errorMessage").IsEqual("ok")
	objData := obj.Value("data").Object()
	objData.Value("success").IsEqual(true)
	objData.Value("message").IsEqual("connection successful")
	objData.Value("models").Array().Length().IsEqual(2)
}

func TestModelHandler_TestConnection_InvalidRequest(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	modelHandler := handler.NewModelHandler(hdl, nil)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models/test-conn-invalid", modelHandler.TestConnection)

	e := newHttpExcept(t, router)
	e.POST("/admin/models/test-conn-invalid").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(map[string]string{}).
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_TestConnection_ServiceError(t *testing.T) {
	req := &v1.TestConnectionRequest{
		Provider: "1",
		BaseURL:  "https://api.openai.com/v1",
		APIKey:   "sk-test-key",
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().TestConnection(gomock.Any(), req).Return(nil, v1.ErrInternalServerError)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models/test-conn-err", modelHandler.TestConnection)

	e := newHttpExcept(t, router)
	e.POST("/admin/models/test-conn-err").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusInternalServerError).
		JSON().
		Object().
		Value("success").IsEqual(false)
}

func TestModelHandler_TestConnection_Failure(t *testing.T) {
	req := &v1.TestConnectionRequest{
		Provider: "1",
		BaseURL:  "https://invalid-api.example.com",
		APIKey:   "sk-invalid-key",
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockModelService := mock_service.NewMockModelService(ctrl)
	mockModelService.EXPECT().TestConnection(gomock.Any(), req).Return(&v1.TestConnectionResponse{
		Success: false,
		Message: "connection failed: timeout",
	}, nil)

	modelHandler := handler.NewModelHandler(hdl, mockModelService)
	router.Use(middleware.StrictAuth(jwt, logger))
	router.POST("/admin/models/test-conn-fail", modelHandler.TestConnection)

	e := newHttpExcept(t, router)
	obj := e.POST("/admin/models/test-conn-fail").
		WithHeader("Content-Type", "application/json").
		WithHeader("Authorization", "Bearer "+genToken(t)).
		WithJSON(req).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("success").IsEqual(true)
	objData := obj.Value("data").Object()
	objData.Value("success").IsEqual(false)
	objData.Value("message").IsEqual("connection failed: timeout")
}
