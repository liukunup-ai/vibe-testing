package model

import (
	"encoding/json"

	"gorm.io/gorm"
)

// Bug 缺陷表
type Bug struct {
	gorm.Model

	// 核心字段
	BugNo      string `gorm:"column:bug_no;type:varchar(64);not null;uniqueIndex;comment:'缺陷编号'"`
	Title      string `gorm:"column:title;type:varchar(255);not null;comment:'缺陷标题'"`
	Desc       string `gorm:"column:description;type:text;comment:'缺陷描述'"`
	Severity   string `gorm:"column:severity;type:varchar(32);not null;comment:'严重程度 critical/major/minor/trivial'"`
	Priority   string `gorm:"column:priority;type:varchar(8);not null;comment:'优先级 P0/P1/P2/P3'"`
	Status     string `gorm:"column:status;type:varchar(32);not null;default:'new';comment:'状态 new/assigned/fixed/verified/closed/duplicate/wontfix'"`
	CreatorID  uint   `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`
	AssigneeID uint   `gorm:"column:assignee_id;index;comment:'处理人ID'"`
	VerifierID uint   `gorm:"column:verifier_id;index;comment:'验证人ID'"`

	// 时间字段
	FixedAt    string `gorm:"column:fixed_at;type:varchar(32);comment:'修复时间'"`
	VerifiedAt string `gorm:"column:verified_at;type:varchar(32);comment:'验证时间'"`
	ClosedAt   string `gorm:"column:closed_at;type:varchar(32);comment:'关闭时间'"`

	// 关联
	ProjectID      uint `gorm:"column:project_id;not null;index;comment:'项目ID'"`
	TestCaseID     uint `gorm:"column:test_case_id;index;comment:'关联用例ID'"`
	TestRecordID   uint `gorm:"column:test_record_id;index;comment:'关联执行记录ID'"`
	UserFeedbackID uint `gorm:"column:user_feedback_id;index;comment:'关联用户反馈ID'"`
	RequirementID  uint `gorm:"column:requirement_id;index;comment:'关联需求ID'"`

	// 环境信息
	Environment string `gorm:"column:environment;type:varchar(32);comment:'环境 dev/test/staging/prod'"`
	DeviceInfo  string `gorm:"column:device_info;type:varchar(512);comment:'设备信息'"`
	OS          string `gorm:"column:os;type:varchar(128);comment:'操作系统'"`
	Browser     string `gorm:"column:browser;type:varchar(128);comment:'浏览器'"`

	// 重现信息 (JSON)
	Preconditions  string `gorm:"column:preconditions;type:text;comment:'前置条件'"`
	Steps          string `gorm:"column:steps;type:text;comment:'重现步骤'"`
	ExpectedResult string `gorm:"column:expected_result;type:text;comment:'预期结果'"`
	ActualResult   string `gorm:"column:actual_result;type:text;comment:'实际结果'"`

	// 附件 (JSON)
	AttachmentPaths string `gorm:"column:attachment_paths;type:text;comment:'附件路径JSON'"`
}

func (m *Bug) TableName() string {
	return "bug"
}

// BugHistory Bug历史记录表
type BugHistory struct {
	gorm.Model

	BugID    uint   `gorm:"column:bug_id;not null;index;comment:'缺陷ID'"`
	Operator uint   `gorm:"column:operator;not null;index;comment:'操作人ID'"`
	Action   string `gorm:"column:action;type:varchar(64);not null;comment:'操作类型'"`
	Changes  string `gorm:"column:changes;type:text;comment:'变更内容JSON'"`
}

func (m *BugHistory) TableName() string {
	return "bug_history"
}

// Bug constants
const (
	// Severity
	BugSeverityCritical = "critical"
	BugSeverityMajor    = "major"
	BugSeverityMinor    = "minor"
	BugSeverityTrivial  = "trivial"

	// Priority
	BugPriorityP0 = "P0"
	BugPriorityP1 = "P1"
	BugPriorityP2 = "P2"
	BugPriorityP3 = "P3"

	// Status
	BugStatusNew       = "new"
	BugStatusAssigned  = "assigned"
	BugStatusFixed     = "fixed"
	BugStatusVerified  = "verified"
	BugStatusClosed    = "closed"
	BugStatusDuplicate = "duplicate"
	BugStatusWontfix   = "wontfix"

	// Environment
	BugEnvDev     = "dev"
	BugEnvTest    = "test"
	BugEnvStaging = "staging"
	BugEnvProd    = "prod"
)

// GetAttachmentPaths returns parsed attachment paths
func (m *Bug) GetAttachmentPaths() []string {
	if m.AttachmentPaths == "" {
		return nil
	}
	var paths []string
	if err := json.Unmarshal([]byte(m.AttachmentPaths), &paths); err != nil {
		return nil
	}
	return paths
}

// SetAttachmentPaths sets attachment paths from slice
func (m *Bug) SetAttachmentPaths(paths []string) {
	if len(paths) == 0 {
		m.AttachmentPaths = ""
		return
	}
	data, _ := json.Marshal(paths)
	m.AttachmentPaths = string(data)
}
