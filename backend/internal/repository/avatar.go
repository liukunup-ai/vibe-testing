package repository

import (
	v1 "backend/api/v1"
	"backend/pkg/storage"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/spf13/viper"
)

const (
	basePath    = "storage/avatar"
	minioPrefix = "minio://"
	localPrefix = "local://"
	httpPrefix  = "http://"
	httpsPrefix = "https://"
)

type AvatarStorage interface {
	SaveToMinIO(ctx context.Context, req *v1.AvatarRequest, reader io.Reader) (string, error)
	SaveToLocal(ctx context.Context, req *v1.AvatarRequest, reader io.Reader) (string, error)
	GetURL(ctx context.Context, avatar string) (string, error)
}

func NewAvatarStorage(
	repository *Repository,
	cfg *viper.Viper,
) AvatarStorage {
	return &avatarStorage{
		Repository: repository,
		cfg:        cfg,
	}
}

type avatarStorage struct {
	*Repository
	cfg *viper.Viper
}

func (r *avatarStorage) objectName(uid string, filename string) string {
	return fmt.Sprintf("%s/%s/%s", basePath, uid, filename)
}

func (r *avatarStorage) getMinIO() *storage.Storage {
	return storage.Client()
}

func (r *avatarStorage) SaveToMinIO(ctx context.Context, req *v1.AvatarRequest, reader io.Reader) (string, error) {
	m := r.getMinIO()
	if m == nil {
		return "", v1.ErrS3NotConfigured
	}

	exists, err := m.BucketExists(ctx, m.Bucket)
	if err != nil {
		return "", fmt.Errorf("failed to check bucket existence: %w", err)
	}
	if !exists {
		return "", fmt.Errorf("bucket does not exist")
	}

	objectName := r.objectName(req.UserID, req.Filename)

	_, err = m.PutObject(ctx, m.Bucket, objectName, reader, req.Size,
		minio.PutObjectOptions{
			ContentType: req.Type,
			UserMetadata: map[string]string{
				"x-amz-acl": "public-read",
			},
		})
	if err != nil {
		return "", fmt.Errorf("failed to upload file to storage: %w", err)
	}

	return fmt.Sprintf("%s%s/%s", minioPrefix, m.Bucket, objectName), nil
}

func (r *avatarStorage) SaveToLocal(ctx context.Context, req *v1.AvatarRequest, reader io.Reader) (string, error) {
	userDir := filepath.Join(basePath, req.UserID)
	if err := os.MkdirAll(userDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create user directory: %w", err)
	}

	filePath := filepath.Join(userDir, req.Filename)

	file, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, reader); err != nil {
		return "", fmt.Errorf("failed to write file content: %w", err)
	}

	return fmt.Sprintf("%s%s", localPrefix, filePath), nil
}

func (r *avatarStorage) GetURL(ctx context.Context, avatar string) (string, error) {
	if strings.HasPrefix(avatar, minioPrefix) {
		m := r.getMinIO()
		if m == nil {
			return "", v1.ErrS3NotConfigured
		}
		noPrefix := strings.TrimPrefix(avatar, minioPrefix)
		// Ensure proper URL formatting with slash between endpoint and path
		endpoint := m.EndpointURL().String()
		if !strings.HasSuffix(endpoint, "/") && !strings.HasPrefix(noPrefix, "/") {
			endpoint += "/"
		}
		return endpoint + noPrefix, nil
	}

	if strings.HasPrefix(avatar, localPrefix) {
		noPrefix := strings.TrimPrefix(avatar, localPrefix)
		// Use frontend base URL from config, or fall back to server address
		baseURL := r.cfg.GetString("site.frontend_base_url")
		if baseURL == "" {
			host := r.cfg.GetString("http.host")
			port := r.cfg.GetInt("http.port")
			if host == "" {
				host = "localhost"
			}
			if port == 0 {
				port = 7001
			}
			baseURL = fmt.Sprintf("http://%s:%d", host, port)
		}
		return fmt.Sprintf("%s/%s", baseURL, noPrefix), nil
	}

	if strings.HasPrefix(avatar, httpPrefix) || strings.HasPrefix(avatar, httpsPrefix) {
		return avatar, nil
	}

	return avatar, fmt.Errorf("unknown avatar prefix")
}
