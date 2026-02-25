package ldap

import (
	"context"
	"crypto/tls"
	"fmt"

	"github.com/go-ldap/ldap/v3"
	"go.uber.org/zap"
)

type LDAPConfig struct {
	Enabled      bool
	Host         string
	Port         int
	BindDN       string
	BindPassword string
	BaseDN       string
	Filter       string
	AttrUsername string
	AttrEmail    string
	AttrName     string
}

type LDAPUser struct {
	Username string
	Email    string
	FullName string
	DN       string
}

type LDAPClient struct {
	config *LDAPConfig
	logger *zap.Logger
}

func NewLDAPClient(config *LDAPConfig, logger *zap.Logger) *LDAPClient {
	return &LDAPClient{
		config: config,
		logger: logger,
	}
}

func (c *LDAPClient) Authenticate(ctx context.Context, username, password string) (*LDAPUser, error) {
	if !c.config.Enabled {
		return nil, fmt.Errorf("LDAP is not enabled")
	}

	port := c.config.Port
	if port == 0 {
		port = 389
	}
	ldapURL := fmt.Sprintf("ldap://%s:%d", c.config.Host, port)

	l, err := ldap.DialURL(ldapURL)
	if err != nil {
		c.logger.Error("failed to connect to LDAP server", zap.Error(err))
		return nil, fmt.Errorf("failed to connect to LDAP server: %w", err)
	}
	defer l.Close()

	if port == 636 {
		err = l.StartTLS(&tls.Config{InsecureSkipVerify: true})
		if err != nil {
			c.logger.Error("failed to start TLS", zap.Error(err))
			return nil, fmt.Errorf("failed to start TLS: %w", err)
		}
	}

	if c.config.BindDN != "" && c.config.BindPassword != "" {
		err = l.Bind(c.config.BindDN, c.config.BindPassword)
		if err != nil {
			c.logger.Error("failed to bind service account", zap.Error(err))
			return nil, fmt.Errorf("failed to bind service account: %w", err)
		}
	}

	filter := c.config.Filter
	if filter == "" {
		filter = "(uid=%s)"
	}
	searchFilter := fmt.Sprintf(filter, ldap.EscapeFilter(username))
	c.logger.Info("LDAP search", zap.String("filter", searchFilter), zap.String("baseDN", c.config.BaseDN))

	attrUsername := c.config.AttrUsername
	if attrUsername == "" {
		attrUsername = "uid"
	}
	attrEmail := c.config.AttrEmail
	if attrEmail == "" {
		attrEmail = "mail"
	}
	attrName := c.config.AttrName
	if attrName == "" {
		attrName = "cn"
	}

	searchRequest := ldap.NewSearchRequest(
		c.config.BaseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		searchFilter,
		[]string{attrUsername, attrEmail, attrName, "dn"},
		nil,
	)

	
	sr, err := l.Search(searchRequest)
	if err != nil {
		c.logger.Error("failed to search user", zap.Error(err))
		return nil, fmt.Errorf("failed to search user: %w", err)
	}

	c.logger.Info("LDAP search result", zap.Int("entries", len(sr.Entries)))
	if len(sr.Entries) == 0 {
		c.logger.Warn("LDAP user not found", zap.String("username", username))
		return nil, fmt.Errorf("user not found")
	}

	entry := sr.Entries[0]
	userDN := entry.DN
	c.logger.Info("LDAP user found", zap.String("dn", userDN))

	
	if err != nil {
		c.logger.Error("failed to bind user", zap.Error(err))
		return nil, fmt.Errorf("invalid credentials")
	}

	user := &LDAPUser{
		Username: entry.GetAttributeValue(attrUsername),
		Email:    entry.GetAttributeValue(attrEmail),
		FullName: entry.GetAttributeValue(attrName),
		DN:       userDN,
	}

	if user.Username == "" {
		user.Username = username
	}

	return user, nil
}

func (c *LDAPClient) IsEnabled() bool {
	return c.config.Enabled
}
