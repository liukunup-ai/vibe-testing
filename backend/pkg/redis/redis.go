package redis

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Config holds Redis configuration
type Config struct {
	Addrs        []string
	Password     string
	DB           int
	ReadTimeout  int // seconds, default 3
	WriteTimeout int // seconds, default 3
}

// singleton holds the global Redis service instance
var singleton struct {
	mu     sync.RWMutex
	logger *zap.Logger
	client redis.UniversalClient
	config *Config
}

// Init initializes the Redis service with a logger
// Must be called before using other functions
func Init(logger *zap.Logger) {
	singleton.mu.Lock()
	defer singleton.mu.Unlock()
	singleton.logger = logger
}

// Configure updates Redis configuration and reconnects if changed
func Configure(cfg *Config) {
	if cfg == nil {
		return
	}

	// Default timeout 3 seconds
	if cfg.ReadTimeout == 0 {
		cfg.ReadTimeout = 3
	}
	if cfg.WriteTimeout == 0 {
		cfg.WriteTimeout = 3
	}

	singleton.mu.Lock()
	defer singleton.mu.Unlock()

	// Check if config changed
	if singleton.config != nil && configEqual(singleton.config, cfg) {
		return
	}

	// Close old client
	if singleton.client != nil {
		_ = singleton.client.Close()
		singleton.client = nil
	}

	// Skip if no addresses
	if len(cfg.Addrs) == 0 {
		singleton.config = cfg
		return
	}

	// Create new client
	client := redis.NewUniversalClient(&redis.UniversalOptions{
		Addrs:        cfg.Addrs,
		Password:     cfg.Password,
		DB:           cfg.DB,
		ReadTimeout:  time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := client.Ping(ctx).Result(); err != nil {
		if singleton.logger != nil {
			singleton.logger.Warn("failed to connect to Redis", zap.Error(err))
		}
		_ = client.Close()
		singleton.config = cfg
		return
	}

	singleton.client = client
	singleton.config = cfg
	if singleton.logger != nil {
		singleton.logger.Info("Redis client connected", zap.Strings("addrs", cfg.Addrs))
	}
}

// Client returns the current Redis client (may be nil if not configured)
func Client() redis.UniversalClient {
	singleton.mu.RLock()
	defer singleton.mu.RUnlock()
	return singleton.client
}

// IsConfigured returns true if Redis is configured and connected
func IsConfigured() bool {
	singleton.mu.RLock()
	defer singleton.mu.RUnlock()
	return singleton.client != nil
}

// Close closes the Redis client
func Close() error {
	singleton.mu.Lock()
	defer singleton.mu.Unlock()

	if singleton.client != nil {
		return singleton.client.Close()
	}
	return nil
}

func configEqual(a, b *Config) bool {
	if len(a.Addrs) != len(b.Addrs) {
		return false
	}
	for i := range a.Addrs {
		if a.Addrs[i] != b.Addrs[i] {
			return false
		}
	}
	return a.Password == b.Password &&
		a.DB == b.DB &&
		a.ReadTimeout == b.ReadTimeout &&
		a.WriteTimeout == b.WriteTimeout
}

// ParseConfig creates Config from a settings map
// Keys: redis_addrs, redis_password, redis_db, redis_read_timeout, redis_write_timeout
func ParseConfig(settings map[string]string) *Config {
	cfg := &Config{}

	if v, ok := settings["redis_addrs"]; ok && v != "" {
		cfg.Addrs = strings.Split(v, ",")
		for i, addr := range cfg.Addrs {
			cfg.Addrs[i] = strings.TrimSpace(addr)
		}
	}
	if v, ok := settings["redis_password"]; ok {
		cfg.Password = v
	}
	if v, ok := settings["redis_db"]; ok {
		fmt.Sscanf(v, "%d", &cfg.DB)
	}
	if v, ok := settings["redis_read_timeout"]; ok {
		fmt.Sscanf(v, "%d", &cfg.ReadTimeout)
	}
	if v, ok := settings["redis_write_timeout"]; ok {
		fmt.Sscanf(v, "%d", &cfg.WriteTimeout)
	}

	return cfg
}
