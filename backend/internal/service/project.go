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
	_ = v1.ErrProjectCodeExists
	_ = v1.ErrProjectNotFound
)

type ProjectService interface {
	List(ctx context.Context, req *v1.ProjectSearchRequest) (*v1.ProjectSearchResponseData, error)
	Create(ctx context.Context, req *v1.ProjectRequest, creatorID uint) error
	Update(ctx context.Context, id uint, req *v1.ProjectRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.ProjectDataItem, error)
}

func NewProjectService(
	service *Service,
	projectRepository repository.ProjectRepository,
) ProjectService {
	return &projectService{
		Service:           service,
		projectRepository: projectRepository,
	}
}

type projectService struct {
	*Service
	projectRepository repository.ProjectRepository
}

func (s *projectService) List(ctx context.Context, req *v1.ProjectSearchRequest) (*v1.ProjectSearchResponseData, error) {
	list, total, err := s.projectRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.ProjectSearchResponseData{
		List:  make([]v1.ProjectDataItem, 0),
		Total: total,
	}
	for _, project := range list {
		data.List = append(data.List, v1.ProjectDataItem{
			ID:          project.ID,
			CreatedAt:   project.CreatedAt.Format(constant.DateTimeLayout),
			UpdatedAt:   project.UpdatedAt.Format(constant.DateTimeLayout),
			Code:        project.Code,
			Name:        project.Name,
			Description: project.Description,
			Icon:        project.Icon,
			Tags:        project.Tags,
			GitRepo:     project.GitRepo,
			Status:      project.Status,
			CaseCount:   project.CaseCount,
			ExecCount:   project.ExecCount,
			CreatorID:   project.CreatorID,
		})
	}
	return data, nil
}

func (s *projectService) Create(ctx context.Context, req *v1.ProjectRequest, creatorID uint) error {
	_, err := s.projectRepository.GetByCode(ctx, req.Code)
	if err == nil {
		return v1.ErrProjectCodeExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	project := &model.Project{
		Code:         req.Code,
		Name:         req.Name,
		Description:  req.Description,
		Icon:         req.Icon,
		Tags:         req.Tags,
		GitRepo:      req.GitRepo,
		DefaultEnvID: req.DefaultEnvID,
		Status:       req.Status,
		CreatorID:    creatorID,
	}
	return s.projectRepository.Create(ctx, project)
}

func (s *projectService) Update(ctx context.Context, id uint, req *v1.ProjectRequest) error {
	_, err := s.projectRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrProjectNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"name":           req.Name,
		"description":    req.Description,
		"icon":           req.Icon,
		"tags":           req.Tags,
		"git_repo":       req.GitRepo,
		"default_env_id": req.DefaultEnvID,
		"status":         req.Status,
	}
	return s.projectRepository.Update(ctx, id, data)
}

func (s *projectService) Delete(ctx context.Context, id uint) error {
	return s.projectRepository.Delete(ctx, id)
}

func (s *projectService) Get(ctx context.Context, id uint) (*v1.ProjectDataItem, error) {
	project, err := s.projectRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("projectRepository.Get error", zap.Error(err))
		return nil, err
	}

	return &v1.ProjectDataItem{
		ID:          project.ID,
		CreatedAt:   project.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:   project.UpdatedAt.Format(constant.DateTimeLayout),
		Code:        project.Code,
		Name:        project.Name,
		Description: project.Description,
		Icon:        project.Icon,
		Tags:        project.Tags,
		GitRepo:     project.GitRepo,
		Status:      project.Status,
		CaseCount:   project.CaseCount,
		ExecCount:   project.ExecCount,
		CreatorID:   project.CreatorID,
	}, nil
}
