package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrFeedbackNoExists
	_ = v1.ErrFeedbackNotFound
)

type UserFeedbackService interface {
	List(ctx context.Context, req *v1.UserFeedbackSearchRequest) (*v1.UserFeedbackSearchResponseData, error)
	GetByProjectID(ctx context.Context, projectID uint) (*v1.UserFeedbackSearchResponseData, error)
	Create(ctx context.Context, req *v1.UserFeedbackRequest) error
	Update(ctx context.Context, id uint, req *v1.UserFeedbackRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.UserFeedbackDataItem, error)
}

func NewUserFeedbackService(
	service *Service,
	userFeedbackRepository repository.UserFeedbackRepository,
) UserFeedbackService {
	return &userFeedbackService{
		Service:                service,
		userFeedbackRepository: userFeedbackRepository,
	}
}

type userFeedbackService struct {
	*Service
	userFeedbackRepository repository.UserFeedbackRepository
}

func (s *userFeedbackService) List(ctx context.Context, req *v1.UserFeedbackSearchRequest) (*v1.UserFeedbackSearchResponseData, error) {
	list, total, err := s.userFeedbackRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.UserFeedbackSearchResponseData{
		List:  make([]v1.UserFeedbackDataItem, 0),
		Total: total,
	}
	for _, feedback := range list {
		data.List = append(data.List, s.toDataItem(feedback))
	}
	return data, nil
}

func (s *userFeedbackService) GetByProjectID(ctx context.Context, projectID uint) (*v1.UserFeedbackSearchResponseData, error) {
	list, total, err := s.userFeedbackRepository.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	data := &v1.UserFeedbackSearchResponseData{
		List:  make([]v1.UserFeedbackDataItem, 0),
		Total: total,
	}
	for _, feedback := range list {
		data.List = append(data.List, s.toDataItem(feedback))
	}
	return data, nil
}

func (s *userFeedbackService) Create(ctx context.Context, req *v1.UserFeedbackRequest) error {
	_, err := s.userFeedbackRepository.GetByFeedbackNo(ctx, req.FeedbackNo)
	if err == nil {
		return v1.ErrFeedbackNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	occurredAt, _ := time.Parse(constant.DateTimeLayout, req.OccurredAt)
	feedback := &model.UserFeedback{
		FeedbackNo:      req.FeedbackNo,
		Title:           req.Title,
		Content:         req.Content,
		Channel:         req.Channel,
		Reporter:        req.Reporter,
		OccurredAt:      occurredAt,
		Status:          req.Status,
		Handler:         req.Handler,
		ProjectID:       req.ProjectID,
		TestRecordID:    req.TestRecordID,
		DeviceModel:     req.DeviceModel,
		OSVersion:       req.OSVersion,
		AppVersion:      req.AppVersion,
		AttachmentPaths: model.StringArray(req.AttachmentPaths),
		BugID:           req.BugID,
		ConvertedBy:     req.ConvertedBy,
	}
	if req.ConvertedAt != "" {
		convertedAt, _ := time.Parse(constant.DateTimeLayout, req.ConvertedAt)
		feedback.ConvertedAt = &convertedAt
	}
	return s.userFeedbackRepository.Create(ctx, feedback)
}

func (s *userFeedbackService) Update(ctx context.Context, id uint, req *v1.UserFeedbackRequest) error {
	_, err := s.userFeedbackRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrFeedbackNotFound
		}
		return err
	}

	occurredAt, _ := time.Parse(constant.DateTimeLayout, req.OccurredAt)
	data := map[string]interface{}{
		"title":            req.Title,
		"content":          req.Content,
		"channel":          req.Channel,
		"reporter":         req.Reporter,
		"occurred_at":      occurredAt,
		"status":           req.Status,
		"handler":          req.Handler,
		"project_id":       req.ProjectID,
		"test_record_id":   req.TestRecordID,
		"device_model":     req.DeviceModel,
		"os_version":       req.OSVersion,
		"app_version":      req.AppVersion,
		"attachment_paths": model.StringArray(req.AttachmentPaths),
		"bug_id":           req.BugID,
		"converted_by":     req.ConvertedBy,
	}
	if req.ClosedAt != "" {
		closedAt, _ := time.Parse(constant.DateTimeLayout, req.ClosedAt)
		data["closed_at"] = closedAt
	}
	if req.ConvertedAt != "" {
		convertedAt, _ := time.Parse(constant.DateTimeLayout, req.ConvertedAt)
		data["converted_at"] = convertedAt
	}
	return s.userFeedbackRepository.Update(ctx, id, data)
}

func (s *userFeedbackService) Delete(ctx context.Context, id uint) error {
	return s.userFeedbackRepository.Delete(ctx, id)
}

func (s *userFeedbackService) Get(ctx context.Context, id uint) (*v1.UserFeedbackDataItem, error) {
	feedback, err := s.userFeedbackRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("userFeedbackRepository.Get error", zap.Error(err))
		return nil, err
	}

	item := s.toDataItem(feedback)
	return &item, nil
}

func (s *userFeedbackService) toDataItem(feedback model.UserFeedback) v1.UserFeedbackDataItem {
	item := v1.UserFeedbackDataItem{
		ID:              feedback.ID,
		CreatedAt:       feedback.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:       feedback.UpdatedAt.Format(constant.DateTimeLayout),
		FeedbackNo:      feedback.FeedbackNo,
		Title:           feedback.Title,
		Content:         feedback.Content,
		Channel:         feedback.Channel,
		Reporter:        feedback.Reporter,
		OccurredAt:      feedback.OccurredAt.Format(constant.DateTimeLayout),
		Status:          feedback.Status,
		Handler:         feedback.Handler,
		ProjectID:       feedback.ProjectID,
		TestRecordID:    feedback.TestRecordID,
		DeviceModel:     feedback.DeviceModel,
		OSVersion:       feedback.OSVersion,
		AppVersion:      feedback.AppVersion,
		AttachmentPaths: feedback.AttachmentPaths,
		BugID:           feedback.BugID,
		ConvertedBy:     feedback.ConvertedBy,
	}
	if feedback.ClosedAt != nil {
		item.ClosedAt = feedback.ClosedAt.Format(constant.DateTimeLayout)
	}
	if feedback.ConvertedAt != nil {
		item.ConvertedAt = feedback.ConvertedAt.Format(constant.DateTimeLayout)
	}
	return item
}
