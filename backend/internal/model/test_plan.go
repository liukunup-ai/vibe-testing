package model

import "gorm.io/gorm"

// TestPlan 测试计划表
type TestPlan struct {
	gorm.Model

	// 核心字段
	ProjectID   uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	PlanNo      string `gorm:"column:plan_no;type:varchar(64);not null;index;comment:'计划编号'"`
	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'计划名称'"`
	Description string `gorm:"column:description;type:text;comment:'计划描述'"`

	// 计划类型
	PlanType string `gorm:"column:plan_type;type:varchar(32);default:'manual';comment:'计划类型 manual/ai_generated'"`

	// 关联内容 (JSON)
	// {"test_cases": ["id1","id2"], "test_suites": ["id1"], "test_data": "id", "test_env": "id", "artifact": "id"}
	ContentData string `gorm:"column:content_data;type:text;comment:'关联内容JSON'"`

	// 执行策略
	TriggerType string `gorm:"column:trigger_type;type:varchar(32);default:'manual';comment:'触发方式 manual/scheduled/webhook'"`
	CronExpr    string `gorm:"column:cron_expr;type:varchar(64);comment:'Cron表达式'"`
	Parallelism int    `gorm:"column:parallelism;default:1;comment:'并行度'"`
	Timeout     int    `gorm:"column:timeout;default:7200;comment:'超时时间(秒)'"`
	RetryCount  int    `gorm:"column:retry_count;default:0;comment:'重试次数'"`

	// 通知配置 (JSON)
	// {"methods": ["email","dingtalk"], "timing": ["start","complete","fail"], "receivers": ["user1"]}
	NotifyConfig string `gorm:"column:notify_config;type:text;comment:'通知配置JSON'`

	// 时间字段
	ExpectedStartTime string `gorm:"column:expected_start_time;type:varchar(32);comment:'预期开始时间'"`
	ExpectedEndTime   string `gorm:"column:expected_end_time;type:varchar(32);comment:'预期结束时间'"`
	ActualStartTime   string `gorm:"column:actual_start_time;type:varchar(32);comment:'实际开始时间'"`
	ActualEndTime     string `gorm:"column:actual_end_time;type:varchar(32);comment:'实际结束时间'"`

	// 执行状态
	ExecStatus int  `gorm:"column:exec_status;type:int;default:1;comment:'执行状态 1:待执行 2:进行中 3:已完成 4:已取消'"`
	ExecutorID uint `gorm:"column:executor_id;index;comment:'执行人ID'"`

	// AI 生成信息
	AIReason       string `gorm:"column:ai_reason;type:text;comment:'AI推荐理由'"`
	AICoverageData string `gorm:"column:ai_coverage_data;type:text;comment:'AI用例覆盖分析JSON'"`

	// 创建者
	CreatorID uint `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`
}

func (m *TestPlan) TableName() string {
	return "test_plan"
}

// TestPlan type constants
const (
	PlanTypeManual      = "manual"
	PlanTypeAIGenerated = "ai_generated"
)

// TestPlan trigger type constants
const (
	PlanTriggerManual    = "manual"
	PlanTriggerScheduled = "scheduled"
	PlanTriggerWebhook   = "webhook"
)

// TestPlan exec status constants
const (
	PlanExecStatusPending   = 1 // 待执行
	PlanExecStatusRunning   = 2 // 进行中
	PlanExecStatusCompleted = 3 // 已完成
	PlanExecStatusCancelled = 4 // 已取消
)
