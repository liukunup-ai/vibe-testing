package service

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/audit"
	"backend/pkg/email"
	"backend/pkg/jwt"
	"backend/pkg/log"
	"backend/pkg/sid"
	"context"
	"fmt"
	"strings"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type Service struct {
	logger  *log.Logger
	sid     *sid.Sid
	jwt     *jwt.JWT
	email   *email.Service
	cfg     *viper.Viper
	tm      repository.Transaction
	audit   *audit.Audit
	setting repository.SettingRepository
}

func NewService(
	logger *log.Logger,
	sid *sid.Sid,
	jwt *jwt.JWT,
	emailSvc *email.Service,
	conf *viper.Viper,
	tm repository.Transaction,
	audit *audit.Audit,
	setting repository.SettingRepository,
) *Service {
	return &Service{
		logger:  logger,
		sid:     sid,
		jwt:     jwt,
		email:   emailSvc,
		cfg:     conf,
		tm:      tm,
		audit:   audit,
		setting: setting,
	}
}

func (s *Service) SendEmail(ctx context.Context, msg *email.Message) error {
	settings, err := s.setting.GetAll(ctx)
	if err != nil {
		return err
	}
	dbSettings := make(map[string]string)
	for _, setting := range settings {
		dbSettings[setting.Key] = setting.Value
	}

	if err := s.email.Send(msg, dbSettings); err != nil {
		s.logger.Warn("SMTP not configured or send failed", zap.Error(err))
		return v1.ErrSMTPNotConfigured
	}
	return nil
}

func (s *Service) GetFrontendBaseURL() string {
	frontendBaseURL := s.cfg.GetString("site.frontend_base_url")
	if frontendBaseURL != "" {
		return strings.TrimSuffix(frontendBaseURL, "/")
	}
	host := s.cfg.GetString("http.host")
	port := s.cfg.GetInt("http.port")
	if host == "" {
		host = "localhost"
	}
	if port == 0 || port == 80 {
		return fmt.Sprintf("http://%s", host)
	}
	return fmt.Sprintf("http://%s:%d", host, port)
}

func (s *Service) GetFrontendBaseURLWithCtx(ctx context.Context) string {
	if v := s.cfg.GetString("site.frontend_base_url"); v != "" {
		return strings.TrimSuffix(v, "/")
	}
	settings, err := s.setting.GetAll(ctx)
	if err == nil {
		for _, setting := range settings {
			if setting.Key == model.SettingKeySiteFrontendBaseURL && setting.Value != "" {
				return strings.TrimSuffix(setting.Value, "/")
			}
		}
	}
	return s.GetFrontendBaseURL()
}

func (s *Service) GetTeamSignature(ctx context.Context) string {
	settings, err := s.setting.GetAll(ctx)
	if err == nil {
		for _, setting := range settings {
			if setting.Key == model.SettingKeySiteTitle && setting.Value != "" {
				return setting.Value + " 团队"
			}
		}
	}
	yamlTitle := s.cfg.GetString("site.title")
	if yamlTitle != "" {
		return yamlTitle + " 团队"
	}
	return "Ant Design Pro 团队"
}
