package model

import (
	"time"

	"gorm.io/gorm"
)

// AIProvider AI供应商配置表
type AIProvider struct {
	gorm.Model

	// 核心字段
	ProviderNo   string `gorm:"column:provider_no;type:varchar(64);not null;uniqueIndex;comment:'供应商编号(业务主键)'"`
	ProviderName string `gorm:"column:provider_name;type:varchar(128);not null;comment:'供应商名称'"`
	ProviderType string `gorm:"column:provider_type;type:varchar(32);not null;comment:'供应商类型 openai/azure_openai/anthropic/google/baidu/aliyun/zhipu/xunfei/moonshot/deepseek/baichuan'"`
	BaseURL      string `gorm:"column:base_url;type:varchar(512);comment:'API基础URL'"`
	APIKey       string `gorm:"column:api_key;type:text;comment:'API密钥(加密存储)'"`
	Status       int    `gorm:"column:status;type:int;default:1;comment:'状态 1:启用 2:禁用'"`
	CreatedBy    uint   `gorm:"column:created_by;not null;index;comment:'创建者ID'"`
	UpdatedBy    uint   `gorm:"column:updated_by;index;comment:'更新者ID'"`

	// 配置字段
	OrganizationID uint   `gorm:"column:organization_id;index;comment:'组织ID'"`
	ProjectID      uint   `gorm:"column:project_id;index;comment:'项目ID'"`
	Region         string `gorm:"column:region;type:varchar(64);comment:'区域/机房'"`
	Desc           string `gorm:"column:desc;type:text;comment:'描述信息'"`

	// 模型配置 (JSONB)
	// models: [{model_id, model_name, model_type, max_tokens, supported_features: [], enabled, priority}]
	// default_model: string
	ModelConfig string `gorm:"column:model_config;type:text;comment:'模型配置JSON'`

	// 速率限制配置 (JSONB)
	// {rpm, tpm, concurrent, daily_tokens, monthly_tokens, reset_day}
	RateLimitConfig string `gorm:"column:rate_limit_config;type:text;comment:'速率限制配置JSON'`

	// 成本配置 (JSONB)
	// {input_price_per_1k, output_price_per_1k, currency}
	CostConfig string `gorm:"column:cost_config;type:text;comment:'成本配置JSON'`

	// 统计字段
	TotalCalls      int64      `gorm:"column:total_calls;default:0;comment:'总调用次数'"`
	SuccessCalls    int64      `gorm:"column:success_calls;default:0;comment:'成功调用次数'"`
	FailedCalls     int64      `gorm:"column:failed_calls;default:0;comment:'失败调用次数'"`
	AvgResponseTime int64      `gorm:"column:avg_response_time;default:0;comment:'平均响应时间(ms)'"`
	TotalTokens     int64      `gorm:"column:total_tokens;default:0;comment:'总Token数'"`
	InputTokens     int64      `gorm:"column:input_tokens;default:0;comment:'输入Token数'"`
	OutputTokens    int64      `gorm:"column:output_tokens;default:0;comment:'输出Token数'"`
	TotalCost       string     `gorm:"column:total_cost;type:decimal(20,6);default:0;comment:'总成本'"`
	LastCost        string     `gorm:"column:last_cost;type:decimal(20,6);default:0;comment:'上次调用成本'"`
	LastUsedAt      *time.Time `gorm:"column:last_used_at;comment:'上次使用时间'"`
	LastSuccessAt   *time.Time `gorm:"column:last_success_at;comment:'上次成功时间'`

	// 安全配置 (JSONB)
	// {encryptionAlgorithm, keyVersion, whitelistIPs: [], expiresIn}
	SecurityConfig string `gorm:"column:security_config;type:text;comment:'安全配置JSON'`

	// 高级配置 (JSONB)
	// {timeout, retryCount, retryInterval, proxyUrl, proxyAuth, customHeaders: {}, webhookUrl}
	AdvancedConfig string `gorm:"column:advanced_config;type:text;comment:'高级配置JSON'`
}

func (m *AIProvider) TableName() string {
	return "ai_provider"
}

// AIProvider status constants
const (
	AIProviderStatusEnabled  = 1
	AIProviderStatusDisabled = 2
)

// AIProvider type constants
const (
	AIProviderTypeOpenAI      = "openai"
	AIProviderTypeAzureOpenAI = "azure_openai"
	AIProviderTypeAnthropic   = "anthropic"
	AIProviderTypeGoogle      = "google"
	AIProviderTypeBaidu       = "baidu"
	AIProviderTypeAliyun      = "aliyun"
	AIProviderTypeZhipu       = "zhipu"
	AIProviderTypeXunfei      = "xunfei"
	AIProviderTypeMoonshot    = "moonshot"
	AIProviderTypeDeepSeek    = "deepseek"
	AIProviderTypeBaiChuan    = "baichuan"
)

// AIProvider model types
const (
	AIProviderModelTypeChat      = "chat"
	AIProviderModelTypeEmbedding = "embedding"
	AIProviderModelTypeVision    = "vision"
)
