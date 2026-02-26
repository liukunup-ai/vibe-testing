package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/audit"
	"backend/pkg/email"
	"context"
	cryptoRand "crypto/rand"
	"crypto/md5"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	mathRand "math/rand"
	"strings"
	"time"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	List(ctx context.Context, req *v1.UserSearchRequest) (*v1.UserSearchResponseData, error)
	Create(ctx context.Context, req *v1.UserRequest) error
	Update(ctx context.Context, uid string, req *v1.UserRequest) error
	Delete(ctx context.Context, uid string) error
	Get(ctx context.Context, uid string) (*v1.UserDataItem, error)

	GetMenu(ctx context.Context, uid string) (*v1.DynamicMenuResponseData, error)

	UpdatePassword(ctx context.Context, uid string, req *v1.UpdatePasswordRequest) error

	UploadAvatar(ctx context.Context, uid string, req *v1.AvatarRequest, reader io.Reader) error

	SendResetEmail(ctx context.Context, uid string) error
	RevokeSessions(ctx context.Context, uid string) error
	UpdateStatus(ctx context.Context, uid string, status int) error
	ResetAvatar(ctx context.Context, uid string) error
}

func NewUserService(
	service *Service,
	userRepository repository.UserRepository,
	roleRepository repository.RoleRepository,
	menuRepository repository.MenuRepository,
	avatarStorage repository.AvatarStorage,
) UserService {
	return &userService{
		Service:        service,
		userRepository: userRepository,
		roleRepository: roleRepository,
		menuRepository: menuRepository,
		avatarStorage:  avatarStorage,
	}
}

const (
	minioPrefix = "minio://"
	localPrefix = "local://"
)

type userService struct {
	*Service
	userRepository repository.UserRepository
	roleRepository repository.RoleRepository
	menuRepository repository.MenuRepository
	avatarStorage  repository.AvatarStorage
}

// getGravatarURL returns Gravatar URL if configured, otherwise empty string
func (s *userService) getGravatarURL(ctx context.Context, email string) string {
	// Get gravatar endpoint from settings
	gravatarEndpoint := s.cfg.GetString("app.gravatar_endpoint")
	if gravatarEndpoint == "" {
		return ""
	}

	// Generate MD5 hash of lowercase email
	hash := md5.Sum([]byte(strings.ToLower(email)))
	return fmt.Sprintf("%s/%x", gravatarEndpoint, hash)
}

func (s *userService) List(ctx context.Context, req *v1.UserSearchRequest) (*v1.UserSearchResponseData, error) {
	// 获取用户列表
	list, total, err := s.userRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.UserSearchResponseData{
		List:  make([]v1.UserDataItem, 0),
		Total: total,
	}
	for _, user := range list {
		// 获取用户角色
		roles, err := s.userRepository.GetRoles(ctx, user.UserID)
		if err != nil {
			s.logger.Error("userRepository.GetUserRoles error", zap.Error(err))
			continue
		}
		// 转成角色对象
		roleList := make([]v1.RoleDataItem, 0)
		if len(roles) > 0 {
			for _, role := range roles {
				m, err2 := s.roleRepository.GetByCasbinRole(ctx, role)
				if err2 != nil {
					s.logger.Error("roleRepository.GetRoleByCasbinRole error", zap.Error(err2))
					continue
				}
				roleList = append(roleList, v1.RoleDataItem{
					ID:         m.ID,
					Name:       m.Name,
					CasbinRole: m.CasbinRole,
				})
			}
		}
		// Convert avatar URL from storage prefix (local://, minio://) to actual URL
		avatarURL := user.AvatarURL
		if avatarURL != "" && (strings.HasPrefix(avatarURL, localPrefix) || strings.HasPrefix(avatarURL, minioPrefix)) {
			if convertedURL, err := s.avatarStorage.GetURL(ctx, avatarURL); err == nil {
				avatarURL = convertedURL
			}
		}
		// If still no avatar, try Gravatar
		if avatarURL == "" {
			avatarURL = s.getGravatarURL(ctx, user.Email)
		}
		data.List = append(data.List, v1.UserDataItem{
			CreatedAt: user.CreatedAt.Format(constant.DateTimeLayout),
			UpdatedAt: user.UpdatedAt.Format(constant.DateTimeLayout),
			UserID:    user.UserID,
			Email:     user.Email,
			Username:  user.Username,
			Phone:     user.Phone,
			AvatarURL: avatarURL,
			FullName:  user.FullName,
			Bio:       user.Bio,
			Language:  user.Language,
			Timezone:  user.Timezone,
			Theme:     user.Theme,
			Direction: user.Direction,
			Status:    user.Status,
			Roles:     roleList,
		})
	}

	return data, nil
}

func (s *userService) Create(ctx context.Context, req *v1.UserRequest) error {
	var err error

	// 检查邮箱是否已存在
	_, err = s.userRepository.GetByEmail(ctx, req.Email)
	if err == nil {
		return v1.ErrEmailAlreadyUse
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return v1.ErrInternalServerError
	}

	// 检查用户名是否已存在
	_, err = s.userRepository.GetByUsername(ctx, req.Username)
	if err == nil {
		return v1.ErrUsernameAlreadyUse
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return v1.ErrInternalServerError
	}

	// 使用随机生成的密码
	randomPassword := generateRandomPassword(16)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 使用随机生成的昵称
	fullName := req.FullName
	if fullName == "" {
		fullName = generateHumanNickname()
	}

	// 构造新用户对象
	newUser := &model.User{
		Email:          req.Email,
		Username:       req.Username,
		HashedPassword: string(hashedPassword), // 用户通过邮箱激活账户并设置新密码
		FullName:       fullName,
		Bio:            req.Bio,
		Language:       req.Language,
		Timezone:       req.Timezone,
		Theme:          req.Theme,
		Status:         req.Status,
	}
	// 创建用户
	if err = s.userRepository.Create(ctx, newUser); err != nil {
		return err
	}
	// 设置角色
	if err = s.userRepository.UpdateRoles(ctx, newUser.UserID, req.Roles); err != nil {
		return err
	}
	return err
}

func (s *userService) Update(ctx context.Context, uid string, req *v1.UserRequest) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}
	if req.Roles != nil {
		err = s.userRepository.UpdateRoles(ctx, user.UserID, req.Roles)
		if err != nil {
			return err
		}
	}
	data := map[string]interface{}{}
	if req.Email != "" {
		data["email"] = req.Email
	}
	if req.Username != "" {
		data["username"] = req.Username
	}
	if req.Phone != "" {
		data["phone"] = req.Phone
	}
	if req.FullName != "" {
		data["fullname"] = req.FullName
	}
	if req.Bio != "" {
		data["bio"] = req.Bio
	}
	if req.Language != "" {
		data["language"] = req.Language
	}
	if req.Timezone != "" {
		data["timezone"] = req.Timezone
	}
	if req.Theme != "" {
		data["theme"] = req.Theme
	}
	if req.Direction != "" {
		data["direction"] = req.Direction
	}
	if req.Status != 0 {
		data["status"] = req.Status
	}
	if len(data) == 0 {
		return nil
	}
	return s.userRepository.Update(ctx, uid, data)
}

func (s *userService) Delete(ctx context.Context, uid string) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}
	err = s.userRepository.DeleteRoles(ctx, user.UserID)
	if err != nil {
		return err
	}
	// 删除用户
	return s.userRepository.Delete(ctx, uid)
}

func (s *userService) Get(ctx context.Context, uid string) (*v1.UserDataItem, error) {
	// 获取用户
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		s.logger.WithContext(ctx).Error("userRepository.Get error", zap.Error(err))
		return nil, err
	}
	// 获取用户角色
	roles, err := s.userRepository.GetRoles(ctx, user.UserID)
	if err != nil {
		s.logger.WithContext(ctx).Error("userRepository.GetRoles error", zap.Error(err))
		return nil, err
	}
	// 转成角色对象
	roleList := make([]v1.RoleDataItem, 0)
	if len(roles) > 0 {
		for _, role := range roles {
			m, err2 := s.roleRepository.GetByCasbinRole(ctx, role)
			if err2 != nil {
				s.logger.Error("roleRepository.GetRoleByCasbinRole error", zap.Error(err2))
				continue
			}
			roleList = append(roleList, v1.RoleDataItem{
				ID:         m.ID,
				Name:       m.Name,
				CasbinRole: m.CasbinRole,
			})
		}
	}
	// Convert avatar URL from storage prefix (local://, minio://) to actual URL
	avatarURL := user.AvatarURL
	if avatarURL != "" && (strings.HasPrefix(avatarURL, localPrefix) || strings.HasPrefix(avatarURL, minioPrefix)) {
		if convertedURL, err := s.avatarStorage.GetURL(ctx, avatarURL); err == nil {
			avatarURL = convertedURL
		}
	}
	// If no avatar, try Gravatar
	if avatarURL == "" {
		avatarURL = s.getGravatarURL(ctx, user.Email)
	}
	return &v1.UserDataItem{
		CreatedAt: user.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt: user.UpdatedAt.Format(constant.DateTimeLayout),
		UserID:    user.UserID,
		Email:     user.Email,
		Phone:     user.Phone,
		Username:  user.Username,
		FullName:  user.FullName,
		AvatarURL: avatarURL,
		Bio:       user.Bio,
		Language:  user.Language,
		Timezone:  user.Timezone,
		Theme:     user.Theme,
		Direction: user.Direction,
		Status:    user.Status,
		Roles:     roleList,
	}, nil
}

func (s *userService) GetByUserID(ctx context.Context, uid string) (*v1.UserDataItem, error) {
	// 获取用户
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		s.logger.WithContext(ctx).Error("userRepository.GetByUserID error", zap.Error(err))
		return nil, err
	}
	// 获取用户角色
	roles, err := s.userRepository.GetRoles(ctx, user.UserID)
	if err != nil {
		s.logger.WithContext(ctx).Error("userRepository.GetRoles error", zap.Error(err))
		return nil, err
	}
	// 转成角色对象
	roleList := make([]v1.RoleDataItem, 0)
	if len(roles) > 0 {
		for _, role := range roles {
			m, err2 := s.roleRepository.GetByCasbinRole(ctx, role)
			if err2 != nil {
				s.logger.Error("roleRepository.GetRoleByCasbinRole error", zap.Error(err2))
				continue
			}
			roleList = append(roleList, v1.RoleDataItem{
				ID:         m.ID,
				Name:       m.Name,
				CasbinRole: m.CasbinRole,
			})
		}
	}
	// Convert avatar URL from storage prefix (local://, minio://) to actual URL
	avatarURL := user.AvatarURL
	if avatarURL != "" && (strings.HasPrefix(avatarURL, localPrefix) || strings.HasPrefix(avatarURL, minioPrefix)) {
		if convertedURL, err := s.avatarStorage.GetURL(ctx, avatarURL); err == nil {
			avatarURL = convertedURL
		}
	}
	// If still no avatar, try Gravatar
	if avatarURL == "" {
		avatarURL = s.getGravatarURL(ctx, user.Email)
	}
	return &v1.UserDataItem{
		UserID:    user.UserID,
		CreatedAt: user.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt: user.UpdatedAt.Format(constant.DateTimeLayout),
		Email:     user.Email,
		Username:  user.Username,
		Phone:     user.Phone,
		FullName:  user.FullName,
		AvatarURL: avatarURL,
		Bio:       user.Bio,
		Language:  user.Language,
		Timezone:  user.Timezone,
		Theme:     user.Theme,
		Direction: user.Direction,
		Status:    user.Status,
		Roles:     roleList,
	}, nil
}

func (s *userService) GetMenu(ctx context.Context, uid string) (*v1.DynamicMenuResponseData, error) {
	menuList, err := s.menuRepository.ListAll(ctx)
	if err != nil {
		s.logger.WithContext(ctx).Error("menuRepository.ListAll error", zap.Error(err))
		return nil, err
	}

	permList, err := s.userRepository.GetPermissions(ctx, uid)
	if err != nil {
		s.logger.WithContext(ctx).Error("userRepository.GetPermissions error", zap.Error(err))
		return nil, err
	}

	// 构建菜单权限映射
	permMap := map[string]struct{}{}
	for _, permission := range permList {
		if len(permission) == 3 && strings.HasPrefix(permission[1], constant.MenuResourcePrefix) {
			permMap[strings.TrimPrefix(permission[1], constant.MenuResourcePrefix)] = struct{}{}
		}
	}

	// -------------------- 构建动态菜单 --------------------
	// 第一轮遍历 构建ID到节点的映射
	menuMap := make(map[uint]*v1.MenuNode)
	for _, menu := range menuList {
		// 权限过滤
		if _, ok := permMap[menu.Path]; !ok {
			continue
		}
		// 构建节点
		menuNode := &v1.MenuNode{
			MenuDataItem: v1.MenuDataItem{
				ID:                 menu.ID,
				ParentID:           menu.ParentID,
				Icon:               menu.Icon,
				Name:               menu.Name,
				Path:               menu.Path,
				Component:          menu.Component,
				Access:             menu.Access,
				Locale:             menu.Locale,
				Redirect:           menu.Redirect,
				Target:             menu.Target,
				HideChildrenInMenu: menu.HideChildrenInMenu,
				HideInMenu:         menu.HideInMenu,
				FlatMenu:           menu.FlatMenu,
				Disabled:           menu.Disabled,
				Tooltip:            menu.Tooltip,
				DisabledTooltip:    menu.DisabledTooltip,
				Key:                menu.Key,
				ParentKeys:         menu.ParentKeys,
			},
			Children: make([]*v1.MenuNode, 0),
		}
		menuMap[menu.ID] = menuNode
	}

	// 第二轮遍历 构建树结构
	menuRoot := make([]*v1.MenuNode, 0)
	for _, menu := range menuList {
		// 权限过滤
		if _, ok := permMap[menu.Path]; !ok {
			continue
		}

		menuNode := menuMap[menu.ID]

		if menu.ParentID == 0 { // 顶级菜单
			menuRoot = append(menuRoot, menuNode)
		} else { // 子菜单
			if parent, ok := menuMap[menu.ParentID]; ok {
				parent.Children = append(parent.Children, menuNode)
			}
		}
	}

	data := &v1.DynamicMenuResponseData{
		List: menuRoot,
	}
	return data, nil
}

func (s *userService) UpdatePassword(ctx context.Context, uid string, req *v1.UpdatePasswordRequest) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.OldPassword))
	if err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordChange, fmt.Sprintf("%d", uid), user.UserID, "user", "", v1.ErrUnauthorized, nil)
		return v1.ErrUnauthorized
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err = s.userRepository.Update(ctx, uid, map[string]interface{}{
		"hashed_password": string(hashedPassword),
	}); err != nil {
		s.audit.LogFailure(ctx, audit.ActionPasswordChange, uid, user.UserID, "user", "", err, nil)
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionPasswordChange, uid, user.UserID, "user", "", nil)
	return nil
}

func (s *userService) UploadAvatar(ctx context.Context, uid string, req *v1.AvatarRequest, reader io.Reader) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	// Validate file size (max 2MB)
	if req.Size > 2*1024*1024 {
		return v1.ErrAvatarSizeExceeded
	}

	// Validate file type
	allowedTypes := []string{"image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/gif", "image/webp"}
	isValidType := false
	for _, t := range allowedTypes {
		if req.Type == t {
			isValidType = true
			break
		}
	}
	if !isValidType {
		return v1.ErrAvatarTypeInvalid
	}

	req.UserID = uid

	avatarURL, err := s.avatarStorage.SaveToMinIO(ctx, req, reader)
	if err != nil {
		s.logger.WithContext(ctx).Warn("upload avatar to minio error", zap.Error(err))

		s.logger.WithContext(ctx).Info("try to save avatar to local")
		avatarURL, err = s.avatarStorage.SaveToLocal(ctx, req, reader)
		if err != nil {
			s.logger.WithContext(ctx).Error("save avatar to local error", zap.Error(err))
			s.audit.LogFailure(ctx, audit.ActionAvatarUpload, uid, user.UserID, "avatar", "", err, map[string]interface{}{
				"filename": req.Filename,
				"size":     req.Size,
		})
			return err
		}
	}

	// Convert internal URL format to actual URL before saving
	if actualURL, err := s.avatarStorage.GetURL(ctx, avatarURL); err == nil {
		avatarURL = actualURL
	}
	if err = s.userRepository.Update(ctx, uid, map[string]interface{}{
		"avatarUrl": avatarURL,
	}); err != nil {
		s.logger.WithContext(ctx).Error("update user avatar error", zap.Error(err))
		s.audit.LogFailure(ctx, audit.ActionAvatarUpload, uid, user.UserID, "avatar", "", err, map[string]interface{}{
			"filename": req.Filename,
		})
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionAvatarUpload, uid, user.UserID, "avatar", "", map[string]interface{}{
		"filename": req.Filename,
		"size":     req.Size,
	})
	return nil
}

func (s *userService) SendResetEmail(ctx context.Context, uid string) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	token, err := s.jwt.GenerateResetPasswordToken(user.Email)
	if err != nil {
		return fmt.Errorf("failed to generate reset password token: %w", err)
	}

	frontendBaseURL := s.GetFrontendBaseURLWithCtx(ctx)
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendBaseURL, token)
	teamSignature := s.GetTeamSignature(ctx)

	msg := &email.Message{
		To:      []string{user.Email},
		Subject: constant.ResetPasswordSubject,
		Text:    fmt.Sprintf(constant.ResetPasswordTextTemplate, user.FullName, resetLink, teamSignature),
	}

	if err = s.SendEmail(ctx, msg); err != nil {
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionPasswordReset, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"email": user.Email,
	})
	return nil
}

func (s *userService) RevokeSessions(ctx context.Context, uid string) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	if err := s.jwt.InvalidateRefreshTokenByUserID(ctx, user.UserID); err != nil {
		s.logger.WithContext(ctx).Error("revoke sessions error", zap.Error(err))
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionLogout, fmt.Sprintf("%d", user.ID), user.UserID, "session", "", nil)
	return nil
}

func (s *userService) UpdateStatus(ctx context.Context, uid string, status int) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	if err = s.userRepository.Update(ctx, uid, map[string]interface{}{
		"status": status,
	}); err != nil {
		s.logger.WithContext(ctx).Error("update status error", zap.Error(err))
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionUserUpdate, fmt.Sprintf("%d", user.ID), user.UserID, "user", "", map[string]interface{}{
		"status": status,
	})
	return nil
}

func (s *userService) ResetAvatar(ctx context.Context, uid string) error {
	user, err := s.userRepository.Get(ctx, uid)
	if err != nil {
		return err
	}

	if err = s.userRepository.Update(ctx, uid, map[string]interface{}{
		"avatar_url": "",
	}); err != nil {
		s.logger.WithContext(ctx).Error("reset avatar error", zap.Error(err))
		return err
	}

	s.audit.LogSuccess(ctx, audit.ActionAvatarUpload, fmt.Sprintf("%d", user.ID), user.UserID, "avatar", "", map[string]interface{}{
		"action": "reset",
	})
	return nil
}

func generateRandomPassword(length int) string {
	b := make([]byte, length)
	_, err := cryptoRand.Read(b)
	if err != nil {
		panic(err)
	}
	return base64.StdEncoding.EncodeToString(b)
}

func generateHumanNickname() string {

	adjectives := []string{
		"阳光的", "温柔的", "睿智的", "活泼的", "优雅的",
		"勇敢的", "幽默的", "神秘的", "开朗的", "沉稳的",
		"可爱的", "聪明的", "热情的", "冷静的", "浪漫的",
		"乐观的", "坚强的", "细心的", "真诚的", "大方的",
		"自由的", "独特的", "时尚的", "古典的", "现代的",
		"快乐的", "宁静的", "梦幻的", "激情的", "稳重的",
	}

	nouns := []string{
		"小明", "小华", "子轩", "雨桐", "浩然",
		"诗涵", "宇航", "欣怡", "俊杰", "雅婷",
		"志强", "美玲", "文博", "雪梅", "家豪",
		"丽娜", "建国", "婷婷", "海涛", "静怡",
		"小龙", "佳琪", "宏伟", "芳芳", "志明",
		"小雨", "天宇", "思琪", "大伟", "梦瑶",
	}

	seededRand := mathRand.New(mathRand.NewSource(time.Now().UnixNano()))
	return adjectives[seededRand.Intn(len(adjectives))] + nouns[seededRand.Intn(len(nouns))]
}
