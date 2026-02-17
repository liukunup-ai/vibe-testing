package model

import "gorm.io/gorm"

// TestCase 测试用例表
type TestCase struct {
	gorm.Model

	// 核心字段
	ProjectID   uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	CaseNo      string `gorm:"column:case_no;type:varchar(64);not null;index;comment:'用例编号'"`
	Title       string `gorm:"column:title;type:varchar(255);not null;comment:'用例标题'"`
	Description string `gorm:"column:description;type:text;comment:'用例描述'"`

	// 分类字段
	Priority int    `gorm:"column:priority;type:int;default:2;comment:'优先级 0:P0 1:P1 2:P2 3:P3'"`
	CaseType string `gorm:"column:case_type;type:varchar(32);default:'functional';comment:'用例类型 functional/performance/compatibility/security'"`
	Module   string `gorm:"column:module;type:varchar(128);comment:'所属模块'"`
	Tags     string `gorm:"column:tags;type:varchar(512);comment:'标签(逗号分隔)'"`

	// 关联字段
	RequirementID uint `gorm:"column:requirement_id;index;comment:'关联需求ID'"`

	// 状态字段
	Status  int `gorm:"column:status;type:int;default:1;comment:'状态 1:草稿 2:已发布 3:已废弃'"`
	Version int `gorm:"column:version;default:1;comment:'版本号'"`

	// 创建者
	CreatorID uint `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`

	// 步骤数据 (JSONB)
	// 包含 preconditions, steps[], tags[], attachments[]
	StepsData string `gorm:"column:steps_data;type:text;comment:'步骤数据JSON'"`

	// AI 增强字段
	AICategory     string `gorm:"column:ai_category;type:varchar(64);comment:'AI智能分类'"`
	SimilarCaseIDs string `gorm:"column:similar_case_ids;type:varchar(512);comment:'相似用例ID列表'"`
	CoverageScore  int    `gorm:"column:coverage_score;default:0;comment:'覆盖率评分0-100'"`
}

func (m *TestCase) TableName() string {
	return "test_case"
}

// TestCase priority constants
const (
	CasePriorityP0 = 0 // 最高优先级
	CasePriorityP1 = 1
	CasePriorityP2 = 2
	CasePriorityP3 = 3 // 最低优先级
)

// TestCase status constants
const (
	CaseStatusDraft      = 1 // 草稿
	CaseStatusPublished  = 2 // 已发布
	CaseStatusDeprecated = 3 // 已废弃
)

// TestCase type constants
const (
	CaseTypeFunctional    = "functional"
	CaseTypePerformance   = "performance"
	CaseTypeCompatibility = "compatibility"
	CaseTypeSecurity      = "security"
	CaseTypeAPI           = "api"
	CaseTypeUI            = "ui"
)
