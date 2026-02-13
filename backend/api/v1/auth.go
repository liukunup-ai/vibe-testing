package v1

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email" example:"zhangsan@example.com"`
	Password string `json:"password" binding:"required" example:"123456"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"zhangsan"`
	Password string `json:"password" binding:"required" example:"123456"`
}

type TokenPair struct {
	TokenType    string `json:"tokenType"`
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    int64  `json:"expiresIn"`
}

type LoginResponse struct {
	Response
	Data TokenPair
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required" example:"123456"`
}

type ResetPasswordRequest struct {
	Email string `json:"email" binding:"required,email" example:"zhangsan@example.com"`
}
