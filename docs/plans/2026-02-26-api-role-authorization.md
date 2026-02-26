# 接口角色授权功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在接口管理和角色管理页面添加双向关联，支持配置角色能访问哪些接口。

**Architecture:** 复用现有 Casbin 权限系统，无需新增数据库表。后端新增 4 个 API，前端改造两个页面的编辑表单。

**Tech Stack:** Go (Gin/GORM/Casbin), React (Ant Design Pro/UmiJS), TypeScript

---

## Task 1: 后端 - API 请求/响应类型定义

**Files:**
- Modify: `backend/api/v1/api.go`
- Modify: `backend/api/v1/role.go`

**Step 1: 在 api.go 添加接口角色相关类型**

在 `backend/api/v1/api.go` 末尾添加：

```go
// ApiRoleResponse 接口授权角色响应
type ApiRoleResponse struct {
	RoleIds []uint `json:"roleIds"`
}

// UpdateApiRolesRequest 更新接口角色请求
type UpdateApiRolesRequest struct {
	RoleIds []uint `json:"roleIds" binding:"required"`
}
```

**Step 2: 在 role.go 添加角色接口权限相关类型**

在 `backend/api/v1/role.go` 末尾添加：

```go
// RoleApiResponse 角色接口权限响应
type RoleApiResponse struct {
	ApiIds []uint `json:"apiIds"`
}

// UpdateRoleApisRequest 更新角色接口权限请求
type UpdateRoleApisRequest struct {
	ApiIds []uint `json:"apiIds" binding:"required"`
}
```

**Step 3: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功，无错误

**Step 4: Commit**

```bash
git add backend/api/v1/api.go backend/api/v1/role.go
git commit -m "feat(api): add request/response types for api-role authorization"
```

---

## Task 2: 后端 - Repository 层添加权限操作方法

**Files:**
- Modify: `backend/internal/repository/api.go`

**Step 1: 在 ApiRepository 接口添加方法**

在 `backend/internal/repository/api.go` 的 `ApiRepository` 接口中添加：

```go
// 在接口定义中添加
GetRoleIds(ctx context.Context, apiId uint) ([]uint, error)
UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error
```

**Step 2: 实现 GetRoleIds 方法**

在 `apiRepository` struct 中添加实现：

```go
func (r *apiRepository) GetRoleIds(ctx context.Context, apiId uint) ([]uint, error) {
	// 获取 API 信息
	api, err := r.Get(ctx, apiId)
	if err != nil {
		return nil, err
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
```

**Step 3: 实现 UpdateRoles 方法**

```go
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
```

**Step 4: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

**Step 5: Commit**

```bash
git add backend/internal/repository/api.go
git commit -m "feat(repo): add GetRoleIds and UpdateRoles methods for api repository"
```

---

## Task 3: 后端 - Repository 层添加角色接口权限方法

**Files:**
- Modify: `backend/internal/repository/role.go`

**Step 1: 在 RoleRepository 接口添加方法**

在 `backend/internal/repository/role.go` 的 `RoleRepository` 接口中添加：

```go
// 在接口定义中添加
GetApiIds(ctx context.Context, roleId uint) ([]uint, error)
UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error
```

**Step 2: 实现 GetApiIds 方法**

在 `roleRepository` struct 中添加实现：

```go
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
	var paths, methods []string
	for _, perm := range permissions {
		if len(perm) >= 3 && strings.HasPrefix(perm[1], constant.ApiResourcePrefix) {
			paths = append(paths, strings.TrimPrefix(perm[1], constant.ApiResourcePrefix))
			methods = append(methods, perm[2])
		}
	}

	// 根据 path 和 method 查找 API ID
	var apiIds []uint
	if len(paths) > 0 {
		var apis []model.Api
		if err := r.DB(ctx).Where("(path, method) IN ?", buildPathMethodPairs(paths, methods)).Find(&apis).Error; err != nil {
			return nil, err
		}
		for _, api := range apis {
			apiIds = append(apiIds, api.ID)
		}
	}

	return apiIds, nil
}

func buildPathMethodPairs(paths, methods []string) [][]interface{} {
	pairs := make([][]interface{}, len(paths))
	for i := range paths {
		pairs[i] = []interface{}{paths[i], methods[i]}
	}
	return pairs
}
```

**Step 3: 实现 UpdateApis 方法**

```go
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
```

**Step 4: 添加必要的 import**

确保文件顶部有：
```go
import (
	"strings"
	// ... 其他 imports
)
```

**Step 5: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

**Step 6: Commit**

```bash
git add backend/internal/repository/role.go
git commit -m "feat(repo): add GetApiIds and UpdateApis methods for role repository"
```

---

## Task 4: 后端 - Service 层添加业务逻辑

**Files:**
- Modify: `backend/internal/service/api.go`
- Modify: `backend/internal/service/role.go`

**Step 1: 在 ApiService 接口添加方法**

在 `backend/internal/service/api.go` 的 `ApiService` 接口中添加：

```go
GetRoles(ctx context.Context, apiId uint) ([]uint, error)
UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error
```

**Step 2: 实现 ApiService 方法**

在 `apiService` struct 中添加实现：

```go
func (s *apiService) GetRoles(ctx context.Context, apiId uint) ([]uint, error) {
	return s.apiRepository.GetRoleIds(ctx, apiId)
}

func (s *apiService) UpdateRoles(ctx context.Context, apiId uint, roleIds []uint) error {
	return s.apiRepository.UpdateRoles(ctx, apiId, roleIds)
}
```

**Step 3: 在 RoleService 接口添加方法**

在 `backend/internal/service/role.go` 的 `RoleService` 接口中添加：

```go
GetApis(ctx context.Context, roleId uint) ([]uint, error)
UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error
```

**Step 4: 实现 RoleService 方法**

在 `roleService` struct 中添加实现：

```go
func (s *roleService) GetApis(ctx context.Context, roleId uint) ([]uint, error) {
	return s.roleRepository.GetApiIds(ctx, roleId)
}

func (s *roleService) UpdateApis(ctx context.Context, roleId uint, apiIds []uint) error {
	return s.roleRepository.UpdateApis(ctx, roleId, apiIds)
}
```

**Step 5: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

**Step 6: Commit**

```bash
git add backend/internal/service/api.go backend/internal/service/role.go
git commit -m "feat(service): add GetRoles/UpdateRoles and GetApis/UpdateApis methods"
```

---

## Task 5: 后端 - Handler 层添加 HTTP 处理

**Files:**
- Modify: `backend/internal/handler/api.go`
- Modify: `backend/internal/handler/role.go`

**Step 1: 在 api.go 添加 GetRoles handler**

在 `backend/internal/handler/api.go` 中添加：

```go
// GetApiRoles godoc
// @Summary 获取接口授权的角色列表
// @Tags Api
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "接口ID"
// @Success 200 {object} v1.ApiRoleResponse
// @Router /apis/{id}/roles [get]
// @ID GetApiRoles
func (h *ApiHandler) GetApiRoles(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	roleIds, err := h.apiService.GetRoles(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("get api roles error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}

	v1.HandleSuccess(ctx, v1.ApiRoleResponse{RoleIds: roleIds})
}
```

**Step 2: 在 api.go 添加 UpdateRoles handler**

```go
// UpdateApiRoles godoc
// @Summary 更新接口授权的角色
// @Tags Api
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "接口ID"
// @Param body body v1.UpdateApiRolesRequest true "角色ID列表"
// @Success 200 {object} v1.Response
// @Router /apis/{id}/roles [put]
// @ID UpdateApiRoles
func (h *ApiHandler) UpdateApiRoles(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	var req v1.UpdateApiRolesRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("bind request error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.apiService.UpdateRoles(ctx, uint(id), req.RoleIds); err != nil {
		h.logger.WithContext(ctx).Error("update api roles error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}

	v1.HandleSuccess(ctx, nil)
}
```

**Step 3: 在 role.go 添加 GetApis handler**

在 `backend/internal/handler/role.go` 中添加：

```go
// GetRoleApis godoc
// @Summary 获取角色授权的接口列表
// @Tags Role
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "角色ID"
// @Success 200 {object} v1.RoleApiResponse
// @Router /roles/{id}/apis [get]
// @ID GetRoleApis
func (h *RoleHandler) GetRoleApis(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	apiIds, err := h.roleService.GetApis(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("get role apis error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}

	v1.HandleSuccess(ctx, v1.RoleApiResponse{ApiIds: apiIds})
}
```

**Step 4: 在 role.go 添加 UpdateApis handler**

```go
// UpdateRoleApis godoc
// @Summary 更新角色授权的接口
// @Tags Role
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "角色ID"
// @Param body body v1.UpdateRoleApisRequest true "接口ID列表"
// @Success 200 {object} v1.Response
// @Router /roles/{id}/apis [put]
// @ID UpdateRoleApis
func (h *RoleHandler) UpdateRoleApis(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	var req v1.UpdateRoleApisRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("bind request error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.roleService.UpdateApis(ctx, uint(id), req.ApiIds); err != nil {
		h.logger.WithContext(ctx).Error("update role apis error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}

	v1.HandleSuccess(ctx, nil)
}
```

**Step 5: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

**Step 6: Commit**

```bash
git add backend/internal/handler/api.go backend/internal/handler/role.go
git commit -m "feat(handler): add GetRoles/UpdateRoles and GetApis/UpdateApis handlers"
```

---

## Task 6: 后端 - 注册路由

**Files:**
- Modify: `backend/internal/server/http.go`

**Step 1: 查找路由注册位置**

找到 `RegisterRoutes` 函数中 API 和 Role 相关的路由组。

**Step 2: 添加新路由**

在 API 路由组中添加：

```go
// 在 apiGroup 中添加
apiGroup.GET("/:id/roles", apiHandler.GetApiRoles)
apiGroup.PUT("/:id/roles", apiHandler.UpdateApiRoles)
```

在 Role 路由组中添加：

```go
// 在 roleGroup 中添加
roleGroup.GET("/:id/apis", roleHandler.GetRoleApis)
roleGroup.PUT("/:id/apis", roleHandler.UpdateRoleApis)
```

**Step 3: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

**Step 4: 生成 Swagger 文档**

Run: `cd backend && make swag`
Expected: 生成成功

**Step 5: Commit**

```bash
git add backend/internal/server/http.go backend/docs/
git commit -m "feat(router): register api-role authorization routes"
```

---

## Task 7: 后端 - 运行测试

**Step 1: 运行现有测试**

Run: `cd backend && make test`
Expected: 所有测试通过

**Step 2: 如果测试失败，修复问题**

根据测试输出修复代码问题。

---

## Task 8: 前端 - 生成 API 服务

**Files:**
- Generate: `frontend/src/services/backend/` (自动生成)

**Step 1: 启动后端服务**

Run: `cd backend && make bootstrap` (或 `nunu run ./cmd/server`)

**Step 2: 生成前端 API**

Run: `cd frontend && npm run openapi`
Expected: 生成新的 API 服务文件

**Step 3: 检查生成的 API**

确认 `frontend/src/services/backend/` 中包含新的 API 方法：
- `getApiRoles`
- `updateApiRoles`
- `getRoleApis`
- `updateRoleApis`

**Step 4: Commit**

```bash
git add frontend/src/services/backend/
git commit -m "feat(frontend): generate api-role authorization services"
```

---

## Task 9: 前端 - 接口管理页面添加角色列

**Files:**
- Modify: `frontend/src/pages/Admin/Api/index.tsx`

**Step 1: 添加角色数量列**

在 `columns` 数组中，`method` 列之后添加：

```typescript
{
  title: intl.formatMessage({
    id: 'pages.admin.api.key.roles',
    defaultMessage: '授权角色',
  }),
  dataIndex: 'roleCount',
  hideInSearch: true,
  render: (_, record) => {
    // 这个值会在请求后填充
    return record.roleCount || 0;
  },
},
```

**Step 2: 添加获取角色数量的逻辑**

在 `searchApis` 函数中，返回数据后需要为每条记录添加 `roleCount`。由于需要额外请求，暂时简化为在编辑时加载。

**Step 3: Commit**

```bash
git add frontend/src/pages/Admin/Api/index.tsx
git commit -m "feat(frontend): add role count column to api list"
```

---

## Task 10: 前端 - 接口编辑表单添加角色选择

**Files:**
- Modify: `frontend/src/pages/Admin/Api/components/UpdateForm.tsx`

**Step 1: 添加必要的 imports**

```typescript
import { getApiRoles, updateApiRoles } from '@/services/backend/api';
import { listRoles } from '@/services/backend/role';
import { Select, Spin, Tag } from 'antd';
```

**Step 2: 添加状态管理**

在组件内部添加：

```typescript
const [roleOptions, setRoleOptions] = useState<API.Role[]>([]);
const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
const [loadingRoles, setLoadingRoles] = useState(false);
```

**Step 3: 加载角色数据**

添加 `useEffect`：

```typescript
useEffect(() => {
  // 加载所有角色
  const loadRoles = async () => {
    try {
      const response = await listRoles({ page: 1, pageSize: 1000 });
      if (response.success && response.data?.list) {
        setRoleOptions(response.data.list);
      }
    } catch (error) {
      // ignore
    }
  };
  loadRoles();
}, []);

// 当 initialValues 变化时，加载已授权的角色
useEffect(() => {
  if (visible && initialValues?.id) {
    setLoadingRoles(true);
    getApiRoles({ id: initialValues.id })
      .then((response) => {
        if (response.success && response.data) {
          setSelectedRoles(response.data.roleIds || []);
        }
      })
      .finally(() => setLoadingRoles(false));
  }
}, [visible, initialValues?.id]);
```

**Step 4: 修改表单提交逻辑**

在 `onFinish` 中添加角色更新：

```typescript
const handleFinish = async (values: API.UpdateApiRequest) => {
  try {
    // 更新接口信息
    await updateApi({ id: initialValues?.id }, values);
    // 更新角色授权
    await updateApiRoles({ id: initialValues?.id }, { roleIds: selectedRoles });
    onSuccess();
  } catch (error) {
    message.error(intl.formatMessage({
      id: 'pages.common.update.failure',
      defaultMessage: '更新失败',
    }));
  }
};
```

**Step 5: 在表单中添加角色选择器**

在 Modal Form 的 `method` 字段之后添加：

```typescript
<ProFormSelect
  name="roles"
  label={intl.formatMessage({
    id: 'pages.admin.api.key.roles',
    defaultMessage: '授权角色',
  })}
  mode="multiple"
  options={roleOptions.map((r) => ({ label: r.name, value: r.id }))}
  fieldProps={{
    loading: loadingRoles,
    value: selectedRoles,
    onChange: setSelectedRoles,
    optionRender: (option) => (
      <span>
        <Tag color="blue">{option.data.label}</Tag>
      </span>
    ),
  }}
/>
```

**Step 6: 验证 TypeScript 编译**

Run: `cd frontend && npm run tsc`
Expected: 无类型错误

**Step 7: Commit**

```bash
git add frontend/src/pages/Admin/Api/components/UpdateForm.tsx
git commit -m "feat(frontend): add role selection to api update form"
```

---

## Task 11: 前端 - 角色管理页面添加接口权限列

**Files:**
- Modify: `frontend/src/pages/Admin/Role/index.tsx`

**Step 1: 添加接口权限数量列**

在 `columns` 数组中，`casbinRole` 列之后添加：

```typescript
{
  title: intl.formatMessage({
    id: 'pages.admin.role.key.apiCount',
    defaultMessage: '接口权限',
  }),
  dataIndex: 'apiCount',
  hideInSearch: true,
  render: (_, record) => {
    return record.apiCount || 0;
  },
},
```

**Step 2: Commit**

```bash
git add frontend/src/pages/Admin/Role/index.tsx
git commit -m "feat(frontend): add api count column to role list"
```

---

## Task 12: 前端 - 角色编辑表单改造为 Tabs

**Files:**
- Modify: `frontend/src/pages/Admin/Role/components/UpdateForm.tsx`

**Step 1: 添加必要的 imports**

```typescript
import { Tabs, Tree, Spin, Input, Select, Tag, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getRoleApis, updateRoleApis } from '@/services/backend/role';
import { listApis } from '@/services/backend/api';
import type { DataNode } from 'antd/es/tree';
```

**Step 2: 添加状态管理**

```typescript
const [activeTab, setActiveTab] = useState('basic');
const [apiList, setApiList] = useState<API.Api[]>([]);
const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
const [loadingApis, setLoadingApis] = useState(false);
const [searchText, setSearchText] = useState('');
const [methodFilter, setMethodFilter] = useState<string>('ALL');
```

**Step 3: 加载接口数据和已授权接口**

```typescript
useEffect(() => {
  // 加载所有接口
  const loadApis = async () => {
    try {
      const response = await listApis({ page: 1, pageSize: 10000 });
      if (response.success && response.data?.list) {
        setApiList(response.data.list);
      }
    } catch (error) {
      // ignore
    }
  };
  loadApis();
}, []);

// 当 visible 变化时，加载已授权的接口
useEffect(() => {
  if (visible && initialValues?.id) {
    setLoadingApis(true);
    getRoleApis({ id: initialValues.id })
      .then((response) => {
        if (response.success && response.data) {
          setCheckedKeys(response.data.apiIds || []);
        }
      })
      .finally(() => setLoadingApis(false));
  }
}, [visible, initialValues?.id]);
```

**Step 4: 构建树形数据**

```typescript
const buildTreeData = (): DataNode[] => {
  // 按分组整理
  const groupedApis: Record<string, API.Api[]> = {};
  apiList.forEach((api) => {
    // 应用搜索和方法筛选
    if (searchText) {
      const search = searchText.toLowerCase();
      if (
        !api.name?.toLowerCase().includes(search) &&
        !api.path?.toLowerCase().includes(search)
      ) {
        return;
      }
    }
    if (methodFilter !== 'ALL' && api.method !== methodFilter) {
      return;
    }

    const group = api.group || '未分组';
    if (!groupedApis[group]) {
      groupedApis[group] = [];
    }
    groupedApis[group].push(api);
  });

  // 转换为树形结构
  return Object.entries(groupedApis).map(([group, apis]) => ({
    key: `group-${group}`,
    title: (
      <Space>
        <span>{group}</span>
        <span style={{ color: '#999' }}>({apis.length})</span>
      </Space>
    ),
    children: apis.map((api) => ({
      key: api.id!,
      title: (
        <Space>
          <Tag color={getMethodColor(api.method)}>{api.method}</Tag>
          <span>{api.path}</span>
          <span style={{ color: '#999' }}>{api.name}</span>
        </Space>
      ),
    })),
  }));
};

const getMethodColor = (method?: string) => {
  switch (method) {
    case 'GET':
      return 'green';
    case 'POST':
      return 'blue';
    case 'PUT':
      return 'orange';
    case 'DELETE':
      return 'red';
    default:
      return 'default';
  }
};
```

**Step 5: 计算统计信息**

```typescript
const stats = {
  total: apiList.length,
  checked: checkedKeys.filter((k) => typeof k === 'number').length,
};
```

**Step 6: 修改表单结构为 Tabs**

将 Modal 内容改为：

```typescript
<Modal
  title={intl.formatMessage({ id: 'pages.admin.role.edit.title', defaultMessage: '编辑角色' })}
  open={visible}
  onCancel={onCancel}
  onOk={handleOk}
  width={700}
  destroyOnClose
>
  <Tabs
    activeKey={activeTab}
    onChange={setActiveTab}
    items={[
      {
        key: 'basic',
        label: intl.formatMessage({ id: 'pages.admin.role.tab.basic', defaultMessage: '基本信息' }),
        children: (
          <ProForm
            form={form}
            submitter={false}
            initialValues={initialValues}
          >
            <ProFormText
              name="name"
              label={intl.formatMessage({ id: 'pages.admin.role.key.name', defaultMessage: '名称' })}
              rules={[{ required: true }]}
            />
            <ProFormText
              name="casbinRole"
              label={intl.formatMessage({ id: 'pages.admin.role.key.role', defaultMessage: '标识' })}
              disabled
              tooltip="标识不可修改"
            />
          </ProForm>
        ),
      },
      {
        key: 'apis',
        label: intl.formatMessage({ id: 'pages.admin.role.tab.apis', defaultMessage: '接口权限' }),
        children: (
          <Spin spinning={loadingApis}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space>
                <Input
                  placeholder="搜索接口名称或路径"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                <Select
                  value={methodFilter}
                  onChange={setMethodFilter}
                  style={{ width: 100 }}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' },
                  ]}
                />
                <span style={{ color: '#999' }}>
                  已授权 {stats.checked}/{stats.total} 个接口
                </span>
              </Space>
              <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
                <Tree
                  checkable
                  checkedKeys={checkedKeys}
                  onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
                  treeData={buildTreeData()}
                  defaultExpandAll
                />
              </div>
            </Space>
          </Spin>
        ),
      },
    ]}
  />
</Modal>
```

**Step 7: 修改提交逻辑**

```typescript
const handleOk = async () => {
  try {
    // 更新基本信息
    const values = await form.validateFields();
    await updateRole({ id: initialValues?.id }, values);
    
    // 更新接口权限
    const apiIds = checkedKeys.filter((k) => typeof k === 'number') as number[];
    await updateRoleApis({ id: initialValues?.id }, { apiIds });
    
    message.success(intl.formatMessage({
      id: 'pages.common.update.success',
      defaultMessage: '更新成功',
    }));
    onSuccess();
  } catch (error) {
    message.error(intl.formatMessage({
      id: 'pages.common.update.failure',
      defaultMessage: '更新失败',
    }));
  }
};
```

**Step 8: 验证 TypeScript 编译**

Run: `cd frontend && npm run tsc`
Expected: 无类型错误

**Step 9: Commit**

```bash
git add frontend/src/pages/Admin/Role/components/UpdateForm.tsx
git commit -m "feat(frontend): redesign role update form with tabs and api tree selection"
```

---

## Task 13: 前端 - 验证和测试

**Step 1: 运行前端 lint**

Run: `cd frontend && npm run lint`
Expected: 无 lint 错误

**Step 2: 运行前端类型检查**

Run: `cd frontend && npm run tsc`
Expected: 无类型错误

**Step 3: 启动开发服务器测试**

Run: `cd frontend && npm run dev`

手动测试：
1. 访问接口管理页面，编辑一个接口，选择角色，保存
2. 访问角色管理页面，编辑对应角色，查看接口权限 Tab，确认已选中正确的接口
3. 在角色页面修改接口权限，保存
4. 回到接口管理页面，编辑接口，确认角色选择正确

---

## Task 14: 最终验证和清理

**Step 1: 运行后端完整测试**

Run: `cd backend && make test`
Expected: 所有测试通过

**Step 2: 运行前端完整检查**

Run: `cd frontend && npm run lint && npm run tsc`
Expected: 无错误

**Step 3: 更新 Swagger 文档**

Run: `cd backend && make swag`

**Step 4: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete api-role authorization feature"
```

---

## 文件变更汇总

### 后端
- `backend/api/v1/api.go` - 新增类型
- `backend/api/v1/role.go` - 新增类型
- `backend/internal/repository/api.go` - 新增方法
- `backend/internal/repository/role.go` - 新增方法
- `backend/internal/service/api.go` - 新增方法
- `backend/internal/service/role.go` - 新增方法
- `backend/internal/handler/api.go` - 新增 handler
- `backend/internal/handler/role.go` - 新增 handler
- `backend/internal/server/http.go` - 注册路由
- `backend/docs/*` - Swagger 自动生成

### 前端
- `frontend/src/services/backend/*` - 自动生成
- `frontend/src/pages/Admin/Api/index.tsx` - 新增列
- `frontend/src/pages/Admin/Api/components/UpdateForm.tsx` - 新增角色选择
- `frontend/src/pages/Admin/Role/index.tsx` - 新增列
- `frontend/src/pages/Admin/Role/components/UpdateForm.tsx` - 改造为 Tabs + 树形选择
