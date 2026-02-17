package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type BugRepository interface {
	Get(ctx context.Context, id uint) (model.Bug, error)
	GetByBugNo(ctx context.Context, bugNo string) (model.Bug, error)
	List(ctx context.Context, req *v1.BugSearchRequest) ([]model.Bug, int64, error)
	Create(ctx context.Context, m *model.Bug) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewBugRepository(repository *Repository) BugRepository {
	return &bugRepository{Repository: repository}
}

type bugRepository struct {
	*Repository
}

func (r *bugRepository) Get(ctx context.Context, id uint) (model.Bug, error) {
	m := model.Bug{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *bugRepository) GetByBugNo(ctx context.Context, bugNo string) (model.Bug, error) {
	m := model.Bug{}
	return m, r.DB(ctx).Where("bug_no = ?", bugNo).First(&m).Error
}

func (r *bugRepository) List(ctx context.Context, req *v1.BugSearchRequest) ([]model.Bug, int64, error) {
	var list []model.Bug
	var total int64
	scope := r.DB(ctx).Model(&model.Bug{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.BugNo != "" {
		scope = scope.Where("bug_no LIKE ?", "%"+req.BugNo+"%")
	}
	if req.Title != "" {
		scope = scope.Where("title LIKE ?", "%"+req.Title+"%")
	}
	if req.Severity != "" {
		scope = scope.Where("severity = ?", req.Severity)
	}
	if req.Priority != "" {
		scope = scope.Where("priority = ?", req.Priority)
	}
	if req.Status != "" {
		scope = scope.Where("status = ?", req.Status)
	}
	if req.CreatorID > 0 {
		scope = scope.Where("creator_id = ?", req.CreatorID)
	}
	if req.AssigneeID > 0 {
		scope = scope.Where("assignee_id = ?", req.AssigneeID)
	}
	if req.Environment != "" {
		scope = scope.Where("environment = ?", req.Environment)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *bugRepository) Create(ctx context.Context, m *model.Bug) error {
	return r.DB(ctx).Create(m).Error
}

func (r *bugRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Bug{}).Where("id = ?", id).Updates(data).Error
}

func (r *bugRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Bug{}).Error
}
