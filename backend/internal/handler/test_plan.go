package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type TestPlanHandler struct {
	*Handler
	planService service.TestPlanService
}

func NewTestPlanHandler(handler *Handler, planService service.TestPlanService) *TestPlanHandler {
	return &TestPlanHandler{
		Handler:     handler,
		planService: planService,
	}
}

// ListTestPlans godoc
// @Summary 获取测试计划列表
// @Schemes
// @Description 获取测试计划列表，支持分页和筛选
// @Tags TestPlan
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "计划名称"
// @Param projectId query int false "项目ID"
// @Success 200 {object} v1.TestPlanSearchResponse
// @Router /v1/testplans [get]
// @ID ListTestPlans
func (h *TestPlanHandler) ListTestPlans(ctx *gin.Context) {
	var req v1.TestPlanSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListTestPlans bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.planService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("planService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateTestPlan godoc
// @Summary 创建测试计划
// @Schemes
// @Description 创建一个新的测试计划
// @Tags TestPlan
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestPlanRequest true "测试计划信息"
// @Success 200 {object} v1.Response
// @Router /v1/testplans [post]
// @ID CreateTestPlan
func (h *TestPlanHandler) CreateTestPlan(ctx *gin.Context) {
	var req v1.TestPlanRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateTestPlan bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.planService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("planService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateTestPlan godoc
// @Summary 更新测试计划
// @Schemes
// @Description 更新测试计划信息
// @Tags TestPlan
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "计划ID"
// @Param request body v1.TestPlanRequest true "测试计划信息"
// @Success 200 {object} v1.Response
// @Router /v1/testplans/{id} [put]
// @ID UpdateTestPlan
func (h *TestPlanHandler) UpdateTestPlan(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestPlan parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.TestPlanRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestPlan bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.planService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("planService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteTestPlan godoc
// @Summary 删除测试计划
// @Schemes
// @Description 删除指定ID的测试计划
// @Tags TestPlan
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "计划ID"
// @Success 200 {object} v1.Response
// @Router /v1/testplans/{id} [delete]
// @ID DeleteTestPlan
func (h *TestPlanHandler) DeleteTestPlan(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteTestPlan parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.planService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("planService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetTestPlan godoc
// @Summary 获取测试计划详情
// @Schemes
// @Description 获取指定ID的测试计划详情
// @Tags TestPlan
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "计划ID"
// @Success 200 {object} v1.TestPlanResponse
// @Router /v1/testplans/{id} [get]
// @ID GetTestPlan
func (h *TestPlanHandler) GetTestPlan(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetTestPlan parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.planService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("planService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
