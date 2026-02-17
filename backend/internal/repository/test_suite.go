package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type TestSuiteRepository interface {
	Get(ctx context.Context, id uint) (model.TestSuite, error)
	GetBySuiteNo(ctx context.Context, projectID uint, suiteNo string) (model.TestSuite, error)
	List(ctx context.Context, req *v1.TestSuiteSearchRequest) ([]model.TestSuite, int64, error)
	Create(ctx context.Context, m *model.TestSuite) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewTestSuiteRepository(repository *Repository) TestSuiteRepository {
	return &testSuiteRepository{Repository: repository}
}

type testSuiteRepository struct {
	*Repository
}

func (r *testSuiteRepository) Get(ctx context.Context, id uint) (model.TestSuite, error) {
	m := model.TestSuite{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testSuiteRepository) GetBySuiteNo(ctx context.Context, projectID uint, suiteNo string) (model.TestSuite, error) {
	m := model.TestSuite{}
	return m, r.DB(ctx).Where("project_id = ? AND suite_no = ?", projectID, suiteNo).First(&m).Error
}

func (r *testSuiteRepository) List(ctx context.Context, req *v1.TestSuiteSearchRequest) ([]model.TestSuite, int64, error) {
	var list []model.TestSuite
	var total int64
	scope := r.DB(ctx).Model(&model.TestSuite{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
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

func (r *testSuiteRepository) Create(ctx context.Context, m *model.TestSuite) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testSuiteRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestSuite{}).Where("id = ?", id).Updates(data).Error
}

func (r *testSuiteRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.TestSuite{}).Error
}
