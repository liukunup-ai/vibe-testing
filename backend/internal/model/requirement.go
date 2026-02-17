package model

import "gorm.io/gorm"

// Requirement 测试需求表
type Requirement struct {
	gorm.Model

	// 核心字段
	RequirementNo string `gorm:"column:requirement_no;type:varchar(64);not null;uniqueIndex;comment:'需求编号(业务主键)'"`
	Title         string `gorm:"column:title;type:varchar(255);not null;comment:'需求标题'"`
	Description   string `gorm:"column:description;type:text;comment:'需求描述'"`
	Priority      string `gorm:"column:priority;type:varchar(16);not null;default:'P2';comment:'优先级 P0/P1/P2/P3'"`
	Status        string `gorm:"column:status;type:varchar(32);not null;default:'pending-review';comment:'状态 pending-review/reviewed/in-development/completed'"`
	Owner         uint   `gorm:"column:owner;not null;index;comment:'负责人ID'"`
	ProjectID     uint   `gorm:"column:project_id;not null;index;comment:'项目ID'"`
	CreatorID     uint   `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`

	// 时间字段
	ExpectedAt  string `gorm:"column:expected_at;type:varchar(32);comment:'期望完成时间'"`
	CompletedAt string `gorm:"column:completed_at;type:varchar(32);comment:'实际完成时间'"`

	// 版本管理
	Version       int    `gorm:"column:version;type:int;default:1;comment:'版本号'"`
	ChangeHistory string `gorm:"column:change_history;type:json;comment:'变更历史'"`
	ParentID      uint   `gorm:"column:parent_id;index;comment:'父需求ID(用于层级)'"`

	// 测试关联
	TestCaseIds string `gorm:"column:test_case_ids;type:json;comment:'关联用例ID列表'"`
	BugIds      string `gorm:"column:bug_ids;type:json;comment:'关联缺陷ID列表'"`
}

func (m *Requirement) TableName() string {
	return "requirement"
}

// Requirement status constants
const (
	RequirementStatusPendingReview = "pending-review"
	RequirementStatusReviewed      = "reviewed"
	RequirementStatusInDevelopment = "in-development"
	RequirementStatusCompleted     = "completed"
)

// Requirement priority constants
const (
	RequirementPriorityP0 = "P0"
	RequirementPriorityP1 = "P1"
	RequirementPriorityP2 = "P2"
	RequirementPriorityP3 = "P3"
)
