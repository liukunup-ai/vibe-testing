package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type UserFeedbackRepository interface {
	Get(ctx context.Context, id uint) (model.UserFeedback, error)
	GetByFeedbackNo(ctx context.Context, feedbackNo string) (model.UserFeedback, error)
	List(ctx context.Context, req *v1.UserFeedbackSearchRequest) ([]model.UserFeedback, int64, error)
	GetByProjectID(ctx context.Context, projectID uint) ([]model.UserFeedback, int64, error)
	Create(ctx context.Context, m *model.UserFeedback) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewUserFeedbackRepository(repository *Repository) UserFeedbackRepository {
	return &userFeedbackRepository{Repository: repository}
}

type userFeedbackRepository struct {
	*Repository
}

func (r *userFeedbackRepository) Get(ctx context.Context, id uint) (model.UserFeedback, error) {
	m := model.UserFeedback{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *userFeedbackRepository) GetByFeedbackNo(ctx context.Context, feedbackNo string) (model.UserFeedback, error) {
	m := model.UserFeedback{}
	return m, r.DB(ctx).Where("feedback_no = ?", feedbackNo).First(&m).Error
}

func (r *userFeedbackRepository) List(ctx context.Context, req *v1.UserFeedbackSearchRequest) ([]model.UserFeedback, int64, error) {
	var list []model.UserFeedback
	var total int64
	scope := r.DB(ctx).Model(&model.UserFeedback{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.FeedbackNo != "" {
		scope = scope.Where("feedback_no LIKE ?", "%"+req.FeedbackNo+"%")
	}
	if req.Title != "" {
		scope = scope.Where("title LIKE ?", "%"+req.Title+"%")
	}
	if req.Channel != "" {
		scope = scope.Where("channel = ?", req.Channel)
	}
	if req.Status >= 0 {
		scope = scope.Where("status = ?", req.Status)
	}
	if req.Reporter != "" {
		scope = scope.Where("reporter LIKE ?", "%"+req.Reporter+"%")
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *userFeedbackRepository) GetByProjectID(ctx context.Context, projectID uint) ([]model.UserFeedback, int64, error) {
	var list []model.UserFeedback
	var total int64
	scope := r.DB(ctx).Model(&model.UserFeedback{}).Where("project_id = ?", projectID)
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *userFeedbackRepository) Create(ctx context.Context, m *model.UserFeedback) error {
	return r.DB(ctx).Create(m).Error
}

func (r *userFeedbackRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.UserFeedback{}).Where("id = ?", id).Updates(data).Error
}

func (r *userFeedbackRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.UserFeedback{}).Error
}
