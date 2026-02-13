package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/email"
	"context"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(ctx context.Context, req *v1.RegisterRequest) error
	Login(ctx context.Context, req *v1.LoginRequest) (*v1.TokenPair, error)
	Logout(ctx context.Context, uid uint) error
	RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.TokenPair, error)
	ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) error
}

func NewAuthService(
	service *Service,
	userRepository repository.UserRepository,
) AuthService {
	return &authService{
		Service:        service,
		userRepository: userRepository,
	}
}

type authService struct {
	*Service
	userRepository repository.UserRepository
}

func (s *authService) Register(ctx context.Context, req *v1.RegisterRequest) error {
	_, err := s.userRepository.GetByEmail(ctx, req.Email)
	if err == nil {
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

	nickname := generateHumanNickname()

	user := &model.User{
		Username: defaultUsername,
		Password: string(hashedPassword),
		Nickname: nickname,
		Email:    req.Email,
		Status:   0,
	}
	err = s.tm.Transaction(ctx, func(ctx context.Context) error {
		if err = s.userRepository.Create(ctx, user); err != nil {
			return err
		}
		return nil
	})
	return err
}

func (s *authService) Login(ctx context.Context, req *v1.LoginRequest) (*v1.TokenPair, error) {
	user, err := s.userRepository.GetByUsernameOrEmail(ctx, req.Username, req.Username)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, v1.ErrUnauthorized
	}
	if err != nil {
		return nil, v1.ErrInternalServerError
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, err
	}

	tokenPair, err := s.jwt.GenerateTokenPair(ctx, user.ID, "")
	if err != nil {
		return nil, err
	}

	return tokenPair, nil
}

func (s *authService) Logout(ctx context.Context, uid uint) error {
	return s.jwt.InvalidateRefreshTokenByUserID(ctx, uid)
}

func (s *authService) RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.TokenPair, error) {
	return s.jwt.RefreshAccessToken(ctx, req.RefreshToken)
}

func (s *authService) ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) error {
	user, err := s.userRepository.GetByEmail(ctx, req.Email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return v1.ErrUnauthorized
	}
	if err != nil {
		return v1.ErrInternalServerError
	}

	token, err := s.jwt.GenerateResetPasswordToken(user.Email)
	if err != nil {
		return fmt.Errorf("failed to generate reset password token: %w", err)
	}
	resetLink := fmt.Sprintf("https://vibe-testing.com/reset-password?token=%s", token)

	if err = s.email.Send(&email.Message{
		To:      []string{user.Email},
		Subject: constant.ResetPasswordSubject,
		Text:    fmt.Sprintf(constant.ResetPasswordTextTemplate, user.Nickname, resetLink),
	}); err != nil {
		return err
	}

	return nil
}
