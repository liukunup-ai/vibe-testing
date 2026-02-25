package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserHandler struct {
	*Handler
	userService service.UserService
}

func NewUserHandler(handler *Handler, userService service.UserService) *UserHandler {
	return &UserHandler{
		Handler:     handler,
		userService: userService,
	}
}

// ListUsers godoc
// @Summary 获取用户列表
// @Schemes
// @Description 搜索时支持用户名、昵称、手机和邮箱筛选
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param email query string false "邮箱"
// @Param phone query string false "手机"
// @Param username query string false "用户名"
// @Param fullName query string false "展示名"
// @Success 200 {object} v1.UserSearchResponse
// @Router /admin/users [get]
// @ID ListUsers
func (h *UserHandler) ListUsers(ctx *gin.Context) {
	var req v1.UserSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListUsers bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.userService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("userService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateUser godoc
// @Summary 创建用户
// @Schemes
// @Description 创建一个新的用户
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.UserRequest true "用户信息"
// @Success 200 {object} v1.Response
// @Router /admin/users [post]
// @ID CreateUser
func (h *UserHandler) CreateUser(ctx *gin.Context) {
	var req v1.UserRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateUser bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userService.Create(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("userService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateUser godoc
// @Summary 更新用户
// @Schemes
// @Description 更新用户信息
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Param request body v1.UserRequest true "参数"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id} [put]
// @ID UpdateUser
func (h *UserHandler) UpdateUser(ctx *gin.Context) {
	uid := ctx.Param("id")

	var req v1.UserRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateUser bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userService.Update(ctx, uid, &req); err != nil {
		h.logger.WithContext(ctx).Error("userService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteUser godoc
// @Summary 删除用户
// @Schemes
// @Description 删除指定ID的用户
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id query string true "用户ID"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id} [delete]
// @ID DeleteUser
func (h *UserHandler) DeleteUser(ctx *gin.Context) {
	uid := ctx.Param("id")

	if err := h.userService.Delete(ctx, uid); err != nil {
		h.logger.WithContext(ctx).Error("userService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetUserByID godoc
// @Summary 获取用户详情
// @Schemes
// @Description 获取指定ID的用户详情
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Success 200 {object} v1.UserResponse
// @Router /users/{id} [get]
// @ID GetUserByID
func (h *UserHandler) GetUserByID(ctx *gin.Context) {
	uid := ctx.Param("id")

	data, err := h.userService.Get(ctx, uid)
	if err != nil {
		h.logger.WithContext(ctx).Error("userService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// GetProfile godoc
// @Summary 获取当前用户
// @Schemes
// @Description 获取当前用户的详细信息
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} v1.UserResponse
// @Router /users/profile [get]
// @ID FetchCurrentUser
func (h *UserHandler) GetProfile(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)

	data, err := h.userService.Get(ctx, uid)
	if err != nil {
		h.logger.WithContext(ctx).Error("userService.GetByPublicID error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// UpdateProfile godoc
// @Summary 更新用户
// @Schemes
// @Description 更新用户信息
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.UserRequest true "参数"
// @Success 200 {object} v1.Response
// @Router /users/profile [put]
// @ID UpdateProfile
func (h *UserHandler) UpdateProfile(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)

	var req v1.UserRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateUser bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userService.Update(ctx, uid, &req); err != nil {
		h.logger.WithContext(ctx).Error("userService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UploadAvatar godoc
// @Summary 上传头像
// @Schemes
// @Description 上传用户头像
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param file formData file true "头像文件"
// @Success 200 {object} v1.Response
// @Router /users/profile/avatar [post]
// @ID UploadAvatar
func (h *UserHandler) UploadAvatar(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)

	file, err := ctx.FormFile("file")
	if err != nil {
		h.logger.WithContext(ctx).Error("UploadAvatar get file error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	reader, err := file.Open()
	if err != nil {
		h.logger.WithContext(ctx).Error("UploadAvatar get file error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}
	defer reader.Close()

	req := &v1.AvatarRequest{
		UserID:   uid,
		Filename: file.Filename,
		Size:     file.Size,
		Type:     file.Header.Get("Content-Type"),
	}

	if err := h.userService.UploadAvatar(ctx, uid, req, reader); err != nil {
		h.logger.WithContext(ctx).Error("userService.UploadAvatar error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetMenus godoc
// @Summary 获取用户菜单
// @Schemes
// @Description 获取当前用户的菜单列表
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} v1.DynamicMenuResponse
// @Router /users/menu [get]
// @ID FetchDynamicMenu
func (h *UserHandler) GetMenu(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)

	data, err := h.userService.GetMenu(ctx, uid)
	if err != nil {
		h.logger.WithContext(ctx).Error("userService.GetMenu error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// UpdatePassword godoc
// @Summary 更新密码
// @Schemes
// @Description 更新用户密码
// @Tags User
// @Accept json
// @Produce json
// @Param request body v1.UpdatePasswordRequest true "更新密码信息"
// @Security Bearer
// @Success 200 {object} v1.Response
// @Router /users/password [put]
// @ID UpdatePassword
func (h *UserHandler) UpdatePassword(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)

	var req v1.UpdatePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdatePassword bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userService.UpdatePassword(ctx, uid, &req); err != nil {
		h.logger.WithContext(ctx).Error("userService.UpdatePassword error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// SendResetEmail godoc
// @Summary 发送重置密码邮件
// @Schemes
// @Description 向指定用户发送重置密码邮件
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id}/send-reset-email [post]
// @ID SendResetEmail
func (h *UserHandler) SendResetEmail(ctx *gin.Context) {
	uid := ctx.Param("id")

	if err := h.userService.SendResetEmail(ctx, uid); err != nil {
		h.logger.WithContext(ctx).Error("userService.SendResetEmail error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// RevokeSessions godoc
// @Summary 撤销登录态
// @Schemes
// @Description 撤销指定用户的所有登录会话
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id}/revoke-sessions [post]
// @ID RevokeSessions
func (h *UserHandler) RevokeSessions(ctx *gin.Context) {
	uid := ctx.Param("id")

	if err := h.userService.RevokeSessions(ctx, uid); err != nil {
		h.logger.WithContext(ctx).Error("userService.RevokeSessions error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateStatus godoc
// @Summary 更新用户状态
// @Schemes
// @Description 更新用户状态（启用/禁用）
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Param request body v1.UpdateStatusRequest true "状态信息"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id}/status [put]
// @ID UpdateStatus
func (h *UserHandler) UpdateStatus(ctx *gin.Context) {
	uid := ctx.Param("id")

	var req v1.UpdateStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateStatus bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userService.UpdateStatus(ctx, uid, req.Status); err != nil {
		h.logger.WithContext(ctx).Error("userService.UpdateStatus error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// ResetAvatar godoc
// @Summary 重置头像
// @Schemes
// @Description 重置用户头像为默认头像
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "用户ID"
// @Success 200 {object} v1.Response
// @Router /admin/users/{id}/reset-avatar [put]
// @ID ResetAvatar
func (h *UserHandler) ResetAvatar(ctx *gin.Context) {
	uid := ctx.Param("id")

	if err := h.userService.ResetAvatar(ctx, uid); err != nil {
		h.logger.WithContext(ctx).Error("userService.ResetAvatar error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}
