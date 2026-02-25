package storage

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

// Config holds S3/MinIO configuration
type Config struct {
	Endpoint   string
	AccessKey  string
	SecretKey  string
	BucketName string
	Secure     bool
	CACert     string // PEM-encoded CA certificate for self-signed certs
}

// Storage wraps minio client with bucket info
type Storage struct {
	*minio.Client
	Bucket string
}

// singleton holds the global storage service instance
var singleton struct {
	mu     sync.RWMutex
	logger *zap.Logger
	client *Storage
	config *Config
}

// Init initializes the storage service with a logger
// Must be called before using other functions
func Init(logger *zap.Logger) {
	singleton.mu.Lock()
	defer singleton.mu.Unlock()
	singleton.logger = logger
}

// Configure updates storage configuration and reconnects if changed
func Configure(cfg *Config) {
	if cfg == nil {
		return
	}

	singleton.mu.Lock()
	defer singleton.mu.Unlock()

	// Check if config changed
	if singleton.config != nil && configEqual(singleton.config, cfg) {
		return
	}

	// Skip if no endpoint
	if cfg.Endpoint == "" {
		singleton.client = nil
		singleton.config = cfg
		return
	}

	// Create transport with custom TLS config if CA cert provided
	var transport *http.Transport
	if cfg.Secure && cfg.CACert != "" {
		caCertPool := x509.NewCertPool()
		if !caCertPool.AppendCertsFromPEM([]byte(cfg.CACert)) {
			if singleton.logger != nil {
				singleton.logger.Warn("failed to parse CA certificate for S3 storage")
			}
			singleton.client = nil
			singleton.config = cfg
			return
		}
		transport = &http.Transport{
			TLSClientConfig: &tls.Config{
				RootCAs: caCertPool,
			},
		}
	} else {
		// Use default transport for non-secure or no custom CA
		transport = http.DefaultTransport.(*http.Transport)
	}

	// Create new client
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:     credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure:    cfg.Secure,
		Transport: transport,
	})
	if err != nil {
		if singleton.logger != nil {
			singleton.logger.Warn("failed to initialize S3 storage client", zap.Error(err))
		}
		singleton.client = nil
		singleton.config = cfg
		return
	}

	// Check bucket
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	exists, err := client.BucketExists(ctx, cfg.BucketName)
	if err != nil {
		if singleton.logger != nil {
			singleton.logger.Warn("failed to check bucket existence", zap.Error(err))
		}
		singleton.client = nil
		singleton.config = cfg
		return
	}
	if !exists {
		if err := client.MakeBucket(ctx, cfg.BucketName, minio.MakeBucketOptions{}); err != nil {
			if singleton.logger != nil {
				singleton.logger.Warn("failed to create bucket", zap.Error(err))
			}
			singleton.client = nil
			singleton.config = cfg
			return
		}
	}

	// Set bucket policy to public read for avatar access
	policy := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {"AWS": ["*"]},
				"Action": ["s3:GetObject"],
				"Resource": ["arn:aws:s3:::%s/*"]
			}
		]
	}`, cfg.BucketName)
	if err := client.SetBucketPolicy(ctx, cfg.BucketName, policy); err != nil {
		if singleton.logger != nil {
			singleton.logger.Warn("failed to set bucket policy, avatar files may not be publicly accessible", zap.Error(err))
		}
	} else if singleton.logger != nil {
		singleton.logger.Info("bucket policy set to public read", zap.String("bucket", cfg.BucketName))
	}

	singleton.client = &Storage{
		Client: client,
		Bucket: cfg.BucketName,
	}
	singleton.config = cfg
	if singleton.logger != nil {
		singleton.logger.Info("S3 storage client connected", zap.String("endpoint", cfg.Endpoint), zap.String("bucket", cfg.BucketName))
	}
}

// Client returns the current storage client (may be nil if not configured)
func Client() *Storage {
	singleton.mu.RLock()
	defer singleton.mu.RUnlock()
	return singleton.client
}

// IsConfigured returns true if storage is configured and connected
func IsConfigured() bool {
	singleton.mu.RLock()
	defer singleton.mu.RUnlock()
	return singleton.client != nil
}

func configEqual(a, b *Config) bool {
	return a.Endpoint == b.Endpoint &&
		a.AccessKey == b.AccessKey &&
		a.SecretKey == b.SecretKey &&
		a.BucketName == b.BucketName &&
		a.Secure == b.Secure &&
		a.CACert == b.CACert
}

// ParseConfig creates Config from a settings map
// Keys: s3_endpoint, s3_access_key, s3_secret_key, s3_bucket_name, s3_secure, s3_ca_cert
func ParseConfig(settings map[string]string) *Config {
	cfg := &Config{}

	if v, ok := settings["s3_endpoint"]; ok {
		v = strings.TrimSpace(v)
		// Remove http:// or https:// prefix for minio client
		v = strings.TrimPrefix(v, "http://")
		v = strings.TrimPrefix(v, "https://")
		v = strings.TrimSuffix(v, "/")
		cfg.Endpoint = v
	}
	if v, ok := settings["s3_access_key"]; ok {
		cfg.AccessKey = v
	}
	if v, ok := settings["s3_secret_key"]; ok {
		cfg.SecretKey = v
	}
	if v, ok := settings["s3_bucket_name"]; ok {
		cfg.BucketName = strings.TrimSpace(v)
	}
	if v, ok := settings["s3_secure"]; ok {
		cfg.Secure = v == "true"
	}
	if v, ok := settings["s3_ca_cert"]; ok {
		cfg.CACert = v
	}

	return cfg
}
