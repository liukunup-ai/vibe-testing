package v1

type BugSearchRequest struct {
	Page        int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize    int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProjectID   uint   `form:"projectId" example:"1"`
	BugNo       string `form:"bugNo" example:"BUG001"`
	Title       string `form:"title" example:"Login error"`
	Severity    string `form:"severity" example:"critical"`
	Priority    string `form:"priority" example:"P0"`
	Status      string `form:"status" example:"new"`
	CreatorID   uint   `form:"creatorId" example:"1"`
	AssigneeID  uint   `form:"assigneeId" example:"1"`
	Environment string `form:"environment" example:"dev"`
}

type BugDataItem struct {
	ID              uint     `json:"id,omitempty" example:"1"`
	CreatedAt       string   `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt       string   `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	BugNo           string   `json:"bugNo" example:"BUG001"`
	Title           string   `json:"title" example:"Login failed"`
	Description     string   `json:"description,omitempty" example:"User cannot login"`
	Severity        string   `json:"severity" example:"critical"`
	Priority        string   `json:"priority" example:"P0"`
	Status          string   `json:"status" example:"new"`
	CreatorID       uint     `json:"creatorId" example:"1"`
	AssigneeID      uint     `json:"assigneeId" example:"1"`
	VerifierID      uint     `json:"verifierId" example:"1"`
	FixedAt         string   `json:"fixedAt,omitempty" example:"2006-01-02 15:04:05"`
	VerifiedAt      string   `json:"verifiedAt,omitempty" example:"2006-01-02 15:04:05"`
	ClosedAt        string   `json:"closedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID       uint     `json:"projectId" example:"1"`
	TestCaseID      uint     `json:"testCaseId,omitempty" example:"1"`
	TestRecordID    uint     `json:"testRecordId,omitempty" example:"1"`
	UserFeedbackID  uint     `json:"userFeedbackId,omitempty" example:"1"`
	RequirementID   uint     `json:"requirementId,omitempty" example:"1"`
	Environment     string   `json:"environment,omitempty" example:"dev"`
	DeviceInfo      string   `json:"deviceInfo,omitempty" example:"iPhone 14"`
	OS              string   `json:"os,omitempty" example:"iOS 16.0"`
	Browser         string   `json:"browser,omitempty" example:"Safari"`
	Preconditions   string   `json:"preconditions,omitempty" example:"User is logged in"`
	Steps           string   `json:"steps,omitempty" example:"1. Click login..."`
	ExpectedResult  string   `json:"expectedResult,omitempty" example:"Login successful"`
	ActualResult    string   `json:"actualResult,omitempty" example:"Login failed"`
	AttachmentPaths []string `json:"attachmentPaths,omitempty" example:"[\"/uploads/bug/1.png\"]"`
}

type BugSearchResponseData struct {
	List  []BugDataItem `json:"list"`
	Total int64         `json:"total"`
}

type BugSearchResponse struct {
	Response
	Data BugSearchResponseData
}

type BugResponse struct {
	Response
	Data BugDataItem
}

type BugRequest struct {
	BugNo           string   `json:"bugNo" binding:"required" example:"BUG001"`
	Title           string   `json:"title" binding:"required" example:"Login failed"`
	Description     string   `json:"description" example:"User cannot login"`
	Severity        string   `json:"severity" binding:"required" example:"critical"`
	Priority        string   `json:"priority" binding:"required" example:"P0"`
	Status          string   `json:"status" example:"new"`
	AssigneeID      uint     `json:"assigneeId" example:"1"`
	VerifierID      uint     `json:"verifierId" example:"1"`
	ProjectID       uint     `json:"projectId" binding:"required" example:"1"`
	TestCaseID      uint     `json:"testCaseId" example:"1"`
	TestRecordID    uint     `json:"testRecordId" example:"1"`
	UserFeedbackID  uint     `json:"userFeedbackId" example:"1"`
	RequirementID   uint     `json:"requirementId" example:"1"`
	Environment     string   `json:"environment" example:"dev"`
	DeviceInfo      string   `json:"deviceInfo" example:"iPhone 14"`
	OS              string   `json:"os" example:"iOS 16.0"`
	Browser         string   `json:"browser" example:"Safari"`
	Preconditions   string   `json:"preconditions" example:"User is logged in"`
	Steps           string   `json:"steps" example:"1. Click login..."`
	ExpectedResult  string   `json:"expectedResult" example:"Login successful"`
	ActualResult    string   `json:"actualResult" example:"Login failed"`
	AttachmentPaths []string `json:"attachmentPaths" example:"[\"/uploads/bug/1.png\"]"`
}
