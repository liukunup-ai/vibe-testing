package v1

import "time"

// CRUD
type UserSearchRequest struct {
	Page     int    `form:"page" binding:"required,min=1" example:"1"`              // 页码
	PageSize int    `form:"pageSize" binding:"required,min=1,max=100" example:"10"` // 分页大小
	UserID   string `form:"userId" example:"IQrIkwYlyn"`                            // 筛选项: UserID 精确匹配
	Email    string `form:"email" example:"zhangsan@example.com"`                   // 筛选项: 邮箱 模糊匹配
	Phone    string `form:"phone" example:"13800138000"`                            // 筛选项: 手机 模糊匹配
	Username string `form:"username" example:"zhangsan"`                            // 筛选项: 用户名 模糊匹配
	FullName string `form:"fullName" example:"Zhang San"`                           // 筛选项: 全名 模糊匹配
}
type UserDataItem struct {
	UserID    string         `json:"userId,omitempty"`    // UserID
	Username  string         `json:"username,omitempty"`  // 用户名
	Email     string         `json:"email,omitempty"`     // 邮箱
	Phone     string         `json:"phone,omitempty"`     // 手机
	FullName  string         `json:"fullName,omitempty"`  // 全名
	AvatarURL string         `json:"avatarUrl,omitempty"` // 头像
	Bio       string         `json:"bio,omitempty"`       // 简介
	Status    int            `json:"status"`              // 状态 0:待激活 1:正常 2:禁用
	Roles     []RoleDataItem `json:"roles,omitempty"`     // 角色
	CreatedAt time.Time      `json:"createdAt,omitempty"` // 创建时间
	UpdatedAt time.Time      `json:"updatedAt,omitempty"` // 更新时间
} // @name User
type UserSearchResponseData struct {
	List  []UserDataItem `json:"list"`  // 列表
	Total int64          `json:"total"` // 总数
} // @name UserList
type UserSearchResponse struct {
	Response
	Data UserSearchResponseData
}

type UserResponse struct {
	Response
	Data UserDataItem
}

type UserRequest struct {
	Username string   `json:"username" example:"zhangsan"`          // 用户名
	Email    string   `json:"email" example:"zhangsan@example.com"` // 邮箱
	Phone    string   `json:"phone" example:"13800138000"`          // 手机
	FullName string   `json:"fullName" example:"Zhang San"`         // 全名
	Bio      string   `json:"bio" example:"The Jackal"`             // 简介
	Status   int      `json:"status" example:"1"`                   // 状态 0:待激活 1:正常 2:禁用
	Roles    []string `json:"roles"`                                // 角色
}

type UpdatePasswordRequest struct {
	OldPassword string `json:"oldPassword" binding:"required" example:"123456"` // 旧密码
	NewPassword string `json:"newPassword" binding:"required" example:"123456"` // 新密码
}

type UpdateStatusRequest struct {
	Status int `json:"status" binding:"required,oneof=0 1 2" example:"1"` // 状态 0:待激活 1:正常 2:禁用
}

type AvatarRequest struct {
	UserID   string `json:"userId" binding:"required" example:"IQrIkwYlyn"`   // UserID
	Filename string `json:"filename" binding:"required" example:"avatar.jpg"` // 文件名称
	Size     int64  `json:"size" example:"1024"`                              // 文件大小
	Type     string `json:"type" example:"image/jpeg"`                        // 文件类型
}

type OwnerData struct {
	Username  string `json:"username,omitempty" example:"zhangsan"`                   // 用户名
	FullName  string `json:"fullName,omitempty" example:"Zhang San"`                  // 全名
	AvatarUrl string `json:"avatarUrl,omitempty" example:"https://example.com/1.jpg"` // 头像
}
