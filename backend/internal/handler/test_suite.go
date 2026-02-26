package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type TestSuiteHandler struct {
	*Handler
	suiteService service.TestSuiteService
}

func NewTestSuiteHandler(handler *Handler, suiteService service.TestSuiteService) *TestSuiteHandler {
	return &TestSuiteHandler{
		Handler:      handler,
		suiteService: suiteService,
	}
}

// ListTestSuites godoc
// @Summary 获取测试套件列表
// @Schemes
// @Description 获取测试套件列表，支持分页和筛选
// @Tags TestSuite
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "套件名称"
// @Param projectId query uint false "项目ID"
// @Success 200 {object} v1.TestSuiteSearchResponse
// @Router /v1/testsuites [get]
// @ID ListTestSuites
func (h *TestSuiteHandler) ListTestSuites(ctx *gin.Context) {
	var req v1.TestSuiteSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListTestSuites bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.suiteService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("suiteService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateTestSuite godoc
// @Summary 创建测试套件
// @Schemes
// @Description 创建一个新的测试套件
// @Tags TestSuite
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestSuiteRequest true "测试套件信息"
// @Success 200 {object} v1.Response
// @Router /v1/testsuites [post]
// @ID CreateTestSuite
func (h *TestSuiteHandler) CreateTestSuite(ctx *gin.Context) {
	var req v1.TestSuiteRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateTestSuite bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.suiteService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("suiteService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateTestSuite godoc
// @Summary 更新测试套件
// @Schemes
// @Description 更新指定ID的测试套件信息
// @Tags TestSuite
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试套件ID"
// @Param request body v1.TestSuiteRequest true "测试套件信息"
// @Success 200 {object} v1.Response
// @Router /v1/testsuites/{id} [put]
// @ID UpdateTestSuite
func (h *TestSuiteHandler) UpdateTestSuite(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestSuite parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.TestSuiteRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateTestSuite bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.suiteService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("suiteService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteTestSuite godoc
// @Summary 删除测试套件
// @Schemes
// @Description 删除指定ID的测试套件
// @Tags TestSuite
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试套件ID"
// @Success 200 {object} v1.Response
// @Router /v1/testsuites/{id} [delete]
// @ID DeleteTestSuite
func (h *TestSuiteHandler) DeleteTestSuite(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteTestSuite parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.suiteService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("suiteService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetTestSuite godoc
// @Summary 获取测试套件详情
// @Schemes
// @Description 获取指定ID的测试套件详情
// @Tags TestSuite
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试套件ID"
// @Success 200 {object} v1.TestSuiteResponse
// @Router /v1/testsuites/{id} [get]
// @ID GetTestSuite
func (h *TestSuiteHandler) GetTestSuite(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetTestSuite parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.suiteService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("suiteService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
