package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"
	"fmt"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrPlanNoExists
	_ = v1.ErrPlanNotFound
)

type TestPlanService interface {
	List(ctx context.Context, req *v1.TestPlanSearchRequest) (*v1.TestPlanSearchResponseData, error)
	Create(ctx context.Context, req *v1.TestPlanRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.TestPlanRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.TestPlanDataItem, error)
}

func NewTestPlanService(
	service *Service,
	planRepository repository.TestPlanRepository,
) TestPlanService {
	return &testPlanService{
		Service:        service,
		planRepository: planRepository,
	}
}

type testPlanService struct {
	*Service
	planRepository repository.TestPlanRepository
}

func (s *testPlanService) List(ctx context.Context, req *v1.TestPlanSearchRequest) (*v1.TestPlanSearchResponseData, error) {
	list, total, err := s.planRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.TestPlanSearchResponseData{
		List:  make([]v1.TestPlanDataItem, 0),
		Total: total,
	}
	for _, plan := range list {
		data.List = append(data.List, s.toDataItem(plan))
	}
	return data, nil
}

func (s *testPlanService) Create(ctx context.Context, req *v1.TestPlanRequest, creatorID uint) error {
	planNo := generatePlanNo(req.ProjectID)
	_, err := s.planRepository.GetByPlanNo(ctx, req.ProjectID, planNo)
	if err == nil {
		return v1.ErrPlanNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	plan := &model.TestPlan{
		ProjectID:         req.ProjectID,
		PlanNo:            planNo,
		Name:              req.Name,
		Description:       req.Description,
		PlanType:          req.PlanType,
		ContentData:       req.ContentData,
		TriggerType:       req.TriggerType,
		CronExpr:          req.CronExpr,
		Parallelism:       req.Parallelism,
		Timeout:           req.Timeout,
		RetryCount:        req.RetryCount,
		NotifyConfig:      req.NotifyConfig,
		ExpectedStartTime: req.ExpectedStartTime,
		ExpectedEndTime:   req.ExpectedEndTime,
		ExecStatus:        model.PlanExecStatusPending,
		CreatorID:         creatorID,
	}
	return s.planRepository.Create(ctx, plan)
}

func (s *testPlanService) Update(ctx context.Context, id uint, req *v1.TestPlanRequest) error {
	_, err := s.planRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrPlanNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"name":                req.Name,
		"description":         req.Description,
		"plan_type":           req.PlanType,
		"content_data":        req.ContentData,
		"trigger_type":        req.TriggerType,
		"cron_expr":           req.CronExpr,
		"parallelism":         req.Parallelism,
		"timeout":             req.Timeout,
		"retry_count":         req.RetryCount,
		"notify_config":       req.NotifyConfig,
		"expected_start_time": req.ExpectedStartTime,
		"expected_end_time":   req.ExpectedEndTime,
	}
	return s.planRepository.Update(ctx, id, data)
}

func (s *testPlanService) Delete(ctx context.Context, id uint) error {
	return s.planRepository.Delete(ctx, id)
}

func (s *testPlanService) Get(ctx context.Context, id uint) (*v1.TestPlanDataItem, error) {
	plan, err := s.planRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("planRepository.Get error", zap.Error(err))
		return nil, err
	}
	item := s.toDataItem(plan)
	return &item, nil
}

func (s *testPlanService) toDataItem(plan model.TestPlan) v1.TestPlanDataItem {
	return v1.TestPlanDataItem{
		ID:                plan.ID,
		CreatedAt:         plan.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:         plan.UpdatedAt.Format(constant.DateTimeLayout),
		ProjectID:         plan.ProjectID,
		PlanNo:            plan.PlanNo,
		Name:              plan.Name,
		Description:       plan.Description,
		PlanType:          plan.PlanType,
		ContentData:       plan.ContentData,
		TriggerType:       plan.TriggerType,
		CronExpr:          plan.CronExpr,
		Parallelism:       plan.Parallelism,
		Timeout:           plan.Timeout,
		RetryCount:        plan.RetryCount,
		NotifyConfig:      plan.NotifyConfig,
		ExpectedStartTime: plan.ExpectedStartTime,
		ExpectedEndTime:   plan.ExpectedEndTime,
		ActualStartTime:   plan.ActualStartTime,
		ActualEndTime:     plan.ActualEndTime,
		ExecStatus:        plan.ExecStatus,
		ExecutorID:        plan.ExecutorID,
		CreatorID:         plan.CreatorID,
	}
}

func generatePlanNo(projectID uint) string {
	return fmt.Sprintf("TP-P%d-%d", projectID, generateID())
}
