package v1

type ProjectSearchRequest struct {
	Page     int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize int    `form:"pageSize" binding:"required,min=1,max=1000" example:"10"`
	Name     string `form:"name" example:"my-project"`
	Code     string `form:"code" example:"PROJ001"`
	Status   int    `form:"status" example:"1"`
}

type ProjectDataItem struct {
	ID          uint   `json:"id,omitempty" example:"1"`
	CreatedAt   string `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt   string `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	Code        string `json:"code" example:"PROJ001"`
	Name        string `json:"name" example:"My Project"`
	Description string `json:"description,omitempty" example:"Project description"`
	Icon        string `json:"icon,omitempty" example:"https://example.com/icon.png"`
	Tags        string `json:"tags,omitempty" example:"mobile,web"`
	GitRepo     string `json:"gitRepo,omitempty" example:"https://github.com/org/repo.git"`
	Status      int    `json:"status" example:"1"`
	CaseCount   int    `json:"caseCount" example:"100"`
	ExecCount   int    `json:"execCount" example:"50"`
	CreatorID   uint   `json:"creatorId" example:"1"`
}

type ProjectSearchResponseData struct {
	List  []ProjectDataItem `json:"list"`
	Total int64             `json:"total"`
}

type ProjectSearchResponse struct {
	Response
	Data ProjectSearchResponseData
}

type ProjectResponse struct {
	Response
	Data ProjectDataItem
}

type ProjectRequest struct {
	Code         string `json:"code" binding:"required" example:"PROJ001"`
	Name         string `json:"name" binding:"required" example:"My Project"`
	Description  string `json:"description" example:"Project description"`
	Icon         string `json:"icon" example:"https://example.com/icon.png"`
	Tags         string `json:"tags" example:"mobile,web"`
	GitRepo      string `json:"gitRepo" example:"https://github.com/org/repo.git"`
	DefaultEnvID uint   `json:"defaultEnvId" example:"1"`
	Status       int    `json:"status" example:"1"`
}
