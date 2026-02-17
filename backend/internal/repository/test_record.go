package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type TestRecordRepository interface {
	Get(ctx context.Context, id uint) (model.TestRecord, error)
	List(ctx context.Context, req *v1.TestRecordSearchRequest) ([]model.TestRecord, int64, error)
	Create(ctx context.Context, m *model.TestRecord) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewTestRecordRepository(repository *Repository) TestRecordRepository {
	return &testRecordRepository{Repository: repository}
}

type testRecordRepository struct {
	*Repository
}

func (r *testRecordRepository) Get(ctx context.Context, id uint) (model.TestRecord, error) {
	m := model.TestRecord{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testRecordRepository) List(ctx context.Context, req *v1.TestRecordSearchRequest) ([]model.TestRecord, int64, error) {
	var list []model.TestRecord
	var total int64
	scope := r.DB(ctx).Model(&model.TestRecord{})
	if req.ProjectID > 0 {
		scope = scope.Where("project_id = ?", req.ProjectID)
	}
	if req.PlanID > 0 {
		scope = scope.Where("plan_id = ?", req.PlanID)
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

func (r *testRecordRepository) Create(ctx context.Context, m *model.TestRecord) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testRecordRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestRecord{}).Where("id = ?", id).Updates(data).Error
}

func (r *testRecordRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.TestRecord{}).Error
}

type TestCaseExecutionRepository interface {
	Get(ctx context.Context, id uint) (model.TestCaseExecution, error)
	ListByRecordID(ctx context.Context, recordID uint) ([]model.TestCaseExecution, error)
	Create(ctx context.Context, m *model.TestCaseExecution) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
}

func NewTestCaseExecutionRepository(repository *Repository) TestCaseExecutionRepository {
	return &testCaseExecutionRepository{Repository: repository}
}

type testCaseExecutionRepository struct {
	*Repository
}

func (r *testCaseExecutionRepository) Get(ctx context.Context, id uint) (model.TestCaseExecution, error) {
	m := model.TestCaseExecution{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testCaseExecutionRepository) ListByRecordID(ctx context.Context, recordID uint) ([]model.TestCaseExecution, error) {
	var list []model.TestCaseExecution
	return list, r.DB(ctx).Where("record_id = ?", recordID).Find(&list).Error
}

func (r *testCaseExecutionRepository) Create(ctx context.Context, m *model.TestCaseExecution) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testCaseExecutionRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestCaseExecution{}).Where("id = ?", id).Updates(data).Error
}

type TestSuiteExecutionRepository interface {
	Get(ctx context.Context, id uint) (model.TestSuiteExecution, error)
	ListByRecordID(ctx context.Context, recordID uint) ([]model.TestSuiteExecution, error)
	Create(ctx context.Context, m *model.TestSuiteExecution) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
}

func NewTestSuiteExecutionRepository(repository *Repository) TestSuiteExecutionRepository {
	return &testSuiteExecutionRepository{Repository: repository}
}

type testSuiteExecutionRepository struct {
	*Repository
}

func (r *testSuiteExecutionRepository) Get(ctx context.Context, id uint) (model.TestSuiteExecution, error) {
	m := model.TestSuiteExecution{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *testSuiteExecutionRepository) ListByRecordID(ctx context.Context, recordID uint) ([]model.TestSuiteExecution, error) {
	var list []model.TestSuiteExecution
	return list, r.DB(ctx).Where("record_id = ?", recordID).Find(&list).Error
}

func (r *testSuiteExecutionRepository) Create(ctx context.Context, m *model.TestSuiteExecution) error {
	return r.DB(ctx).Create(m).Error
}

func (r *testSuiteExecutionRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.TestSuiteExecution{}).Where("id = ?", id).Updates(data).Error
}
