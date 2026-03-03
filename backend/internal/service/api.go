package service

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/audit"
	"context"
	"fmt"
)

type ApiService interface {
	Get(ctx context.Context, id uint) (model.Api, error)
	List(ctx context.Context, req *v1.ApiSearchRequest) (*v1.ApiSearchResponseData, error)
	Create(ctx context.Context, req *v1.ApiRequest) error
	Update(ctx context.Context, id uint, req *v1.ApiRequest) error
	Delete(ctx context.Context, id uint) error

	GetRoles(ctx context.Context, apiId uint) ([]uint, error)
	UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error
}
func NewApiService(
	service *Service,
	apiRepository repository.ApiRepository,
) ApiService {
	return &apiService{
		Service:       service,
		apiRepository: apiRepository,
	}
}

type apiService struct {
	*Service
	apiRepository repository.ApiRepository
}

func (s *apiService) Get(ctx context.Context, id uint) (model.Api, error) {
	return s.apiRepository.Get(ctx, id)
}

func (s *apiService) List(ctx context.Context, req *v1.ApiSearchRequest) (*v1.ApiSearchResponseData, error) {
list, total, err := s.apiRepository.List(ctx, req)
if err != nil {
return nil, err
}
data := &v1.ApiSearchResponseData{
List:   make([]v1.ApiDataItem, 0),
Total:  total,
}
	for _, api := range list {
		// 获取接口的角色授权数量
		roleCount, _ := s.apiRepository.CountRolePermissions(ctx, api.Path, api.Method)
		data.List = append(data.List, v1.ApiDataItem{
			ID:        api.ID,
			CreatedAt: api.CreatedAt,
			UpdatedAt: api.UpdatedAt,
			Group:     api.Group,
			Method:    api.Method,
			Name:      api.Name,
			Path:      api.Path,
			IsPublic:  api.IsPublic,
			RoleCount: roleCount,
		})
	}
return data, nil
}

func (s *apiService) Create(ctx context.Context, req *v1.ApiRequest) error {
	if err := s.apiRepository.Create(ctx, &model.Api{
		Group:    req.Group,
		Name:     req.Name,
		Path:     req.Path,
		Method:   req.Method,
		IsPublic: req.IsPublic,
	}); err != nil {
		s.audit.LogFailure(ctx, audit.ActionApiCreate, "", "", "api", "", err, map[string]interface{}{
			"name":   req.Name,
			"path":   req.Path,
			"method": req.Method,
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionApiCreate, "", "", "api", "", map[string]interface{}{
		"name":   req.Name,
		"path":   req.Path,
		"method": req.Method,
	})
	return nil
}

func (s *apiService) Update(ctx context.Context, id uint, req *v1.ApiRequest) error {
	data := map[string]interface{}{
		"group":     req.Group,
		"name":      req.Name,
		"path":      req.Path,
		"method":    req.Method,
		"is_public": req.IsPublic,
	}
	if err := s.apiRepository.Update(ctx, id, data); err != nil {
		s.audit.LogFailure(ctx, audit.ActionApiUpdate, "", "", "api", fmt.Sprintf("%d", id), err, map[string]interface{}{
			"name":   req.Name,
			"path":   req.Path,
			"method": req.Method,
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionApiUpdate, "", "", "api", fmt.Sprintf("%d", id), map[string]interface{}{
		"name":   req.Name,
		"path":   req.Path,
		"method": req.Method,
	})
	return nil
}

func (s *apiService) Delete(ctx context.Context, id uint) error {
	if err := s.apiRepository.Delete(ctx, id); err != nil {
		s.audit.LogFailure(ctx, audit.ActionApiDelete, "", "", "api", fmt.Sprintf("%d", id), err, nil)
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionApiDelete, "", "", "api", fmt.Sprintf("%d", id), nil)
	return nil
}

func (s *apiService) GetRoles(ctx context.Context, apiId uint) ([]uint, error) {
	return s.apiRepository.GetRoleIds(ctx, apiId)
}

func (s *apiService) UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error {
	if err := s.apiRepository.UpdateRoles(ctx, apiId, roleIds); err != nil {
		s.audit.LogFailure(ctx, audit.ActionApiRoleUpdate, "", "", "api", fmt.Sprintf("%d", apiId), err, map[string]interface{}{
			"roleCount": len(roleIds),
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionApiRoleUpdate, "", "", "api", fmt.Sprintf("%d", apiId), map[string]interface{}{
		"roleCount": len(roleIds),
	})
	return nil
}
