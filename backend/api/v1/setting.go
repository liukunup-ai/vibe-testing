package v1

type SiteConfig struct {
	Title        string `json:"title,omitempty"`
	Logo         string `json:"logo,omitempty"`
	Favicon      string `json:"favicon,omitempty"`
	Copyright    string `json:"copyright,omitempty"`
	ShowLinks    bool   `json:"showLinks"`
	QuestionLink string `json:"questionLink,omitempty"`
}

type AppConfig struct {
	FrontendBaseURL  string `json:"frontendBaseUrl,omitempty"`
	GravatarEndpoint string `json:"gravatarEndpoint,omitempty"`
}

type AIConfig struct {
	Provider string `json:"provider,omitempty"`
	BaseURL  string `json:"baseUrl,omitempty"`
	APIKey   string `json:"apiKey,omitempty"`
	Model    string `json:"model,omitempty"`
}

type RedisConfig struct {
	Addrs        []string `json:"addrs,omitempty"`
	Password     string   `json:"password,omitempty"`
	DB           int      `json:"db"`
	ReadTimeout  int      `json:"readTimeout"`
	WriteTimeout int      `json:"writeTimeout"`
}

type S3Config struct {
	Endpoint   string `json:"endpoint,omitempty"`
	AccessKey  string `json:"accessKey,omitempty"`
	SecretKey  string `json:"secretKey,omitempty"`
	BucketName string `json:"bucketName,omitempty"`
	Secure     bool   `json:"secure"`
	CACert     string `json:"caCert,omitempty"`
}

type SMTPConfig struct {
	Host      string `json:"host,omitempty"`
	Port      int    `json:"port"`
	User      string `json:"user,omitempty"`
	Password  string `json:"password,omitempty"`
	From      string `json:"from,omitempty"`
	LocalName string `json:"localName,omitempty"`
	UseSSL    bool   `json:"useSSL"`
	UseTLS    bool   `json:"useTLS"`
}

type LDAPConfig struct {
	Enabled      bool   `json:"enabled"`
	Host         string `json:"host,omitempty"`
	Port         int    `json:"port"`
	BindDN       string `json:"bindDn,omitempty"`
	BindPassword string `json:"bindPassword,omitempty"`
	BaseDN       string `json:"baseDn,omitempty"`
	UserFilter   string `json:"userFilter,omitempty"`
	AttrUsername string `json:"attrUsername,omitempty"`
	AttrEmail    string `json:"attrEmail,omitempty"`
	AttrName     string `json:"attrName,omitempty"`
}

type OIDCConfig struct {
	Enabled            bool   `json:"enabled"`
	Name               string `json:"name,omitempty"`
	Logo               string `json:"logo,omitempty"`
	Issuer             string `json:"issuer,omitempty"`
	AuthorizeURL       string `json:"authorizeUrl,omitempty"`
	ResponseType       string `json:"responseType,omitempty"`
	Scopes             string `json:"scopes,omitempty"`
	ClientID           string `json:"clientId,omitempty"`
	ClientSecret       string `json:"clientSecret,omitempty"`
	RedirectURL        string `json:"redirectUrl,omitempty"`
	AutoLogin          bool   `json:"autoLogin"`
	SignoutRedirectURL string `json:"signoutRedirectUrl,omitempty"`
	InsecureSkipVerify bool   `json:"insecureSkipVerify"`
	CACert             string `json:"caCert,omitempty"`
}

type SentryConfig struct {
	DSN string `json:"dsn,omitempty"`
}

type AdminSettingRequest struct {
	App    *AppConfig    `json:"app,omitempty"`
	Site   *SiteConfig   `json:"site,omitempty"`
	AI     *AIConfig     `json:"ai,omitempty"`
	Redis  *RedisConfig  `json:"redis,omitempty"`
	S3     *S3Config     `json:"s3,omitempty"`
	SMTP   *SMTPConfig   `json:"smtp,omitempty"`
	LDAP   *LDAPConfig   `json:"ldap,omitempty"`
	OIDC   *OIDCConfig   `json:"oidc,omitempty"`
	Sentry *SentryConfig `json:"sentry,omitempty"`
}

type AdminSetting struct {
	App    *AppConfig    `json:"app,omitempty"`
	Site   *SiteConfig   `json:"site,omitempty"`
	AI     *AIConfig     `json:"ai,omitempty"`
	Redis  *RedisConfig  `json:"redis,omitempty"`
	S3     *S3Config     `json:"s3,omitempty"`
	SMTP   *SMTPConfig   `json:"smtp,omitempty"`
	LDAP   *LDAPConfig   `json:"ldap,omitempty"`
	OIDC   *OIDCConfig   `json:"oidc,omitempty"`
	Sentry *SentryConfig `json:"sentry,omitempty"`
}

type AdminSettingResponse struct {
	Response
	Data AdminSetting
}

type SiteSettingRequest struct {
	Version string `form:"version" binding:"omitempty"`
}

type SiteSetting struct {
	Version string        `json:"version"`
	Site    *SiteConfig   `json:"site,omitempty"`
	OIDC    *OIDCConfig   `json:"oidc,omitempty"`
	Sentry  *SentryConfig `json:"sentry,omitempty"`
}

type SiteSettingResponse struct {
	Response
	Data SiteSetting
}

type TestEmailRequest struct {
	To string `json:"to" binding:"required,email" example:"zhangsan@example.com"` // 邮箱
}
