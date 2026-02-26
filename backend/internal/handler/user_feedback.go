package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserFeedbackHandler struct {
	*Handler
	userFeedbackService service.UserFeedbackService
}

func NewUserFeedbackHandler(handler *Handler, userFeedbackService service.UserFeedbackService) *UserFeedbackHandler {
	return &UserFeedbackHandler{
		Handler:             handler,
		userFeedbackService: userFeedbackService,
	}
}

// ListUserFeedbacks godoc
// @Summary 获取用户反馈列表
// @Schemes
// @Description 获取用户反馈列表，支持分页和筛选
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param projectId query uint false "项目ID"
// @Param type query string false "反馈类型"
// @Param status query string false "反馈状态"
// @Success 200 {object} v1.UserFeedbackSearchResponse
// @Router /v1/feedbacks [get]
// @ID ListUserFeedbacks
func (h *UserFeedbackHandler) ListUserFeedbacks(ctx *gin.Context) {
	var req v1.UserFeedbackSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListUserFeedbacks bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.userFeedbackService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// GetUserFeedback godoc
// @Summary 获取用户反馈详情
// @Schemes
// @Description 获取指定ID的用户反馈详情
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "反馈ID"
// @Success 200 {object} v1.UserFeedbackResponse
// @Router /v1/feedbacks/{id} [get]
// @ID GetUserFeedback
func (h *UserFeedbackHandler) GetUserFeedback(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetUserFeedback parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.userFeedbackService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// GetUserFeedbacksByProject godoc
// @Summary 获取项目用户反馈
// @Schemes
// @Description 获取指定项目的所有用户反馈
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Success 200 {object} v1.UserFeedbackSearchResponse
// @Router /v1/feedbacks/project/{id} [get]
// @ID GetUserFeedbacksByProject
func (h *UserFeedbackHandler) GetUserFeedbacksByProject(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetUserFeedbacksByProject parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.userFeedbackService.GetByProjectID(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.GetByProjectID error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateUserFeedback godoc
// @Summary 创建用户反馈
// @Schemes
// @Description 创建一个新的用户反馈
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.UserFeedbackRequest true "反馈信息"
// @Success 200 {object} v1.Response
// @Router /v1/feedbacks [post]
// @ID CreateUserFeedback
func (h *UserFeedbackHandler) CreateUserFeedback(ctx *gin.Context) {
	var req v1.UserFeedbackRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateUserFeedback bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userFeedbackService.Create(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateUserFeedback godoc
// @Summary 更新用户反馈
// @Schemes
// @Description 更新用户反馈信息
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "反馈ID"
// @Param request body v1.UserFeedbackRequest true "反馈信息"
// @Success 200 {object} v1.Response
// @Router /v1/feedbacks/{id} [put]
// @ID UpdateUserFeedback
func (h *UserFeedbackHandler) UpdateUserFeedback(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateUserFeedback parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.UserFeedbackRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateUserFeedback bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.userFeedbackService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteUserFeedback godoc
// @Summary 删除用户反馈
// @Schemes
// @Description 删除指定ID的用户反馈
// @Tags UserFeedback
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "反馈ID"
// @Success 200 {object} v1.Response
// @Router /v1/feedbacks/{id} [delete]
// @ID DeleteUserFeedback
func (h *UserFeedbackHandler) DeleteUserFeedback(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteUserFeedback parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.userFeedbackService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("userFeedbackService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}
