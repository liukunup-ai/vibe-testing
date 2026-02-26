package handler

import (
	"backend/pkg/jwt"
	"backend/pkg/log"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	logger *log.Logger
}

func NewHandler(
	logger *log.Logger,
) *Handler {
	return &Handler{
		logger: logger,
	}
}

func GetUserIDFromCtx(ctx *gin.Context) string {
	v, exists := ctx.Get("claims")
	if !exists {
		return ""
	}
	return v.(*jwt.AccessClaims).UserID
}

// GetUserIdFromCtx returns the user ID as uint from context
func GetUserIdFromCtx(ctx *gin.Context) uint {
	v, exists := ctx.Get("claims")
	if !exists {
		return 0
	}
	userIDStr := v.(*jwt.AccessClaims).UserID
	userID, _ := strconv.ParseUint(userIDStr, 10, 64)
	return uint(userID)
}
