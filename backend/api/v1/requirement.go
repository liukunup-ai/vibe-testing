package v1

type RequirementSearchRequest struct {
	Page          int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize      int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProjectID     uint   `form:"projectId" example:"1"`
	Title         string `form:"title" example:"Login Feature"`
	Status        string `form:"status" example:"pending-review"`
	Priority      string `form:"priority" example:"P1"`
	Owner         uint   `form:"owner" example:"1"`
	ParentID      uint   `form:"parentId" example:"0"`
	RequirementNo string `form:"requirementNo" example:"REQ001"`
}

type RequirementDataItem struct {
	ID            uint   `json:"id,omitempty" example:"1"`
	CreatedAt     string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt     string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	RequirementNo string `json:"requirementNo" example:"REQ001"`
	Title         string `json:"title" example:"User Login"`
	Description   string `json:"description,omitempty" example:"User login requirement"`
	Priority      string `json:"priority" example:"P1"`
	Status        string `json:"status" example:"pending-review"`
	Owner         uint   `json:"owner" example:"1"`
	ProjectID     uint   `json:"projectId" example:"1"`
	CreatorID     uint   `json:"creatorId" example:"1"`
	ExpectedAt    string `json:"expectedAt,omitempty" example:"2024-12-31"`
	CompletedAt   string `json:"completedAt,omitempty" example:""`
	Version       int    `json:"version" example:"1"`
	ChangeHistory string `json:"changeHistory,omitempty" example:"[]"`
	ParentID      uint   `json:"parentId" example:"0"`
	TestCaseIds   string `json:"testCaseIds,omitempty" example:"[]"`
	BugIds        string `json:"bugIds,omitempty" example:"[]"`
}

type RequirementSearchResponseData struct {
	List  []RequirementDataItem `json:"list"`
	Total int64                 `json:"total"`
}

type RequirementSearchResponse struct {
	Response
	Data RequirementSearchResponseData
}

type RequirementResponse struct {
	Response
	Data RequirementDataItem
}

type RequirementRequest struct {
	RequirementNo string `json:"requirementNo" binding:"required" example:"REQ001"`
	Title         string `json:"title" binding:"required" example:"User Login"`
	Description   string `json:"description" example:"User login requirement"`
	Priority      string `json:"priority" example:"P1"`
	Status        string `json:"status" example:"pending-review"`
	Owner         uint   `json:"owner" binding:"required" example:"1"`
	ProjectID     uint   `json:"projectId" binding:"required" example:"1"`
	ExpectedAt    string `json:"expectedAt" example:"2024-12-31"`
	ParentID      uint   `json:"parentId" example:"0"`
	TestCaseIds   string `json:"testCaseIds" example:"[]"`
	BugIds        string `json:"bugIds" example:"[]"`
}
