package v1

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email" example:"zhangsan@example.com"` // 邮箱
	Password string `json:"password" binding:"required,min=6" example:"123456"`            // 密码
	FullName string `json:"fullName" example:"Zhang San"`                                  // 全名
}

type LoginRequest struct {
	Username  string `json:"username" binding:"required" example:"zhangsan"` // 用户名 或 邮箱
	Password  string `json:"password" binding:"required" example:"123456"`   // 密码
	AutoLogin bool   `json:"autoLogin"`                                      // 记住我 - 延长refresh token有效期
}

type TokenData struct {
	AccessToken  string `json:"accessToken"`            // 访问凭证
	RefreshToken string `json:"refreshToken,omitempty"` // 刷新凭证
	ExpiresIn    int64  `json:"expiresIn"`              // 有效期（秒）
	TokenType    string `json:"tokenType"`              // 凭证类型
}

type LoginResponse struct {
	Response
	Data TokenData
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"` // 刷新凭证
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email" example:"zhangsan@example.com"` // 邮箱
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`                                  // 重置令牌
	NewPassword string `json:"newPassword" binding:"required,min=6" example:"newpass123"` // 新密码
}

type OIDCAuthRequest struct {
	Code      string `json:"code" binding:"required"`
	State     string `json:"state"`
	AutoLogin bool   `json:"autoLogin"` // 记住我 - 延长refresh token有效期
}


type LogoutResponse struct {
	Response
	Data *LogoutData `json:"data,omitempty"`
}

type LogoutData struct {
	EndSessionURL string `json:"endSessionUrl,omitempty"` // OIDC end session URL for SLO
}
