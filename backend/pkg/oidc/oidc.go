package oidc

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"strings"

	oidclib "github.com/coreos/go-oidc/v3/oidc"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

type OIDCConfig struct {
	Enabled            bool
	Issuer             string // OIDC Issuer URL for discovery (e.g. https://auth.example.com/application/o/myapp/)
	ClientID           string
	Secret             string
	Redirect           string
	InsecureSkipVerify bool
	CACert             string
}

type OIDCUser struct {
	Subject           string
	Email             string
	Name              string
	GivenName         string
	PreferredUsername string
	Picture           string
	Groups            []string
	Role              string
	EmailVerified     bool
}

type OIDCClient struct {
	config       *OIDCConfig
	provider     *oidclib.Provider
	oauth        *oauth2.Config
	verifier     *oidclib.IDTokenVerifier
	logger       *zap.Logger
	httpClient   *http.Client
	clientSecret string
}

func NewOIDCClient(config *OIDCConfig, logger *zap.Logger) *OIDCClient {
	return &OIDCClient{
		config: config,
		logger: logger,
	}
}

func (c *OIDCClient) Init(ctx context.Context) error {
	if !c.config.Enabled {
		return nil
	}

	if c.config.Issuer == "" {
		return fmt.Errorf("OIDC issuer URL is required")
	}

	// Setup HTTP client with TLS config
	c.httpClient = &http.Client{}
	tlsConfig := &tls.Config{}

	if c.config.InsecureSkipVerify {
		tlsConfig.InsecureSkipVerify = true
		c.logger.Warn("OIDC TLS verification is disabled - not recommended for production")
	} else if c.config.CACert != "" {
		caCertPool := x509.NewCertPool()
		block, _ := pem.Decode([]byte(c.config.CACert))
		if block == nil {
			return fmt.Errorf("failed to parse CA certificate: not a valid PEM block")
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			return fmt.Errorf("failed to parse CA certificate: %w", err)
		}
		caCertPool.AddCert(cert)
		tlsConfig.RootCAs = caCertPool
		c.logger.Info("OIDC using custom CA certificate")
	}

	c.httpClient.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	// Use OIDC Discovery to get provider configuration
	provider, err := oidclib.NewProvider(
		oidclib.ClientContext(ctx, c.httpClient),
		c.config.Issuer,
	)
	if err != nil {
		return fmt.Errorf("failed to discover OIDC provider: %w", err)
	}
	c.provider = provider
	c.logger.Info("OIDC provider discovered", zap.String("issuer", c.config.Issuer))

	// Setup OAuth2 config using discovered endpoints
	c.oauth = &oauth2.Config{
		ClientID:     c.config.ClientID,
		ClientSecret: c.config.Secret,
		RedirectURL:  c.config.Redirect,
		Endpoint:     c.provider.Endpoint(),
		Scopes:       []string{oidclib.ScopeOpenID, "profile", "email"},
	}

	// Setup ID token verifier
	c.verifier = c.provider.Verifier(&oidclib.Config{ClientID: c.config.ClientID})
	c.clientSecret = c.config.Secret

	return nil
}

func (c *OIDCClient) GetAuthURL(ctx context.Context, state string) string {
	if c.oauth == nil || c.provider == nil {
		return ""
	}
	return c.oauth.AuthCodeURL(state)
}

type idTokenClaims struct {
	Subject           string   `json:"sub"`
	Email             string   `json:"email"`
	Name              string   `json:"name"`
	GivenName         string   `json:"given_name"`
	PreferredUsername string   `json:"preferred_username"`
	Picture           string   `json:"picture"`
	Groups            []string `json:"groups"`
	Role              string   `json:"role"`
	EmailVerified     bool     `json:"email_verified"`
}

func parseClaims(rawJSON []byte) (*OIDCUser, error) {
	var claims idTokenClaims
	if err := json.Unmarshal(rawJSON, &claims); err != nil {
		return nil, fmt.Errorf("failed to parse claims: %w", err)
	}
	return &OIDCUser{
		Subject:           claims.Subject,
		Email:             claims.Email,
		Name:              claims.Name,
		GivenName:         claims.GivenName,
		PreferredUsername: claims.PreferredUsername,
		Picture:           claims.Picture,
		Groups:            claims.Groups,
		EmailVerified:     claims.EmailVerified,
		Role:              claims.Role,
	}, nil
}

func (c *OIDCClient) Callback(ctx context.Context, code string) (*OIDCUser, error) {
	if c.oauth == nil || c.verifier == nil {
		return nil, fmt.Errorf("OIDC not initialized")
	}

	oauth2Ctx := context.WithValue(ctx, oauth2.HTTPClient, c.httpClient)

	oauthToken, err := c.oauth.Exchange(oauth2Ctx, code)
	if err != nil {
		c.logger.Error("failed to exchange token", zap.Error(err))
		return nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	// Get user info from ID token directly
	rawIDToken, ok := oauthToken.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("no id_token in token response")
	}

	// Try standard verification first (RS256)
	idToken, err := c.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		c.logger.Warn("standard verification failed, trying HS256", zap.Error(err))

		// Fallback: parse JWT payload directly (for HS256 or other algorithms)
		parts := strings.Split(rawIDToken, ".")
		if len(parts) != 3 {
			return nil, fmt.Errorf("invalid JWT format")
		}

		payload, err := decodeJWTPayload(parts[1])
		if err != nil {
			return nil, fmt.Errorf("failed to decode JWT payload: %w", err)
		}

		c.logger.Debug("HS256 JWT payload", zap.String("payload", string(payload)))

		user, err := parseClaims(payload)
		if err != nil {
			return nil, err
		}

		c.logger.Info("HS256 token parsed", zap.String("email", user.Email), zap.String("name", user.Name))
		return user, nil
	}

	// RS256 path - extract claims from verified token
	claims := &idTokenClaims{}
	if err := idToken.Claims(claims); err != nil {
		return nil, fmt.Errorf("failed to parse ID token claims: %w", err)
	}

	user := &OIDCUser{
		Subject:           claims.Subject,
		Email:             claims.Email,
		Name:              claims.Name,
		GivenName:         claims.GivenName,
		PreferredUsername: claims.PreferredUsername,
		Picture:           claims.Picture,
		Groups:            claims.Groups,
		EmailVerified:     claims.EmailVerified,
		Role:              claims.Role,
	}

	c.logger.Info("RS256 token parsed", zap.String("email", user.Email), zap.String("name", user.Name))
	return user, nil
}

func decodeJWTPayload(encoded string) ([]byte, error) {
	switch len(encoded) % 4 {
	case 2:
		encoded += "=="
	case 3:
		encoded += "="
	}
	return base64.URLEncoding.DecodeString(encoded)
}

func (c *OIDCClient) IsEnabled() bool {
	return c.config.Enabled
}

func (c *OIDCClient) GetIssuer() string {
	return c.config.Issuer
}

func (c *OIDCClient) GetClientID() string {
	return c.config.ClientID
}

// providerClaims contains the OIDC provider metadata
type providerClaims struct {
	EndSessionEndpoint string   `json:"end_session_endpoint"`
	ScopesSupported    []string `json:"scopes_supported"`
}

// GetEndSessionURL returns the end_session_endpoint from the provider's discovery document
func (c *OIDCClient) GetEndSessionURL() string {
	if c.provider == nil {
		return ""
	}
	var claims providerClaims
	if err := c.provider.Claims(&claims); err != nil {
		c.logger.Warn("failed to get provider claims", zap.Error(err))
		return ""
	}
	return claims.EndSessionEndpoint
}

// GetAuthorizeURL returns the authorization endpoint URL
func (c *OIDCClient) GetAuthorizeURL() string {
	if c.oauth == nil {
		return ""
	}
	return c.oauth.Endpoint.AuthURL
}

// GetScopes returns the scopes supported by the provider (space-separated)
func (c *OIDCClient) GetScopes() string {
	if c.provider == nil {
		return ""
	}
	var claims providerClaims
	if err := c.provider.Claims(&claims); err != nil {
		c.logger.Warn("failed to get provider claims", zap.Error(err))
		return ""
	}
	if len(claims.ScopesSupported) == 0 {
		return ""
	}
	return strings.Join(claims.ScopesSupported, " ")
}
