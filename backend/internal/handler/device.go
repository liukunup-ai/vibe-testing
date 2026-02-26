package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DeviceHandler struct {
	*Handler
	deviceService service.DeviceService
}

func NewDeviceHandler(handler *Handler, deviceService service.DeviceService) *DeviceHandler {
	return &DeviceHandler{
		Handler:       handler,
		deviceService: deviceService,
	}
}

// ListDevices godoc
// @Summary 获取设备列表
// @Schemes
// @Description 搜索时支持设备名称、设备类型和状态筛选
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "设备名称"
// @Param type query string false "设备类型"
// @Param status query string false "设备状态"
// @Success 200 {object} v1.DeviceSearchResponse
// @Router /v1/devices [get]
// @ID ListDevices
func (h *DeviceHandler) ListDevices(ctx *gin.Context) {
	var req v1.DeviceSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListDevices bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.deviceService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("deviceService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateDevice godoc
// @Summary 创建设备
// @Schemes
// @Description 创建一个新的设备
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.DeviceRequest true "设备信息"
// @Success 200 {object} v1.Response
// @Router /v1/devices [post]
// @ID CreateDevice
func (h *DeviceHandler) CreateDevice(ctx *gin.Context) {
	var req v1.DeviceRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateDevice bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.deviceService.Create(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("deviceService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateDevice godoc
// @Summary 更新设备
// @Schemes
// @Description 更新设备信息
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "设备ID"
// @Param request body v1.DeviceRequest true "设备信息"
// @Success 200 {object} v1.Response
// @Router /v1/devices/{id} [put]
// @ID UpdateDevice
func (h *DeviceHandler) UpdateDevice(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateDevice parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.DeviceRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateDevice bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.deviceService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("deviceService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteDevice godoc
// @Summary 删除设备
// @Schemes
// @Description 删除指定ID的设备
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "设备ID"
// @Success 200 {object} v1.Response
// @Router /v1/devices/{id} [delete]
// @ID DeleteDevice
func (h *DeviceHandler) DeleteDevice(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteDevice parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.deviceService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("deviceService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetDevice godoc
// @Summary 获取设备详情
// @Schemes
// @Description 获取指定ID的设备详情
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "设备ID"
// @Success 200 {object} v1.DeviceResponse
// @Router /v1/devices/{id} [get]
// @ID GetDevice
func (h *DeviceHandler) GetDevice(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetDevice parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.deviceService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("deviceService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// DeviceHeartbeat godoc
// @Summary 设备心跳
// @Schemes
// @Description 接收设备心跳请求
// @Tags Device
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.DeviceHeartbeatRequest true "心跳信息"
// @Success 200 {object} v1.Response
// @Router /v1/devices/heartbeat [post]
// @ID DeviceHeartbeat
func (h *DeviceHandler) DeviceHeartbeat(ctx *gin.Context) {
	var req v1.DeviceHeartbeatRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("DeviceHeartbeat bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.deviceService.Heartbeat(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("deviceService.Heartbeat error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}
