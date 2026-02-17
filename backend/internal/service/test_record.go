package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"time"

	"go.uber.org/zap"
)

type TestRecordService interface {
	List(ctx context.Context, req *v1.TestRecordSearchRequest) (*v1.TestRecordSearchResponseData, error)
	Create(ctx context.Context, req *v1.TestRecordRequest) (*v1.TestRecordDataItem, error)
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.TestRecordDataItem, error)
}

func NewTestRecordService(
	service *Service,
	recordRepository repository.TestRecordRepository,
) TestRecordService {
	return &testRecordService{
		Service:          service,
		recordRepository: recordRepository,
	}
}

type testRecordService struct {
	*Service
	recordRepository repository.TestRecordRepository
}

func (s *testRecordService) List(ctx context.Context, req *v1.TestRecordSearchRequest) (*v1.TestRecordSearchResponseData, error) {
	list, total, err := s.recordRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.TestRecordSearchResponseData{
		List:  make([]v1.TestRecordDataItem, 0),
		Total: total,
	}
	for _, record := range list {
		data.List = append(data.List, s.toDataItem(record))
	}
	return data, nil
}

func (s *testRecordService) Create(ctx context.Context, req *v1.TestRecordRequest) (*v1.TestRecordDataItem, error) {
	now := time.Now().Format(constant.DateTimeLayout)
	record := &model.TestRecord{
		ProjectID:   req.ProjectID,
		PlanID:      req.PlanID,
		ExecutorID:  req.ExecutorID,
		StartTime:   now,
		ExecStatus:  model.RecordExecStatusRunning,
		ExecContext: req.ExecContext,
	}
	if err := s.recordRepository.Create(ctx, record); err != nil {
		return nil, err
	}
	item := s.toDataItem(*record)
	return &item, nil
}

func (s *testRecordService) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return s.recordRepository.Update(ctx, id, data)
}

func (s *testRecordService) Delete(ctx context.Context, id uint) error {
	return s.recordRepository.Delete(ctx, id)
}

func (s *testRecordService) Get(ctx context.Context, id uint) (*v1.TestRecordDataItem, error) {
	record, err := s.recordRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("recordRepository.Get error", zap.Error(err))
		return nil, err
	}
	item := s.toDataItem(record)
	return &item, nil
}

func (s *testRecordService) toDataItem(record model.TestRecord) v1.TestRecordDataItem {
	return v1.TestRecordDataItem{
		ID:           record.ID,
		CreatedAt:    record.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:    record.UpdatedAt.Format(constant.DateTimeLayout),
		ProjectID:    record.ProjectID,
		PlanID:       record.PlanID,
		ExecutorID:   record.ExecutorID,
		StartTime:    record.StartTime,
		EndTime:      record.EndTime,
		Duration:     record.Duration,
		ExecStatus:   record.ExecStatus,
		TotalCases:   record.TotalCases,
		PassedCases:  record.PassedCases,
		FailedCases:  record.FailedCases,
		BlockedCases: record.BlockedCases,
		SkippedCases: record.SkippedCases,
		PassRate:     record.PassRate,
		ExecContext:  record.ExecContext,
		ReportURL:    record.ReportURL,
		ReportFormat: record.ReportFormat,
	}
}
