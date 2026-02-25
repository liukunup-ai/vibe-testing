package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AuthHandler struct {
	*Handler
	authService service.AuthService
}

func NewAuthHandler(handler *Handler, authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		Handler:     handler,
		authService: authService,
	}
}

// Register godoc
// @Summary 注册
// @Schemes
// @Description 目前只支持通过邮箱进行注册
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.RegisterRequest true "注册信息"
// @Success 200 {object} v1.Response
// @Router /register [post]
// @ID Register
func (h *AuthHandler) Register(ctx *gin.Context) {
	var req v1.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("Register bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.authService.Register(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("authService.Register error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, err, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// Login godoc
// @Summary 登录
// @Schemes
// @Description 支持用户名或邮箱登录，LDAP启用时自动尝试LDAP认证
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.LoginRequest true "登录凭证"
// @Success 200 {object} v1.LoginResponse
// @Router /login [post]
// @ID Login
func (h *AuthHandler) Login(ctx *gin.Context) {
	var req v1.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("Login bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	tokenPair, err := h.authService.Login(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("authService.Login error", zap.Error(err))
		v1.HandleError(ctx, http.StatusUnauthorized, v1.ErrUnauthorized, gin.H{"error": err.Error()})
		return
	}

	v1.HandleSuccess(ctx, tokenPair)
}

// RefreshToken godoc
// @Summary 刷新令牌
// @Schemes
// @Description 刷新访问令牌和刷新令牌
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.RefreshTokenRequest true "刷新令牌信息"
// @Success 200 {object} v1.LoginResponse
// @Router /refresh-token [post]
// @ID RefreshToken
func (h *AuthHandler) RefreshToken(ctx *gin.Context) {
	var req v1.RefreshTokenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("RefreshToken bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	tokenPair, err := h.authService.RefreshToken(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("authService.RefreshToken error", zap.Error(err))
		v1.HandleError(ctx, http.StatusUnauthorized, v1.ErrUnauthorized, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, tokenPair)
}

// ForgotPassword godoc
// @Summary 忘记密码
// @Schemes
// @Description 发送重置密码邮件
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.ForgotPasswordRequest true "忘记密码信息"
// @Success 200 {object} v1.Response
// @Router /forgot-password [post]
// @ID ForgotPassword
func (h *AuthHandler) ForgotPassword(ctx *gin.Context) {
	var req v1.ForgotPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("ForgotPassword bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.authService.ForgotPassword(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("authService.ForgotPassword error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// ResetPassword godoc
// @Summary 重置密码
// @Schemes
// @Description 通过token重置密码
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.ResetPasswordRequest true "重置密码信息"
// @Success 200 {object} v1.Response
// @Router /reset-password [post]
// @ID ResetPassword
func (h *AuthHandler) ResetPassword(ctx *gin.Context) {
	var req v1.ResetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("ResetPassword bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.authService.ResetPassword(ctx, &req); err != nil {
		h.logger.WithContext(ctx).Error("authService.ResetPassword error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// Logout godoc
// @Summary 登出
// @Schemes
// @Description 用户登出，记录审计日志
// @Tags Auth
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} v1.LogoutResponse
// @Router /logout [post]
// @ID Logout
func (h *AuthHandler) Logout(ctx *gin.Context) {
	uid := GetUserIDFromCtx(ctx)
	logoutData, err := h.authService.Logout(ctx, uid)
	if err != nil {
		h.logger.WithContext(ctx).Error("authService.Logout error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, logoutData)
}

// OIDCAuth godoc
// @Summary OIDC登录
// @Schemes
// @Description 通过OIDC授权码登录
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body v1.OIDCAuthRequest true "OIDC授权码"
// @Success 200 {object} v1.LoginResponse
// @Router /auth/oidc [post]
// @ID OIDCAuth
func (h *AuthHandler) OIDCAuth(ctx *gin.Context) {
	var req v1.OIDCAuthRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.logger.WithContext(ctx).Error("OIDCAuth bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	tokenPair, err := h.authService.LoginWithOIDC(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("authService.LoginWithOIDC error", zap.Error(err))
		v1.HandleError(ctx, http.StatusUnauthorized, v1.ErrUnauthorized, gin.H{"error": err.Error()})
		return
	}

	v1.HandleSuccess(ctx, tokenPair)
}
