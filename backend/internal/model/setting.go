package model

import "gorm.io/gorm"

type Setting struct {
	gorm.Model

	Key   string `gorm:"column:key;type:varchar(255);not null;unique;index;comment:'键'"`
	Value string `gorm:"column:value;type:text;comment:'值'"`
}

func (m *Setting) TableName() string {
	return "setting"
}

const (
	// Site
	SettingKeySiteTitle        = "site_title"
	SettingKeySiteLogo         = "site_logo"
	SettingKeySiteFavicon      = "site_favicon"
	SettingKeySiteCopyright    = "site_copyright"
	SettingKeySiteShowLinks    = "site_show_links"
	SettingKeySiteQuestionLink = "site_question_link"

	// App
	SettingKeySiteFrontendBaseURL = "site_frontend_base_url"
	SettingKeyAppGravatarEndpoint = "app_gravatar_endpoint"

	// AI
	SettingKeyAIProvider      = "ai_provider"
	SettingKeyAIOpenAIBaseURL = "ai_openai_base_url"
	SettingKeyAIOpenAIAPIKey  = "ai_openai_api_key"
	SettingKeyAIOpenAIModel   = "ai_openai_model"

	// Redis
	SettingKeyRedisAddrs        = "redis_addrs"
	SettingKeyRedisPassword     = "redis_password"
	SettingKeyRedisDB           = "redis_db"
	SettingKeyRedisReadTimeout  = "redis_read_timeout"
	SettingKeyRedisWriteTimeout = "redis_write_timeout"

	// S3
	SettingKeyS3Endpoint   = "s3_endpoint"
	SettingKeyS3AccessKey  = "s3_access_key"
	SettingKeyS3SecretKey  = "s3_secret_key"
	SettingKeyS3BucketName = "s3_bucket_name"
	SettingKeyS3Secure     = "s3_secure"
	SettingKeyS3CACert     = "s3_ca_cert"

	// SMTP
	SettingKeySMTPHost      = "smtp_host"
	SettingKeySMTPPort      = "smtp_port"
	SettingKeySMTPUser      = "smtp_user"
	SettingKeySMTPPassword  = "smtp_password"
	SettingKeySMTPFrom      = "smtp_from"
	SettingKeySMTPLocalName = "smtp_local_name"
	SettingKeySMTPUseSSL    = "smtp_use_ssl"
	SettingKeySMTPUseTLS    = "smtp_use_tls"

	// LDAP
	SettingKeyLDAPEnabled      = "ldap_enabled"
	SettingKeyLDAPHost         = "ldap_host"
	SettingKeyLDAPPort         = "ldap_port"
	SettingKeyLDAPBindDN       = "ldap_bind_dn"
	SettingKeyLDAPBindPassword = "ldap_bind_password"
	SettingKeyLDAPBaseDN       = "ldap_base_dn"
	SettingKeyLDAPUserFilter   = "ldap_user_filter"
	SettingKeyLDAPAttrUsername = "ldap_attr_username"
	SettingKeyLDAPAttrEmail    = "ldap_attr_email"
	SettingKeyLDAPAttrName     = "ldap_attr_name"

	// OIDC
	SettingKeyOIDCEnabled            = "oidc_enabled"
	SettingKeyOIDCName               = "oidc_name"
	SettingKeyOIDCLogo               = "oidc_logo"
	SettingKeyOIDCColor              = "oidc_color"
	SettingKeyOIDCIssuer             = "oidc_issuer" // OIDC Issuer URL for discovery
	SettingKeyOIDCClientID           = "oidc_client_id"
	SettingKeyOIDCClientSecret       = "oidc_client_secret"
	SettingKeyOIDCRedirectURL        = "oidc_redirect_url"
	SettingKeyOIDCAutoLogin          = "oidc_auto_login"
	SettingKeyOIDCSignoutRedirectURL = "oidc_signout_redirect_url"
	SettingKeyOIDCInsecureSkipVerify = "oidc_insecure_skip_verify"
	SettingKeyOIDCCACert             = "oidc_ca_cert"
	SettingKeyOIDCScopes             = "oidc_scopes"
	// Sentry
	SettingKeySentryDSN = "sentry_dsn"
)
