package service

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/crypto"
	"context"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"go.uber.org/zap"
)

type ModelService interface {
	Get(ctx context.Context, id uint) (*v1.ModelDataItem, error)
	List(ctx context.Context, req *v1.ModelSearchRequest) (*v1.ModelSearchResponseData, error)
	Create(ctx context.Context, req *v1.ModelRequest) error
	Update(ctx context.Context, id uint, req *v1.ModelRequest) error
	Delete(ctx context.Context, id uint) error
	TestConnection(ctx context.Context, req *v1.TestConnectionRequest) (*v1.TestConnectionResponse, error)
}

func NewModelService(
	service *Service,
	modelRepository repository.ModelRepository,
) (ModelService, error) {
	return &modelService{
		Service:         service,
		modelRepository: modelRepository,
	}, nil
}

type modelService struct {
	*Service
	modelRepository repository.ModelRepository
}

func (s *modelService) Get(ctx context.Context, id uint) (*v1.ModelDataItem, error) {
	m, err := s.modelRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("modelRepository.Get error", zap.Error(err))
		return nil, err
	}
	return &v1.ModelDataItem{
		ID:               m.ID,
		Provider:         m.Provider,
		Name:             m.Name,
		BaseURL:          m.BaseURL,
		ModelID:          m.ModelID,
		Timeout:          m.Timeout,
		MaxRetries:       m.MaxRetries,
		RateLimit:        m.RateLimit,
		Headers:          m.Headers,
		Temperature:      m.Temperature,
		TopP:             m.TopP,
		MaxTokens:        m.MaxTokens,
		TopK:             m.TopK,
		FrequencyPenalty: m.FrequencyPenalty,
		PresencePenalty:  m.PresencePenalty,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}, nil
}

func (s *modelService) List(ctx context.Context, req *v1.ModelSearchRequest) (*v1.ModelSearchResponseData, error) {
	list, total, err := s.modelRepository.List(ctx, req)
	if err != nil {
		s.logger.WithContext(ctx).Error("modelRepository.List error", zap.Error(err))
		return nil, err
	}

	data := &v1.ModelSearchResponseData{
		List:  make([]v1.ModelDataItem, 0),
		Total: total,
	}

	for _, m := range list {
		data.List = append(data.List, v1.ModelDataItem{
			ID:               m.ID,
			Provider:         m.Provider,
			Name:             m.Name,
			BaseURL:          m.BaseURL,
			ModelID:          m.ModelID,
			Timeout:          m.Timeout,
			MaxRetries:       m.MaxRetries,
			RateLimit:        m.RateLimit,
			Headers:          m.Headers,
			Temperature:      m.Temperature,
			TopP:             m.TopP,
			MaxTokens:        m.MaxTokens,
			TopK:             m.TopK,
			FrequencyPenalty: m.FrequencyPenalty,
			PresencePenalty:  m.PresencePenalty,
			CreatedAt:        m.CreatedAt,
			UpdatedAt:        m.UpdatedAt,
		})
	}

	return data, nil
}

func (s *modelService) Create(ctx context.Context, req *v1.ModelRequest) error {
	// Build model entity
	m := &model.Model{
		Provider:    req.Provider,
		Name:        req.Name,
		BaseURL:     req.BaseURL,
		ModelID:     req.ModelID,
		Timeout:     req.Timeout,
		MaxRetries:  req.MaxRetries,
		RateLimit:   req.RateLimit,
		Headers:     req.Headers,
		Temperature: req.Temperature,
		TopP:        req.TopP,
		MaxTokens:   req.MaxTokens,
		TopK:        req.TopK,
	}

	// Encrypt API key if provided
	if req.APIKey != "" {
		key := s.cfg.GetString("security.crypto.key")
		encryptedKey, err := crypto.Encrypt(key, req.APIKey)
		if err != nil {
			s.logger.WithContext(ctx).Error("encrypt API key error", zap.Error(err))
			return v1.ErrInternalServerError
		}
		m.ApiKeyEncrypted = encryptedKey
	}

	if err := s.modelRepository.Create(ctx, m); err != nil {
		s.logger.WithContext(ctx).Error("modelRepository.Create error", zap.Error(err))
		return err
	}

	return nil
}

func (s *modelService) Update(ctx context.Context, id uint, req *v1.ModelRequest) error {
	// Build model for update
	m := &model.Model{}

	// Only update fields that are provided
	if req.Name != "" {
		m.Name = req.Name
	}
	if req.BaseURL != "" {
		m.BaseURL = req.BaseURL
	}
	if req.ModelID != "" {
		m.ModelID = req.ModelID
	}
	if req.Timeout > 0 {
		m.Timeout = req.Timeout
	}
	if req.MaxRetries > 0 {
		m.MaxRetries = req.MaxRetries
	}
	if req.RateLimit > 0 {
		m.RateLimit = req.RateLimit
	}
	if req.Headers != "" {
		m.Headers = req.Headers
	}
	if req.Temperature > 0 {
		m.Temperature = req.Temperature
	}
	if req.TopP > 0 {
		m.TopP = req.TopP
	}
	if req.MaxTokens > 0 {
		m.MaxTokens = req.MaxTokens
	}
	if req.TopK > 0 {
		m.TopK = req.TopK
	}
	if req.FrequencyPenalty != 0 {
		m.FrequencyPenalty = req.FrequencyPenalty
	}
	if req.PresencePenalty != 0 {
		m.PresencePenalty = req.PresencePenalty
	}

	// Re-encrypt API key if provided
	if req.APIKey != "" {
		key := s.cfg.GetString("security.crypto.key")
		encryptedKey, err := crypto.Encrypt(key, req.APIKey)
		if err != nil {
			s.logger.WithContext(ctx).Error("encrypt API key error", zap.Error(err))
			return v1.ErrInternalServerError
		}
		m.ApiKeyEncrypted = encryptedKey
	}

	if err := s.modelRepository.Update(ctx, id, m); err != nil {
		s.logger.WithContext(ctx).Error("modelRepository.Update error", zap.Error(err))
		return err
	}

	return nil
}

func (s *modelService) Delete(ctx context.Context, id uint) error {
	if err := s.modelRepository.Delete(ctx, id); err != nil {
		s.logger.WithContext(ctx).Error("modelRepository.Delete error", zap.Error(err))
		return err
	}
	return nil
}

func (s *modelService) TestConnection(ctx context.Context, req *v1.TestConnectionRequest) (*v1.TestConnectionResponse, error) {
	// Build OpenAI client options
	var opts []option.RequestOption

	// Set base URL if provided
	if req.BaseURL != "" {
		opts = append(opts, option.WithBaseURL(req.BaseURL))
	}

	// Set API key if provided
	if req.APIKey != "" {
		opts = append(opts, option.WithAPIKey(req.APIKey))
	}

	// Create client
	client := openai.NewClient(opts...)

	// Try to list models to verify connection
	modelsPage, err := client.Models.List(ctx)
	if err != nil {
		s.logger.WithContext(ctx).Warn("TestConnection failed", zap.Error(err))
		return &v1.TestConnectionResponse{
			Success: false,
			Message: "connection failed: " + err.Error(),
		}, nil
	}

	// Extract model IDs from page.Data
	modelIDs := make([]string, 0, len(modelsPage.Data))
	for _, m := range modelsPage.Data {
		modelIDs = append(modelIDs, m.ID)
	}

	return &v1.TestConnectionResponse{
		Success: true,
		Message: "connection successful",
		Models:  modelIDs,
	}, nil
}
