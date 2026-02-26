package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AIProviderHandler struct {
	*Handler
	aiProviderService service.AIProviderService
}

func NewAIProviderHandler(handler *Handler, aiProviderService service.AIProviderService) *AIProviderHandler {
	return &AIProviderHandler{
		Handler:           handler,
		aiProviderService: aiProviderService,
	}
}

// ListAIProviders godoc
// @Summary 获取AI供应商列表
// @Schemes
// @Description 获取所有AI供应商列表，支持分页
// @Tags AIProvider
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "供应商名称"
// @Param providerType query string false "供应商类型"
// @Success 200 {object} v1.AIProviderSearchResponse
// @Router /v1/ai-providers [get]
// @ID ListAIProviders
func (h *AIProviderHandler) ListAIProviders(ctx *gin.Context) {
	var req v1.AIProviderSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListAIProviders bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.aiProviderService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("aiProviderService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateAIProvider godoc
// @Summary 创建AI供应商
// @Schemes
// @Description 创建一个新的AI供应商配置
// @Tags AIProvider
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.AIProviderRequest true "供应商信息"
// @Success 200 {object} v1.Response
// @Router /v1/ai-providers [post]
// @ID CreateAIProvider
func (h *AIProviderHandler) CreateAIProvider(ctx *gin.Context) {
	var req v1.AIProviderRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateAIProvider bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.aiProviderService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("aiProviderService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateAIProvider godoc
// @Summary 更新AI供应商
// @Schemes
// @Description 更新指定ID的AI供应商信息
// @Tags AIProvider
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "供应商ID"
// @Param request body v1.AIProviderRequest true "供应商信息"
// @Success 200 {object} v1.Response
// @Router /v1/ai-providers/{id} [put]
// @ID UpdateAIProvider
func (h *AIProviderHandler) UpdateAIProvider(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateAIProvider parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.AIProviderRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateAIProvider bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.aiProviderService.Update(ctx, uint(id), &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("aiProviderService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteAIProvider godoc
// @Summary 删除AI供应商
// @Schemes
// @Description 删除指定ID的AI供应商
// @Tags AIProvider
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "供应商ID"
// @Success 200 {object} v1.Response
// @Router /v1/ai-providers/{id} [delete]
// @ID DeleteAIProvider
func (h *AIProviderHandler) DeleteAIProvider(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteAIProvider parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.aiProviderService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("aiProviderService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetAIProvider godoc
// @Summary 获取AI供应商详情
// @Schemes
// @Description 获取指定ID的AI供应商详细信息
// @Tags AIProvider
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "供应商ID"
// @Success 200 {object} v1.AIProviderResponse
// @Router /v1/ai-providers/{id} [get]
// @ID GetAIProvider
func (h *AIProviderHandler) GetAIProvider(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetAIProvider parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.aiProviderService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("aiProviderService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
