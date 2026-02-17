package model

import "gorm.io/gorm"

// AIAnalysisResult AI分析结果表
type AIAnalysisResult struct {
	gorm.Model

	// 核心字段
	AnalysisNo        string `gorm:"column:analysis_no;type:varchar(64);not null;uniqueIndex;comment:'分析编号(业务主键)'"`
	AnalysisType      string `gorm:"column:analysis_type;type:varchar(32);not null;index;comment:'分析类型 case-generation/diagnosis/visual-comparison/coverage-analysis'"`
	RelatedObjectID   uint   `gorm:"column:related_object_id;not null;index;comment:'关联对象ID'"`
	RelatedObjectType string `gorm:"column:related_object_type;type:varchar(32);not null;index;comment:'关联对象类型 test_case/test_record/bug'"`
	AnalyzedAt        string `gorm:"column:analyzed_at;type:varchar(32);comment:'分析完成时间'"`
	ModelVersion      string `gorm:"column:model_version;type:varchar(64);comment:'模型版本'"`

	// 分析内容 (JSONB)
	// case-generation: {"generatedCases": [...], "recommendationReason": "..."}
	// diagnosis: {"rootCause": "...", "fixSuggestion": "...", "confidence": 0.95}
	// visual-comparison: {"diffRegions": [...], "similarityScore": 0.98}
	// coverage-analysis: {"coverageData": {...}, "uncoveredPaths": [...]}
	AnalysisContent string `gorm:"column:analysis_content;type:text;comment:'分析内容JSON'"`

	// 关联数据
	RelatedDataIDs string `gorm:"column:related_data_ids;type:text;comment:'关联数据ID列表JSON'"`

	// 评估字段
	HumanVerified bool   `gorm:"column:human_verified;default:false;comment:'是否人工验证'"`
	VerifiedAt    string `gorm:"column:verified_at;type:varchar(32);comment:'验证时间'"`
	AccuracyScore int    `gorm:"column:accuracy_score;default:0;comment:'准确度评分0-100'"`

	// AI信息
	ProviderID  string `gorm:"column:provider_id;type:varchar(64);index;comment:'AI提供商ID'"`
	ModelID     string `gorm:"column:model_id;type:varchar(64);comment:'模型ID'"`
	APICallTime int    `gorm:"column:api_call_time;default:0;comment:'API调用耗时(毫秒)'"`
	TokenUsage  int    `gorm:"column:token_usage;default:0;comment:'Token使用量'"`

	// 创建者
	CreatorID uint `gorm:"column:creator_id;not null;index;comment:'创建者ID'"`
}

func (m *AIAnalysisResult) TableName() string {
	return "ai_analysis_result"
}

// AIAnalysisResult analysis type constants
const (
	AnalysisTypeCaseGeneration   = "case-generation"
	AnalysisTypeDiagnosis        = "diagnosis"
	AnalysisTypeVisualComparison = "visual-comparison"
	AnalysisTypeCoverageAnalysis = "coverage-analysis"
)

// AIAnalysisResult related object type constants
const (
	AnalysisRelatedTestCase   = "test_case"
	AnalysisRelatedTestRecord = "test_record"
	AnalysisRelatedBug        = "bug"
)
