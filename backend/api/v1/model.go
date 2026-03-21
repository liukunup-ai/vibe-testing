package v1

import "time"

// ModelProvider 模型提供者枚举
const (
	ModelProviderOpenAI    = 1 // OpenAI
	ModelProviderAzure     = 2 // Azure
	ModelProviderOllama    = 3 // Ollama
	ModelProviderLMStudio  = 4 // LMStudio
	ModelProviderVLLM      = 5 // vLLM
	ModelProviderGroq      = 6 // Groq
	ModelProviderAnthropic = 7 // Anthropic
) // @name ModelProvider

// ModelSearchRequest 模型搜索请求
type ModelSearchRequest struct {
	Page     int    `form:"page" binding:"required,min=1" example:"1"`              // 页码
	PageSize int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"` // 分页大小
	Provider *int   `form:"provider" example:"1"`                                   // 筛选项: 模型提供者
	Name     string `form:"name" example:"gpt-4"`                                   // 筛选项: 模型名称 模糊匹配
}

// ModelDataItem 模型数据项 (不包含敏感信息)
type ModelDataItem struct {
	ID               uint      `json:"id"`                  // ID
	Provider         int       `json:"provider"`            // 模型提供者 1:OpenAI 2:Azure 3:Ollama 4:LMStudio 5:vLLM 6:Groq 7:Anthropic
	Name             string    `json:"name"`                // 模型名称
	BaseURL          string    `json:"baseUrl"`             // API 基础地址
	ModelID          string    `json:"modelId"`             // 模型 ID
	Timeout          int       `json:"timeout"`             // 超时时间(秒)
	MaxRetries       int       `json:"maxRetries"`          // 最大重试次数
	RateLimit        int       `json:"rateLimit"`           // 速率限制(请求/分钟)
	Headers          string    `json:"headers"`             // 自定义请求头(JSON)
	Temperature      float64   `json:"temperature"`         // 温度参数
	TopP             float64   `json:"topP"`                // Top P 参数
	MaxTokens        int       `json:"maxTokens"`           // 最大 token 数
	TopK             int       `json:"topK"`                // Top K 参数
	FrequencyPenalty float64   `json:"frequencyPenalty"`    // 频率惩罚
	PresencePenalty  float64   `json:"presencePenalty"`     // 存在惩罚
	CreatedAt        time.Time `json:"createdAt,omitempty"` // 创建时间
	UpdatedAt        time.Time `json:"updatedAt,omitempty"` // 更新时间
} // @name Model

// ModelSearchResponseData 模型搜索响应数据
type ModelSearchResponseData struct {
	List  []ModelDataItem `json:"list"`  // 列表
	Total int64           `json:"total"` // 总数
} // @name ModelList

// ModelSearchResponse 模型搜索响应
type ModelSearchResponse struct {
	Response
	Data ModelSearchResponseData
}

// ModelResponse 模型响应 (单条)
type ModelResponse struct {
	Response
	Data ModelDataItem
}

// ModelRequest 模型创建/更新请求 (包含敏感信息)
type ModelRequest struct {
	Provider         int     `json:"provider" binding:"required,oneof=1 2 3 4 5 6 7" example:"1"`    // 模型提供者 1:OpenAI 2:Azure 3:Ollama 4:LMStudio 5:vLLM 6:Groq 7:Anthropic
	Name             string  `json:"name" binding:"required" example:"GPT-4"`                        // 模型名称
	BaseURL          string  `json:"baseUrl" binding:"required" example:"https://api.openai.com/v1"` // API 基础地址
	ModelID          string  `json:"modelId" binding:"required" example:"gpt-4"`                     // 模型 ID
	APIKey           string  `json:"apiKey" binding:"omitempty" example:"sk-xxx"`                    // API 密钥
	Timeout          int     `json:"timeout" example:"60"`                                           // 超时时间(秒)
	MaxRetries       int     `json:"maxRetries" example:"3"`                                         // 最大重试次数
	RateLimit        int     `json:"rateLimit" example:"60"`                                         // 速率限制(请求/分钟)
	Headers          string  `json:"headers" example:"{}"`                                           // 自定义请求头(JSON)
	Temperature      float64 `json:"temperature" example:"0.7"`                                      // 温度参数
	TopP             float64 `json:"topP" example:"1.0"`                                             // Top P 参数
	MaxTokens        int     `json:"maxTokens" example:"4096"`                                       // 最大 token 数
	TopK             int     `json:"topK" example:"40"`                                              // Top K 参数
	FrequencyPenalty float64 `json:"frequencyPenalty" example:"0.0"`                                 // 频率惩罚
	PresencePenalty  float64 `json:"presencePenalty" example:"0.0"`                                  // 存在惩罚
}

// TestConnectionRequest 测试连接请求
type TestConnectionRequest struct {
	Provider string `json:"provider" binding:"required" example:"1"`                        // 模型提供者
	BaseURL  string `json:"baseUrl" binding:"required" example:"https://api.openai.com/v1"` // API 基础地址
	APIKey   string `json:"apiKey" example:"sk-xxx"`                                        // API 密钥
}

// TestConnectionResponse 测试连接响应
type TestConnectionResponse struct {
	Success bool     `json:"success"`          // 是否成功
	Message string   `json:"message"`          // 消息
	Models  []string `json:"models,omitempty"` // 可用模型列表
} // @name TestConnectionResult
