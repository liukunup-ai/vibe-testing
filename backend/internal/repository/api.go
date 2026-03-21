package repository

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"context"
)

type ApiRepository interface {
	Get(ctx context.Context, id uint) (model.Api, error)
	List(ctx context.Context, req *v1.ApiSearchRequest) ([]model.Api, int64, error)
	Create(ctx context.Context, m *model.Api) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error

	ListAllGroups(ctx context.Context) ([]string, error)

	GetRoleIds(ctx context.Context, apiId uint) ([]uint, error)
	UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error
	CountRolePermissions(ctx context.Context, path string, method string) (int64, error)
}

func NewApiRepository(
	repository *Repository,
) ApiRepository {
	return &apiRepository{
		Repository: repository,
	}
}

type apiRepository struct {
	*Repository
}

func (r *apiRepository) Get(ctx context.Context, id uint) (model.Api, error) {
	m := model.Api{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *apiRepository) List(ctx context.Context, req *v1.ApiSearchRequest) ([]model.Api, int64, error) {
	var list []model.Api
	var total int64
	scope := r.DB(ctx).Model(&model.Api{})
	if req.Group != "" {
		scope = scope.Where("`group` LIKE ?", "%"+req.Group+"%")
	}
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if req.Path != "" {
		scope = scope.Where("path LIKE ?", "%"+req.Path+"%")
	}
	if req.Method != "" {
		scope = scope.Where("method = ?", req.Method)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("`group` ASC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *apiRepository) Create(ctx context.Context, m *model.Api) error {
	return r.DB(ctx).Create(m).Error
}

func (r *apiRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Api{}).Where("id = ?", id).Updates(data).Error
}

func (r *apiRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Api{}).Error
}

func (r *apiRepository) ListAllGroups(ctx context.Context) ([]string, error) {
	groups := make([]string, 0)
	if err := r.DB(ctx).Model(&model.Api{}).Group("`group`").Pluck("`group`", &groups).Error; err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *apiRepository) GetRoleIds(ctx context.Context, apiId uint) ([]uint, error) {
	// 获取 API 信息
	api, err := r.Get(ctx, apiId)
	if err != nil {
		return nil, err
	}

	// 如果是公开接口，所有角色都有权限
	if api.IsPublic {
		var roles []model.Role
		if err := r.DB(ctx).Find(&roles).Error; err != nil {
			return nil, err
		}
		var roleIds []uint
		for _, role := range roles {
			roleIds = append(roleIds, role.ID)
		}
		return roleIds, nil
	}

	// 获取所有角色
	var roles []model.Role
	if err := r.DB(ctx).Find(&roles).Error; err != nil {
		return nil, err
	}

	// 检查每个角色是否有该 API 的权限
	var roleIds []uint
	for _, role := range roles {
		hasPermission, err := r.e.Enforce(role.CasbinRole, constant.ApiResourcePrefix+api.Path, api.Method)
		if err != nil {
			return nil, err
		}
		if hasPermission {
			roleIds = append(roleIds, role.ID)
		}
	}

	return roleIds, nil
}

func (r *apiRepository) UpdateRoles(ctx context.Context, apiId uint, newRoleIds []uint) error {
	// 获取 API 信息
	api, err := r.Get(ctx, apiId)
	if err != nil {
		return err
	}

	// 获取当前授权的角色
	oldRoleIds, err := r.GetRoleIds(ctx, apiId)
	if err != nil {
		return err
	}

	// 获取角色 ID 到 CasbinRole 的映射
	var roles []model.Role
	if err := r.DB(ctx).Find(&roles).Error; err != nil {
		return err
	}
	roleMap := make(map[uint]string)
	for _, role := range roles {
		roleMap[role.ID] = role.CasbinRole
	}

	// 计算差异
	oldSet := make(map[uint]struct{})
	newSet := make(map[uint]struct{})
	for _, id := range oldRoleIds {
		oldSet[id] = struct{}{}
	}
	for _, id := range newRoleIds {
		newSet[id] = struct{}{}
	}

	// 移除权限
	for id := range oldSet {
		if _, exists := newSet[id]; !exists {
			if casbinRole, ok := roleMap[id]; ok {
				_, err := r.e.DeletePermissionForUser(casbinRole, constant.ApiResourcePrefix+api.Path, api.Method)
				if err != nil {
					return err
				}
			}
		}
	}

	// 添加权限
	for id := range newSet {
		if _, exists := oldSet[id]; !exists {
			if casbinRole, ok := roleMap[id]; ok {
				_, err := r.e.AddPermissionForUser(casbinRole, constant.ApiResourcePrefix+api.Path, api.Method)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}
func (r *apiRepository) CountRolePermissions(ctx context.Context, path string, method string) (int64, error) {
	// 查找 API
	var api model.Api
	if err := r.DB(ctx).Where("path = ? AND method = ?", path, method).First(&api).Error; err == nil {
		// 如果是公开接口，所有角色都有权限
		if api.IsPublic {
			var count int64
			r.DB(ctx).Model(&model.Role{}).Count(&count)
			return count, nil
		}
	}

	// 获取所有角色
	var roles []model.Role
	if err := r.DB(ctx).Find(&roles).Error; err != nil {
		return 0, err
	}

	// 统计有该 API 权限的角色数量
	var count int64
	for _, role := range roles {
		hasPermission, err := r.e.Enforce(role.CasbinRole, constant.ApiResourcePrefix+path, method)
		if err != nil {
			return 0, err
		}
		if hasPermission {
			count++
		}
	}

	return count, nil
}
