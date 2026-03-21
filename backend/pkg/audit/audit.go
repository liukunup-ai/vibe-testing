package audit

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

const (
	ActionLogin                = "LOGIN"
	ActionLogout               = "LOGOUT"
	ActionRegister             = "REGISTER"
	ActionPasswordReset        = "PASSWORD_RESET"
	ActionPasswordChange       = "PASSWORD_CHANGE"
	ActionUserCreate           = "USER_CREATE"
	ActionUserUpdate           = "USER_UPDATE"
	ActionUserDelete           = "USER_DELETE"
	ActionRoleAssign           = "ROLE_ASSIGN"
	ActionRoleRemove           = "ROLE_REMOVE"
	ActionRoleCreate           = "ROLE_CREATE"
	ActionRoleUpdate           = "ROLE_UPDATE"
	ActionRoleDelete           = "ROLE_DELETE"
	ActionRolePermissionUpdate = "ROLE_PERMISSION_UPDATE"
	ActionRoleApiUpdate        = "ROLE_API_UPDATE"
	ActionMenuCreate           = "MENU_CREATE"
	ActionMenuUpdate           = "MENU_UPDATE"
	ActionMenuDelete           = "MENU_DELETE"
	ActionApiCreate            = "API_CREATE"
	ActionApiUpdate            = "API_UPDATE"
	ActionApiDelete            = "API_DELETE"
	ActionApiRoleUpdate        = "API_ROLE_UPDATE"
	ActionPermissionGrant      = "PERMISSION_GRANT"
	ActionPermissionRevoke     = "PERMISSION_REVOKE"
	ActionTokenRefresh         = "TOKEN_REFRESH"
	ActionAvatarUpload         = "AVATAR_UPLOAD"
)

type Entry struct {
	Timestamp  time.Time              `json:"timestamp"`
	Action     string                 `json:"action"`
	UserID     string                 `json:"userId,omitempty"`
	PublicID   string                 `json:"publicId,omitempty"`
	IPAddress  string                 `json:"ipAddress,omitempty"`
	UserAgent  string                 `json:"userAgent,omitempty"`
	Resource   string                 `json:"resource,omitempty"`
	ResourceID string                 `json:"resourceId,omitempty"`
	Success    bool                   `json:"success"`
	Error      string                 `json:"error,omitempty"`
	Details    map[string]interface{} `json:"details,omitempty"`
}

type Audit struct {
	logger *zap.Logger
	mu     sync.Mutex
}

func NewAudit(conf *viper.Viper) *Audit {
	lp := conf.GetString("audit.log_file_name")
	maxSize := conf.GetInt("audit.max_size")
	if maxSize == 0 {
		maxSize = 100
	}
	maxBackups := conf.GetInt("audit.max_backups")
	if maxBackups == 0 {
		maxBackups = 30
	}
	maxAge := conf.GetInt("audit.max_age")
	if maxAge == 0 {
		maxAge = 90
	}

	hook := lumberjack.Logger{
		Filename:   lp,                             // Log file path
		MaxSize:    conf.GetInt("log.max_size"),    // Maximum size unit for each log file: M
		MaxBackups: conf.GetInt("log.max_backups"), // The maximum number of backups that can be saved for log files
		MaxAge:     conf.GetInt("log.max_age"),     // Maximum number of days the file can be saved
		Compress:   true,
	}

	encoder := zapcore.NewJSONEncoder(zapcore.EncoderConfig{
		TimeKey:        "ts",
		LevelKey:       "level",
		MessageKey:     "msg",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
	})

	core := zapcore.NewCore(
		encoder,
		zapcore.AddSync(&hook),
		zapcore.InfoLevel,
	)

	return &Audit{
		logger: zap.New(core),
	}
}

func (a *Audit) Log(ctx context.Context, entry *Entry) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}

	if ginCtx, ok := ctx.(*gin.Context); ok {
		if entry.IPAddress == "" {
			entry.IPAddress = ginCtx.ClientIP()
		}
		if entry.UserAgent == "" {
			entry.UserAgent = ginCtx.GetHeader("User-Agent")
		}
	}

	data, err := json.Marshal(entry)
	if err != nil {
		a.logger.Error("failed to marshal audit entry", zap.Error(err))
		return
	}

	a.logger.Info(string(data))
}

func (a *Audit) LogSuccess(ctx context.Context, action string, userID, publicID string, resource string, resourceID string, details map[string]interface{}) {
	a.Log(ctx, &Entry{
		Action:     action,
		UserID:     userID,
		PublicID:   publicID,
		Resource:   resource,
		ResourceID: resourceID,
		Success:    true,
		Details:    details,
	})
}

func (a *Audit) LogFailure(ctx context.Context, action string, userID, publicID string, resource string, resourceID string, err error, details map[string]interface{}) {
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}
	a.Log(ctx, &Entry{
		Action:     action,
		UserID:     userID,
		PublicID:   publicID,
		Resource:   resource,
		ResourceID: resourceID,
		Success:    false,
		Error:      errorMsg,
		Details:    details,
	})
}
