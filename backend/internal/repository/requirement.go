package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type RequirementRepository interface {
	Get(ctx context.Context, id uint) (model.Requirement, error)
	GetByNo(ctx context.Context, no string) (model.Requirement, error)
	List(ctx context.Context, req *v1.RequirementSearchRequest) ([]model.Requirement, int64, error)
	Create(ctx context.Context, m *model.Requirement) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewRequirementRepository(repository *Repository) RequirementRepository {
	return &requirementRepository{Repository: repository}
}

type requirementRepository struct {
	*Repository
}

func (r *requirementRepository) Get(ctx context.Context, id uint) (model.Requirement, error) {
	m := model.Requirement{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *requirementRepository) GetByNo(ctx context.Context, no string) (model.Requirement, error) {
	m := model.Requirement{}
	return m, r.DB(ctx).Where("requirement_no = ?", no).First(&m).Error
}

func (r *requirementRepository) List(ctx context.Context, req *v1.RequirementSearchRequest) ([]model.Requirement, int64, error) {
	var list []model.Requirement
	var total int64
	scope := r.DB(ctx).Model(&model.Requirement{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.Title != "" {
		scope = scope.Where("title LIKE ?", "%"+req.Title+"%")
	}
	if req.RequirementNo != "" {
		scope = scope.Where("requirement_no LIKE ?", "%"+req.RequirementNo+"%")
	}
	if req.Status != "" {
		scope = scope.Where("status = ?", req.Status)
	}
	if req.Priority != "" {
		scope = scope.Where("priority = ?", req.Priority)
	}
	if req.Owner > 0 {
		scope = scope.Where("owner = ?", req.Owner)
	}
	if req.ParentID > 0 {
		scope = scope.Where("parent_id = ?", req.ParentID)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *requirementRepository) Create(ctx context.Context, m *model.Requirement) error {
	return r.DB(ctx).Create(m).Error
}

func (r *requirementRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Requirement{}).Where("id = ?", id).Updates(data).Error
}

func (r *requirementRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Requirement{}).Error
}
