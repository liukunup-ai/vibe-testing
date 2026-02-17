package model

import "gorm.io/gorm"

// Project 测试项目表
type Project struct {
	gorm.Model

	// 核心字段
	Code        string `gorm:"column:code;type:varchar(64);not null;uniqueIndex;comment:'项目编码(业务主键)'"`
	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'项目名称'"`
	Description string `gorm:"column:description;type:text;comment:'项目描述'"`
	CreatorID   uint   `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`

	// 配置字段
	Icon         string `gorm:"column:icon;type:varchar(255);comment:'项目图标URL'"`
	Tags         string `gorm:"column:tags;type:varchar(512);comment:'标签(逗号分隔)'"`
	GitRepo      string `gorm:"column:git_repo;type:varchar(512);comment:'Git仓库地址'"`
	DefaultEnvID uint   `gorm:"column:default_env_id;comment:'默认测试环境ID'"`

	// 状态字段
	Status int `gorm:"column:status;type:int;default:1;comment:'状态 1:正常 2:归档 3:删除'"`

	// 统计字段 (可用于缓存)
	CaseCount    int    `gorm:"column:case_count;default:0;comment:'用例总数'"`
	ExecCount    int    `gorm:"column:exec_count;default:0;comment:'执行次数'"`
	LastExecTime string `gorm:"column:last_exec_time;type:varchar(32);comment:'最近执行时间'"`

	// 关联
	// Creator User `gorm:"foreignKey:CreatorID"`
}

func (m *Project) TableName() string {
	return "project"
}

// ProjectUser 项目用户关联表
type ProjectUser struct {
	gorm.Model

	ProjectID uint   `gorm:"column:project_id;not null;uniqueIndex:idx_project_user;comment:'项目ID'"`
	UserID    uint   `gorm:"column:user_id;not null;uniqueIndex:idx_project_user;comment:'用户ID'"`
	Role      string `gorm:"column:role;type:varchar(32);not null;comment:'角色 owner/admin/developer/viewer'"`
	Status    int    `gorm:"column:status;type:int;default:1;comment:'状态 1:正常 2:移除'"`
}

func (m *ProjectUser) TableName() string {
	return "project_user"
}

// Project status constants
const (
	ProjectStatusNormal   = 1
	ProjectStatusArchived = 2
	ProjectStatusDeleted  = 3
)

// Project user role constants
const (
	ProjectRoleOwner     = "owner"
	ProjectRoleAdmin     = "admin"
	ProjectRoleDeveloper = "developer"
	ProjectRoleViewer    = "viewer"
)
