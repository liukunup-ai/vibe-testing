package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"backend/pkg/time"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ItemHandler struct {
	*Handler
	itemService service.ItemService
}

func NewItemHandler(
	handler *Handler,
	itemService service.ItemService,
) *ItemHandler {
	return &ItemHandler{
		Handler:     handler,
		itemService: itemService,
	}
}

// ListItems godoc
// @Summary 获取项目列表
// @Schemes
// @Description 搜索时支持名称、描述和所有者筛选
// @Tags Item
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "名称"
// @Param desc query string false "描述"
// @Param owner query string false "所有者"
// @Success 200 {object} v1.ItemSearchResponse
// @Router /items [get]
// @ID ListItems
func (h *ItemHandler) ListItems(ctx *gin.Context) {
	var req v1.ItemSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListItems bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.itemService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("itemService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateItem godoc
// @Summary 创建项目
// @Schemes
// @Description 创建一个新的项目
// @Tags Item
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.ItemRequest true "项目数据"
// @Success 200 {object} v1.Response
// @Router /items [post]
// @ID CreateItem
func (h *ItemHandler) CreateItem(ctx *gin.Context) {
	var req v1.ItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateItem bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	err := h.itemService.Create(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("itemService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateItem godoc
// @Summary 更新项目
// @Schemes
// @Description 更新项目数据
// @Tags Item
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Param request body v1.ItemRequest true "项目数据"
// @Success 200 {object} v1.Response
// @Router /items/{id} [put]
// @ID UpdateItem
func (h *ItemHandler) UpdateItem(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateItem parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.ItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateItem bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.itemService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("itemService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteItem godoc
// @Summary 删除项目
// @Schemes
// @Description 删除指定ID的项目
// @Tags Item
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Success 200 {object} v1.Response
// @Router /items/{id} [delete]
// @ID DeleteItem
func (h *ItemHandler) DeleteItem(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteItem parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.itemService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("itemService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetItem godoc
// @Summary 获取项目
// @Schemes
// @Description 获取指定ID的项目信息
// @Tags Item
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Success 200 {object} v1.ItemResponse
// @Router /items/{id} [get]
// @ID GetItem
func (h *ItemHandler) GetItem(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetItem parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	item, err := h.itemService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("itemService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}

	v1.HandleSuccess(ctx, v1.ItemDataItem{
		Id:        item.ID,
		CreatedAt: time.FormatTime(item.CreatedAt),
		UpdatedAt: time.FormatTime(item.UpdatedAt),
		Name:      item.Name,
		Desc:      item.Desc,
		Owner:     item.Owner,
	})
}
