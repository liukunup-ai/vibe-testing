package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, s)
}

type UserFeedback struct {
	gorm.Model

	FeedbackNo   string     `gorm:"column:feedback_no;type:varchar(64);not null;uniqueIndex;comment:'反馈编号'"`
	Title        string     `gorm:"column:title;type:varchar(255);not null;comment:'标题'"`
	Content      string     `gorm:"column:content;type:text;not null;comment:'内容'"`
	Channel      string     `gorm:"column:channel;type:varchar(32);not null;comment:'来源渠道 in-app/customer-service/survey/email'"`
	Reporter     string     `gorm:"column:reporter;type:varchar(128);not null;comment:'反馈人'"`
	OccurredAt   time.Time  `gorm:"column:occurred_at;not null;comment:'问题发生时间'"`
	Status       int        `gorm:"column:status;type:int;default:0;comment:'状态 0:待处理 1:处理中 2:已转bug 3:已关闭'"`
	Handler      string     `gorm:"column:handler;type:varchar(128);comment:'处理人'"`
	ClosedAt     *time.Time `gorm:"column:closed_at;comment:'关闭时间'"`
	ProjectID    uint       `gorm:"column:project_id;not null;index;comment:'项目ID'"`
	TestRecordID *uint      `gorm:"column:test_record_id;index;comment:'测试记录ID(可选)'"`

	DeviceModel     string      `gorm:"column:device_model;type:varchar(128);comment:'设备型号'"`
	OSVersion       string      `gorm:"column:os_version;type:varchar(64);comment:'系统版本'"`
	AppVersion      string      `gorm:"column:app_version;type:varchar(64);comment:'应用版本'"`
	AttachmentPaths StringArray `gorm:"column:attachment_paths;type:json;comment:'附件路径JSON数组'"`

	BugID       *uint      `gorm:"column:bug_id;comment:'转Bug后的BugID'"`
	ConvertedAt *time.Time `gorm:"column:converted_at;comment:'转化时间'"`
	ConvertedBy string     `gorm:"column:converted_by;type:varchar(128);comment:'转化人'"`
}

func (m *UserFeedback) TableName() string {
	return "user_feedback"
}

const (
	UserFeedbackStatusPending    = 0
	UserFeedbackStatusProcessing = 1
	UserFeedbackStatusConverted  = 2
	UserFeedbackStatusClosed     = 3
)

const (
	UserFeedbackChannelInApp           = "in-app"
	UserFeedbackChannelCustomerService = "customer-service"
	UserFeedbackChannelSurvey          = "survey"
	UserFeedbackChannelEmail           = "email"
)
