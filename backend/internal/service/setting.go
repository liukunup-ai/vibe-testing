package service

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/email"
	"backend/pkg/oidc"
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"

	"go.uber.org/zap"
)

type SettingService interface {
	GetPublicSiteConfig(ctx context.Context, clientVersion string) (*v1.PublicSiteConfig, error)
	Get(ctx context.Context) (*v1.AdminSetting, error)
	Update(ctx context.Context, req *v1.AdminSettingRequest) error
	TestEmail(ctx context.Context, req *v1.TestEmailRequest) error
}

func NewSettingService(
	service *Service,
	settingRepository repository.SettingRepository,
) SettingService {
	return &settingService{
		Service:           service,
		settingRepository: settingRepository,
	}
}

type settingService struct {
	*Service
	settingRepository repository.SettingRepository
}

func (s *settingService) Get(ctx context.Context) (*v1.AdminSetting, error) {
	settings, err := s.settingRepository.GetAll(ctx)
	if err != nil {
		s.logger.WithContext(ctx).Error("GetAll error", zap.Error(err))
		return nil, err
	}

	settingMap := make(map[string]string)
	for _, setting := range settings {
		settingMap[setting.Key] = setting.Value
	}

	getString := func(dbKey string, yamlKey string) string {
		if v := s.cfg.GetString(yamlKey); v != "" {
			return v
		}
		return settingMap[dbKey]
	}

	getBool := func(dbKey string, yamlKey string) bool {
		if v := s.cfg.GetString(yamlKey); v != "" {
			return v == "true"
		}
		return settingMap[dbKey] == "true"
	}

	getInt := func(dbKey string, yamlKey string) int {
		if v := s.cfg.GetInt(yamlKey); v != 0 {
			return v
		}
		if v := settingMap[dbKey]; v != "" {
			var i int
			fmt.Sscanf(v, "%d", &i)
			return i
		}
		return 0
	}

	getStringSlice := func(dbKey string, yamlKey string) []string {
		if v := s.cfg.GetString(yamlKey); v != "" {
			return strings.Split(v, ",")
		}
		if v := settingMap[dbKey]; v != "" {
			return strings.Split(v, ",")
		}
		return nil
	}

	resp := &v1.AdminSetting{}

	// Only include App if there's actual data
	appFrontendBaseURL := getString(model.SettingKeySiteFrontendBaseURL, "site.frontend_base_url")
	appGravatarEndpoint := getString(model.SettingKeyAppGravatarEndpoint, "app.gravatar_endpoint")
	if appFrontendBaseURL != "" || appGravatarEndpoint != "" {
		resp.App = &v1.AppConfig{
			FrontendBaseURL:  appFrontendBaseURL,
			GravatarEndpoint: appGravatarEndpoint,
		}
	}

	// Get site config values
	siteTitle := getString(model.SettingKeySiteTitle, "site.title")
	siteLogo := getString(model.SettingKeySiteLogo, "site.logo")
	siteFavicon := getString(model.SettingKeySiteFavicon, "site.favicon")
	siteCopyright := getString(model.SettingKeySiteCopyright, "site.copyright")
	siteShowLinks := getBool(model.SettingKeySiteShowLinks, "site.show_links")
	siteQuestionLink := getString(model.SettingKeySiteQuestionLink, "site.question_link")

	// Check if any site config exists in database or config file
	_, hasSiteTitle := settingMap[model.SettingKeySiteTitle]
	_, hasSiteLogo := settingMap[model.SettingKeySiteLogo]
	_, hasSiteFavicon := settingMap[model.SettingKeySiteFavicon]
	_, hasSiteCopyright := settingMap[model.SettingKeySiteCopyright]
	_, hasSiteShowLinks := settingMap[model.SettingKeySiteShowLinks]
	_, hasSiteQuestionLink := settingMap[model.SettingKeySiteQuestionLink]
	hasSiteConfig := hasSiteTitle || hasSiteLogo || hasSiteFavicon || hasSiteCopyright || hasSiteShowLinks || hasSiteQuestionLink

	// Also check config file
	if !hasSiteConfig {
		hasSiteConfig = s.cfg.GetString("site.title") != "" ||
			s.cfg.GetString("site.logo") != "" ||
			s.cfg.GetString("site.favicon") != "" ||
			s.cfg.GetString("site.copyright") != "" ||
			s.cfg.GetBool("site.show_links") ||
			s.cfg.GetString("site.question_link") != ""
	}

	if hasSiteConfig {
		resp.Site = &v1.SiteConfig{
			Title:        siteTitle,
			Logo:         siteLogo,
			Favicon:      siteFavicon,
			Copyright:    siteCopyright,
			ShowLinks:    siteShowLinks,
			QuestionLink: siteQuestionLink,
		}
	}

	// Only include AI if there's any configuration
	aiProvider := getString(model.SettingKeyAIProvider, "ai.provider")
	aiBaseURL := getString(model.SettingKeyAIOpenAIBaseURL, "ai.openai.base_url")
	aiModel := getString(model.SettingKeyAIOpenAIModel, "ai.openai.model")
	if aiProvider != "" || aiBaseURL != "" || aiModel != "" {
		resp.AI = &v1.AIConfig{
			Provider: aiProvider,
			BaseURL:  aiBaseURL,
			APIKey:   maskPassword(getString(model.SettingKeyAIOpenAIAPIKey, "ai.openai.api_key")),
			Model:    aiModel,
		}
	}

	// Only include Redis if there's any configuration
	redisAddrs := getStringSlice(model.SettingKeyRedisAddrs, "redis.addrs")
	redisDB := getInt(model.SettingKeyRedisDB, "redis.db")
	redisReadTimeout := getInt(model.SettingKeyRedisReadTimeout, "redis.read_timeout")
	redisWriteTimeout := getInt(model.SettingKeyRedisWriteTimeout, "redis.write_timeout")
	if len(redisAddrs) > 0 || redisDB != 0 || redisReadTimeout != 0 || redisWriteTimeout != 0 {
		resp.Redis = &v1.RedisConfig{
			Addrs:        redisAddrs,
			Password:     maskPassword(getString(model.SettingKeyRedisPassword, "redis.password")),
			DB:           redisDB,
			ReadTimeout:  redisReadTimeout,
			WriteTimeout: redisWriteTimeout,
		}
	}

	// Only include S3 if there's any configuration
	s3Endpoint := getString(model.SettingKeyS3Endpoint, "s3.endpoint")
	s3AccessKey := getString(model.SettingKeyS3AccessKey, "s3.access_key")
	s3BucketName := getString(model.SettingKeyS3BucketName, "s3.bucket_name")
	s3Secure := getBool(model.SettingKeyS3Secure, "s3.secure")
	s3CACert := getString(model.SettingKeyS3CACert, "s3.ca_cert")
	if s3Endpoint != "" || s3AccessKey != "" || s3BucketName != "" || s3Secure || s3CACert != "" {
		resp.S3 = &v1.S3Config{
			Endpoint:   s3Endpoint,
			AccessKey:  s3AccessKey,
			SecretKey:  maskPassword(getString(model.SettingKeyS3SecretKey, "s3.secret_key")),
			BucketName: s3BucketName,
			Secure:     s3Secure,
			CACert:     maskPassword(s3CACert),
		}
	}

	// Only include SMTP if there's any configuration
	smtpHost := getString(model.SettingKeySMTPHost, "email.host")
	smtpPort := getInt(model.SettingKeySMTPPort, "email.port")
	smtpUser := getString(model.SettingKeySMTPUser, "email.user")
	smtpUseSSL := getBool(model.SettingKeySMTPUseSSL, "email.use_ssl")
	smtpUseTLS := getBool(model.SettingKeySMTPUseTLS, "email.use_tls")
	if smtpHost != "" || smtpPort != 0 || smtpUser != "" || smtpUseSSL || smtpUseTLS {
		resp.SMTP = &v1.SMTPConfig{
			Host:      smtpHost,
			Port:      smtpPort,
			User:      smtpUser,
			Password:  maskPassword(getString(model.SettingKeySMTPPassword, "email.password")),
			From:      getString(model.SettingKeySMTPFrom, "email.from"),
			LocalName: getString(model.SettingKeySMTPLocalName, "email.local_name"),
			UseSSL:    smtpUseSSL,
			UseTLS:    smtpUseTLS,
		}
	}

	// Only include LDAP if there's any configuration
	ldapEnabled := getBool(model.SettingKeyLDAPEnabled, "ldap.enabled")
	ldapHost := getString(model.SettingKeyLDAPHost, "ldap.host")
	ldapPort := getInt(model.SettingKeyLDAPPort, "ldap.port")
	ldapBindDN := getString(model.SettingKeyLDAPBindDN, "ldap.bind_dn")
	ldapBaseDN := getString(model.SettingKeyLDAPBaseDN, "ldap.base_dn")
	if ldapEnabled || ldapHost != "" || ldapPort != 0 || ldapBindDN != "" || ldapBaseDN != "" {
		resp.LDAP = &v1.LDAPConfig{
			Enabled:      ldapEnabled,
			Host:         ldapHost,
			Port:         ldapPort,
			BindDN:       ldapBindDN,
			BindPassword: maskPassword(getString(model.SettingKeyLDAPBindPassword, "ldap.bind_password")),
			BaseDN:       ldapBaseDN,
			UserFilter:   getString(model.SettingKeyLDAPUserFilter, "ldap.user_filter"),
			AttrUsername: getString(model.SettingKeyLDAPAttrUsername, "ldap.attr_username"),
			AttrEmail:    getString(model.SettingKeyLDAPAttrEmail, "ldap.attr_email"),
			AttrName:     getString(model.SettingKeyLDAPAttrName, "ldap.attr_name"),
		}
	}

	// Only include OIDC if there's any configuration
	oidcEnabled := getBool(model.SettingKeyOIDCEnabled, "oidc.enabled")
	oidcIssuer := getString(model.SettingKeyOIDCIssuer, "oidc.issuer")
	oidcClientID := getString(model.SettingKeyOIDCClientID, "oidc.client_id")
	oidcRedirectURL := getString(model.SettingKeyOIDCRedirectURL, "oidc.redirect_url")
	oidcAutoLogin := getBool(model.SettingKeyOIDCAutoLogin, "oidc.auto_login")
	if oidcEnabled || oidcIssuer != "" || oidcClientID != "" || oidcRedirectURL != "" || oidcAutoLogin {
		resp.OIDC = &v1.OIDCConfig{
			Enabled:            oidcEnabled,
			Name:               getString(model.SettingKeyOIDCName, "oidc.name"),
			Logo:               getString(model.SettingKeyOIDCLogo, "oidc.logo"),
			Issuer:             oidcIssuer,
			ClientID:           oidcClientID,
			ClientSecret:       maskPassword(getString(model.SettingKeyOIDCClientSecret, "oidc.client_secret")),
			RedirectURL:        oidcRedirectURL,
			AutoLogin:          oidcAutoLogin,
			SignoutRedirectURL: getString(model.SettingKeyOIDCSignoutRedirectURL, "oidc.signout_redirect_url"),
			InsecureSkipVerify: getBool(model.SettingKeyOIDCInsecureSkipVerify, "oidc.insecure_skip_verify"),
			CACert:             maskPassword(getString(model.SettingKeyOIDCCACert, "oidc.ca_cert")),
			Scopes:             getString(model.SettingKeyOIDCScopes, "oidc.scopes"),
		}
	}

	// Only include Sentry if there's actual data
	if getString(model.SettingKeySentryDSN, "sentry.dsn") != "" {
		resp.Sentry = &v1.SentryConfig{
			DSN: getString(model.SettingKeySentryDSN, "sentry.dsn"),
		}
	}

	return resp, nil
}

func (s *settingService) GetPublicSiteConfig(ctx context.Context, clientVersion string) (*v1.PublicSiteConfig, error) {
	settings, err := s.settingRepository.GetAll(ctx)
	if err != nil {
		s.logger.WithContext(ctx).Error("GetAll error", zap.Error(err))
		return nil, err
	}

	settingMap := make(map[string]string)
	for _, setting := range settings {
		settingMap[setting.Key] = setting.Value
	}

	currentVersion := calculateSiteConfigVersion(settingMap)
	if clientVersion != "" && clientVersion == currentVersion {
		return nil, nil
	}

	getString := func(dbKey string, yamlKey string) string {
		if v := settingMap[dbKey]; v != "" {
			return v
		}
		return s.cfg.GetString(yamlKey)
	}

	getBool := func(dbKey string, yamlKey string) bool {
		if v := settingMap[dbKey]; v != "" {
			return v == "true"
		}
		return s.cfg.GetBool(yamlKey)
	}

	resp := &v1.PublicSiteConfig{
		Version: currentVersion,
	}

	// Get site config values
	siteTitle := getString(model.SettingKeySiteTitle, "site.title")
	siteLogo := getString(model.SettingKeySiteLogo, "site.logo")
	siteFavicon := getString(model.SettingKeySiteFavicon, "site.favicon")
	siteCopyright := getString(model.SettingKeySiteCopyright, "site.copyright")
	siteShowLinks := getBool(model.SettingKeySiteShowLinks, "site.show_links")
	siteQuestionLink := getString(model.SettingKeySiteQuestionLink, "site.question_link")

	// Check if any site config exists in database or config file
	_, hasSiteTitle := settingMap[model.SettingKeySiteTitle]
	_, hasSiteLogo := settingMap[model.SettingKeySiteLogo]
	_, hasSiteFavicon := settingMap[model.SettingKeySiteFavicon]
	_, hasSiteCopyright := settingMap[model.SettingKeySiteCopyright]
	_, hasSiteShowLinks := settingMap[model.SettingKeySiteShowLinks]
	_, hasSiteQuestionLink := settingMap[model.SettingKeySiteQuestionLink]
	hasSiteConfig := hasSiteTitle || hasSiteLogo || hasSiteFavicon || hasSiteCopyright || hasSiteShowLinks || hasSiteQuestionLink

	// Also check config file
	if !hasSiteConfig {
		hasSiteConfig = s.cfg.GetString("site.title") != "" ||
			s.cfg.GetString("site.logo") != "" ||
			s.cfg.GetString("site.favicon") != "" ||
			s.cfg.GetString("site.copyright") != "" ||
			s.cfg.GetBool("site.show_links") ||
			s.cfg.GetString("site.question_link") != ""
	}

	if hasSiteConfig {
		resp.Site = &v1.SiteConfig{
			Title:        siteTitle,
			Logo:         siteLogo,
			Favicon:      siteFavicon,
			Copyright:    siteCopyright,
			ShowLinks:    siteShowLinks,
			QuestionLink: siteQuestionLink,
		}
	}

	if getBool(model.SettingKeyOIDCEnabled, "oidc.enabled") {
		issuer := getString(model.SettingKeyOIDCIssuer, "oidc.issuer")
		resp.OIDC = &v1.OIDCConfig{
			Enabled:            true,
			Name:               getString(model.SettingKeyOIDCName, "oidc.name"),
			Logo:               getString(model.SettingKeyOIDCLogo, "oidc.logo"),
			ClientID:           getString(model.SettingKeyOIDCClientID, "oidc.client_id"),
			RedirectURL:        getString(model.SettingKeyOIDCRedirectURL, "oidc.redirect_url"),
			AutoLogin:          getBool(model.SettingKeyOIDCAutoLogin, "oidc.auto_login"),
			SignoutRedirectURL: getString(model.SettingKeyOIDCSignoutRedirectURL, "oidc.signout_redirect_url"),
		}

		// Discover authorize URL from OIDC provider
		if issuer != "" {
			insecureSkipVerify := getBool(model.SettingKeyOIDCInsecureSkipVerify, "oidc.insecure_skip_verify")
			caCert := getString(model.SettingKeyOIDCCACert, "oidc.ca_cert")
			oidcClient := oidc.NewOIDCClient(&oidc.OIDCConfig{
				Enabled:            true, // Must set to true for Init() to work
				Issuer:             issuer,
				InsecureSkipVerify: insecureSkipVerify,
				CACert:             caCert,
			}, s.logger.Logger)
			if err := oidcClient.Init(ctx); err == nil {
				resp.OIDC.AuthorizeURL = oidcClient.GetAuthorizeURL()
				resp.OIDC.ResponseType = "code"
				resp.OIDC.Scopes = "openid profile email" // Standard scopes for client to use
			} else {
				s.logger.Warn("OIDC discovery failed, authorizeUrl will not be available", zap.Error(err))
			}
		}
	}
	if getString(model.SettingKeySentryDSN, "sentry.dsn") != "" {
		resp.Sentry = &v1.SentryConfig{
			DSN: getString(model.SettingKeySentryDSN, "sentry.dsn"),
		}
	}

	return resp, nil
}

func calculateSiteConfigVersion(settingMap map[string]string) string {
	siteKeys := []string{
		model.SettingKeySiteTitle,
		model.SettingKeySiteLogo,
		model.SettingKeySiteFavicon,
		model.SettingKeySiteCopyright,
		model.SettingKeySiteShowLinks,
		model.SettingKeySiteQuestionLink,
		model.SettingKeyOIDCEnabled,
		model.SettingKeyOIDCIssuer,
		model.SettingKeyOIDCClientID,
		model.SettingKeyOIDCRedirectURL,
		model.SettingKeyOIDCAutoLogin,
		model.SettingKeyOIDCSignoutRedirectURL,
		model.SettingKeyLDAPEnabled,
		model.SettingKeySentryDSN,
	}
	sort.Strings(siteKeys)

	var builder strings.Builder
	for _, key := range siteKeys {
		builder.WriteString(key)
		builder.WriteString("=")
		builder.WriteString(settingMap[key])
		builder.WriteString(";")
	}

	hash := md5.Sum([]byte(builder.String()))
	return hex.EncodeToString(hash[:])
}

func (s *settingService) Update(ctx context.Context, req *v1.AdminSettingRequest) error {
	settings := make(map[string]string)

	if req.App != nil {
		settings[model.SettingKeySiteFrontendBaseURL] = req.App.FrontendBaseURL
		settings[model.SettingKeyAppGravatarEndpoint] = req.App.GravatarEndpoint
	}

	if req.Site != nil {
		settings[model.SettingKeySiteTitle] = req.Site.Title
		settings[model.SettingKeySiteLogo] = req.Site.Logo
		settings[model.SettingKeySiteFavicon] = req.Site.Favicon
		settings[model.SettingKeySiteCopyright] = req.Site.Copyright
		settings[model.SettingKeySiteShowLinks] = fmt.Sprintf("%v", req.Site.ShowLinks)
		settings[model.SettingKeySiteQuestionLink] = req.Site.QuestionLink
	}

	if req.AI != nil {
		settings[model.SettingKeyAIProvider] = req.AI.Provider
		settings[model.SettingKeyAIOpenAIBaseURL] = req.AI.BaseURL
		settings[model.SettingKeyAIOpenAIModel] = req.AI.Model
		if req.AI.APIKey != "" && !isMaskedPassword(req.AI.APIKey) {
			settings[model.SettingKeyAIOpenAIAPIKey] = req.AI.APIKey
		}
	}

	if req.Redis != nil {
		settings[model.SettingKeyRedisAddrs] = strings.Join(req.Redis.Addrs, ",")
		settings[model.SettingKeyRedisDB] = fmt.Sprintf("%d", req.Redis.DB)
		settings[model.SettingKeyRedisReadTimeout] = fmt.Sprintf("%d", req.Redis.ReadTimeout)
		settings[model.SettingKeyRedisWriteTimeout] = fmt.Sprintf("%d", req.Redis.WriteTimeout)
		if req.Redis.Password != "" && !isMaskedPassword(req.Redis.Password) {
			settings[model.SettingKeyRedisPassword] = req.Redis.Password
		}
	}

	if req.S3 != nil {
		settings[model.SettingKeyS3Endpoint] = req.S3.Endpoint
		settings[model.SettingKeyS3AccessKey] = req.S3.AccessKey
		settings[model.SettingKeyS3BucketName] = req.S3.BucketName
		settings[model.SettingKeyS3Secure] = fmt.Sprintf("%v", req.S3.Secure)
		if req.S3.SecretKey != "" && !isMaskedPassword(req.S3.SecretKey) {
			settings[model.SettingKeyS3SecretKey] = req.S3.SecretKey
		}
		if req.S3.CACert != "" && !isMaskedPassword(req.S3.CACert) {
			settings[model.SettingKeyS3CACert] = req.S3.CACert
		}
	}

	if req.SMTP != nil {
		settings[model.SettingKeySMTPHost] = req.SMTP.Host
		settings[model.SettingKeySMTPPort] = fmt.Sprintf("%d", req.SMTP.Port)
		settings[model.SettingKeySMTPUser] = req.SMTP.User
		settings[model.SettingKeySMTPFrom] = req.SMTP.From
		settings[model.SettingKeySMTPLocalName] = req.SMTP.LocalName
		settings[model.SettingKeySMTPUseSSL] = fmt.Sprintf("%v", req.SMTP.UseSSL)
		settings[model.SettingKeySMTPUseTLS] = fmt.Sprintf("%v", req.SMTP.UseTLS)
		if req.SMTP.Password != "" && !isMaskedPassword(req.SMTP.Password) {
			settings[model.SettingKeySMTPPassword] = req.SMTP.Password
		}
	}

	if req.LDAP != nil {
		settings[model.SettingKeyLDAPEnabled] = fmt.Sprintf("%v", req.LDAP.Enabled)
		settings[model.SettingKeyLDAPHost] = req.LDAP.Host
		settings[model.SettingKeyLDAPPort] = fmt.Sprintf("%d", req.LDAP.Port)
		settings[model.SettingKeyLDAPBindDN] = req.LDAP.BindDN
		settings[model.SettingKeyLDAPBaseDN] = req.LDAP.BaseDN
		settings[model.SettingKeyLDAPUserFilter] = req.LDAP.UserFilter
		settings[model.SettingKeyLDAPAttrUsername] = req.LDAP.AttrUsername
		settings[model.SettingKeyLDAPAttrEmail] = req.LDAP.AttrEmail
		settings[model.SettingKeyLDAPAttrName] = req.LDAP.AttrName
		if req.LDAP.BindPassword != "" && !isMaskedPassword(req.LDAP.BindPassword) {
			settings[model.SettingKeyLDAPBindPassword] = req.LDAP.BindPassword
		}
	}

	if req.OIDC != nil {
		settings[model.SettingKeyOIDCEnabled] = fmt.Sprintf("%v", req.OIDC.Enabled)
		settings[model.SettingKeyOIDCName] = req.OIDC.Name
		settings[model.SettingKeyOIDCLogo] = req.OIDC.Logo
		settings[model.SettingKeyOIDCIssuer] = req.OIDC.Issuer
		settings[model.SettingKeyOIDCClientID] = req.OIDC.ClientID
		settings[model.SettingKeyOIDCRedirectURL] = req.OIDC.RedirectURL
		settings[model.SettingKeyOIDCAutoLogin] = fmt.Sprintf("%v", req.OIDC.AutoLogin)
		settings[model.SettingKeyOIDCSignoutRedirectURL] = req.OIDC.SignoutRedirectURL
		settings[model.SettingKeyOIDCInsecureSkipVerify] = fmt.Sprintf("%v", req.OIDC.InsecureSkipVerify)
		settings[model.SettingKeyOIDCScopes] = req.OIDC.Scopes
		if req.OIDC.CACert != "" && !isMaskedPassword(req.OIDC.CACert) {
			settings[model.SettingKeyOIDCCACert] = req.OIDC.CACert
		}
		if req.OIDC.ClientSecret != "" && !isMaskedPassword(req.OIDC.ClientSecret) {
			settings[model.SettingKeyOIDCClientSecret] = req.OIDC.ClientSecret
		}
	}

	if req.Sentry != nil {
		settings[model.SettingKeySentryDSN] = req.Sentry.DSN
	}

	if len(settings) == 0 {
		return nil
	}

	if err := s.settingRepository.SetMany(ctx, settings); err != nil {
		return err
	}

	// Refresh runtime config (Redis, Storage) after settings update
	return s.settingRepository.UpdateRuntimeConfig(ctx)
}

func maskPassword(password string) string {
	if password == "" {
		return ""
	}
	if len(password) <= 4 {
		return "****"
	}
	// Use at most 6 asterisks
	maskLen := len(password) - 4
	if maskLen > 6 {
		maskLen = 6
	}
	return strings.Repeat("*", maskLen) + password[len(password)-4:]
}

func isMaskedPassword(password string) bool {
	return strings.HasPrefix(password, "****")
}

func (s *settingService) TestEmail(ctx context.Context, req *v1.TestEmailRequest) error {
	msg := &email.Message{
		To:      []string{req.To},
		Subject: "测试邮件 - 系统设置测试",
		Text:    "这是一封测试邮件，用于验证SMTP邮件发送配置是否正确。\n\n如果您收到这封邮件，说明邮件配置成功！",
		HTML:    "<p>这是一封测试邮件，用于验证SMTP邮件发送配置是否正确。</p><p><strong>如果您收到这封邮件，说明邮件配置成功！</strong></p>",
	}

	return s.SendEmail(ctx, msg)
}
