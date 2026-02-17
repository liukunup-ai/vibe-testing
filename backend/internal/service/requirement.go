package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrRequirementNoExists
	_ = v1.ErrRequirementNotFound
)

type RequirementService interface {
	List(ctx context.Context, req *v1.RequirementSearchRequest) (*v1.RequirementSearchResponseData, error)
	Create(ctx context.Context, req *v1.RequirementRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.RequirementRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.RequirementDataItem, error)
}

func NewRequirementService(
	service *Service,
	requirementRepository repository.RequirementRepository,
) RequirementService {
	return &requirementService{
		Service:               service,
		requirementRepository: requirementRepository,
	}
}

type requirementService struct {
	*Service
	requirementRepository repository.RequirementRepository
}

func (s *requirementService) List(ctx context.Context, req *v1.RequirementSearchRequest) (*v1.RequirementSearchResponseData, error) {
	list, total, err := s.requirementRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.RequirementSearchResponseData{
		List:  make([]v1.RequirementDataItem, 0),
		Total: total,
	}
	for _, requirement := range list {
		data.List = append(data.List, s.toDataItem(requirement))
	}
	return data, nil
}

func (s *requirementService) toDataItem(requirement model.Requirement) v1.RequirementDataItem {
	return v1.RequirementDataItem{
		ID:            requirement.ID,
		CreatedAt:     requirement.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:     requirement.UpdatedAt.Format(constant.DateTimeLayout),
		RequirementNo: requirement.RequirementNo,
		Title:         requirement.Title,
		Description:   requirement.Description,
		Priority:      requirement.Priority,
		Status:        requirement.Status,
		Owner:         requirement.Owner,
		ProjectID:     requirement.ProjectID,
		CreatorID:     requirement.CreatorID,
		ExpectedAt:    requirement.ExpectedAt,
		CompletedAt:   requirement.CompletedAt,
		Version:       requirement.Version,
		ChangeHistory: requirement.ChangeHistory,
		ParentID:      requirement.ParentID,
		TestCaseIds:   requirement.TestCaseIds,
		BugIds:        requirement.BugIds,
	}
}

func (s *requirementService) Create(ctx context.Context, req *v1.RequirementRequest, creatorID uint) error {
	_, err := s.requirementRepository.GetByNo(ctx, req.RequirementNo)
	if err == nil {
		return v1.ErrRequirementNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	requirement := &model.Requirement{
		RequirementNo: req.RequirementNo,
		Title:         req.Title,
		Description:   req.Description,
		Priority:      req.Priority,
		Status:        req.Status,
		Owner:         req.Owner,
		ProjectID:     req.ProjectID,
		CreatorID:     creatorID,
		ExpectedAt:    req.ExpectedAt,
		ParentID:      req.ParentID,
		TestCaseIds:   req.TestCaseIds,
		BugIds:        req.BugIds,
		Version:       1,
		ChangeHistory: "[]",
	}
	return s.requirementRepository.Create(ctx, requirement)
}

func (s *requirementService) Update(ctx context.Context, id uint, req *v1.RequirementRequest) error {
	_, err := s.requirementRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrRequirementNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"title":         req.Title,
		"description":   req.Description,
		"priority":      req.Priority,
		"status":        req.Status,
		"owner":         req.Owner,
		"expected_at":   req.ExpectedAt,
		"parent_id":     req.ParentID,
		"test_case_ids": req.TestCaseIds,
		"bug_ids":       req.BugIds,
	}
	return s.requirementRepository.Update(ctx, id, data)
}

func (s *requirementService) Delete(ctx context.Context, id uint) error {
	return s.requirementRepository.Delete(ctx, id)
}

func (s *requirementService) Get(ctx context.Context, id uint) (*v1.RequirementDataItem, error) {
	requirement, err := s.requirementRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("requirementRepository.Get error", zap.Error(err))
		return nil, err
	}

	item := s.toDataItem(requirement)
	return &item, nil
}
