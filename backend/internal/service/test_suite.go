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
	_ = v1.ErrSuiteNoExists
	_ = v1.ErrSuiteNotFound
)

type TestSuiteService interface {
	List(ctx context.Context, req *v1.TestSuiteSearchRequest) (*v1.TestSuiteSearchResponseData, error)
	Create(ctx context.Context, req *v1.TestSuiteRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.TestSuiteRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.TestSuiteDataItem, error)
}

func NewTestSuiteService(
	service *Service,
	suiteRepository repository.TestSuiteRepository,
) TestSuiteService {
	return &testSuiteService{
		Service:         service,
		suiteRepository: suiteRepository,
	}
}

type testSuiteService struct {
	*Service
	suiteRepository repository.TestSuiteRepository
}

func (s *testSuiteService) List(ctx context.Context, req *v1.TestSuiteSearchRequest) (*v1.TestSuiteSearchResponseData, error) {
	list, total, err := s.suiteRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.TestSuiteSearchResponseData{
		List:  make([]v1.TestSuiteDataItem, 0),
		Total: total,
	}
	for _, suite := range list {
		data.List = append(data.List, s.toDataItem(suite))
	}
	return data, nil
}

func (s *testSuiteService) Create(ctx context.Context, req *v1.TestSuiteRequest, creatorID uint) error {
	suiteNo := generateSuiteNo(req.ProjectID)
	_, err := s.suiteRepository.GetBySuiteNo(ctx, req.ProjectID, suiteNo)
	if err == nil {
		return v1.ErrSuiteNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	suite := &model.TestSuite{
		ProjectID:      req.ProjectID,
		SuiteNo:        suiteNo,
		Name:           req.Name,
		Description:    req.Description,
		SuiteType:      req.SuiteType,
		CaseIDs:        req.CaseIDs,
		FilterRule:     req.FilterRule,
		Parallelism:    req.Parallelism,
		Timeout:        req.Timeout,
		RetryCount:     req.RetryCount,
		ContinueOnFail: req.ContinueOnFail,
		Status:         model.SuiteStatusNormal,
		CreatorID:      creatorID,
	}
	return s.suiteRepository.Create(ctx, suite)
}

func (s *testSuiteService) Update(ctx context.Context, id uint, req *v1.TestSuiteRequest) error {
	_, err := s.suiteRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrSuiteNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"name":             req.Name,
		"description":      req.Description,
		"suite_type":       req.SuiteType,
		"case_ids":         req.CaseIDs,
		"filter_rule":      req.FilterRule,
		"parallelism":      req.Parallelism,
		"timeout":          req.Timeout,
		"retry_count":      req.RetryCount,
		"continue_on_fail": req.ContinueOnFail,
		"status":           req.Status,
	}
	return s.suiteRepository.Update(ctx, id, data)
}

func (s *testSuiteService) Delete(ctx context.Context, id uint) error {
	return s.suiteRepository.Delete(ctx, id)
}

func (s *testSuiteService) Get(ctx context.Context, id uint) (*v1.TestSuiteDataItem, error) {
	suite, err := s.suiteRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("suiteRepository.Get error", zap.Error(err))
		return nil, err
	}
	item := s.toDataItem(suite)
	return &item, nil
}

func (s *testSuiteService) toDataItem(suite model.TestSuite) v1.TestSuiteDataItem {
	return v1.TestSuiteDataItem{
		ID:             suite.ID,
		CreatedAt:      suite.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:      suite.UpdatedAt.Format(constant.DateTimeLayout),
		ProjectID:      suite.ProjectID,
		SuiteNo:        suite.SuiteNo,
		Name:           suite.Name,
		Description:    suite.Description,
		SuiteType:      suite.SuiteType,
		CaseIDs:        suite.CaseIDs,
		FilterRule:     suite.FilterRule,
		Parallelism:    suite.Parallelism,
		Timeout:        suite.Timeout,
		RetryCount:     suite.RetryCount,
		ContinueOnFail: suite.ContinueOnFail,
		Status:         suite.Status,
		CreatorID:      suite.CreatorID,
	}
}

func generateSuiteNo(projectID uint) string {
	return fmt.Sprintf("TS-P%d-%d", projectID, generateID())
}
