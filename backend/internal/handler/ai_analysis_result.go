package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AIAnalysisResultHandler struct {
	*Handler
	aiAnalysisResultService service.AIAnalysisResultService
}

func NewAIAnalysisResultHandler(handler *Handler, aiAnalysisResultService service.AIAnalysisResultService) *AIAnalysisResultHandler {
	return &AIAnalysisResultHandler{
		Handler:                 handler,
		aiAnalysisResultService: aiAnalysisResultService,
	}
}

func (h *AIAnalysisResultHandler) ListAIAnalysisResults(ctx *gin.Context) {
	var req v1.AIAnalysisResultSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListAIAnalysisResults bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.aiAnalysisResultService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("aiAnalysisResultService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

func (h *AIAnalysisResultHandler) CreateAIAnalysisResult(ctx *gin.Context) {
	var req v1.AIAnalysisResultRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateAIAnalysisResult bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.aiAnalysisResultService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("aiAnalysisResultService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AIAnalysisResultHandler) UpdateAIAnalysisResult(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateAIAnalysisResult parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.AIAnalysisResultRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateAIAnalysisResult bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.aiAnalysisResultService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("aiAnalysisResultService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AIAnalysisResultHandler) DeleteAIAnalysisResult(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteAIAnalysisResult parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.aiAnalysisResultService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("aiAnalysisResultService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AIAnalysisResultHandler) GetAIAnalysisResult(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetAIAnalysisResult parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.aiAnalysisResultService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("aiAnalysisResultService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
