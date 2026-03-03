package repository

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"context"
	"fmt"
	"strings"
)

type RoleRepository interface {
	Get(ctx context.Context, id uint) (model.Role, error)
	List(ctx context.Context, req *v1.RoleSearchRequest) ([]model.Role, int64, error)
	Create(ctx context.Context, m *model.Role) error
	Update(ctx context.Context, m *model.Role) error
	Delete(ctx context.Context, id uint) error

	ListAll(ctx context.Context) ([]model.Role, error)

	GetByCasbinRole(ctx context.Context, casbinRole string) (model.Role, error)
	DeleteCasbinRole(ctx context.Context, casbinRole string) (bool, error)

	GetPermissions(ctx context.Context, casbinRole string) ([][]string, error)
	UpdatePermissions(ctx context.Context, casbinRole string, permissions map[string]struct{}) error

	GetApiIds(ctx context.Context, roleId uint) ([]uint, error)
	UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error
	CountApiPermissions(ctx context.Context, casbinRole string) (int64, error)
}

func NewRoleRepository(
	repository *Repository,
) RoleRepository {
	return &roleRepository{
		Repository: repository,
	}
}

type roleRepository struct {
	*Repository
}

func (r *roleRepository) Get(ctx context.Context, id uint) (model.Role, error) {
	m := model.Role{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *roleRepository) List(ctx context.Context, req *v1.RoleSearchRequest) ([]model.Role, int64, error) {
	var list []model.Role
	var total int64
	scope := r.DB(ctx).Model(&model.Role{})
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if req.CasbinRole != "" {
		scope = scope.Where("casbin_role = ?", req.CasbinRole)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if req.Page > 0 && req.PageSize > 0 {
		if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Find(&list).Error; err != nil {
			return nil, total, err
		}
	} else {
		if err := scope.Find(&list).Error; err != nil {
			return nil, total, err
		}
	}

	return list, total, nil
}

func (r *roleRepository) Create(ctx context.Context, m *model.Role) error {
	return r.DB(ctx).Create(m).Error
}

func (r *roleRepository) Update(ctx context.Context, m *model.Role) error {
	return r.DB(ctx).Model(&model.Role{}).Where("id = ?", m.ID).UpdateColumn("name", m.Name).Error
}

func (r *roleRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Role{}).Error
}

func (r *roleRepository) ListAll(ctx context.Context) ([]model.Role, error) {
	var list []model.Role
	if err := r.DB(ctx).Model(&model.Role{}).Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *roleRepository) GetByCasbinRole(ctx context.Context, casbinRole string) (model.Role, error) {
	m := model.Role{}
	return m, r.DB(ctx).Where("casbin_role = ?", casbinRole).First(&m).Error
}

func (r *roleRepository) DeleteCasbinRole(ctx context.Context, casbinRole string) (bool, error) {
	return r.e.DeleteRole(casbinRole)
}

func (r *roleRepository) GetPermissions(ctx context.Context, casbinRole string) ([][]string, error) {
	return r.e.GetPermissionsForUser(casbinRole)
}

func (r *roleRepository) UpdatePermissions(ctx context.Context, casbinRole string, newPermSet map[string]struct{}) error {
	// 如果没有新的权限需要更新
	if len(newPermSet) == 0 {
		return nil
	}

	// 获取当前角色的所有权限
	oldPermissions, err := r.e.GetPermissionsForUser(casbinRole)
	if err != nil {
		return err
	}

	// 将旧权限转换为 map 方便查找
	oldPermSet := make(map[string]struct{})
	for _, perm := range oldPermissions {
		if len(perm) == 3 {
			oldPermSet[strings.Join([]string{perm[1], perm[2]}, constant.PermSep)] = struct{}{}
		}
	}

	// 找出需要删除的权限
	var shouldRemovePermList [][]string
	for key, _ := range oldPermSet {
		if _, exists := newPermSet[key]; !exists {
			shouldRemovePermList = append(shouldRemovePermList, strings.Split(key, constant.PermSep))
		}
	}

	// 找出需要添加的权限
	var shouldAddPermList [][]string
	for key, _ := range newPermSet {
		if _, exists := oldPermSet[key]; !exists {
			shouldAddPermList = append(shouldAddPermList, strings.Split(key, constant.PermSep))
		}

	}

	// 先移除多余的权限（使用 DeletePermissionForUser 逐条删除）
	for _, perm := range shouldRemovePermList {
		_, err := r.e.DeletePermissionForUser(casbinRole, perm...)
		if err != nil {
			return fmt.Errorf("移除旧权限失败: %v", err)
		}
	}

	// 再添加新的权限
	if len(shouldAddPermList) > 0 {
		_, err = r.e.AddPermissionsForUser(casbinRole, shouldAddPermList...)
		if err != nil {
			return fmt.Errorf("添加新权限失败: %v", err)
		}
	}
	return nil
}

func (r *roleRepository) GetApiIds(ctx context.Context, roleId uint) ([]uint, error) {
	// 获取角色信息
	role, err := r.Get(ctx, roleId)
	if err != nil {
		return nil, err
	}

	// 获取角色的所有权限
	permissions, err := r.e.GetPermissionsForUser(role.CasbinRole)
	if err != nil {
		return nil, err
	}

	// 提取 API 路径和方法
	type pathMethod struct {
		path   string
		method string
	}
	var pathMethods []pathMethod
	for _, perm := range permissions {
		if len(perm) >= 3 && strings.HasPrefix(perm[1], constant.ApiResourcePrefix) {
			path := strings.TrimPrefix(perm[1], constant.ApiResourcePrefix)
			method := perm[2]
			pathMethods = append(pathMethods, pathMethod{path: path, method: method})
		}
	}

	// 使用 map 去重
	apiIdSet := make(map[uint]struct{})

	// 根据 path 和 method 查找 API ID
	if len(pathMethods) > 0 {
		for _, pm := range pathMethods {
			var api model.Api
			if err := r.DB(ctx).Where("path = ? AND method = ?", pm.path, pm.method).First(&api).Error; err == nil {
				apiIdSet[api.ID] = struct{}{}
			}
		}
	}

	// 添加公开接口 ID（所有角色都拥有公开接口权限）
	var publicApis []model.Api
	if err := r.DB(ctx).Where("is_public = ?", true).Find(&publicApis).Error; err == nil {
		for _, api := range publicApis {
			apiIdSet[api.ID] = struct{}{}
		}
	}

	// 转换为切片
	apiIds := make([]uint, 0, len(apiIdSet))
	for id := range apiIdSet {
		apiIds = append(apiIds, id)
	}

	return apiIds, nil
}

func (r *roleRepository) UpdateApis(ctx context.Context, roleId uint, newApiIds []uint) error {
	// 获取角色信息
	role, err := r.Get(ctx, roleId)
	if err != nil {
		return err
	}

	// 获取当前授权的 API
	oldApiIds, err := r.GetApiIds(ctx, roleId)
	if err != nil {
		return err
	}

	// 获取所有相关 API 信息
	allIds := append(oldApiIds, newApiIds...)
	var apis []model.Api
	if err := r.DB(ctx).Where("id IN ?", allIds).Find(&apis).Error; err != nil {
		return err
	}
	apiMap := make(map[uint]model.Api)
	for _, api := range apis {
		apiMap[api.ID] = api
	}

	// 计算差异
	oldSet := make(map[uint]struct{})
	newSet := make(map[uint]struct{})
	for _, id := range oldApiIds {
		oldSet[id] = struct{}{}
	}
	for _, id := range newApiIds {
		newSet[id] = struct{}{}
	}

	// 移除权限
	for id := range oldSet {
		if _, exists := newSet[id]; !exists {
			if api, ok := apiMap[id]; ok {
				_, err := r.e.DeletePermissionForUser(role.CasbinRole, constant.ApiResourcePrefix+api.Path, api.Method)
				if err != nil {
					return err
				}
			}
		}
	}

	// 添加权限
	for id := range newSet {
		if _, exists := oldSet[id]; !exists {
			if api, ok := apiMap[id]; ok {
				_, err := r.e.AddPermissionForUser(role.CasbinRole, constant.ApiResourcePrefix+api.Path, api.Method)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}
func (r *roleRepository) CountApiPermissions(ctx context.Context, casbinRole string) (int64, error) {
	// 获取角色的所有权限
	permissions, err := r.e.GetPermissionsForUser(casbinRole)
	if err != nil {
		return 0, err
	}

	// 记录 Casbin 中已授权的 path+method
	authSet := make(map[string]struct{})
	for _, perm := range permissions {
		if len(perm) >= 3 && strings.HasPrefix(perm[1], constant.ApiResourcePrefix) {
			path := strings.TrimPrefix(perm[1], constant.ApiResourcePrefix)
			key := path + ":" + perm[2]
			authSet[key] = struct{}{}
		}
	}

	// 获取公开接口，统计不在 Casbin 中的数量
	var publicApis []model.Api
	if err := r.DB(ctx).Where("is_public = ?", true).Find(&publicApis).Error; err != nil {
		return 0, err
	}

	publicNotInCasbin := 0
	for _, api := range publicApis {
		key := api.Path + ":" + api.Method
		if _, exists := authSet[key]; !exists {
			publicNotInCasbin++
		}
	}

	// 最终权限数 = Casbin 权限数 + 不在 Casbin 中的公开接口数
	return int64(len(authSet)) + int64(publicNotInCasbin), nil
}
