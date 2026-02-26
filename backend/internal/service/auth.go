package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/audit"
	"backend/pkg/email"
	"backend/pkg/ldap"
	"backend/pkg/oidc"
	"context"
	"errors"
	"fmt"
	"strings"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(ctx context.Context, req *v1.RegisterRequest) error
	Login(ctx context.Context, req *v1.LoginRequest) (*v1.TokenData, error)
	LoginWithOIDC(ctx context.Context, req *v1.OIDCAuthRequest) (*v1.TokenData, error)
	Logout(ctx context.Context, uid string) (*v1.LogoutData, error)
	RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.TokenData, error)
	ForgotPassword(ctx context.Context, req *v1.ForgotPasswordRequest) error
	ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) error
}

func NewAuthService(
	service *Service,
	userRepository repository.UserRepository,
	settingRepository repository.SettingRepository,
) AuthService {
	return &authService{
		Service:           service,
		userRepository:    userRepository,
		settingRepository: settingRepository,
	}
}

type authService struct {
	*Service
	userRepository    repository.UserRepository
	settingRepository repository.SettingRepository
}

func (s *authService) getTeamSignature(ctx context.Context) string {
	settings, err := s.settingRepository.GetAll(ctx)
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

func (s *authService) getLDAPConfig(ctx context.Context) *ldap.LDAPConfig {
	settings, err := s.settingRepository.GetAll(ctx)
	if err != nil {
		settings = nil
	}

	settingMap := make(map[string]string)
	for _, setting := range settings {
		settingMap[setting.Key] = setting.Value
	}

	getString := func(key string, yamlKey string) string {
		if v := settingMap[key]; v != "" {
			return v
		}
		return s.Service.cfg.GetString("ldap." + yamlKey)
	}

	getInt := func(key string, yamlKey string) int {
		if v := settingMap[key]; v != "" {
			var i int
			fmt.Sscanf(v, "%d", &i)
			return i
		}
		return s.Service.cfg.GetInt("ldap." + yamlKey)
	}

	return &ldap.LDAPConfig{
		Enabled:      settingMap[model.SettingKeyLDAPEnabled] == "true" || s.Service.cfg.GetBool("ldap.enabled"),
		Host:         getString(model.SettingKeyLDAPHost, "host"),
		Port:         getInt(model.SettingKeyLDAPPort, "port"),
		BindDN:       getString(model.SettingKeyLDAPBindDN, "bind_dn"),
		BindPassword: getString(model.SettingKeyLDAPBindPassword, "bind_password"),
		BaseDN:       getString(model.SettingKeyLDAPBaseDN, "base_dn"),
		Filter:       getString(model.SettingKeyLDAPUserFilter, "user_filter"),
		AttrUsername: getString(model.SettingKeyLDAPAttrUsername, "attr_username"),
		AttrEmail:    getString(model.SettingKeyLDAPAttrEmail, "attr_email"),
		AttrName:     getString(model.SettingKeyLDAPAttrName, "attr_name"),
	}
}

func (s *authService) getOIDCConfig(ctx context.Context) *oidc.OIDCConfig {
	settings, err := s.settingRepository.GetAll(ctx)
	if err != nil {
		settings = nil
	}

	settingMap := make(map[string]string)
	for _, setting := range settings {
		settingMap[setting.Key] = setting.Value
	}

	s.logger.Debug("OIDC settings from DB", zap.Any("settings", settingMap))

	getString := func(key string, yamlKey string) string {
		if v := settingMap[key]; v != "" {
			return v
		}
		return s.Service.cfg.GetString("oidc." + yamlKey)
	}

	getBool := func(key string, yamlKey string) bool {
		if v := settingMap[key]; v != "" {
			s.logger.Debug("OIDC config bool", zap.String("key", key), zap.String("value", v), zap.Bool("result", v == "true"))
			return v == "true"
		}
		return s.Service.cfg.GetBool("oidc." + yamlKey)
	}

	insecureSkipVerify := getBool(model.SettingKeyOIDCInsecureSkipVerify, "insecure_skip_verify")
	s.logger.Debug("OIDC InsecureSkipVerify value", zap.Bool("value", insecureSkipVerify))

	return &oidc.OIDCConfig{
		Enabled:            settingMap[model.SettingKeyOIDCEnabled] == "true" || s.Service.cfg.GetBool("oidc.enabled"),
		Issuer:             getString(model.SettingKeyOIDCIssuer, "issuer"),
		ClientID:           getString(model.SettingKeyOIDCClientID, "client_id"),
		Secret:             getString(model.SettingKeyOIDCClientSecret, "client_secret"),
		Redirect:           getString(model.SettingKeyOIDCRedirectURL, "redirect_url"),
		InsecureSkipVerify: insecureSkipVerify,
		CACert:             getString(model.SettingKeyOIDCCACert, "ca_cert"),
	}
}
func (s *authService) Register(ctx context.Context, req *v1.RegisterRequest) error {
	_, err := s.userRepository.GetByEmail(ctx, req.Email)
	if err == nil {
		s.audit.LogFailure(ctx, audit.ActionRegister, "", "", "user", "", v1.ErrEmailAlreadyUse, map[string]interface{}{
			"email": req.Email,
		})
		return v1.ErrEmailAlreadyUse
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return v1.ErrInternalServerError
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	parts := strings.Split(req.Email, "@")
	if len(parts) != 2 {
		return v1.ErrInternalServerError
	}
	defaultUsername := parts[0]

	fullName := req.FullName
	if fullName == "" {
		fullName = generateHumanNickname()
	}

	user := &model.User{
		Username:       defaultUsername,
		HashedPassword: string(hashedPassword),
		FullName:       fullName,
		Email:          req.Email,
		Status:         0,
	}
	err = s.tm.Transaction(ctx, func(ctx context.Context) error {
		if err = s.userRepository.Create(ctx, user); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionRegister, "", "", "user", "", err, map[string]interface{}{
			"email": req.Email,
		})
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionRegister, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"email":    req.Email,
		"username": defaultUsername,
	})
	return nil
}

func (s *authService) Login(ctx context.Context, req *v1.LoginRequest) (*v1.TokenData, error) {
	ldapConfig := s.getLDAPConfig(ctx)
	s.logger.Info("Login attempt", zap.String("username", req.Username), zap.Bool("ldapEnabled", ldapConfig.Enabled))

	if ldapConfig.Enabled {
		s.logger.Info("Attempting LDAP authentication", zap.String("username", req.Username))
		ldapClient := ldap.NewLDAPClient(ldapConfig, s.logger.Logger)
		ldapUser, err := ldapClient.Authenticate(ctx, req.Username, req.Password)
		if err == nil && ldapUser != nil {
			return s.handleLDAPLogin(ctx, ldapUser, req.AutoLogin)
		}
		if err != nil {
			s.logger.Warn("LDAP authentication failed, falling back to local auth",
				zap.String("username", req.Username),
				zap.Error(err))
		}
	}

	user, err := s.userRepository.GetByUsernameOrEmail(ctx, req.Username, req.Username)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		s.audit.LogFailure(ctx, audit.ActionLogin, "", "", "user", "", v1.ErrUnauthorized, map[string]interface{}{
			"username": req.Username,
		})
		return nil, v1.ErrUnauthorized
	}
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionLogin, "", "", "user", "", err, map[string]interface{}{
			"username": req.Username,
		})
		return nil, v1.ErrInternalServerError
	}
	// Check if user can authenticate with password
	if user.HashedPassword == "" {
		s.audit.LogFailure(ctx, audit.ActionLogin, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", v1.ErrUnauthorized, map[string]interface{}{
			"username": req.Username,
			"authType": user.AuthType,
		})
		return nil, v1.ErrUnauthorized
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.Password))
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionLogin, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", err, map[string]interface{}{
			"username": req.Username,
		})
		return nil, err
	}

	tokenPair, err := s.jwt.GenerateTokenPairWithExpiry(ctx, user.UserID, "", req.AutoLogin)
	if err != nil {
		return nil, err
	}

	s.audit.LogSuccess(ctx, audit.ActionLogin, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"username": user.Username,
	})

	return tokenPair, nil
}

func (s *authService) handleLDAPLogin(ctx context.Context, ldapUser *ldap.LDAPUser, autoLogin bool) (*v1.TokenData, error) {
	email := ldapUser.Email
	if email == "" {
		email = ldapUser.Username + "@ldap.local"
	}

	username := ldapUser.Username
	s.logger.Info("LDAP user data",
		zap.String("username", username),
		zap.String("email", email),
		zap.String("fullName", ldapUser.FullName),
	)

	// Try to find user by username or email
	user, err := s.userRepository.GetByUsernameOrEmail(ctx, username, email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new user
		fullName := ldapUser.FullName
		if fullName == "" {
			fullName = username
		}

		userID, err := s.sid.GenString()
		if err != nil {
			return nil, fmt.Errorf("failed to generate user id: %w", err)
		}

		newUser := &model.User{
			UserID:         userID,
			Username:       username,
			HashedPassword: "",
			FullName:       fullName,
			Email:          email,
			Status:         1,
			AuthType:       "ldap",
			LDAPDN:         ldapUser.DN,
		}
		if err = s.userRepository.Create(ctx, newUser); err != nil {
			return nil, err
		}
		user = *newUser
		s.logger.Info("Created new LDAP user", zap.String("userID", userID), zap.String("email", email))
	} else if err != nil {
		return nil, err
	} else {
		// User already exists - update info
		s.logger.Info("LDAP user already exists, updating info", zap.String("username", username), zap.String("email", email))

		updateFields := map[string]interface{}{}
		if ldapUser.FullName != "" && user.FullName != ldapUser.FullName {
			updateFields["full_name"] = ldapUser.FullName
		}
		if ldapUser.DN != "" && user.LDAPDN != ldapUser.DN {
			updateFields["ldap_dn"] = ldapUser.DN
		}
		// Always update auth_type to current login method
		updateFields["auth_type"] = "ldap"

		if len(updateFields) > 0 {
			if err = s.userRepository.Update(ctx, user.UserID, updateFields); err != nil {
				s.logger.Warn("failed to update LDAP user info", zap.Error(err))
			}
		}
	}

	// Assign default role
	roles := []string{"user"}
	s.logger.Info("Assigning LDAP role", zap.String("role", "user"), zap.String("userID", user.UserID))
	if err = s.userRepository.UpdateRoles(ctx, user.UserID, roles); err != nil {
		s.logger.Warn("failed to assign roles for LDAP user", zap.Error(err))
	}

	tokenPair, err := s.jwt.GenerateTokenPairWithExpiry(ctx, user.UserID, "", autoLogin)
	if err != nil {
		return nil, err
	}

	s.audit.LogSuccess(ctx, audit.ActionLogin, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"username":  user.Username,
		"auth_type": "ldap",
	})

	return tokenPair, nil
}

func (s *authService) LoginWithOIDC(ctx context.Context, req *v1.OIDCAuthRequest) (*v1.TokenData, error) {
	oidcConfig := s.getOIDCConfig(ctx)
	if !oidcConfig.Enabled {
		s.logger.Warn("OIDC login attempted but OIDC is not configured")
		return nil, v1.ErrOIDCNotConfigured
	}

	if oidcConfig.Issuer == "" || oidcConfig.ClientID == "" || oidcConfig.Secret == "" {
		s.logger.Warn("OIDC configuration is incomplete")
		return nil, v1.ErrOIDCNotConfigured
	}

	oidcClient := oidc.NewOIDCClient(oidcConfig, s.logger.Logger)
	if err := oidcClient.Init(ctx); err != nil {
		return nil, err
	}

	oidcUser, err := oidcClient.Callback(ctx, req.Code)
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionLogin, "", "", "user", "", err, map[string]interface{}{
			"auth_type": "oidc",
		})
		return nil, err
	}

	email := oidcUser.Email
	if email == "" {
		email = oidcUser.Subject + "@oidc.local"
	}

	username := oidcUser.PreferredUsername
	if username == "" {
		username = oidcUser.Subject
	}

	s.logger.Info("OIDC user data",
		zap.String("subject", oidcUser.Subject),
		zap.String("email", oidcUser.Email),
		zap.String("name", oidcUser.Name),
		zap.String("preferred_username", oidcUser.PreferredUsername),
		zap.String("role", oidcUser.Role),
	)

	// Try to find user by username or email
	user, err := s.userRepository.GetByUsernameOrEmail(ctx, username, email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new user
		fullName := oidcUser.Name
		if fullName == "" {
			fullName = oidcUser.GivenName
		}
		if fullName == "" {
			fullName = username
		}

		userID, err := s.sid.GenString()
		if err != nil {
			return nil, fmt.Errorf("failed to generate user id: %w", err)
		}

		// Status: 1 = active if email is verified, 0 = pending activation
		status := 0
		if oidcUser.EmailVerified {
			status = 1
		}

		newUser := &model.User{
			UserID:         userID,
			Username:       username,
			HashedPassword: "",
			FullName:       fullName,
			Email:          email,
			AvatarURL:      oidcUser.Picture,
			Status:         status,
			AuthType:       "oidc",
			OIDCSUB:        oidcUser.Subject,
		}
		if err = s.userRepository.Create(ctx, newUser); err != nil {
			return nil, err
		}
		user = *newUser
		s.logger.Info("Created new OIDC user", zap.String("userID", userID), zap.String("email", email))
	} else if err != nil {
		return nil, err
	} else {
		// User already exists - update info
		s.logger.Info("OIDC user already exists, updating info", zap.String("username", username), zap.String("email", email))

		updateFields := map[string]interface{}{}
		if oidcUser.Picture != "" && user.AvatarURL != oidcUser.Picture {
			updateFields["avatar_url"] = oidcUser.Picture
		}
		if oidcUser.Name != "" && user.FullName != oidcUser.Name {
			updateFields["full_name"] = oidcUser.Name
		}
		if oidcUser.Subject != "" && user.OIDCSUB != oidcUser.Subject {
			updateFields["oidc_sub"] = oidcUser.Subject
		}
		// Always update auth_type to current login method
		updateFields["auth_type"] = "oidc"

		if len(updateFields) > 0 {
			if err = s.userRepository.Update(ctx, user.UserID, updateFields); err != nil {
				s.logger.Warn("failed to update OIDC user info", zap.Error(err))
			}
		}
	}

	// Assign roles (for both new and existing users)
	// Assign roles: default is "user", use OIDC role if provided
	role := "user"
	if oidcUser.Role != "" {
		role = strings.ToLower(oidcUser.Role)
	}
	roles := []string{role}
	s.logger.Info("Assigning OIDC role", zap.String("role", role), zap.String("userID", user.UserID))
	if err = s.userRepository.UpdateRoles(ctx, user.UserID, roles); err != nil {
		s.logger.Warn("failed to assign roles for OIDC user", zap.Error(err))
	}

	tokenPair, err := s.jwt.GenerateTokenPairWithExpiry(ctx, user.UserID, "", req.AutoLogin)
	if err != nil {
		return nil, err
	}

	s.audit.LogSuccess(ctx, audit.ActionLogin, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"username":  user.Username,
		"auth_type": "oidc",
	})

	return tokenPair, nil
}

func (s *authService) Logout(ctx context.Context, uid string) (*v1.LogoutData, error) {
	err := s.jwt.InvalidateRefreshTokenByUserID(ctx, uid)
	if err == nil {
		s.audit.LogSuccess(ctx, audit.ActionLogout, uid, "", "session", "", nil)
	}

	// Get OIDC end session URL for Single Logout
	logoutData := &v1.LogoutData{}
	oidcConfig := s.getOIDCConfig(ctx)
	if oidcConfig != nil && oidcConfig.Enabled && oidcConfig.Issuer != "" {
		// Create OIDC client to get end_session_endpoint from discovery
		oidcClient := oidc.NewOIDCClient(oidcConfig, s.logger.Logger)
		if err := oidcClient.Init(ctx); err == nil {
			logoutData.EndSessionURL = oidcClient.GetEndSessionURL()
		}
	}

	return logoutData, err
}

func (s *authService) RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.TokenData, error) {
	return s.jwt.RefreshAccessToken(ctx, req.RefreshToken)
}

func (s *authService) ForgotPassword(ctx context.Context, req *v1.ForgotPasswordRequest) error {
	user, err := s.userRepository.GetByEmail(ctx, req.Email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		s.audit.LogFailure(ctx, audit.ActionPasswordReset, "", "", "user", "", v1.ErrUnauthorized, map[string]interface{}{
			"email": req.Email,
		})
		return v1.ErrUnauthorized
	}
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordReset, "", "", "user", "", err, map[string]interface{}{
			"email": req.Email,
		})
		return v1.ErrInternalServerError
	}

	token, err := s.jwt.GenerateResetPasswordToken(user.Email)
	if err != nil {
		return fmt.Errorf("failed to generate reset password token: %w", err)
	}
	frontendBaseURL := s.GetFrontendBaseURLWithCtx(ctx)
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendBaseURL, token)
	teamSignature := s.getTeamSignature(ctx)

	if err = s.SendEmail(ctx, &email.Message{
		To:      []string{user.Email},
		Subject: constant.ResetPasswordSubject,
		Text:    fmt.Sprintf(constant.ResetPasswordTextTemplate, user.FullName, resetLink, teamSignature),
	}); err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordReset, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", err, map[string]interface{}{
			"email": req.Email,
		})
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionPasswordReset, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"email": req.Email,
	})
	return nil
}

func (s *authService) ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) error {
	email, err := s.jwt.ValidateResetPasswordToken(req.Token)
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordChange, "", "", "user", "", err, map[string]interface{}{
			"token": req.Token[:20] + "...",
		})
		return v1.ErrUnauthorized
	}

	user, err := s.userRepository.GetByEmail(ctx, email)
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordChange, "", "", "user", "", err, map[string]interface{}{
			"email": email,
		})
		return v1.ErrInternalServerError
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err = s.userRepository.Update(ctx, user.UserID, map[string]interface{}{
		"hashed_password": string(hashedPassword),
	}); err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordChange, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", err, nil)
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionPasswordChange, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"email": email,
	})
	return nil
}
