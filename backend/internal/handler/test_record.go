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
