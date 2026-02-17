package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type AIAnalysisResultRepository interface {
	Get(ctx context.Context, id uint) (model.AIAnalysisResult, error)
	GetByAnalysisNo(ctx context.Context, analysisNo string) (model.AIAnalysisResult, error)
	List(ctx context.Context, req *v1.AIAnalysisResultSearchRequest) ([]model.AIAnalysisResult, int64, error)
	Create(ctx context.Context, m *model.AIAnalysisResult) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewAIAnalysisResultRepository(repository *Repository) AIAnalysisResultRepository {
	return &aiAnalysisResultRepository{Repository: repository}
}

type aiAnalysisResultRepository struct {
	*Repository
}

func (r *aiAnalysisResultRepository) Get(ctx context.Context, id uint) (model.AIAnalysisResult, error) {
	m := model.AIAnalysisResult{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *aiAnalysisResultRepository) GetByAnalysisNo(ctx context.Context, analysisNo string) (model.AIAnalysisResult, error) {
	m := model.AIAnalysisResult{}
	return m, r.DB(ctx).Where("analysis_no = ?", analysisNo).First(&m).Error
}

func (r *aiAnalysisResultRepository) List(ctx context.Context, req *v1.AIAnalysisResultSearchRequest) ([]model.AIAnalysisResult, int64, error) {
	var list []model.AIAnalysisResult
	var total int64
	scope := r.DB(ctx).Model(&model.AIAnalysisResult{})
	if req.AnalysisType != "" {
		scope = scope.Where("analysis_type = ?", req.AnalysisType)
	}
	if req.RelatedObjectID > 0 {
		scope = scope.Where("related_object_id = ?", req.RelatedObjectID)
	}
	if req.RelatedObjectType != "" {
		scope = scope.Where("related_object_type = ?", req.RelatedObjectType)
	}
	if req.ProviderID != "" {
		scope = scope.Where("provider_id = ?", req.ProviderID)
	}
	if req.HumanVerified != nil {
		scope = scope.Where("human_verified = ?", *req.HumanVerified)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *aiAnalysisResultRepository) Create(ctx context.Context, m *model.AIAnalysisResult) error {
	return r.DB(ctx).Create(m).Error
}

func (r *aiAnalysisResultRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.AIAnalysisResult{}).Where("id = ?", id).Updates(data).Error
}

func (r *aiAnalysisResultRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.AIAnalysisResult{}).Error
}
