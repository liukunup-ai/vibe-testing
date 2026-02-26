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
// ListAIAnalysisResults godoc
// @Summary 获取AI分析结果列表
// @Schemes
// @Description 获取AI分析结果列表，支持分页和筛选
// @Tags AIAnalysisResult
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param projectId query uint false "项目ID"
// @Param testCaseId query uint false "测试用例ID"
// @Param analysisType query string false "分析类型"
// @Success 200 {object} v1.AIAnalysisResultSearchResponse
// @Router /v1/ai-analysis-results [get]
// @ID ListAIAnalysisResults

// CreateAIAnalysisResult godoc
// @Summary 创建AI分析结果
// @Schemes
// @Description 创建新的AI分析结果
// @Tags AIAnalysisResult
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.AIAnalysisResultRequest true "AI分析结果信息"
// @Success 200 {object} v1.Response
// @Router /v1/ai-analysis-results [post]
// @ID CreateAIAnalysisResult

// UpdateAIAnalysisResult godoc
// @Summary 更新AI分析结果
// @Schemes
// @Description 更新指定ID的AI分析结果
// @Tags AIAnalysisResult
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "AI分析结果ID"
// @Param request body v1.AIAnalysisResultRequest true "AI分析结果信息"
// @Success 200 {object} v1.Response
// @Router /v1/ai-analysis-results/{id} [put]
// @ID UpdateAIAnalysisResult

// DeleteAIAnalysisResult godoc
// @Summary 删除AI分析结果
// @Schemes
// @Description 删除指定ID的AI分析结果
// @Tags AIAnalysisResult
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "AI分析结果ID"
// @Success 200 {object} v1.Response
// @Router /v1/ai-analysis-results/{id} [delete]
// @ID DeleteAIAnalysisResult

// GetAIAnalysisResult godoc
// @Summary 获取AI分析结果详情
// @Schemes
// @Description 获取指定ID的AI分析结果详情
// @Tags AIAnalysisResult
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "AI分析结果ID"
// @Success 200 {object} v1.AIAnalysisResultResponse
// @Router /v1/ai-analysis-results/{id} [get]
// @ID GetAIAnalysisResult

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
