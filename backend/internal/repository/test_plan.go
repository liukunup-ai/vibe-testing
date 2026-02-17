package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type TestPlanRepository interface {
	Get(ctx context.Context, id uint) (model.TestPlan, error)
	GetByPlanNo(ctx context.Context, projectID uint, planNo string) (model.TestPlan, error)
	List(ctx context.Context, req *v1.TestPlanSearchRequest) ([]model.TestPlan, int64, error)
	Create(ctx context.Context, m *model.TestPlan) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewTestPlanRepository(repository *Repository) TestPlanRepository {
	return &testPlanRepository{Repository: repository}
}

type testPlanRepository struct {
	*Repository
}

func (r *testPlanRepository) Get(ctx context.Context, id uint) (model.TestPlan, error) {
	m := model.TestPlan{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testPlanRepository) GetByPlanNo(ctx context.Context, projectID uint, planNo string) (model.TestPlan, error) {
	m := model.TestPlan{}
	return m, r.DB(ctx).Where("project_id = ? AND plan_no = ?", projectID, planNo).First(&m).Error
}

func (r *testPlanRepository) List(ctx context.Context, req *v1.TestPlanSearchRequest) ([]model.TestPlan, int64, error) {
	var list []model.TestPlan
	var total int64
	scope := r.DB(ctx).Model(&model.TestPlan{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if req.ExecStatus > 0 {
		scope = scope.Where("exec_status = ?", req.ExecStatus)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *testPlanRepository) Create(ctx context.Context, m *model.TestPlan) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testPlanRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestPlan{}).Where("id = ?", id).Updates(data).Error
}

func (r *testPlanRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.TestPlan{}).Error
}
