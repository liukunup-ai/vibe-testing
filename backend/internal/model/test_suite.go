package model

import "gorm.io/gorm"

// TestSuite 测试套件表
type TestSuite struct {
	gorm.Model

	// 核心字段
	ProjectID   uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	SuiteNo     string `gorm:"column:suite_no;type:varchar(64);not null;index;comment:'套件编号'"`
	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'套件名称'"`
	Description string `gorm:"column:description;type:text;comment:'套件描述'"`

	// 类型字段
	SuiteType string `gorm:"column:suite_type;type:varchar(32);default:'static';comment:'套件类型 static/dynamic'"`

	// 静态套件内容: 用例ID列表 (逗号分隔)
	CaseIDs string `gorm:"column:case_ids;type:text;comment:'包含的用例ID列表(JSON数组)'"`

	// 动态套件内容: 筛选条件 (JSON)
	FilterRule string `gorm:"column:filter_rule;type:text;comment:'动态筛选规则JSON'"`

	// 执行策略
	Parallelism    int  `gorm:"column:parallelism;default:1;comment:'并行度'"`
	Timeout        int  `gorm:"column:timeout;default:3600;comment:'超时时间(秒)'"`
	RetryCount     int  `gorm:"column:retry_count;default:0;comment:'重试次数'"`
	ContinueOnFail bool `gorm:"column:continue_on_fail;default:false;comment:'失败继续执行'"`

	// 状态字段
	Status int `gorm:"column:status;type:int;default:1;comment:'状态 1:正常 2:禁用'"`

	// 创建者
	CreatorID uint `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`
}

func (m *TestSuite) TableName() string {
	return "test_suite"
}

// TestSuite type constants
const (
	SuiteTypeStatic  = "static"  // 静态套件: 固定用例列表
	SuiteTypeDynamic = "dynamic" // 动态套件: 按条件筛选
)

// TestSuite status constants
const (
	SuiteStatusNormal   = 1
	SuiteStatusDisabled = 2
)
