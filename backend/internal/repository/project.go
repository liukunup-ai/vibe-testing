package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type ProjectRepository interface {
	Get(ctx context.Context, id uint) (model.Project, error)
	GetByCode(ctx context.Context, code string) (model.Project, error)
	List(ctx context.Context, req *v1.ProjectSearchRequest) ([]model.Project, int64, error)
	Create(ctx context.Context, m *model.Project) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewProjectRepository(repository *Repository) ProjectRepository {
	return &projectRepository{Repository: repository}
}

type projectRepository struct {
	*Repository
}

func (r *projectRepository) Get(ctx context.Context, id uint) (model.Project, error) {
	m := model.Project{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *projectRepository) GetByCode(ctx context.Context, code string) (model.Project, error) {
	m := model.Project{}
	return m, r.DB(ctx).Where("code = ?", code).First(&m).Error
}

func (r *projectRepository) List(ctx context.Context, req *v1.ProjectSearchRequest) ([]model.Project, int64, error) {
	var list []model.Project
	var total int64
	scope := r.DB(ctx).Model(&model.Project{})
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if req.Code != "" {
		scope = scope.Where("code LIKE ?", "%"+req.Code+"%")
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

func (r *projectRepository) Create(ctx context.Context, m *model.Project) error {
	return r.DB(ctx).Create(m).Error
}

func (r *projectRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Project{}).Where("id = ?", id).Updates(data).Error
}

func (r *projectRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Project{}).Error
}

type ProjectUserRepository interface {
	GetByProjectID(ctx context.Context, projectID uint) ([]model.ProjectUser, error)
	GetByUserID(ctx context.Context, userID uint) ([]model.ProjectUser, error)
	Create(ctx context.Context, m *model.ProjectUser) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
	DeleteByProjectID(ctx context.Context, projectID uint) error
}

func NewProjectUserRepository(repository *Repository) ProjectUserRepository {
	return &projectUserRepository{Repository: repository}
}

type projectUserRepository struct {
	*Repository
}

func (r *projectUserRepository) GetByProjectID(ctx context.Context, projectID uint) ([]model.ProjectUser, error) {
	var list []model.ProjectUser
	return list, r.DB(ctx).Where("project_id = ?", projectID).Find(&list).Error
}

func (r *projectUserRepository) GetByUserID(ctx context.Context, userID uint) ([]model.ProjectUser, error) {
	var list []model.ProjectUser
	return list, r.DB(ctx).Where("user_id = ?", userID).Find(&list).Error
}

func (r *projectUserRepository) Create(ctx context.Context, m *model.ProjectUser) error {
	return r.DB(ctx).Create(m).Error
}

func (r *projectUserRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.ProjectUser{}).Where("id = ?", id).Updates(data).Error
}

func (r *projectUserRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.ProjectUser{}).Error
}

func (r *projectUserRepository) DeleteByProjectID(ctx context.Context, projectID uint) error {
	return r.DB(ctx).Where("project_id = ?", projectID).Delete(&model.ProjectUser{}).Error
}
