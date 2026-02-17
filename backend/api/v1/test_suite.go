package v1

type TestSuiteSearchRequest struct {
	Page      int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize  int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProjectID uint   `form:"projectId" example:"1"`
	Name      string `form:"name" example:"Smoke Suite"`
	Status    int    `form:"status" example:"1"`
}

type TestSuiteDataItem struct {
	ID             uint   `json:"id,omitempty" example:"1"`
	CreatedAt      string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt      string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID      uint   `json:"projectId" example:"1"`
	SuiteNo        string `json:"suiteNo" example:"TS001"`
	Name           string `json:"name" example:"Smoke Suite"`
	Description    string `json:"description,omitempty" example:"Smoke test suite"`
	SuiteType      string `json:"suiteType" example:"static"`
	CaseIDs        string `json:"caseIds,omitempty" example:"[1,2,3]"`
	FilterRule     string `json:"filterRule,omitempty" example:"{}"`
	Parallelism    int    `json:"parallelism" example:"1"`
	Timeout        int    `json:"timeout" example:"3600"`
	RetryCount     int    `json:"retryCount" example:"0"`
	ContinueOnFail bool   `json:"continueOnFail" example:"false"`
	Status         int    `json:"status" example:"1"`
	CreatorID      uint   `json:"creatorId" example:"1"`
}

type TestSuiteSearchResponseData struct {
	List  []TestSuiteDataItem `json:"list"`
	Total int64               `json:"total"`
}

type TestSuiteSearchResponse struct {
	Response
	Data TestSuiteSearchResponseData
}

type TestSuiteResponse struct {
	Response
	Data TestSuiteDataItem
}

type TestSuiteRequest struct {
	ProjectID      uint   `json:"projectId" binding:"required" example:"1"`
	Name           string `json:"name" binding:"required" example:"Smoke Suite"`
	Description    string `json:"description" example:"Smoke test suite"`
	SuiteType      string `json:"suiteType" example:"static"`
	CaseIDs        string `json:"caseIds" example:"[1,2,3]"`
	FilterRule     string `json:"filterRule" example:"{}"`
	Parallelism    int    `json:"parallelism" example:"1"`
	Timeout        int    `json:"timeout" example:"3600"`
	RetryCount     int    `json:"retryCount" example:"0"`
	ContinueOnFail bool   `json:"continueOnFail" example:"false"`
	Status         int    `json:"status" example:"1"`
}
