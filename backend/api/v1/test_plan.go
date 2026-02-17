package v1

type TestPlanSearchRequest struct {
	Page       int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize   int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"`
	ProjectID  uint   `form:"projectId" example:"1"`
	Name       string `form:"name" example:"Release 1.0 Test Plan"`
	ExecStatus int    `form:"execStatus" example:"1"`
}

type TestPlanDataItem struct {
	ID                uint   `json:"id,omitempty" example:"1"`
	CreatedAt         string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt         string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID         uint   `json:"projectId" example:"1"`
	PlanNo            string `json:"planNo" example:"TP001"`
	Name              string `json:"name" example:"Release 1.0 Test Plan"`
	Description       string `json:"description,omitempty" example:"Test plan for release 1.0"`
	PlanType          string `json:"planType" example:"manual"`
	ContentData       string `json:"contentData,omitempty" example:"{}"`
	TriggerType       string `json:"triggerType" example:"manual"`
	CronExpr          string `json:"cronExpr,omitempty" example:"0 0 * * *"`
	Parallelism       int    `json:"parallelism" example:"1"`
	Timeout           int    `json:"timeout" example:"7200"`
	RetryCount        int    `json:"retryCount" example:"0"`
	NotifyConfig      string `json:"notifyConfig,omitempty" example:"{}"`
	ExpectedStartTime string `json:"expectedStartTime,omitempty" example:"2024-01-01 10:00:00"`
	ExpectedEndTime   string `json:"expectedEndTime,omitempty" example:"2024-01-01 18:00:00"`
	ActualStartTime   string `json:"actualStartTime,omitempty" example:"2024-01-01 10:00:00"`
	ActualEndTime     string `json:"actualEndTime,omitempty" example:"2024-01-01 16:00:00"`
	ExecStatus        int    `json:"execStatus" example:"1"`
	ExecutorID        uint   `json:"executorId,omitempty" example:"1"`
	CreatorID         uint   `json:"creatorId" example:"1"`
}

type TestPlanSearchResponseData struct {
	List  []TestPlanDataItem `json:"list"`
	Total int64              `json:"total"`
}

type TestPlanSearchResponse struct {
	Response
	Data TestPlanSearchResponseData
}

type TestPlanResponse struct {
	Response
	Data TestPlanDataItem
}

type TestPlanRequest struct {
	ProjectID         uint   `json:"projectId" binding:"required" example:"1"`
	Name              string `json:"name" binding:"required" example:"Release 1.0 Test Plan"`
	Description       string `json:"description" example:"Test plan for release 1.0"`
	PlanType          string `json:"planType" example:"manual"`
	ContentData       string `json:"contentData" example:"{}"`
	TriggerType       string `json:"triggerType" example:"manual"`
	CronExpr          string `json:"cronExpr" example:"0 0 * * *"`
	Parallelism       int    `json:"parallelism" example:"1"`
	Timeout           int    `json:"timeout" example:"7200"`
	RetryCount        int    `json:"retryCount" example:"0"`
	NotifyConfig      string `json:"notifyConfig" example:"{}"`
	ExpectedStartTime string `json:"expectedStartTime" example:"2024-01-01 10:00:00"`
	ExpectedEndTime   string `json:"expectedEndTime" example:"2024-01-01 18:00:00"`
}
