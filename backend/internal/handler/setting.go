package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type SettingHandler struct {
	*Handler
	settingService service.SettingService
}

func NewSettingHandler(
	handler *Handler,
	settingService service.SettingService,
) *SettingHandler {
	return &SettingHandler{
		Handler:        handler,
		settingService: settingService,
	}
}

// GetSiteSetting godoc
// @Summary 获取站点设置
// @Schemes
// @Description 获取站点的基本设置信息(网站标题、Logo、图标、版权信息)。支持版本检查：如果传入version参数且版本相同，返回304。
// @Tags Setting
// @Accept json
// @Produce json
// @Param version query string false "客户端缓存的版本号"
// @Success 200 {object} v1.SiteSettingResponse
// @Success 304 "版本未变化，使用缓存"
// @Router /settings [get]
// @ID GetSiteSetting
func (h *SettingHandler) GetSiteSetting(ctx *gin.Context) {
	var req v1.SiteSettingRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		h.logger.WithContext(ctx).Error("GetSiteSetting bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.settingService.GetSite(ctx, req.Version)
	if err != nil {
		h.logger.WithContext(ctx).Error("settingService.GetSite error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}

	if data == nil {
		ctx.Status(http.StatusNotModified)
		return
	}

	v1.HandleSuccess(ctx, data)
}

// GetSetting godoc
// @Summary 获取系统设置
// @Schemes
// @Description 获取系统设置信息
// @Tags Setting
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} v1.AdminSettingResponse
// @Router /admin/settings [get]
// @ID GetSetting
func (h *SettingHandler) GetSetting(ctx *gin.Context) {
	data, err := h.settingService.Get(ctx)
	if err != nil {
		h.logger.WithContext(ctx).Error("settingService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}

// UpdateSetting godoc
// @Summary 更新系统设置
// @Schemes
// @Description 更新系统设置信息
// @Tags Setting
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.AdminSettingRequest true "系统设置数据"
// @Success 200 {object} v1.Response
// @Router /admin/settings [put]
// @ID UpdateSetting
func (h *SettingHandler) UpdateSetting(ctx *gin.Context) {
	var req v1.AdminSettingRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateSetting bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.settingService.Update(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("settingService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// TestEmail godoc
// @Summary 测试邮件发送
// @Schemes
// @Description 使用当前SMTP配置发送测试邮件
// @Tags Setting
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.TestEmailRequest true "测试邮件请求"
// @Success 200 {object} v1.Response
// @Router /admin/settings/test-email [post]
// @ID TestEmail
func (h *SettingHandler) TestEmail(ctx *gin.Context) {
	var req v1.TestEmailRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("TestEmail bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.settingService.TestEmail(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("settingService.TestEmail error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}
