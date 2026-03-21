package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ModelHandler struct {
	*Handler
	modelService service.ModelService
}

func NewModelHandler(handler *Handler, modelService service.ModelService) *ModelHandler {
	return &ModelHandler{
		Handler:      handler,
		modelService: modelService,
	}
}

func (h *ModelHandler) RegisterRoutes(g *gin.RouterGroup) {
	models := g.Group("/models")
	models.GET("", h.ListModels)
	models.GET("/:id", h.GetModel)
	models.POST("", h.CreateModel)
	models.PUT("/:id", h.UpdateModel)
	models.DELETE("/:id", h.DeleteModel)
	models.POST("/test-connection", h.TestConnection)
}

// ListModels godoc
// @Summary 获取模型列表
// @Schemes
// @Description 分页获取模型列表，支持按提供者和名称筛选
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param provider query int false "模型提供者"
// @Param name query string false "模型名称"
// @Success 200 {object} v1.ModelSearchResponse
// @Router /admin/models [get]
// @ID ListModels
func (h *ModelHandler) ListModels(ctx *gin.Context) {
	var req v1.ModelSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListModels bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.modelService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("modelService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// GetModel godoc
// @Summary 获取模型详情
// @Schemes
// @Description 获取指定ID的模型详情
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "模型ID"
// @Success 200 {object} v1.ModelResponse
// @Router /admin/models/{id} [get]
// @ID GetModel
func (h *ModelHandler) GetModel(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetModel parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.modelService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("modelService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateModel godoc
// @Summary 创建模型
// @Schemes
// @Description 创建一个新的模型配置
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.ModelRequest true "模型信息"
// @Success 200 {object} v1.Response
// @Router /admin/models [post]
// @ID CreateModel
func (h *ModelHandler) CreateModel(ctx *gin.Context) {
	var req v1.ModelRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateModel bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.modelService.Create(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("modelService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateModel godoc
// @Summary 更新模型
// @Schemes
// @Description 更新指定ID的模型配置
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "模型ID"
// @Param request body v1.ModelRequest true "模型信息"
// @Success 200 {object} v1.Response
// @Router /admin/models/{id} [put]
// @ID UpdateModel
func (h *ModelHandler) UpdateModel(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateModel parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	var req v1.ModelRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateModel bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.modelService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("modelService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteModel godoc
// @Summary 删除模型
// @Schemes
// @Description 删除指定ID的模型配置
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "模型ID"
// @Success 200 {object} v1.Response
// @Router /admin/models/{id} [delete]
// @ID DeleteModel
func (h *ModelHandler) DeleteModel(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteModel parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.modelService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("modelService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// TestConnection godoc
// @Summary 测试模型连接
// @Schemes
// @Description 测试模型配置是否可以正常连接
// @Tags Model
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestConnectionRequest true "连接测试参数"
// @Success 200 {object} v1.TestConnectionResponse
// @Router /admin/models/test-connection [post]
// @ID TestConnection
func (h *ModelHandler) TestConnection(ctx *gin.Context) {
	var req v1.TestConnectionRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("TestConnection bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.modelService.TestConnection(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("modelService.TestConnection error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
