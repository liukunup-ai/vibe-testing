package v1

type UserFeedbackSearchRequest struct {
	Page       int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize   int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProjectID  uint   `form:"projectId" example:"1"`
	FeedbackNo string `form:"feedbackNo" example:"FB001"`
	Title      string `form:"title" example:"Login issue"`
	Channel    string `form:"channel" example:"in-app"`
	Status     int    `form:"status" example:"0"`
	Reporter   string `form:"reporter" example:"user@example.com"`
}

type UserFeedbackDataItem struct {
	ID              uint     `json:"id,omitempty" example:"1"`
	CreatedAt       string   `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt       string   `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	FeedbackNo      string   `json:"feedbackNo" example:"FB001"`
	Title           string   `json:"title" example:"Login issue"`
	Content         string   `json:"content" example:"Cannot login with correct password"`
	Channel         string   `json:"channel" example:"in-app"`
	Reporter        string   `json:"reporter" example:"user@example.com"`
	OccurredAt      string   `json:"occurredAt" example:"2006-01-02 15:04:05"`
	Status          int      `json:"status" example:"0"`
	Handler         string   `json:"handler,omitempty" example:"admin"`
	ClosedAt        string   `json:"closedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID       uint     `json:"projectId" example:"1"`
	TestRecordID    *uint    `json:"testRecordId,omitempty" example:"1"`
	DeviceModel     string   `json:"deviceModel,omitempty" example:"iPhone 14"`
	OSVersion       string   `json:"osVersion,omitempty" example:"iOS 16.0"`
	AppVersion      string   `json:"appVersion,omitempty" example:"1.0.0"`
	AttachmentPaths []string `json:"attachmentPaths,omitempty" example:"[]"`
	BugID           *uint    `json:"bugId,omitempty" example:"1"`
	ConvertedAt     string   `json:"convertedAt,omitempty" example:"2006-01-02 15:04:05"`
	ConvertedBy     string   `json:"convertedBy,omitempty" example:"admin"`
}

type UserFeedbackSearchResponseData struct {
	List  []UserFeedbackDataItem `json:"list"`
	Total int64                  `json:"total"`
}

type UserFeedbackSearchResponse struct {
	Response
	Data UserFeedbackSearchResponseData
}

type UserFeedbackResponse struct {
	Response
	Data UserFeedbackDataItem
}

type UserFeedbackRequest struct {
	FeedbackNo      string   `json:"feedbackNo" binding:"required" example:"FB001"`
	Title           string   `json:"title" binding:"required" example:"Login issue"`
	Content         string   `json:"content" binding:"required" example:"Cannot login with correct password"`
	Channel         string   `json:"channel" binding:"required" example:"in-app"`
	Reporter        string   `json:"reporter" binding:"required" example:"user@example.com"`
	OccurredAt      string   `json:"occurredAt" binding:"required" example:"2006-01-02 15:04:05"`
	Status          int      `json:"status" example:"0"`
	Handler         string   `json:"handler" example:"admin"`
	ClosedAt        string   `json:"closedAt" example:"2006-01-02 15:04:05"`
	ProjectID       uint     `json:"projectId" binding:"required" example:"1"`
	TestRecordID    *uint    `json:"testRecordId" example:"1"`
	DeviceModel     string   `json:"deviceModel" example:"iPhone 14"`
	OSVersion       string   `json:"osVersion" example:"iOS 16.0"`
	AppVersion      string   `json:"appVersion" example:"1.0.0"`
	AttachmentPaths []string `json:"attachmentPaths" example:"[]"`
	BugID           *uint    `json:"bugId" example:"1"`
	ConvertedAt     string   `json:"convertedAt" example:"2006-01-02 15:04:05"`
	ConvertedBy     string   `json:"convertedBy" example:"admin"`
}
