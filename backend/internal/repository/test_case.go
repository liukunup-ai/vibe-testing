package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type TestCaseRepository interface {
	Get(ctx context.Context, id uint) (model.TestCase, error)
	GetByCaseNo(ctx context.Context, projectID uint, caseNo string) (model.TestCase, error)
	List(ctx context.Context, req *v1.TestCaseSearchRequest) ([]model.TestCase, int64, error)
	Create(ctx context.Context, m *model.TestCase) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
	ListByIDs(ctx context.Context, ids []uint) ([]model.TestCase, error)
}

func NewTestCaseRepository(repository *Repository) TestCaseRepository {
	return &testCaseRepository{Repository: repository}
}

type testCaseRepository struct {
	*Repository
}

func (r *testCaseRepository) Get(ctx context.Context, id uint) (model.TestCase, error) {
	m := model.TestCase{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testCaseRepository) GetByCaseNo(ctx context.Context, projectID uint, caseNo string) (model.TestCase, error) {
	m := model.TestCase{}
	return m, r.DB(ctx).Where("project_id = ? AND case_no = ?", projectID, caseNo).First(&m).Error
}

func (r *testCaseRepository) List(ctx context.Context, req *v1.TestCaseSearchRequest) ([]model.TestCase, int64, error) {
	var list []model.TestCase
	var total int64
	scope := r.DB(ctx).Model(&model.TestCase{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.Title != "" {
		scope = scope.Where("title LIKE ?", "%"+req.Title+"%")
	}
	if req.Priority >= 0 {
		scope = scope.Where("priority = ?", req.Priority)
	}
	if req.Status > 0 {
		scope = scope.Where("status = ?", req.Status)
	}
	if req.Module != "" {
		scope = scope.Where("module = ?", req.Module)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *testCaseRepository) Create(ctx context.Context, m *model.TestCase) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testCaseRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestCase{}).Where("id = ?", id).Updates(data).Error
}

func (r *testCaseRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.TestCase{}).Error
}

func (r *testCaseRepository) ListByIDs(ctx context.Context, ids []uint) ([]model.TestCase, error) {
	var list []model.TestCase
	return list, r.DB(ctx).Where("id IN ?", ids).Find(&list).Error
}
