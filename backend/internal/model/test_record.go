package model

import "gorm.io/gorm"

// TestRecord 执行记录表
type TestRecord struct {
	gorm.Model

	// 核心字段
	ProjectID uint `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	PlanID    uint `gorm:"column:plan_id;index;comment:'关联计划ID'"`

	// 执行信息
	ExecutorID uint   `gorm:"column:executor_id;index;comment:'执行人ID'"`
	StartTime  string `gorm:"column:start_time;type:varchar(32);comment:'开始时间'"`
	EndTime    string `gorm:"column:end_time;type:varchar(32);comment:'结束时间'"`
	Duration   int    `gorm:"column:duration;default:0;comment:'执行时长(秒)'"`
	ExecStatus int    `gorm:"column:exec_status;type:int;default:1;comment:'执行状态 1:进行中 2:成功 3:失败 4:超时 5:取消'"`

	// 执行摘要
	TotalCases   int `gorm:"column:total_cases;default:0;comment:'总用例数'"`
	PassedCases  int `gorm:"column:passed_cases;default:0;comment:'通过数'"`
	FailedCases  int `gorm:"column:failed_cases;default:0;comment:'失败数'"`
	BlockedCases int `gorm:"column:blocked_cases;default:0;comment:'阻塞数'"`
	SkippedCases int `gorm:"column:skipped_cases;default:0;comment:'跳过数'"`
	PassRate     int `gorm:"column:pass_rate;default:0;comment:'通过率(百分比)'"`

	// 执行上下文 (JSON)
	// {"environment": {...}, "artifact": {...}, "devices": [...]}
	ExecContext string `gorm:"column:exec_context;type:text;comment:'执行上下文JSON'`

	// 报告信息
	ReportURL     string `gorm:"column:report_url;type:varchar(512);comment:'报告URL'"`
	ReportGenTime string `gorm:"column:report_gen_time;type:varchar(32);comment:'报告生成时间'"`
	ReportFormat  string `gorm:"column:report_format;type:varchar(32);default:'html';comment:'报告格式 html/pdf/excel'`
}

func (m *TestRecord) TableName() string {
	return "test_record"
}

// TestRecord exec status constants
const (
	RecordExecStatusRunning   = 1 // 进行中
	RecordExecStatusSuccess   = 2 // 成功
	RecordExecStatusFailed    = 3 // 失败
	RecordExecStatusTimeout   = 4 // 超时
	RecordExecStatusCancelled = 5 // 取消
)

// TestCaseExecution 用例执行记录表
type TestCaseExecution struct {
	gorm.Model

	// 核心字段
	RecordID uint `gorm:"column:record_id;not null;index;comment:'关联执行记录ID'"`
	CaseID   uint `gorm:"column:case_id;not null;index;comment:'关联用例ID'"`
	DeviceID uint `gorm:"column:device_id;index;comment:'执行设备ID'"`

	// 执行信息
	ExecStatus int    `gorm:"column:exec_status;type:int;default:1;comment:'执行状态 1:等待 2:进行中 3:通过 4:失败 5:跳过 6:超时'"`
	StartTime  string `gorm:"column:start_time;type:varchar(32);comment:'开始时间'"`
	EndTime    string `gorm:"column:end_time;type:varchar(32);comment:'结束时间'`
	Duration   int    `gorm:"column:duration;default:0;comment:'执行时长(秒)'`
	ExecutorID uint   `gorm:"column:executor_id;index;comment:'执行人ID'`

	// 执行详情
	ErrorStack   string `gorm:"column:error_stack;type:text;comment:'错误堆栈'`
	ErrorMessage string `gorm:"column:error_message;type:text;comment:'错误消息'`
	FailReason   string `gorm:"column:fail_reason;type:text;comment:'失败原因'`

	// 执行步骤结果 (JSON)
	// [{"order": 1, "action": "...", "expected": "...", "actual": "...", "status": "pass", "screenshot": "..."}]
	StepsResult string `gorm:"column:steps_result;type:text;comment:'执行步骤结果JSON'`

	// 性能指标 (JSON)
	// {"cpu": 45.2, "memory": 128.5, "network": 1024, "response_time": 234}
	PerfMetrics string `gorm:"column:perf_metrics;type:text;comment:'性能指标JSON'`

	// 关联信息
	BugID uint `gorm:"column:bug_id;index;comment:'关联缺陷ID'`

	// 重试信息
	RetryCount   int    `gorm:"column:retry_count;default:0;comment:'重试次数'`
	RetryHistory string `gorm:"column:retry_history;type:text;comment:'重试历史JSON'`
}

func (m *TestCaseExecution) TableName() string {
	return "test_case_execution"
}

// TestCaseExecution exec status constants
const (
	CaseExecStatusWaiting = 1 // 等待中
	CaseExecStatusRunning = 2 // 进行中
	CaseExecStatusPassed  = 3 // 通过
	CaseExecStatusFailed  = 4 // 失败
	CaseExecStatusSkipped = 5 // 跳过
	CaseExecStatusTimeout = 6 // 超时
)

// TestSuiteExecution 套件执行记录表
type TestSuiteExecution struct {
	gorm.Model

	// 核心字段
	RecordID uint `gorm:"column:record_id;not null;index;comment:'关联执行记录ID'"`
	SuiteID  uint `gorm:"column:suite_id;not null;index;comment:'关联套件ID'"`
	DeviceID uint `gorm:"column:device_id;index;comment:'执行设备ID'`

	// 执行信息
	ExecStatus int    `gorm:"column:exec_status;type:int;default:1;comment:'执行状态 1:等待 2:进行中 3:通过 4:失败 5:跳过 6:超时'"`
	StartTime  string `gorm:"column:start_time;type:varchar(32);comment:'开始时间'`
	EndTime    string `gorm:"column:end_time;type:varchar(32);comment:'结束时间'`
	Duration   int    `gorm:"column:duration;default:0;comment:'执行时长(秒)'`
	ExecutorID uint   `gorm:"column:executor_id;index;comment:'执行人ID'`

	// 用例汇总
	TotalCases   int `gorm:"column:total_cases;default:0;comment:'总用例数'`
	PassedCases  int `gorm:"column:passed_cases;default:0;comment:'通过数'`
	FailedCases  int `gorm:"column:failed_cases;default:0;comment:'失败数'`
	BlockedCases int `gorm:"column:blocked_cases;default:0;comment:'阻塞数'`
	SkippedCases int `gorm:"column:skipped_cases;default:0;comment:'跳过数'`
	PassRate     int `gorm:"column:pass_rate;default:0;comment:'通过率(百分比)'`
	AvgDuration  int `gorm:"column:avg_duration;default:0;comment:'平均用例耗时(秒)'`

	// 执行摘要
	ExecSummary     string `gorm:"column:exec_summary;type:text;comment:'执行摘要'`
	FailedCasesList string `gorm:"column:failed_cases_list;type:text;comment:'关键失败用例列表JSON'`
}

func (m *TestSuiteExecution) TableName() string {
	return "test_suite_execution"
}

// TestAttachment 执行附件表
type TestAttachment struct {
	gorm.Model

	// 核心字段
	TargetType string `gorm:"column:target_type;type:varchar(32);not null;index;comment:'关联类型 case_execution/suite_execution'"`
	TargetID   uint   `gorm:"column:target_id;not null;index;comment:'关联执行ID'`

	// 附件类型
	AttachType string `gorm:"column:attach_type;type:varchar(32);not null;comment:'附件类型 log/screenshot/screenrecord/other'"`

	// 文件信息
	FileName string `gorm:"column:file_name;type:varchar(255);not null;comment:'文件名称'`
	FileSize int64  `gorm:"column:file_size;default:0;comment:'文件大小(字节)'`
	FilePath string `gorm:"column:file_path;type:varchar(512);not null;comment:'文件路径(对象存储)'`

	// 类型特定字段
	LogLevel       string `gorm:"column:log_level;type:varchar(16);comment:'日志级别'`
	LogLineCount   int    `gorm:"column:log_line_count;default:0;comment:'日志行数'`
	ScreenshotTime string `gorm:"column:screenshot_time;type:varchar(32);comment:'截图时间'`
	ThumbnailPath  string `gorm:"column:thumbnail_path;type:varchar(512);comment:'缩略图路径'`
	RecordDuration int    `gorm:"column:record_duration;default:0;comment:'录制时长(秒)'`
	VideoFormat    string `gorm:"column:video_format;type:varchar(32);comment:'视频格式'`

	// 元数据
	Checksum string `gorm:"column:checksum;type:varchar(64);comment:'文件校验和'`
	Tags     string `gorm:"column:tags;type:text;comment:'附件标签JSON'`

	// 上传信息
	CreatorID uint `gorm:"column:creator_id;index;comment:'创建者ID'`
	DeviceID  uint `gorm:"column:device_id;index;comment:'上传节点(设备ID)'`
}

func (m *TestAttachment) TableName() string {
	return "test_attachment"
}

// TestAttachment type constants
const (
	AttachTypeLog          = "log"
	AttachTypeScreenshot   = "screenshot"
	AttachTypeScreenrecord = "screenrecord"
	AttachTypeOther        = "other"
)

// TestAttachment target type constants
const (
	AttachTargetCaseExecution  = "case_execution"
	AttachTargetSuiteExecution = "suite_execution"
)
