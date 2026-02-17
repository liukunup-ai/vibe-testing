package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrAIAnalysisNoExists
	_ = v1.ErrAIAnalysisNotFound
)

type AIAnalysisResultService interface {
	List(ctx context.Context, req *v1.AIAnalysisResultSearchRequest) (*v1.AIAnalysisResultSearchResponseData, error)
	Create(ctx context.Context, req *v1.AIAnalysisResultRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.AIAnalysisResultRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.AIAnalysisResultDataItem, error)
}

func NewAIAnalysisResultService(
	service *Service,
	aiAnalysisResultRepository repository.AIAnalysisResultRepository,
) AIAnalysisResultService {
	return &aiAnalysisResultService{
		Service:                    service,
		aiAnalysisResultRepository: aiAnalysisResultRepository,
	}
}

type aiAnalysisResultService struct {
	*Service
	aiAnalysisResultRepository repository.AIAnalysisResultRepository
}

func (s *aiAnalysisResultService) List(ctx context.Context, req *v1.AIAnalysisResultSearchRequest) (*v1.AIAnalysisResultSearchResponseData, error) {
	list, total, err := s.aiAnalysisResultRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.AIAnalysisResultSearchResponseData{
		List:  make([]v1.AIAnalysisResultDataItem, 0),
		Total: total,
	}
	for _, item := range list {
		data.List = append(data.List, toAIAnalysisResultDataItem(item))
	}
	return data, nil
}

func (s *aiAnalysisResultService) Create(ctx context.Context, req *v1.AIAnalysisResultRequest, creatorID uint) error {
	_, err := s.aiAnalysisResultRepository.GetByAnalysisNo(ctx, req.AnalysisNo)
	if err == nil {
		return v1.ErrAIAnalysisNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	m := &model.AIAnalysisResult{
		AnalysisNo:        req.AnalysisNo,
		AnalysisType:      req.AnalysisType,
		RelatedObjectID:   req.RelatedObjectID,
		RelatedObjectType: req.RelatedObjectType,
		AnalyzedAt:        req.AnalyzedAt,
		ModelVersion:      req.ModelVersion,
		AnalysisContent:   req.AnalysisContent,
		RelatedDataIDs:    req.RelatedDataIDs,
		HumanVerified:     req.HumanVerified,
		VerifiedAt:        req.VerifiedAt,
		AccuracyScore:     req.AccuracyScore,
		ProviderID:        req.ProviderID,
		ModelID:           req.ModelID,
		APICallTime:       req.APICallTime,
		TokenUsage:        req.TokenUsage,
		CreatorID:         creatorID,
	}
	return s.aiAnalysisResultRepository.Create(ctx, m)
}

func (s *aiAnalysisResultService) Update(ctx context.Context, id uint, req *v1.AIAnalysisResultRequest) error {
	_, err := s.aiAnalysisResultRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrAIAnalysisNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"analysis_type":       req.AnalysisType,
		"related_object_id":   req.RelatedObjectID,
		"related_object_type": req.RelatedObjectType,
		"analyzed_at":         req.AnalyzedAt,
		"model_version":       req.ModelVersion,
		"analysis_content":    req.AnalysisContent,
		"related_data_ids":    req.RelatedDataIDs,
		"human_verified":      req.HumanVerified,
		"verified_at":         req.VerifiedAt,
		"accuracy_score":      req.AccuracyScore,
		"provider_id":         req.ProviderID,
		"model_id":            req.ModelID,
		"api_call_time":       req.APICallTime,
		"token_usage":         req.TokenUsage,
	}
	return s.aiAnalysisResultRepository.Update(ctx, id, data)
}

func (s *aiAnalysisResultService) Delete(ctx context.Context, id uint) error {
	return s.aiAnalysisResultRepository.Delete(ctx, id)
}

func (s *aiAnalysisResultService) Get(ctx context.Context, id uint) (*v1.AIAnalysisResultDataItem, error) {
	item, err := s.aiAnalysisResultRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("aiAnalysisResultRepository.Get error", zap.Error(err))
		return nil, err
	}

	result := toAIAnalysisResultDataItem(item)
	return &result, nil
}

func toAIAnalysisResultDataItem(m model.AIAnalysisResult) v1.AIAnalysisResultDataItem {
	return v1.AIAnalysisResultDataItem{
		ID:                m.ID,
		CreatedAt:         m.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:         m.UpdatedAt.Format(constant.DateTimeLayout),
		AnalysisNo:        m.AnalysisNo,
		AnalysisType:      m.AnalysisType,
		RelatedObjectID:   m.RelatedObjectID,
		RelatedObjectType: m.RelatedObjectType,
		AnalyzedAt:        m.AnalyzedAt,
		ModelVersion:      m.ModelVersion,
		AnalysisContent:   m.AnalysisContent,
		RelatedDataIDs:    m.RelatedDataIDs,
		HumanVerified:     m.HumanVerified,
		VerifiedAt:        m.VerifiedAt,
		AccuracyScore:     m.AccuracyScore,
		ProviderID:        m.ProviderID,
		ModelID:           m.ModelID,
		APICallTime:       m.APICallTime,
		TokenUsage:        m.TokenUsage,
		CreatorID:         m.CreatorID,
	}
}
