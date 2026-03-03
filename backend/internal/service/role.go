package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/audit"
	"context"
	"errors"
	"fmt"
	"strings"

	"gorm.io/gorm"
)

type RoleService interface {
	List(ctx context.Context, req *v1.RoleSearchRequest) (*v1.RoleSearchResponseData, error)
	Create(ctx context.Context, req *v1.RoleRequest) error
	Update(ctx context.Context, id uint, req *v1.RoleRequest) error
	Delete(ctx context.Context, id uint) error

	ListAll(ctx context.Context) (*v1.RoleSearchResponseData, error)

	GetPermissions(ctx context.Context, role string) (*v1.GetRolePermissionResponseData, error)
	UpdatePermissions(ctx context.Context, req *v1.UpdateRolePermissionRequest) error

	GetApis(ctx context.Context, roleId uint) ([]uint, error)
	UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error
}

func NewRoleService(
	service *Service,
	roleRepository repository.RoleRepository,
) RoleService {
	return &roleService{
		Service:        service,
		roleRepository: roleRepository,
	}
}

type roleService struct {
	*Service
	roleRepository repository.RoleRepository
}

func (s *roleService) List(ctx context.Context, req *v1.RoleSearchRequest) (*v1.RoleSearchResponseData, error) {
	list, total, err := s.roleRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}
	data := &v1.RoleSearchResponseData{
		List:  make([]v1.RoleDataItem, 0),
		Total: total,
	}
	for _, role := range list {
		// 获取角色的 API 权限数量
		apiCount, _ := s.roleRepository.CountApiPermissions(ctx, role.CasbinRole)

		data.List = append(data.List, v1.RoleDataItem{
			ID:         role.ID,
			CreatedAt:  role.CreatedAt,
			UpdatedAt:  role.UpdatedAt,
			Name:       role.Name,
			CasbinRole: role.CasbinRole,
			ApiCount:   apiCount,
		})

	}
	return data, nil
}

func (s *roleService) Create(ctx context.Context, req *v1.RoleRequest) error {
	_, err := s.roleRepository.GetByCasbinRole(ctx, req.CasbinRole)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = s.roleRepository.Create(ctx, &model.Role{
				Name:       req.Name,
				CasbinRole: req.CasbinRole,
			})
			if err != nil {
				s.audit.LogFailure(ctx, audit.ActionRoleCreate, "", "", "role", "", err, map[string]interface{}{
					"name":       req.Name,
					"casbinRole": req.CasbinRole,
				})
				return err
			}
			s.audit.LogSuccess(ctx, audit.ActionRoleCreate, "", "", "role", "", map[string]interface{}{
				"name":       req.Name,
				"casbinRole": req.CasbinRole,
			})
			return nil
		} else {
			s.audit.LogFailure(ctx, audit.ActionRoleCreate, "", "", "role", "", err, map[string]interface{}{
				"name":       req.Name,
				"casbinRole": req.CasbinRole,
			})
			return err
		}
	}
	return nil
}

func (s *roleService) Update(ctx context.Context, id uint, req *v1.RoleRequest) error {
	if err := s.roleRepository.Update(ctx, &model.Role{
		Model: gorm.Model{
			ID: id,
		},
		Name: req.Name,
	}); err != nil {
		s.audit.LogFailure(ctx, audit.ActionRoleUpdate, "", "", "role", fmt.Sprintf("%d", id), err, map[string]interface{}{
			"name": req.Name,
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionRoleUpdate, "", "", "role", fmt.Sprintf("%d", id), map[string]interface{}{
		"name": req.Name,
	})
	return nil
}

func (s *roleService) Delete(ctx context.Context, id uint) error {
	old, err := s.roleRepository.Get(ctx, id)
	if err != nil {
		return err
	}
	if _, err := s.roleRepository.DeleteCasbinRole(ctx, old.CasbinRole); err != nil {
		s.audit.LogFailure(ctx, audit.ActionRoleDelete, "", "", "role", fmt.Sprintf("%d", id), err, map[string]interface{}{
			"name":       old.Name,
			"casbinRole": old.CasbinRole,
		})
		return err
	}
	if err := s.roleRepository.Delete(ctx, id); err != nil {
		s.audit.LogFailure(ctx, audit.ActionRoleDelete, "", "", "role", fmt.Sprintf("%d", id), err, nil)
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionRoleDelete, "", "", "role", fmt.Sprintf("%d", id), map[string]interface{}{
		"name":       old.Name,
		"casbinRole": old.CasbinRole,
	})
	return nil
}

func (s *roleService) ListAll(ctx context.Context) (*v1.RoleSearchResponseData, error) {
	list, err := s.roleRepository.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	data := &v1.RoleSearchResponseData{
		List: make([]v1.RoleDataItem, 0),
	}
	for _, role := range list {
		data.List = append(data.List, v1.RoleDataItem{
			ID:         role.ID,
			Name:       role.Name,
			CasbinRole: role.CasbinRole,
		})
	}
	return data, nil
}

func (s *roleService) GetPermissions(ctx context.Context, role string) (*v1.GetRolePermissionResponseData, error) {
	// 获取角色对应的权限列表
	list, err := s.roleRepository.GetPermissions(ctx, role)
	if err != nil {
		return nil, err
	}

	data := &v1.GetRolePermissionResponseData{
		List:  []string{},
		Total: 0,
	}
	for _, v := range list {
		if len(v) == 3 {
			data.List = append(data.List, strings.Join([]string{v[1], v[2]}, constant.PermSep))
		}
	}
	data.Total = int64(len(data.List))
	return data, nil
}

func (s *roleService) UpdatePermissions(ctx context.Context, req *v1.UpdateRolePermissionRequest) error {
	permissions := map[string]struct{}{}
	for _, v := range req.List {
		perm := strings.Split(v, constant.PermSep)
		if len(perm) == 2 {
			permissions[v] = struct{}{}
		}
	}
	if err := s.roleRepository.UpdatePermissions(ctx, req.CasbinRole, permissions); err != nil {
		s.audit.LogFailure(ctx, audit.ActionRolePermissionUpdate, "", "", "role", req.CasbinRole, err, map[string]interface{}{
			"permissionCount": len(permissions),
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionRolePermissionUpdate, "", "", "role", req.CasbinRole, map[string]interface{}{
		"permissionCount": len(permissions),
	})
	return nil
}

func (s *roleService) GetApis(ctx context.Context, roleId uint) ([]uint, error) {
	return s.roleRepository.GetApiIds(ctx, roleId)
}

func (s *roleService) UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error {
	if err := s.roleRepository.UpdateApis(ctx, roleId, apiIds); err != nil {
		s.audit.LogFailure(ctx, audit.ActionRoleApiUpdate, "", "", "role", fmt.Sprintf("%d", roleId), err, map[string]interface{}{
			"apiCount": len(apiIds),
		})
		return err
	}
	s.audit.LogSuccess(ctx, audit.ActionRoleApiUpdate, "", "", "role", fmt.Sprintf("%d", roleId), map[string]interface{}{
		"apiCount": len(apiIds),
	})
	return nil
}
