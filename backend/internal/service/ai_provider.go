package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AIProviderService interface {
	List(ctx context.Context, req *v1.AIProviderSearchRequest) (*v1.AIProviderSearchResponseData, error)
	Create(ctx context.Context, req *v1.AIProviderRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.AIProviderRequest, updaterID uint) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.AIProviderDataItem, error)
}

func NewAIProviderService(
	service *Service,
	aiProviderRepository repository.AIProviderRepository,
) AIProviderService {
	return &aiProviderService{
		Service:              service,
		aiProviderRepository: aiProviderRepository,
	}
}

type aiProviderService struct {
	*Service
	aiProviderRepository repository.AIProviderRepository
}

func (s *aiProviderService) List(ctx context.Context, req *v1.AIProviderSearchRequest) (*v1.AIProviderSearchResponseData, error) {
	list, total, err := s.aiProviderRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.AIProviderSearchResponseData{
		List:  make([]v1.AIProviderDataItem, 0),
		Total: total,
	}
	for _, provider := range list {
		data.List = append(data.List, s.modelToDataItem(provider))
	}
	return data, nil
}

func (s *aiProviderService) Create(ctx context.Context, req *v1.AIProviderRequest, creatorID uint) error {
	_, err := s.aiProviderRepository.GetByNo(ctx, req.ProviderNo)
	if err == nil {
		return v1.ErrAIProviderNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	now := time.Now()
	provider := &model.AIProvider{
		ProviderNo:      req.ProviderNo,
		ProviderName:    req.ProviderName,
		ProviderType:    req.ProviderType,
		BaseURL:         req.BaseURL,
		Status:          req.Status,
		CreatedBy:       creatorID,
		UpdatedBy:       creatorID,
		OrganizationID:  req.OrganizationID,
		ProjectID:       req.ProjectID,
		Region:          req.Region,
		Desc:            req.Desc,
		ModelConfig:     req.ModelConfig,
		RateLimitConfig: req.RateLimitConfig,
		CostConfig:      req.CostConfig,
		SecurityConfig:  req.SecurityConfig,
		AdvancedConfig:  req.AdvancedConfig,
	}
	provider.CreatedAt = now
	provider.UpdatedAt = now
	return s.aiProviderRepository.Create(ctx, provider)
}

func (s *aiProviderService) Update(ctx context.Context, id uint, req *v1.AIProviderRequest, updaterID uint) error {
	_, err := s.aiProviderRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrAIProviderNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"provider_name":     req.ProviderName,
		"provider_type":     req.ProviderType,
		"base_url":          req.BaseURL,
		"status":            req.Status,
		"updated_by":        updaterID,
		"organization_id":   req.OrganizationID,
		"project_id":        req.ProjectID,
		"region":            req.Region,
		"desc":              req.Desc,
		"model_config":      req.ModelConfig,
		"rate_limit_config": req.RateLimitConfig,
		"cost_config":       req.CostConfig,
		"security_config":   req.SecurityConfig,
		"advanced_config":   req.AdvancedConfig,
	}
	return s.aiProviderRepository.Update(ctx, id, data)
}

func (s *aiProviderService) Delete(ctx context.Context, id uint) error {
	return s.aiProviderRepository.Delete(ctx, id)
}

func (s *aiProviderService) Get(ctx context.Context, id uint) (*v1.AIProviderDataItem, error) {
	provider, err := s.aiProviderRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("aiProviderRepository.Get error", zap.Error(err))
		return nil, err
	}

	item := s.modelToDataItem(provider)
	return &item, nil
}

func (s *aiProviderService) modelToDataItem(provider model.AIProvider) v1.AIProviderDataItem {
	var lastUsedAt *string
	if provider.LastUsedAt != nil {
		t := provider.LastUsedAt.Format(constant.DateTimeLayout)
		lastUsedAt = &t
	}
	var lastSuccessAt *string
	if provider.LastSuccessAt != nil {
		t := provider.LastSuccessAt.Format(constant.DateTimeLayout)
		lastSuccessAt = &t
	}

	return v1.AIProviderDataItem{
		ID:              provider.ID,
		CreatedAt:       provider.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:       provider.UpdatedAt.Format(constant.DateTimeLayout),
		ProviderNo:      provider.ProviderNo,
		ProviderName:    provider.ProviderName,
		ProviderType:    provider.ProviderType,
		BaseURL:         provider.BaseURL,
		Status:          provider.Status,
		CreatedBy:       provider.CreatedBy,
		UpdatedBy:       provider.UpdatedBy,
		OrganizationID:  provider.OrganizationID,
		ProjectID:       provider.ProjectID,
		Region:          provider.Region,
		Desc:            provider.Desc,
		ModelConfig:     provider.ModelConfig,
		RateLimitConfig: provider.RateLimitConfig,
		CostConfig:      provider.CostConfig,
		TotalCalls:      provider.TotalCalls,
		SuccessCalls:    provider.SuccessCalls,
		FailedCalls:     provider.FailedCalls,
		AvgResponseTime: provider.AvgResponseTime,
		TotalTokens:     provider.TotalTokens,
		InputTokens:     provider.InputTokens,
		OutputTokens:    provider.OutputTokens,
		TotalCost:       provider.TotalCost,
		LastCost:        provider.LastCost,
		LastUsedAt:      lastUsedAt,
		LastSuccessAt:   lastSuccessAt,
		SecurityConfig:  provider.SecurityConfig,
		AdvancedConfig:  provider.AdvancedConfig,
	}
}
