package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type BugHandler struct {
	*Handler
	bugService service.BugService
}

func NewBugHandler(handler *Handler, bugService service.BugService) *BugHandler {
	return &BugHandler{
		Handler:    handler,
		bugService: bugService,
	}
}
// ListBugs godoc
// @Summary 获取缺陷列表
// @Schemes
// @Description 搜索时支持编号、标题、严重程度、优先级、状态等筛选
// @Tags Bug
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param projectId query uint false "项目ID"
// @Param bugNo query string false "缺陷编号"
// @Param title query string false "标题"
// @Param severity query string false "严重程度"
// @Param priority query string false "优先级"
// @Param status query string false "状态"
// @Success 200 {object} v1.BugSearchResponse
// @Router /v1/bugs [get]
// @ID ListBugs
func (h *BugHandler) ListBugs(ctx *gin.Context) {
	var req v1.BugSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListBugs bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.bugService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("bugService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}
// CreateBug godoc
// @Summary 创建缺陷
// @Schemes
// @Description 创建一个新的缺陷
// @Tags Bug
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.BugRequest true "缺陷信息"
// @Success 200 {object} v1.Response
// @Router /v1/bugs [post]
// @ID CreateBug
func (h *BugHandler) CreateBug(ctx *gin.Context) {
	var req v1.BugRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateBug bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.bugService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("bugService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}
// UpdateBug godoc
// @Summary 更新缺陷
// @Schemes
// @Description 更新缺陷信息
// @Tags Bug
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "缺陷ID"
// @Param request body v1.BugRequest true "缺陷信息"
// @Success 200 {object} v1.Response
// @Router /v1/bugs/{id} [put]
// @ID UpdateBug
func (h *BugHandler) UpdateBug(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateBug parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.BugRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateBug bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.bugService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("bugService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}
// DeleteBug godoc
// @Summary 删除缺陷
// @Schemes
// @Description 删除指定ID的缺陷
// @Tags Bug
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "缺陷ID"
// @Success 200 {object} v1.Response
// @Router /v1/bugs/{id} [delete]
// @ID DeleteBug
func (h *BugHandler) DeleteBug(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteBug parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.bugService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("bugService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}
// GetBug godoc
// @Summary 获取缺陷详情
// @Schemes
// @Description 获取指定ID的缺陷详情
// @Tags Bug
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "缺陷ID"
// @Success 200 {object} v1.BugResponse
// @Router /v1/bugs/{id} [get]
// @ID GetBug
func (h *BugHandler) GetBug(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetBug parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.bugService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("bugService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
