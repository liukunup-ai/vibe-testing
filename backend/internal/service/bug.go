package service

import (
	"backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrBugNoExists
	_ = v1.ErrBugNotFound
)

type BugService interface {
	List(ctx context.Context, req *v1.BugSearchRequest) (*v1.BugSearchResponseData, error)
	Create(ctx context.Context, req *v1.BugRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.BugRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.BugDataItem, error)
}

func NewBugService(
	service *Service,
	bugRepository repository.BugRepository,
) BugService {
	return &bugService{
		Service:       service,
		bugRepository: bugRepository,
	}
}

type bugService struct {
	*Service
	bugRepository repository.BugRepository
}

func (s *bugService) List(ctx context.Context, req *v1.BugSearchRequest) (*v1.BugSearchResponseData, error) {
	list, total, err := s.bugRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.BugSearchResponseData{
		List:  make([]v1.BugDataItem, 0),
		Total: total,
	}
	for _, bug := range list {
		data.List = append(data.List, s.modelToData(&bug))
	}
	return data, nil
}

func (s *bugService) Create(ctx context.Context, req *v1.BugRequest, creatorID uint) error {
	_, err := s.bugRepository.GetByBugNo(ctx, req.BugNo)
	if err == nil {
		return v1.ErrBugNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	bug := s.reqToModel(req)
	bug.CreatorID = creatorID
	if bug.Status == "" {
		bug.Status = model.BugStatusNew
	}
	return s.bugRepository.Create(ctx, bug)
}

func (s *bugService) Update(ctx context.Context, id uint, req *v1.BugRequest) error {
	_, err := s.bugRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrBugNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"bug_no":           req.BugNo,
		"title":            req.Title,
		"description":      req.Description,
		"severity":         req.Severity,
		"priority":         req.Priority,
		"status":           req.Status,
		"assignee_id":      req.AssigneeID,
		"verifier_id":      req.VerifierID,
		"test_case_id":     req.TestCaseID,
		"test_record_id":   req.TestRecordID,
		"user_feedback_id": req.UserFeedbackID,
		"requirement_id":   req.RequirementID,
		"environment":      req.Environment,
		"device_info":      req.DeviceInfo,
		"os":               req.OS,
		"browser":          req.Browser,
		"preconditions":    req.Preconditions,
		"steps":            req.Steps,
		"expected_result":  req.ExpectedResult,
		"actual_result":    req.ActualResult,
	}
	if len(req.AttachmentPaths) > 0 {
		bug := &model.Bug{}
		bug.SetAttachmentPaths(req.AttachmentPaths)
		data["attachment_paths"] = bug.AttachmentPaths
	}
	return s.bugRepository.Update(ctx, id, data)
}

func (s *bugService) Delete(ctx context.Context, id uint) error {
	return s.bugRepository.Delete(ctx, id)
}

func (s *bugService) Get(ctx context.Context, id uint) (*v1.BugDataItem, error) {
	bug, err := s.bugRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("bugRepository.Get error", zap.Error(err))
		return nil, err
	}

	item := s.modelToData(&bug)
	return &item, nil
}

func (s *bugService) modelToData(m *model.Bug) v1.BugDataItem {
	return v1.BugDataItem{
		ID:              m.ID,
		CreatedAt:       m.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:       m.UpdatedAt.Format(constant.DateTimeLayout),
		BugNo:           m.BugNo,
		Title:           m.Title,
		Description:     m.Desc,
		Severity:        m.Severity,
		Priority:        m.Priority,
		Status:          m.Status,
		CreatorID:       m.CreatorID,
		AssigneeID:      m.AssigneeID,
		VerifierID:      m.VerifierID,
		FixedAt:         m.FixedAt,
		VerifiedAt:      m.VerifiedAt,
		ClosedAt:        m.ClosedAt,
		ProjectID:       m.ProjectID,
		TestCaseID:      m.TestCaseID,
		TestRecordID:    m.TestRecordID,
		UserFeedbackID:  m.UserFeedbackID,
		RequirementID:   m.RequirementID,
		Environment:     m.Environment,
		DeviceInfo:      m.DeviceInfo,
		OS:              m.OS,
		Browser:         m.Browser,
		Preconditions:   m.Preconditions,
		Steps:           m.Steps,
		ExpectedResult:  m.ExpectedResult,
		ActualResult:    m.ActualResult,
		AttachmentPaths: m.GetAttachmentPaths(),
	}
}

func (s *bugService) reqToModel(req *v1.BugRequest) *model.Bug {
	bug := &model.Bug{
		BugNo:          req.BugNo,
		Title:          req.Title,
		Desc:           req.Description,
		Severity:       req.Severity,
		Priority:       req.Priority,
		Status:         req.Status,
		AssigneeID:     req.AssigneeID,
		VerifierID:     req.VerifierID,
		ProjectID:      req.ProjectID,
		TestCaseID:     req.TestCaseID,
		TestRecordID:   req.TestRecordID,
		UserFeedbackID: req.UserFeedbackID,
		RequirementID:  req.RequirementID,
		Environment:    req.Environment,
		DeviceInfo:     req.DeviceInfo,
		OS:             req.OS,
		Browser:        req.Browser,
		Preconditions:  req.Preconditions,
		Steps:          req.Steps,
		ExpectedResult: req.ExpectedResult,
		ActualResult:   req.ActualResult,
	}
	if len(req.AttachmentPaths) > 0 {
		bug.SetAttachmentPaths(req.AttachmentPaths)
	}
	return bug
}
