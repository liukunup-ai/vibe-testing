package model

import "gorm.io/gorm"

// TestData 测试数据表
type TestData struct {
	gorm.Model

	// 核心字段
	ProjectID   uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	DataNo      string `gorm:"column:data_no;type:varchar(64);not null;index;comment:'数据编号'"`
	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'数据名称'"`
	Description string `gorm:"column:description;type:text;comment:'数据描述'"`

	// 文件信息
	FileName string `gorm:"column:file_name;type:varchar(255);not null;comment:'文件名称'"`
	FileType string `gorm:"column:file_type;type:varchar(32);not null;comment:'文件类型 excel/csv/txt/json'"`
	FileSize int64  `gorm:"column:file_size;default:0;comment:'文件大小(字节)'"`
	FilePath string `gorm:"column:file_path;type:varchar(512);not null;comment:'文件路径(对象存储)'"`
	Checksum string `gorm:"column:checksum;type:varchar(64);comment:'文件校验和(MD5)'"`
	Version  int    `gorm:"column:version;default:1;comment:'文件版本'"`

	// 关联字段 (可选)
	CaseID  uint `gorm:"column:case_id;index;comment:'关联用例ID'"`
	SuiteID uint `gorm:"column:suite_id;index;comment:'关联套件ID'"`

	// 上传者
	UploaderID uint `gorm:"column:uploader_id;not null;index;comment:'上传者ID'"`
}

func (m *TestData) TableName() string {
	return "test_data"
}

// TestData file type constants
const (
	DataFileTypeExcel = "excel"
	DataFileTypeCSV   = "csv"
	DataFileTypeTxt   = "txt"
	DataFileTypeJSON  = "json"
)

// TestEnv 测试环境表
type TestEnv struct {
	gorm.Model

	// 核心字段
	ProjectID   uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	EnvNo       string `gorm:"column:env_no;type:varchar(64);not null;index;comment:'环境编号'"`
	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'环境名称'"`
	Description string `gorm:"column:description;type:text;comment:'环境描述'"`

	// 环境类型
	EnvType string `gorm:"column:env_type;type:varchar(32);default:'test';comment:'环境类型 dev/test/staging/prod'"`

	// 配置数据 (JSON数组)
	// [{"key": "base_url", "value": "https://...", "encrypted": false}, ...]
	ConfigData string `gorm:"column:config_data;type:text;comment:'配置数据JSON'"`

	// 环境变量 (JSON数组)
	EnvVars string `gorm:"column:env_vars;type:text;comment:'环境变量JSON'"`

	// 状态字段
	Status int `gorm:"column:status;type:int;default:1;comment:'状态 1:正常 2:维护 3:禁用'"`

	// 创建者
	CreatorID uint `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`
}

func (m *TestEnv) TableName() string {
	return "test_env"
}

// TestEnv type constants
const (
	EnvTypeDev     = "dev"
	EnvTypeTest    = "test"
	EnvTypeStaging = "staging"
	EnvTypeProd    = "prod"
)

// TestEnv status constants
const (
	EnvStatusNormal   = 1
	EnvStatusMaintain = 2
	EnvStatusDisabled = 3
)
