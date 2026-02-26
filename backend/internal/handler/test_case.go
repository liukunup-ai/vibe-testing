package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type TestCaseHandler struct {
	*Handler
	caseService service.TestCaseService
}

func NewTestCaseHandler(handler *Handler, caseService service.TestCaseService) *TestCaseHandler {
	return &TestCaseHandler{
		Handler:     handler,
		caseService: caseService,
	}
}

// ListTestCases godoc
// @Summary 获取测试用例列表
// @Schemes
// @Description 搜索时支持名称、描述、项目ID等筛选
// @Tags TestCase
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "用例名称"
// @Param projectId query uint false "项目ID"
// @Param status query string false "状态"
// @Success 200 {object} v1.TestCaseSearchResponse
// @Router /v1/testcases [get]
// @ID ListTestCases
func (h *TestCaseHandler) ListTestCases(ctx *gin.Context) {
	var req v1.TestCaseSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListTestCases bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.caseService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("caseService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateTestCase godoc
// @Summary 创建测试用例
// @Schemes
// @Description 创建一个新的测试用例
// @Tags TestCase
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestCaseRequest true "测试用例信息"
// @Success 200 {object} v1.Response
// @Router /v1/testcases [post]
// @ID CreateTestCase
func (h *TestCaseHandler) CreateTestCase(ctx *gin.Context) {
	var req v1.TestCaseRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateTestCase bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.caseService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("caseService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateTestCase godoc
// @Summary 更新测试用例
// @Schemes
// @Description 更新测试用例信息
// @Tags TestCase
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试用例ID"
// @Param request body v1.TestCaseRequest true "测试用例信息"
// @Success 200 {object} v1.Response
// @Router /v1/testcases/{id} [put]
// @ID UpdateTestCase
func (h *TestCaseHandler) UpdateTestCase(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestCase parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.TestCaseRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestCase bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.caseService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("caseService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteTestCase godoc
// @Summary 删除测试用例
// @Schemes
// @Description 删除指定ID的测试用例
// @Tags TestCase
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试用例ID"
// @Success 200 {object} v1.Response
// @Router /v1/testcases/{id} [delete]
// @ID DeleteTestCase
func (h *TestCaseHandler) DeleteTestCase(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteTestCase parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.caseService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("caseService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetTestCase godoc
// @Summary 获取测试用例详情
// @Schemes
// @Description 获取指定ID的测试用例详情
// @Tags TestCase
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试用例ID"
// @Success 200 {object} v1.TestCaseResponse
// @Router /v1/testcases/{id} [get]
// @ID GetTestCase
func (h *TestCaseHandler) GetTestCase(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetTestCase parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.caseService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("caseService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
