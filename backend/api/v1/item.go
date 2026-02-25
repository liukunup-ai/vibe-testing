package v1

// CRUD
type ItemSearchRequest struct {
	Page     int    `form:"page" binding:"required,min=1" example:"1"`              // 页码
	PageSize int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"` // 分页大小
	Name     string `form:"name" example:"item"`                                    // 筛选项: 名称 模糊匹配
	Desc     string `form:"desc" example:"It's a demo item"`                        // 筛选项: 描述 模糊匹配
	Owner    string `form:"owner" example:"Zhangsan"`                               // 筛选项: 所有者 精确匹配
}
type ItemDataItem struct {
	Id        uint       `json:"id,omitempty" example:"1"`                          // ID
	CreatedAt string     `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"` // 创建时间
	UpdatedAt string     `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"` // 更新时间
	Name      string     `json:"name" example:"item"`                               // 名称
	Desc      string     `json:"desc,omitempty" example:"It's a demo item"`         // 描述
	Owner     *OwnerData `json:"owner,omitempty"`                                   // 所有者
} // @name Item
type ItemSearchResponseData struct {
	List  []ItemDataItem `json:"list"`  // 列表
	Total int64          `json:"total"` // 总数
} // @name ItemList
type ItemSearchResponse struct {
	Response
	Data ItemSearchResponseData
}

type ItemResponse struct {
	Response
	Data ItemDataItem
}

type ItemRequest struct {
	Name  string `json:"name" example:"item"`             // 名称
	Desc  string `json:"desc" example:"It's a demo item"` // 描述
	Owner string `json:"owner" example:"Zhangsan"`        // 所有者
}
