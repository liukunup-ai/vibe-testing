package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type RequirementHandler struct {
	*Handler
	requirementService service.RequirementService
}

func NewRequirementHandler(handler *Handler, requirementService service.RequirementService) *RequirementHandler {
	return &RequirementHandler{
		Handler:            handler,
		requirementService: requirementService,
	}
}

// ListRequirements godoc
// @Summary 获取需求列表
// @Schemes
// @Description 分页获取需求列表，支持筛选
// @Tags Requirement
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param title query string false "需求标题"
// @Param status query string false "需求状态"
// @Success 200 {object} v1.RequirementSearchResponse
// @Router /v1/requirements [get]
// @ID ListRequirements
func (h *RequirementHandler) ListRequirements(ctx *gin.Context) {
	var req v1.RequirementSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListRequirements bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.requirementService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("requirementService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateRequirement godoc
// @Summary 创建需求
// @Schemes
// @Description 创建一个新的需求
// @Tags Requirement
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.RequirementRequest true "需求信息"
// @Success 200 {object} v1.Response
// @Router /v1/requirements [post]
// @ID CreateRequirement
func (h *RequirementHandler) CreateRequirement(ctx *gin.Context) {
	var req v1.RequirementRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateRequirement bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.requirementService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("requirementService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateRequirement godoc
// @Summary 更新需求
// @Schemes
// @Description 更新指定ID的需求信息
// @Tags Requirement
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "需求ID"
// @Param request body v1.RequirementRequest true "需求信息"
// @Success 200 {object} v1.Response
// @Router /v1/requirements/{id} [put]
// @ID UpdateRequirement
func (h *RequirementHandler) UpdateRequirement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateRequirement parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.RequirementRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateRequirement bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.requirementService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("requirementService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteRequirement godoc
// @Summary 删除需求
// @Schemes
// @Description 删除指定ID的需求
// @Tags Requirement
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "需求ID"
// @Success 200 {object} v1.Response
// @Router /v1/requirements/{id} [delete]
// @ID DeleteRequirement
func (h *RequirementHandler) DeleteRequirement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteRequirement parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.requirementService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("requirementService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetRequirement godoc
// @Summary 获取需求详情
// @Schemes
// @Description 获取指定ID的需求详情
// @Tags Requirement
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "需求ID"
// @Success 200 {object} v1.RequirementResponse
// @Router /v1/requirements/{id} [get]
// @ID GetRequirement
func (h *RequirementHandler) GetRequirement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetRequirement parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.requirementService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("requirementService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
