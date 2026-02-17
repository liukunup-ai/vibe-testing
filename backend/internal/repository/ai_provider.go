package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type AIProviderRepository interface {
	Get(ctx context.Context, id uint) (model.AIProvider, error)
	GetByNo(ctx context.Context, providerNo string) (model.AIProvider, error)
	List(ctx context.Context, req *v1.AIProviderSearchRequest) ([]model.AIProvider, int64, error)
	Create(ctx context.Context, m *model.AIProvider) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewAIProviderRepository(repository *Repository) AIProviderRepository {
	return &aiProviderRepository{Repository: repository}
}

type aiProviderRepository struct {
	*Repository
}

func (r *aiProviderRepository) Get(ctx context.Context, id uint) (model.AIProvider, error) {
	m := model.AIProvider{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *aiProviderRepository) GetByNo(ctx context.Context, providerNo string) (model.AIProvider, error) {
	m := model.AIProvider{}
	return m, r.DB(ctx).Where("provider_no = ?", providerNo).First(&m).Error
}

func (r *aiProviderRepository) List(ctx context.Context, req *v1.AIProviderSearchRequest) ([]model.AIProvider, int64, error) {
	var list []model.AIProvider
	var total int64
	scope := r.DB(ctx).Model(&model.AIProvider{})
	if req.ProviderNo != "" {
		scope = scope.Where("provider_no LIKE ?", "%"+req.ProviderNo+"%")
	}
	if req.ProviderName != "" {
		scope = scope.Where("provider_name LIKE ?", "%"+req.ProviderName+"%")
	}
	if req.ProviderType != "" {
		scope = scope.Where("provider_type = ?", req.ProviderType)
	}
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.Status > 0 {
		scope = scope.Where("status = ?", req.Status)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *aiProviderRepository) Create(ctx context.Context, m *model.AIProvider) error {
	return r.DB(ctx).Create(m).Error
}

func (r *aiProviderRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.AIProvider{}).Where("id = ?", id).Updates(data).Error
}

func (r *aiProviderRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.AIProvider{}).Error
}
