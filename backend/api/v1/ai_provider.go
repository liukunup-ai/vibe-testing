package v1

type AIProviderSearchRequest struct {
	Page         int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize     int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProviderNo   string `form:"providerNo" example:"PROVIDER001"`
	ProviderName string `form:"providerName" example:"OpenAI"`
	ProviderType string `form:"providerType" example:"openai"`
	ProjectID    uint   `form:"projectId" example:"1"`
	Status       int    `form:"status" example:"1"`
}

type AIProviderDataItem struct {
	ID              uint    `json:"id,omitempty" example:"1"`
	CreatedAt       string  `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt       string  `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProviderNo      string  `json:"providerNo" example:"PROVIDER001"`
	ProviderName    string  `json:"providerName" example:"OpenAI"`
	ProviderType    string  `json:"providerType" example:"openai"`
	BaseURL         string  `json:"baseUrl,omitempty" example:"https://api.openai.com/v1"`
	Status          int     `json:"status" example:"1"`
	CreatedBy       uint    `json:"createdBy" example:"1"`
	UpdatedBy       uint    `json:"updatedBy,omitempty" example:"1"`
	OrganizationID  uint    `json:"organizationId,omitempty" example:"1"`
	ProjectID       uint    `json:"projectId,omitempty" example:"1"`
	Region          string  `json:"region,omitempty" example:"us-east-1"`
	Desc            string  `json:"desc,omitempty" example:"OpenAI API configuration"`
	ModelConfig     string  `json:"modelConfig,omitempty" example:"{}"`
	RateLimitConfig string  `json:"rateLimitConfig,omitempty" example:"{}"`
	CostConfig      string  `json:"costConfig,omitempty" example:"{}"`
	TotalCalls      int64   `json:"totalCalls" example:"1000"`
	SuccessCalls    int64   `json:"successCalls" example:"980"`
	FailedCalls     int64   `json:"failedCalls" example:"20"`
	AvgResponseTime int64   `json:"avgResponseTime" example:"1500"`
	TotalTokens     int64   `json:"totalTokens" example:"500000"`
	InputTokens     int64   `json:"inputTokens" example:"300000"`
	OutputTokens    int64   `json:"outputTokens" example:"200000"`
	TotalCost       string  `json:"totalCost" example:"10.500000"`
	LastCost        string  `json:"lastCost" example:"0.005000"`
	LastUsedAt      *string `json:"lastUsedAt,omitempty" example:"2024-01-01 12:00:00"`
	LastSuccessAt   *string `json:"lastSuccessAt,omitempty" example:"2024-01-01 12:00:00"`
	SecurityConfig  string  `json:"securityConfig,omitempty" example:"{}"`
	AdvancedConfig  string  `json:"advancedConfig,omitempty" example:"{}"`
}

type AIProviderSearchResponseData struct {
	List  []AIProviderDataItem `json:"list"`
	Total int64                `json:"total"`
}

type AIProviderSearchResponse struct {
	Response
	Data AIProviderSearchResponseData
}

type AIProviderResponse struct {
	Response
	Data AIProviderDataItem
}

type AIProviderRequest struct {
	ProviderNo      string `json:"providerNo" binding:"required" example:"PROVIDER001"`
	ProviderName    string `json:"providerName" binding:"required" example:"OpenAI"`
	ProviderType    string `json:"providerType" binding:"required" example:"openai"`
	BaseURL         string `json:"baseUrl" example:"https://api.openai.com/v1"`
	Status          int    `json:"status" example:"1"`
	OrganizationID  uint   `json:"organizationId" example:"1"`
	ProjectID       uint   `json:"projectId" example:"1"`
	Region          string `json:"region" example:"us-east-1"`
	Desc            string `json:"desc" example:"OpenAI API configuration"`
	ModelConfig     string `json:"modelConfig" example:"{}"`
	RateLimitConfig string `json:"rateLimitConfig" example:"{}"`
	CostConfig      string `json:"costConfig" example:"{}"`
	SecurityConfig  string `json:"securityConfig" example:"{}"`
	AdvancedConfig  string `json:"advancedConfig" example:"{}"`
}
