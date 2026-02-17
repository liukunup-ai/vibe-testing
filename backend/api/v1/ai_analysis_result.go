package v1

type AIAnalysisResultSearchRequest struct {
	Page              int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize          int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	AnalysisType      string `form:"analysisType" example:"diagnosis"`
	RelatedObjectID   uint   `form:"relatedObjectId" example:"1"`
	RelatedObjectType string `form:"relatedObjectType" example:"test_case"`
	ProviderID        string `form:"providerId" example:"openai"`
	HumanVerified     *bool  `form:"humanVerified" example:"true"`
}

type AIAnalysisResultDataItem struct {
	ID                uint   `json:"id,omitempty" example:"1"`
	CreatedAt         string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt         string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	AnalysisNo        string `json:"analysisNo" example:"ANA-20240101-001"`
	AnalysisType      string `json:"analysisType" example:"diagnosis"`
	RelatedObjectID   uint   `json:"relatedObjectId" example:"1"`
	RelatedObjectType string `json:"relatedObjectType" example:"test_case"`
	AnalyzedAt        string `json:"analyzedAt,omitempty" example:"2006-01-02 15:04:05"`
	ModelVersion      string `json:"modelVersion,omitempty" example:"gpt-4-turbo"`
	AnalysisContent   string `json:"analysisContent,omitempty" example:"{}"`
	RelatedDataIDs    string `json:"relatedDataIds,omitempty" example:"[]"`
	HumanVerified     bool   `json:"humanVerified" example:"false"`
	VerifiedAt        string `json:"verifiedAt,omitempty" example:"2006-01-02 15:04:05"`
	AccuracyScore     int    `json:"accuracyScore" example:"85"`
	ProviderID        string `json:"providerId,omitempty" example:"openai"`
	ModelID           string `json:"modelId,omitempty" example:"gpt-4-turbo"`
	APICallTime       int    `json:"apiCallTime" example:"1200"`
	TokenUsage        int    `json:"tokenUsage" example:"3500"`
	CreatorID         uint   `json:"creatorId" example:"1"`
}

type AIAnalysisResultSearchResponseData struct {
	List  []AIAnalysisResultDataItem `json:"list"`
	Total int64                      `json:"total"`
}

type AIAnalysisResultSearchResponse struct {
	Response
	Data AIAnalysisResultSearchResponseData
}

type AIAnalysisResultResponse struct {
	Response
	Data AIAnalysisResultDataItem
}

type AIAnalysisResultRequest struct {
	AnalysisNo        string `json:"analysisNo" binding:"required" example:"ANA-20240101-001"`
	AnalysisType      string `json:"analysisType" binding:"required" example:"diagnosis"`
	RelatedObjectID   uint   `json:"relatedObjectId" binding:"required" example:"1"`
	RelatedObjectType string `json:"relatedObjectType" binding:"required" example:"test_case"`
	AnalyzedAt        string `json:"analyzedAt" example:"2006-01-02 15:04:05"`
	ModelVersion      string `json:"modelVersion" example:"gpt-4-turbo"`
	AnalysisContent   string `json:"analysisContent" example:"{}"`
	RelatedDataIDs    string `json:"relatedDataIds" example:"[]"`
	HumanVerified     bool   `json:"humanVerified" example:"false"`
	VerifiedAt        string `json:"verifiedAt" example:"2006-01-02 15:04:05"`
	AccuracyScore     int    `json:"accuracyScore" example:"85"`
	ProviderID        string `json:"providerId" example:"openai"`
	ModelID           string `json:"modelId" example:"gpt-4-turbo"`
	APICallTime       int    `json:"apiCallTime" example:"1200"`
	TokenUsage        int    `json:"tokenUsage" example:"3500"`
}
