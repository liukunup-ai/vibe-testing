package v1

type TestRecordSearchRequest struct {
	Page       int  `form:"page" binding:"required,min=1" example:"1"`
	PageSize   int  `form:"pageSize" binding:"required,min=1,max=1000" example:"10"`
	ProjectID  uint `form:"projectId" example:"1"`
	PlanID     uint `form:"planId" example:"1"`
	ExecStatus int  `form:"execStatus" example:"2"`
}

type TestRecordDataItem struct {
	ID           uint   `json:"id,omitempty" example:"1"`
	CreatedAt    string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt    string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	ProjectID    uint   `json:"projectId" example:"1"`
	PlanID       uint   `json:"planId,omitempty" example:"1"`
	ExecutorID   uint   `json:"executorId,omitempty" example:"1"`
	StartTime    string `json:"startTime,omitempty" example:"2024-01-01 10:00:00"`
	EndTime      string `json:"endTime,omitempty" example:"2024-01-01 12:00:00"`
	Duration     int    `json:"duration" example:"7200"`
	ExecStatus   int    `json:"execStatus" example:"2"`
	TotalCases   int    `json:"totalCases" example:"100"`
	PassedCases  int    `json:"passedCases" example:"95"`
	FailedCases  int    `json:"failedCases" example:"3"`
	BlockedCases int    `json:"blockedCases" example:"2"`
	SkippedCases int    `json:"skippedCases" example:"0"`
	PassRate     int    `json:"passRate" example:"95"`
	ExecContext  string `json:"execContext,omitempty" example:"{}"`
	ReportURL    string `json:"reportUrl,omitempty" example:"https://example.com/report.html"`
	ReportFormat string `json:"reportFormat" example:"html"`
}

type TestRecordSearchResponseData struct {
	List  []TestRecordDataItem `json:"list"`
	Total int64                `json:"total"`
}

type TestRecordSearchResponse struct {
	Response
	Data TestRecordSearchResponseData
}

type TestRecordResponse struct {
	Response
	Data TestRecordDataItem
}

type TestRecordRequest struct {
	ProjectID   uint   `json:"projectId" binding:"required" example:"1"`
	PlanID      uint   `json:"planId" example:"1"`
	ExecutorID  uint   `json:"executorId" example:"1"`
	ExecContext string `json:"execContext" example:"{}"`
}

type TestRecordStartRequest struct {
	ProjectID uint `json:"projectId" binding:"required" example:"1"`
	PlanID    uint `json:"planId" binding:"required" example:"1"`
}
