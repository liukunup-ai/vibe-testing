package model

import "gorm.io/gorm"

// Artifact 制品表
type Artifact struct {
	gorm.Model

	// 核心字段
	ProjectID  uint   `gorm:"column:project_id;not null;index;comment:'关联项目ID'"`
	ArtifactNo string `gorm:"column:artifact_no;type:varchar(64);not null;index;comment:'制品编号'"`
	Name       string `gorm:"column:name;type:varchar(255);not null;comment:'制品名称'"`
	Version    string `gorm:"column:version;type:varchar(64);not null;index;comment:'版本号'"`

	// 构建信息
	BuildType     string `gorm:"column:build_type;type:varchar(32);default:'debug';comment:'构建类型 debug/release'"`
	BuildTime     string `gorm:"column:build_time;type:varchar(32);comment:'构建时间'"`
	BuildDuration int    `gorm:"column:build_duration;default:0;comment:'构建时长(秒)'"`
	GitCommit     string `gorm:"column:git_commit;type:varchar(64);comment:'Git提交ID'"`
	BuilderID     uint   `gorm:"column:builder_id;index;comment:'构建人ID'"`

	// 文件信息
	FilePath string `gorm:"column:file_path;type:varchar(512);comment:'制品文件路径(对象存储)'"`
	FileSize int64  `gorm:"column:file_size;default:0;comment:'文件大小(字节)'"`
	Checksum string `gorm:"column:checksum;type:varchar(128);comment:'文件校验和(MD5/SHA256)'"`

	// 附加信息
	BuildLogPath string `gorm:"column:build_log_path;type:varchar(512);comment:'构建日志路径'"`
	ReleaseNote  string `gorm:"column:release_note;type:text;comment:'发布说明'"`
	ReqIDs       string `gorm:"column:req_ids;type:text;comment:'关联需求ID列表(JSON)'"`
}

func (m *Artifact) TableName() string {
	return "artifact"
}

// Artifact build type constants
const (
	ArtifactBuildDebug   = "debug"
	ArtifactBuildRelease = "release"
)
