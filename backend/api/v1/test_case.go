package v1

type TestCaseSearchRequest struct {
	Page      int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize  int    `form:"pageSize" binding:"required,min=1,max=1000" example:"10"`
	ProjectID uint   `form:"projectId" example:"1"`
	Title     string `form:"title" example:"Login test"`
	Priority  int    `form:"priority" example:"0"`
	Status    int    `form:"status" example:"2"`
	Module    string `form:"module" example:"auth"`
}

type TestCaseDataItem struct {
	ID            uint   `json:"id,omitempty" example:"1"`
	CreatedAt     string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt     string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID     uint   `json:"projectId" example:"1"`
	CaseNo        string `json:"caseNo" example:"TC001"`
	Title         string `json:"title" example:"Login Test Case"`
	Description   string `json:"description,omitempty" example:"Test user login flow"`
	Priority      int    `json:"priority" example:"0"`
	CaseType      string `json:"caseType" example:"functional"`
	Module        string `json:"module,omitempty" example:"auth"`
	Tags          string `json:"tags,omitempty" example:"smoke,regression"`
	RequirementID uint   `json:"requirementId,omitempty" example:"1"`
	Status        int    `json:"status" example:"2"`
	Version       int    `json:"version" example:"1"`
	StepsData     string `json:"stepsData,omitempty" example:"{}"`
	CreatorID     uint   `json:"creatorId" example:"1"`
}

type TestCaseSearchResponseData struct {
	List  []TestCaseDataItem `json:"list"`
	Total int64              `json:"total"`
}

type TestCaseSearchResponse struct {
	Response
	Data TestCaseSearchResponseData
}

type TestCaseResponse struct {
	Response
	Data TestCaseDataItem
}

type TestCaseRequest struct {
	ProjectID     uint   `json:"projectId" binding:"required" example:"1"`
	Title         string `json:"title" binding:"required" example:"Login Test Case"`
	Description   string `json:"description" example:"Test user login flow"`
	Priority      int    `json:"priority" example:"0"`
	CaseType      string `json:"caseType" example:"functional"`
	Module        string `json:"module" example:"auth"`
	Tags          string `json:"tags" example:"smoke,regression"`
	RequirementID uint   `json:"requirementId" example:"1"`
	StepsData     string `json:"stepsData" example:"{}"`
	Status        int    `json:"status" example:"1"`
}
