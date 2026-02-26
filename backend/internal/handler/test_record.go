package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type TestRecordHandler struct {
	*Handler
	recordService service.TestRecordService
}

func NewTestRecordHandler(handler *Handler, recordService service.TestRecordService) *TestRecordHandler {
	return &TestRecordHandler{
		Handler:       handler,
		recordService: recordService,
	}
}

// ListTestRecords godoc
// @Summary 获取测试记录列表
// @Schemes
// @Description 获取测试记录列表，支持按项目、用例等筛选
// @Tags TestRecord
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param projectID query uint false "项目ID"
// @Param testCaseID query uint false "用例ID"
// @Param status query string false "执行状态"
// @Success 200 {object} v1.TestRecordSearchResponse
// @Router /v1/testrecords [get]
// @ID ListTestRecords
func (h *TestRecordHandler) ListTestRecords(ctx *gin.Context) {
	var req v1.TestRecordSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListTestRecords bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.recordService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("recordService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateTestRecord godoc
// @Summary 创建测试记录
// @Schemes
// @Description 创建一个新的测试记录
// @Tags TestRecord
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestRecordRequest true "测试记录信息"
// @Success 200 {object} v1.TestRecordResponse
// @Router /v1/testrecords [post]
// @ID CreateTestRecord
func (h *TestRecordHandler) CreateTestRecord(ctx *gin.Context) {
	var req v1.TestRecordRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateTestRecord bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	req.ExecutorID = uid
	data, err := h.recordService.Create(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("recordService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// DeleteTestRecord godoc
// @Summary 删除测试记录
// @Schemes
// @Description 删除指定ID的测试记录
// @Tags TestRecord
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试记录ID"
// @Success 200 {object} v1.Response
// @Router /v1/testrecords/{id} [delete]
// @ID DeleteTestRecord
func (h *TestRecordHandler) DeleteTestRecord(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteTestRecord parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.recordService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("recordService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetTestRecord godoc
// @Summary 获取测试记录详情
// @Schemes
// @Description 获取指定ID的测试记录详情
// @Tags TestRecord
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "测试记录ID"
// @Success 200 {object} v1.TestRecordResponse
// @Router /v1/testrecords/{id} [get]
// @ID GetTestRecord
func (h *TestRecordHandler) GetTestRecord(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetTestRecord parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.recordService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("recordService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
