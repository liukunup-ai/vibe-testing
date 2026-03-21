package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type ModelRepository interface {
	Get(ctx context.Context, id uint) (model.Model, error)
	List(ctx context.Context, req *v1.ModelSearchRequest) ([]model.Model, int64, error)
	Create(ctx context.Context, m *model.Model) error
	Update(ctx context.Context, id uint, m *model.Model) error
	Delete(ctx context.Context, id uint) error
}

func NewModelRepository(
	repository *Repository,
) ModelRepository {
	return &modelRepository{
		Repository: repository,
	}
}

type modelRepository struct {
	*Repository
}

func (r *modelRepository) Get(ctx context.Context, id uint) (model.Model, error) {
	m := model.Model{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *modelRepository) List(ctx context.Context, req *v1.ModelSearchRequest) ([]model.Model, int64, error) {
	var list []model.Model
	var total int64
	scope := r.DB(ctx).Model(&model.Model{})
	if req.Provider != nil {
		scope = scope.Where("provider = ?", *req.Provider)
	}
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id ASC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *modelRepository) Create(ctx context.Context, m *model.Model) error {
	return r.DB(ctx).Create(m).Error
}

func (r *modelRepository) Update(ctx context.Context, id uint, m *model.Model) error {
	return r.DB(ctx).Model(&model.Model{}).Where("id = ?", id).Updates(m).Error
}

func (r *modelRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Model{}).Error
}
