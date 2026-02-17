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
	_ = v1.ErrCaseNoExists
	_ = v1.ErrCaseNotFound
)

type TestCaseService interface {
	List(ctx context.Context, req *v1.TestCaseSearchRequest) (*v1.TestCaseSearchResponseData, error)
	Create(ctx context.Context, req *v1.TestCaseRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.TestCaseRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.TestCaseDataItem, error)
}

func NewTestCaseService(
	service *Service,
	caseRepository repository.TestCaseRepository,
) TestCaseService {
	return &testCaseService{
		Service:        service,
		caseRepository: caseRepository,
	}
}

type testCaseService struct {
	*Service
	caseRepository repository.TestCaseRepository
}

func (s *testCaseService) List(ctx context.Context, req *v1.TestCaseSearchRequest) (*v1.TestCaseSearchResponseData, error) {
	list, total, err := s.caseRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.TestCaseSearchResponseData{
		List:  make([]v1.TestCaseDataItem, 0),
		Total: total,
	}
	for _, c := range list {
		data.List = append(data.List, s.toDataItem(c))
	}
	return data, nil
}

func (s *testCaseService) Create(ctx context.Context, req *v1.TestCaseRequest, creatorID uint) error {
	_, err := s.caseRepository.GetByCaseNo(ctx, req.ProjectID, generateCaseNo(req.ProjectID))
	if err == nil {
		return v1.ErrCaseNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	c := &model.TestCase{
		ProjectID:     req.ProjectID,
		CaseNo:        generateCaseNo(req.ProjectID),
		Title:         req.Title,
		Description:   req.Description,
		Priority:      req.Priority,
		CaseType:      req.CaseType,
		Module:        req.Module,
		Tags:          req.Tags,
		RequirementID: req.RequirementID,
		StepsData:     req.StepsData,
		Status:        req.Status,
		CreatorID:     creatorID,
	}
	return s.caseRepository.Create(ctx, c)
}

func (s *testCaseService) Update(ctx context.Context, id uint, req *v1.TestCaseRequest) error {
	c, err := s.caseRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrCaseNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"title":          req.Title,
		"description":    req.Description,
		"priority":       req.Priority,
		"case_type":      req.CaseType,
		"module":         req.Module,
		"tags":           req.Tags,
		"requirement_id": req.RequirementID,
		"steps_data":     req.StepsData,
		"status":         req.Status,
		"version":        c.Version + 1,
	}
	return s.caseRepository.Update(ctx, id, data)
}

func (s *testCaseService) Delete(ctx context.Context, id uint) error {
	return s.caseRepository.Delete(ctx, id)
}

func (s *testCaseService) Get(ctx context.Context, id uint) (*v1.TestCaseDataItem, error) {
	c, err := s.caseRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("caseRepository.Get error", zap.Error(err))
		return nil, err
	}
	item := s.toDataItem(c)
	return &item, nil
}

func (s *testCaseService) toDataItem(c model.TestCase) v1.TestCaseDataItem {
	return v1.TestCaseDataItem{
		ID:            c.ID,
		CreatedAt:     c.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:     c.UpdatedAt.Format(constant.DateTimeLayout),
		ProjectID:     c.ProjectID,
		CaseNo:        c.CaseNo,
		Title:         c.Title,
		Description:   c.Description,
		Priority:      c.Priority,
		CaseType:      c.CaseType,
		Module:        c.Module,
		Tags:          c.Tags,
		RequirementID: c.RequirementID,
		Status:        c.Status,
		Version:       c.Version,
		StepsData:     c.StepsData,
		CreatorID:     c.CreatorID,
	}
}

func generateCaseNo(projectID uint) string {
	return fmt.Sprintf("TC-P%d-%d", projectID, generateID())
}

var idCounter uint = 1000

func generateID() uint {
	idCounter++
	return idCounter
}
