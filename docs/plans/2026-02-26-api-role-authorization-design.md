# 接口角色授权功能设计

## 概述

在接口管理（/admin/api）和角色管理（/admin/role）页面添加双向关联功能，支持配置某个角色能访问哪些接口。

## 现有架构

| 组件 | 现状 |
|------|------|
| 接口模型 | `Api` - Group/Name/Path/Method |
| 角色模型 | `Role` - Name/CasbinRole |
| 权限存储 | Casbin，格式 `[casbinRole, api_path, method]` |
| 用户-角色 | Casbin `g` policy |
| 权限检查 | `AuthMiddleware` 调用 `e.Enforce(uid, api_path, method)` |

## 数据设计

无需新增数据库表，直接复用 Casbin 权限存储：

```
权限记录示例：(role_admin, /api/v1/users, GET)
```

表示 `role_admin` 角色可以 GET `/api/v1/users` 接口。

**同步策略**：
- 接口页面修改角色 → 更新 Casbin 权限
- 角色页面修改接口 → 更新 Casbin 权限
- 两者操作同一个 Casbin enforcer，天然双向同步

## 后端 API 设计

### 接口管理相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/apis/{id}/roles` | 获取某接口已授权的角色列表 |
| PUT | `/api/v1/apis/{id}/roles` | 更新某接口的角色授权 |

**PUT 请求体**：
```json
{
  "roleIds": [1, 2, 3]
}
```

### 角色管理相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/roles/{id}/apis` | 获取某角色已授权的接口列表 |
| PUT | `/api/v1/roles/{id}/apis` | 更新某角色的接口授权 |

**PUT 请求体**：
```json
{
  "apiIds": [1, 2, 3, 4, 5]
}
```

### 辅助接口（可能已存在，需确认）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/roles/all` | 获取所有角色列表 |
| GET | `/api/v1/apis/all` | 获取所有接口列表 |

## 前端交互设计

### 接口管理页面

**表格变更**：
- 新增「授权角色」列，显示已授权角色数量和名称预览
- 示例：`3个角色: admin, editor, viewer`

**编辑弹窗变更**：
- 底部新增「授权角色」区域
- 使用 Ant Design `Select` 多选组件
- 已选角色以 Tag 形式展示

```
┌─────────────────────────────────────┐
│ 编辑接口                            │
├─────────────────────────────────────┤
│ 分组: [用户管理        ]            │
│ 名称: [获取用户列表    ]            │
│ 路径: [/api/v1/users   ]            │
│ 方法: [GET ▼]                        │
├─────────────────────────────────────┤
│ 授权角色:                           │
│ ┌─────────────────────────────────┐ │
│ │ admin ✕  editor ✕  viewer ✕   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 角色管理页面

**表格变更**：
- 新增「接口权限」列，显示已授权接口数量
- 示例：`15/50 个接口`

**编辑弹窗变更**：
- 改为 Tabs 布局

```
┌─────────────────────────────────────────────────┐
│ 编辑角色                                        │
├─────────────────────────────────────────────────┤
│ [基本信息] [接口权限]                           │
├─────────────────────────────────────────────────┤
│ Tab: 接口权限                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 搜索: [________] 方法: [ALL ▼]              │ │
│ │ 已授权 15/50 个接口                         │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ▼ 用户管理 (5)               [全选] [取消]  │ │
│ │   ☑ GET  /api/v1/users      获取用户列表   │ │
│ │   ☑ POST /api/v1/users      创建用户       │ │
│ │   ☐ PUT  /api/v1/users/:id  更新用户       │ │
│ │   ☐ DEL  /api/v1/users/:id  删除用户       │ │
│ │   ☑ GET  /api/v1/users/:id  获取用户详情   │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ▼ 角色管理 (4)               [全选] [取消]  │ │
│ │   ☑ GET  /api/v1/roles      获取角色列表   │ │
│ │   ...                                       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**树形结构功能**：
- 按分组折叠/展开
- 分组级别全选/取消全选
- 单个接口勾选
- 搜索框按名称/路径筛选
- 方法筛选（GET/POST/PUT/DELETE/ALL）
- 顶部统计已授权数量

## 核心逻辑流程

### 接口页面更新角色授权

```
1. 用户勾选/取消角色
2. 调用 PUT /api/v1/apis/{id}/roles { roleIds: [...] }
3. 后端获取 Api 信息 (path, method)
4. 获取旧角色列表
5. 计算差异：
   - 需新增授权的角色
   - 需移除授权的角色
6. 调用 Casbin：
   - e.AddPermissionForUser(role, path, method)
   - e.DeletePermissionForUser(role, path, method)
7. 返回成功
```

### 角色页面更新接口授权

```
1. 用户勾选/取消接口
2. 调用 PUT /api/v1/roles/{id}/apis { apiIds: [...] }
3. 后端获取 Role 信息 (casbinRole)
4. 获取旧接口权限列表
5. 计算差异：
   - 需新增授权的接口 (path, method)
   - 需移除授权的接口 (path, method)
6. 调用 Casbin：
   - e.AddPermissionForUser(casbinRole, path, method)
   - e.DeletePermissionForUser(casbinRole, path, method)
7. 返回成功
```

## 实现范围

### 后端 (Go)

1. `backend/api/v1/api.go` - 新增请求/响应类型
2. `backend/internal/handler/api.go` - 新增 GetRoles/UpdateRoles handler
3. `backend/internal/service/api.go` - 新增角色授权业务逻辑
4. `backend/internal/repository/api.go` - 新增 Casbin 权限操作
5. `backend/internal/handler/role.go` - 新增 GetApis/UpdateApis handler
6. `backend/internal/service/role.go` - 新增接口授权业务逻辑
7. `backend/cmd/server/router.go` - 注册新路由

### 前端 (React)

1. `frontend/src/services/backend/api.ts` - 新增 API 调用
2. `frontend/src/services/backend/role.ts` - 新增 API 调用
3. `frontend/src/pages/Admin/Api/index.tsx` - 表格新增列
4. `frontend/src/pages/Admin/Api/components/UpdateForm.tsx` - 新增角色选择
5. `frontend/src/pages/Admin/Role/index.tsx` - 表格新增列
6. `frontend/src/pages/Admin/Role/components/UpdateForm.tsx` - 改为 Tabs + 树形选择

## 风险与注意事项

1. **权限缓存**：Casbin SyncedEnforcer 会自动同步，无需手动处理
2. **数据一致性**：双向操作同一数据源，天然一致
3. **性能**：接口/角色数量较多时，树形组件需虚拟滚动优化
4. **超级管理员**：现有逻辑已跳过权限检查，不受影响
