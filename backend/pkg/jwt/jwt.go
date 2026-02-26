package jwt

import (
	v1 "backend/api/v1"
	"backend/internal/repository"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

const (
	bearerPrefix                    = "Bearer " // 请勿删除空格
	randomBytes                     = 32
	defaultAccessTokenExpiry        = 15 * time.Minute
	defaultRefreshTokenExpiry       = 7 * 24 * time.Hour
	rememberMeRefreshTokenExpiry    = 30 * 24 * time.Hour // 30 days for "Remember Me"
	defaultTokenExpiry              = 1 * time.Hour
)

type JWT struct {
	secretKey          []byte
	signingMethod      jwt.SigningMethod
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
	defaultTokenExpiry time.Duration
	tokenStore         repository.TokenStore
}

type AccessClaims struct {
	UserID  string `json:"uid"`
	TokenID string `json:"jti,omitempty"`
	jwt.RegisteredClaims
}

type RefreshClaims struct {
	UserID   string `json:"uid"`
	TokenID  string `json:"jti,omitempty"`
	FamilyID string `json:"family,omitempty"`
	jwt.RegisteredClaims
}

type ResetPasswordClaims struct {
	Email   string `json:"email"`
	TokenID string `json:"jti,omitempty"`
	jwt.RegisteredClaims
}

func NewJwt(conf *viper.Viper, tokenStore repository.TokenStore) *JWT {
	secretKey := conf.GetString("security.jwt.secret_key")
	if len(secretKey) < 32 {
		panic("jwt secret key length must be at least 32")
	}

	accessTokenExpiry := conf.GetDuration("security.jwt.access_token_expiry")
	if accessTokenExpiry == 0 {
		accessTokenExpiry = defaultAccessTokenExpiry
	}
	refreshTokenExpiry := conf.GetDuration("security.jwt.refresh_token_expiry")
	if refreshTokenExpiry == 0 {
		refreshTokenExpiry = defaultRefreshTokenExpiry
	}

	return &JWT{
		secretKey:          []byte(secretKey),
		signingMethod:      jwt.SigningMethodHS256,
		accessTokenExpiry:  accessTokenExpiry,
		refreshTokenExpiry: refreshTokenExpiry,
		defaultTokenExpiry: defaultTokenExpiry,
		tokenStore:         tokenStore,
	}
}

func (j *JWT) GenerateTokenPair(ctx context.Context, userID string, familyID string) (*v1.TokenData, error) {
	return j.GenerateTokenPairWithExpiry(ctx, userID, familyID, false)
}

// GenerateTokenPairWithExpiry generates token pair with optional extended refresh token expiry
// When rememberMe is true, refresh token expires in 30 days instead of 7 days
func (j *JWT) GenerateTokenPairWithExpiry(ctx context.Context, userID string, familyID string, rememberMe bool) (*v1.TokenData, error) {
	accessTokenID, err := generateTokenID()
	if err != nil {
		return nil, err
	}
	accessClaims := AccessClaims{
		UserID:  userID,
		TokenID: accessTokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.accessTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        accessTokenID,
		},
	}
	accessToken := jwt.NewWithClaims(j.signingMethod, accessClaims)
	accessTokenStr, err := accessToken.SignedString(j.secretKey)
	if err != nil {
		return nil, err
	}

	refreshTokenID, err := generateTokenID()
	if err != nil {
		return nil, err
	}
	if familyID == "" {
		familyID, err = generateTokenID()
		if err != nil {
			return nil, err
		}
	}

	// Use extended expiry if rememberMe is true
	refreshExpiry := j.refreshTokenExpiry
	if rememberMe {
		refreshExpiry = rememberMeRefreshTokenExpiry
	}

	refreshClaims := RefreshClaims{
		UserID:   userID,
		TokenID:  refreshTokenID,
		FamilyID: familyID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        refreshTokenID,
		},
	}
	refreshToken := jwt.NewWithClaims(j.signingMethod, refreshClaims)
	refreshTokenStr, err := refreshToken.SignedString(j.secretKey)
	if err != nil {
		return nil, err
	}

	if j.tokenStore != nil {
		err = j.tokenStore.StoreRefreshToken(ctx, refreshTokenID, familyID, userID, refreshExpiry)
		if err != nil {
			return nil, fmt.Errorf("failed to store refresh token: %w", err)
		}
	}

	return &v1.TokenData{
		TokenType:    "Bearer",
		AccessToken:  accessTokenStr,
		RefreshToken: refreshTokenStr,
		ExpiresIn:    int64(j.accessTokenExpiry.Seconds()),
	}, nil
}


func (j *JWT) RefreshAccessToken(ctx context.Context, refreshToken string) (*v1.TokenData, error) {
	refreshToken = strings.TrimPrefix(refreshToken, bearerPrefix)

	refreshClaims, err := j.parseRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	if j.tokenStore != nil {
		valid, _ := j.tokenStore.IsRefreshTokenValid(ctx, refreshClaims.TokenID, refreshClaims.FamilyID)
		if !valid {
			return nil, v1.ErrInvalidRefreshToken
		}
	}

	accessTokenID, err := generateTokenID()
	if err != nil {
		return nil, err
	}
	accessClaims := AccessClaims{
		UserID:  refreshClaims.UserID,
		TokenID: accessTokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.accessTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        accessTokenID,
		},
	}
	accessToken := jwt.NewWithClaims(j.signingMethod, accessClaims)
	accessTokenStr, err := accessToken.SignedString(j.secretKey)
	if err != nil {
		return nil, err
	}

	return &v1.TokenData{
		TokenType:   "Bearer",
		AccessToken: accessTokenStr,
		ExpiresIn:   int64(j.accessTokenExpiry.Seconds()),
	}, nil
}

func (j *JWT) ValidateAccessToken(ctx context.Context, accessToken string) (*AccessClaims, error) {
	accessToken = strings.TrimPrefix(accessToken, bearerPrefix)

	token, err := jwt.ParseWithClaims(accessToken, &AccessClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, v1.ErrUnexpectedSigningMethod
		}
		return j.secretKey, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*AccessClaims)
	if !ok || !token.Valid {
		return nil, v1.ErrInvalidAccessToken
	}

	if j.tokenStore != nil {
		revoked, _ := j.tokenStore.IsAccessTokenRevoked(ctx, claims.TokenID)
		if revoked {
			return nil, v1.ErrInvalidAccessToken
		}
	}

	return claims, nil
}

func (j *JWT) InvalidateRefreshTokenByUserID(ctx context.Context, userID string) error {
	if j.tokenStore != nil {
		return j.tokenStore.InvalidateRefreshTokenByUserID(ctx, userID)
	}
	return fmt.Errorf("token store is not initialized")
}

func (j *JWT) parseRefreshToken(tokenStr string) (*RefreshClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &RefreshClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, v1.ErrUnexpectedSigningMethod
		}
		return j.secretKey, nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*RefreshClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, v1.ErrInvalidRefreshToken
}

func (j *JWT) GenerateResetPasswordToken(email string) (string, error) {
	tokenID, err := generateTokenID()
	if err != nil {
		return "", err
	}

	claims := ResetPasswordClaims{
		Email:   email,
		TokenID: tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.defaultTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        tokenID,
		},
	}

	token := jwt.NewWithClaims(j.signingMethod, claims)
	return token.SignedString(j.secretKey)
}

func (j *JWT) ValidateResetPasswordToken(tokenStr string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &ResetPasswordClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, v1.ErrUnexpectedSigningMethod
		}
		return j.secretKey, nil
	})
	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(*ResetPasswordClaims); ok && token.Valid {
		return claims.Email, nil
	}

	return "", v1.ErrInvalidAccessToken
}

func generateTokenID() (string, error) {
	b := make([]byte, randomBytes/2)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
