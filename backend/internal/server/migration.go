package server

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/pkg/log"
	"backend/pkg/sid"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/casbin/casbin/v2"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type MigrateServer struct {
	db  *gorm.DB
	log *log.Logger
	sid *sid.Sid
	e   *casbin.SyncedEnforcer
}

func NewMigrateServer(
	db *gorm.DB,
	log *log.Logger,
	sid *sid.Sid,
	e *casbin.SyncedEnforcer,
) *MigrateServer {
	return &MigrateServer{
		db:  db,
		log: log,
		sid: sid,
		e:   e,
	}
}

func (m *MigrateServer) Start(ctx context.Context) error {
	m.db.Migrator().DropTable(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.Api{},
		&model.Model{},
		&model.Setting{},
		&model.Item{},
	)
	if err := m.db.AutoMigrate(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.Api{},
		&model.Model{},
		&model.Setting{},
		&model.Item{},
	); err != nil {
		m.log.Error("AutoMigrate error", zap.Error(err))
		return err
	}
	err := m.initialUser(ctx)
	if err != nil {
		m.log.Error("initialUser error", zap.Error(err))
	}

	err = m.initialMenuData(ctx)
	if err != nil {
		m.log.Error("initialMenuData error", zap.Error(err))
	}

	err = m.initialApisData(ctx)
	if err != nil {
		m.log.Error("initialApisData error", zap.Error(err))
	}

	err = m.initialRBAC(ctx)
	if err != nil {
		m.log.Error("initialRBAC error", zap.Error(err))
	}

	err = m.initialItems(ctx)
	if err != nil {
		m.log.Error("initialItems error", zap.Error(err))
	}

	err = m.initialSettings(ctx)
	if err != nil {
		m.log.Error("initialSettings error", zap.Error(err))
	}

	m.log.Info("AutoMigrate success")
	os.Exit(0)
	return nil
}
func (m *MigrateServer) Stop(ctx context.Context) error {
	m.log.Info("AutoMigrate stop")
	return nil
}

func (m *MigrateServer) initialUser(ctx context.Context) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err = m.db.Create(&model.User{
		Model:          gorm.Model{ID: 1},
		UserID:         constant.AdminUserID,
		Username:       "admin",
		HashedPassword: string(hashedPassword),
		FullName:       "超级管理员",
		Email:          "admin@example.com",
		Status:         1,
	}).Error; err != nil {
		return err
	}

	operatorUserID, err := m.sid.GenString()
	if err != nil {
		return err
	}
	if err = m.db.Create(&model.User{
		Model:          gorm.Model{ID: 2},
		UserID:         operatorUserID,
		Username:       "operator",
		HashedPassword: string(hashedPassword),
		FullName:       "运营人员",
		Email:          "operator@example.com",
		Status:         0,
	}).Error; err != nil {
		return err
	}
	return nil
}

func (m *MigrateServer) initialItems(ctx context.Context) error {
	items := []model.Item{
		{Name: "用户认证模块", Desc: "实现用户登录、注册、JWT token 管理等功能", Owner: "admin"},
		{Name: "权限管理系统", Desc: "基于 Casbin 的 RBAC 权限控制，支持角色和菜单权限", Owner: "admin"},
		{Name: "API 网关服务", Desc: "统一的 API 入口，支持限流、熔断、负载均衡", Owner: "operator"},
		{Name: "日志监控平台", Desc: "集中式日志收集和分析，支持实时告警", Owner: "operator"},
		{Name: "数据报表系统", Desc: "多维度数据分析和可视化报表生成", Owner: "admin"},
	}
	return m.db.Create(&items).Error
}

func (m *MigrateServer) initialRBAC(ctx context.Context) error {
	// 创建角色
	roles := []model.Role{
		{CasbinRole: constant.AdminRole, Name: "超级管理员"},
		{CasbinRole: constant.OperatorRole, Name: "运营人员"},
		{CasbinRole: constant.UserRole, Name: "普通用户"},
	}
	if err := m.db.Create(&roles).Error; err != nil {
		return err
	}
	m.e.ClearPolicy()
	err := m.e.SavePolicy()
	if err != nil {
		m.log.Error("m.e.SavePolicy error", zap.Error(err))
		return err
	}

	// 给管理员加角色
	if _, err := m.e.AddRoleForUser(constant.AdminUserID, constant.AdminRole); err != nil {
		m.log.Error("m.e.AddRoleForUser error", zap.Error(err))
		return err
	}
	// 给管理员加菜单权限
	menuList := make([]model.Menu, 0)
	if err := m.db.Find(&menuList).Error; err != nil {
		m.log.Error("m.db.Find(&menuList).Error error", zap.Error(err))
		return err
	}
	for _, menu := range menuList {
		m.addPermissionForRole(constant.AdminRole, constant.MenuResourcePrefix+menu.Path, "read")
	}
	// 给管理员加接口权限
	apiList := make([]model.Api, 0)
	if err := m.db.Find(&apiList).Error; err != nil {
		m.log.Error("m.db.Find(&apiList).Error error", zap.Error(err))
		return err
	}
	for _, api := range apiList {
		m.addPermissionForRole(constant.AdminRole, constant.ApiResourcePrefix+api.Path, api.Method)
	}

	// 从数据库查询用户
	var operator model.User
	if err := m.db.First(&operator, 2).Error; err != nil {
		return err
	}
	// 添加运营人员权限
	if _, err := m.e.AddRoleForUser(operator.UserID, constant.OperatorRole); err != nil {
		m.log.Error("m.e.AddRoleForUser error", zap.Error(err))
		return err
	}

	// 运营人员
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/welcome", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/profile", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/admin", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/admin/user", "read")

	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile/avatar", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/menu", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/password", http.MethodPut)

	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id", http.MethodDelete)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/send-reset-email", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/revoke-sessions", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/status", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/reset-avatar", http.MethodPut)

	// 普通用户
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/welcome", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/item", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/profile", "read")

	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodPut)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile/avatar", http.MethodPost)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/menu", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/password", http.MethodPut)

	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items", http.MethodPost)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodPut)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodDelete)

	return nil
}

func (m *MigrateServer) addPermissionForRole(role, resource, action string) {
	_, err := m.e.AddPermissionForUser(role, resource, action)
	if err != nil {
		m.log.Sugar().Info("为角色 %s 添加权限 %s:%s 失败: %v", role, resource, action, err)
		return
	}
	fmt.Printf("为角色 %s 添加权限: %s %s\n", role, resource, action)
}

func (m *MigrateServer) initialApisData(ctx context.Context) error {
	initialApis := []model.Api{

		// 基础API - 公开接口
		{Group: "基础API", Name: "登录", Path: "/v1/login", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "注册", Path: "/v1/register", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "忘记密码", Path: "/v1/forgot-password", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "重置密码", Path: "/v1/reset-password", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "刷新token", Path: "/v1/refresh-token", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "OIDC认证", Path: "/v1/auth/oidc", Method: http.MethodPost, IsPublic: true},

		// 基础API - 需认证但跳过权限检查（所有角色默认拥有）
		{Group: "基础API", Name: "登出", Path: "/v1/logout", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "获取当前用户信息", Path: "/v1/users/:id", Method: http.MethodGet, IsPublic: true},

		// 用户
		{Group: "用户", Name: "获取Profile", Path: "/v1/users/profile", Method: http.MethodGet},
		{Group: "用户", Name: "更新Profile", Path: "/v1/users/profile", Method: http.MethodPut},
		{Group: "用户", Name: "更新头像", Path: "/v1/users/profile/avatar", Method: http.MethodPost},
		{Group: "用户", Name: "获取菜单", Path: "/v1/users/menu", Method: http.MethodGet},
		{Group: "用户", Name: "更新密码", Path: "/v1/users/password", Method: http.MethodPut},

		// 用户管理
		{Group: "用户管理", Name: "获取用户列表", Path: "/v1/admin/users", Method: http.MethodGet},
		{Group: "用户管理", Name: "创建用户", Path: "/v1/admin/users", Method: http.MethodPost},
		{Group: "用户管理", Name: "更新用户", Path: "/v1/admin/users/:id", Method: http.MethodPut},
		{Group: "用户管理", Name: "删除用户", Path: "/v1/admin/users/:id", Method: http.MethodDelete},
		{Group: "用户管理", Name: "发送重置邮件", Path: "/v1/admin/users/:id/send-reset-email", Method: http.MethodPost},
		{Group: "用户管理", Name: "撤销会话", Path: "/v1/admin/users/:id/revoke-sessions", Method: http.MethodPost},
		{Group: "用户管理", Name: "更新用户状态", Path: "/v1/admin/users/:id/status", Method: http.MethodPut},
		{Group: "用户管理", Name: "重置头像", Path: "/v1/admin/users/:id/reset-avatar", Method: http.MethodPut},

		// 角色管理
		{Group: "角色管理", Name: "获取角色列表", Path: "/v1/admin/roles", Method: http.MethodGet},
		{Group: "角色管理", Name: "创建角色", Path: "/v1/admin/roles", Method: http.MethodPost},
		{Group: "角色管理", Name: "更新角色", Path: "/v1/admin/roles/:id", Method: http.MethodPut},
		{Group: "角色管理", Name: "删除角色", Path: "/v1/admin/roles/:id", Method: http.MethodDelete},
		{Group: "角色管理", Name: "获取角色权限", Path: "/v1/admin/roles/permissions", Method: http.MethodGet},
		{Group: "角色管理", Name: "更新角色权限", Path: "/v1/admin/roles/permissions", Method: http.MethodPut},
		{Group: "角色管理", Name: "获取角色接口", Path: "/v1/admin/roles/:id/apis", Method: http.MethodGet},
		{Group: "角色管理", Name: "更新角色接口", Path: "/v1/admin/roles/:id/apis", Method: http.MethodPut},

		// 接口管理
		{Group: "接口管理", Name: "获取接口列表", Path: "/v1/admin/apis", Method: http.MethodGet},
		{Group: "接口管理", Name: "创建接口", Path: "/v1/admin/apis", Method: http.MethodPost},
		{Group: "接口管理", Name: "更新接口", Path: "/v1/admin/apis/:id", Method: http.MethodPut},
		{Group: "接口管理", Name: "删除接口", Path: "/v1/admin/apis/:id", Method: http.MethodDelete},
		{Group: "接口管理", Name: "获取接口角色", Path: "/v1/admin/apis/:id/roles", Method: http.MethodGet},
		{Group: "接口管理", Name: "更新接口角色", Path: "/v1/admin/apis/:id/roles", Method: http.MethodPut},

		// 菜单管理
		{Group: "菜单管理", Name: "获取菜单列表", Path: "/v1/admin/menus", Method: http.MethodGet},
		{Group: "菜单管理", Name: "创建菜单", Path: "/v1/admin/menus", Method: http.MethodPost},
		{Group: "菜单管理", Name: "更新菜单", Path: "/v1/admin/menus/:id", Method: http.MethodPut},
		{Group: "菜单管理", Name: "删除菜单", Path: "/v1/admin/menus/:id", Method: http.MethodDelete},

		// 模型管理
		{Group: "模型管理", Name: "获取模型列表", Path: "/v1/admin/models", Method: http.MethodGet},
		{Group: "模型管理", Name: "获取模型详情", Path: "/v1/admin/models/:id", Method: http.MethodGet},
		{Group: "模型管理", Name: "创建模型", Path: "/v1/admin/models", Method: http.MethodPost},
		{Group: "模型管理", Name: "更新模型", Path: "/v1/admin/models/:id", Method: http.MethodPut},
		{Group: "模型管理", Name: "删除模型", Path: "/v1/admin/models/:id", Method: http.MethodDelete},
		{Group: "模型管理", Name: "测试模型连接", Path: "/v1/admin/models/test-connection", Method: http.MethodPost},

		// 系统设置
		{Group: "系统设置", Name: "获取系统设置", Path: "/v1/admin/settings", Method: http.MethodGet},
		{Group: "系统设置", Name: "更新系统设置", Path: "/v1/admin/settings", Method: http.MethodPut},
		{Group: "系统设置", Name: "测试邮件发送", Path: "/v1/admin/settings/test-email", Method: http.MethodPost},
		{Group: "系统设置", Name: "获取公开设置", Path: "/v1/settings", Method: http.MethodGet, IsPublic: true},

		// 项目管理
		{Group: "项目管理", Name: "获取项目列表", Path: "/v1/items", Method: http.MethodGet},
		{Group: "项目管理", Name: "获取项目详情", Path: "/v1/items/:id", Method: http.MethodGet},
		{Group: "项目管理", Name: "创建项目", Path: "/v1/items", Method: http.MethodPost},
		{Group: "项目管理", Name: "更新项目", Path: "/v1/items/:id", Method: http.MethodPut},
		{Group: "项目管理", Name: "删除项目", Path: "/v1/items/:id", Method: http.MethodDelete},
	}

	return m.db.Create(&initialApis).Error
}

func (m *MigrateServer) initialMenuData(ctx context.Context) error {
	menuList := make([]v1.MenuDataItem, 0)
	err := json.Unmarshal([]byte(menuData), &menuList)
	if err != nil {
		m.log.Error("json.Unmarshal error", zap.Error(err))
		return err
	}
	menuListDb := make([]model.Menu, 0)
	for _, item := range menuList {
		menuListDb = append(menuListDb, model.Menu{
			Model: gorm.Model{
				ID: item.ID,
			},
			ParentID:           item.ParentID,
			Icon:               item.Icon,
			Name:               item.Name,
			Path:               item.Path,
			Component:          item.Component,
			Access:             item.Access,
			Locale:             item.Locale,
			Redirect:           item.Redirect,
			Target:             item.Target,
			HideChildrenInMenu: item.HideChildrenInMenu,
			HideInMenu:         item.HideInMenu,
			FlatMenu:           item.FlatMenu,
			Disabled:           item.Disabled,
			Tooltip:            item.Tooltip,
			DisabledTooltip:    item.DisabledTooltip,
			Key:                item.Key,
			ParentKeys:         item.ParentKeys,
		})
	}
	return m.db.Create(&menuListDb).Error
}

var menuData = `[
  {
    "id": 1,
    "path": "/",
	"redirect": "/welcome"
  },
  {
    "id": 2,
    "path": "/welcome",
    "name": "welcome",
    "locale": "menu.welcome",
    "icon": "smile",
	"component": "@/pages/Welcome"
  },
  {
    "id": 3,
    "path": "/item",
    "name": "item",
    "locale": "menu.item",
    "icon": "appstore",
	"component": "@/pages/Item",
	"access": "canUser"
  },
  {
    "id": 999,
    "path": "/profile",
    "name": "profile",
    "locale": "menu.profile",
    "icon": "profile",
	"component": "@/pages/Profile",
	"access": "canUser"
  },
  {
    "id": 1000,
    "path": "/admin",
    "name": "admin",
    "locale": "menu.admin",
    "icon": "crown",
    "access": "canOperate"
  },
  {
    "id": 1001,
    "parentId": 1000,
    "path": "/admin",
	"redirect": "/admin/user"
  },
  {
    "id": 1002,
    "parentId": 1000,
    "path": "/admin/user",
    "name": "user",
    "locale": "menu.admin.user",
	"component": "@/pages/Admin/User",
	"access": "canOperate"
  },
  {
    "id": 1003,
    "parentId": 1000,
    "path": "/admin/role",
    "name": "role",
    "locale": "menu.admin.role",
	"component": "@/pages/Admin/Role",
	"access": "canAdmin"
  },
  {
    "id": 1004,
    "parentId": 1000,
    "path": "/admin/api",
    "name": "api",
    "locale": "menu.admin.api",
	"component": "@/pages/Admin/Api",
	"access": "canAdmin"
  },
  {
    "id": 1005,
    "parentId": 1000,
    "path": "/admin/menu",
    "name": "menu",
    "locale": "menu.admin.menu",
	"component": "@/pages/Admin/Menu",
	"access": "canAdmin"
  },
  {
    "id": 1006,
    "parentId": 1000,
    "path": "/admin/model",
    "name": "model",
    "locale": "menu.admin.model",
    "icon": "ProductOutlined",
	"component": "@/pages/Admin/Model",
	"access": "canAdmin"
  },
  {
    "id": 1007,
    "parentId": 1000,
    "path": "/admin/config",
    "name": "config",
    "locale": "menu.admin.config",
	"component": "@/pages/Admin/Config",
	"access": "canAdmin"
  }
]`

func (m *MigrateServer) initialSettings(ctx context.Context) error {
	// 初始化 SiteConfig.ShowLinks 为 true
	setting := &model.Setting{
		Key:   model.SettingKeySiteShowLinks,
		Value: "true",
	}
	return m.db.Create(setting).Error
}
