package repository

import (
	v1 "backend/api/v1"
	"backend/pkg/redis"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	redislib "github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

const (
	keyPrefix          = "token"
	nsAccess           = "access"
	nsRefresh          = "refresh"
	nsFamily           = "family"
	nsUserFamilies     = "user_families"
	maxPendingSyncSize = 1000000
)

type refreshTokenEntry struct {
	TokenID   string
	FamilyID  string
	UserID    string
	ExpiresAt time.Time
	Valid     bool
}

type TokenStore interface {
	StoreRefreshToken(ctx context.Context, tokenID string, familyID string, userID string, expiry time.Duration) error
	IsRefreshTokenValid(ctx context.Context, tokenID string, familyID string) (bool, error)
	InvalidateRefreshToken(ctx context.Context, tokenID string) error
	InvalidateRefreshTokenByFamilyID(ctx context.Context, familyID string) error
	InvalidateRefreshTokenByUserID(ctx context.Context, userID string) error
	RevokeAccessToken(ctx context.Context, tokenID string, expiry time.Duration) error
	IsAccessTokenRevoked(ctx context.Context, tokenID string) (bool, error)
}

func NewTokenStore(repository *Repository) TokenStore {
	s := &tokenStore{
		Repository:  repository,
		pendingSync: make(map[string]struct{}),
		stopChan:    make(chan struct{}),
	}

	s.healthTicker = time.NewTicker(10 * time.Second)
	go s.healthCheck()

	return s
}

type tokenStore struct {
	*Repository
	pendingSync  map[string]struct{}
	pendingMu    sync.Mutex
	mu           sync.RWMutex
	isRedisDown  bool
	healthTicker *time.Ticker
	stopChan     chan struct{}
}

func (s *tokenStore) getRedis() redislib.UniversalClient {
	return redis.Client()
}

func (s *tokenStore) key(namespace, id string) string {
	return fmt.Sprintf("%s:%s:%s", keyPrefix, namespace, id)
}

func (s *tokenStore) StoreRefreshToken(ctx context.Context, tokenID string, familyID string, userID string, expiry time.Duration) error {
	data := refreshTokenEntry{
		TokenID:   tokenID,
		FamilyID:  familyID,
		UserID:    userID,
		ExpiresAt: time.Now().Add(expiry),
		Valid:     true,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("marshal refresh token data failed: %w", err)
	}

	key := s.key(nsRefresh, tokenID)
	cached := s.cache.SetWithTTL(key, jsonData, int64(len(jsonData)), expiry)

	rdb := s.getRedis()
	if rdb == nil {
		if !cached {
			return fmt.Errorf("failed to store refresh token")
		}
		return nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		s.pendingMu.Lock()
		if len(s.pendingSync) >= maxPendingSyncSize {
			return fmt.Errorf("pending sync size exceeded %d, data will not be stored", maxPendingSyncSize)
		}
		s.pendingSync[key] = struct{}{}
		s.pendingMu.Unlock()

		if !cached {
			return fmt.Errorf("failed to store refresh token")
		}
		return nil
	}

	_, err = rdb.Pipelined(ctx, func(pipe redislib.Pipeliner) error {
		pipe.SetEx(ctx, key, jsonData, expiry)

		if familyID != "" {
			familyKey := s.key(nsFamily, familyID)
			pipe.SAdd(ctx, familyKey, tokenID)
			pipe.Expire(ctx, familyKey, expiry+15*time.Minute)
		}

		userFamiliesKey := s.key(nsUserFamilies, userID)
		pipe.SAdd(ctx, userFamiliesKey, familyID)
		pipe.Expire(ctx, userFamiliesKey, expiry+24*time.Hour)
		return nil
	})

	if err != nil {
		s.mu.Lock()
		s.isRedisDown = true
		s.mu.Unlock()

		if !cached {
			return fmt.Errorf("failed to store refresh token")
		}
	}
	return nil
}

func (s *tokenStore) IsRefreshTokenValid(ctx context.Context, tokenID string, familyID string) (bool, error) {
	key := s.key(nsRefresh, tokenID)

	if data, found := s.cache.Get(key); found {
		var token refreshTokenEntry
		if err := json.Unmarshal(data.([]byte), &token); err != nil {
			return false, fmt.Errorf("unmarshal token data from cache failed: %w", err)
		}
		return token.Valid &&
			(familyID == "" || token.FamilyID == familyID) &&
			time.Now().Before(token.ExpiresAt), nil
	}

	rdb := s.getRedis()
	if rdb == nil {
		return false, nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		return false, nil
	}

	data, err := rdb.Get(ctx, key).Bytes()
	switch {
	case err == redislib.Nil:
		return false, nil

	case err != nil:
		s.mu.Lock()
		s.isRedisDown = true
		s.mu.Unlock()

		return false, nil
	}

	var token refreshTokenEntry
	if err := json.Unmarshal(data, &token); err != nil {
		return false, fmt.Errorf("unmarshal token data from redis failed: %w", err)
	}

	s.cache.SetWithTTL(key, data, int64(len(data)), time.Until(token.ExpiresAt))

	return token.Valid &&
		(familyID == "" || token.FamilyID == familyID) &&
		time.Now().Before(token.ExpiresAt), nil
}

func (s *tokenStore) InvalidateRefreshToken(ctx context.Context, tokenID string) error {
	key := s.key(nsRefresh, tokenID)
	s.cache.Del(key)

	rdb := s.getRedis()
	if rdb == nil {
		return nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		return nil
	}

	script := `
	local key = KEYS[1]
	local data = redis.call('GET', key)
	if not data then return 0 end

	local token = cjson.decode(data)
	token['valid'] = false
	redis.call('SET', key, cjson.encode(token))
	return 1
	`

	_, err := rdb.Eval(ctx, script, []string{key}).Result()
	if err != nil && err != redislib.Nil {
		return fmt.Errorf("lua script failed: %w", err)
	}
	return nil
}

func (s *tokenStore) InvalidateRefreshTokenByFamilyID(ctx context.Context, familyID string) error {
	rdb := s.getRedis()
	if rdb == nil {
		return nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		return nil
	}

	familyKey := s.key(nsFamily, familyID)

	var cursor uint64
	for {
		var tokenIDs []string
		var err error
		tokenIDs, cursor, err = rdb.SScan(ctx, familyKey, cursor, "", 100).Result()
		if err != nil {
			return fmt.Errorf("scan family failed: %w", err)
		}

		for _, tokenID := range tokenIDs {
			if err := s.InvalidateRefreshToken(ctx, tokenID); err != nil {
				s.logger.Warn("skip token invalidation", zap.Error(err))
				continue
			}
		}

		if cursor == 0 {
			break
		}
	}
	return nil
}

func (s *tokenStore) InvalidateRefreshTokenByUserID(ctx context.Context, userID string) error {
	rdb := s.getRedis()
	if rdb == nil {
		return nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		return nil
	}

	userFamiliesKey := s.key(nsUserFamilies, userID)

	var cursor uint64
	for {
		var familyIDs []string
		var err error
		familyIDs, cursor, err = rdb.SScan(ctx, userFamiliesKey, cursor, "", 100).Result()
		if err != nil {
			return fmt.Errorf("scan user families failed: %w", err)
		}

		for _, familyID := range familyIDs {
			if err := s.InvalidateRefreshTokenByFamilyID(ctx, familyID); err != nil {
				s.logger.Warn("skip family invalidation", zap.Error(err))
				continue
			}
		}
		if cursor == 0 {
			break
		}
	}
	return nil
}

func (s *tokenStore) RevokeAccessToken(ctx context.Context, tokenID string, expiry time.Duration) error {
	key := s.key(nsAccess, tokenID)
	val := "1"

	cached := s.cache.SetWithTTL(key, val, int64(len(val)), expiry)

	rdb := s.getRedis()
	if rdb == nil {
		if !cached {
			return fmt.Errorf("failed to store access token")
		}
		return nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		s.pendingMu.Lock()
		if len(s.pendingSync) >= maxPendingSyncSize {
			return fmt.Errorf("pending sync size exceeded %d, data will not be stored", maxPendingSyncSize)
		}
		s.pendingSync[key] = struct{}{}
		s.pendingMu.Unlock()

		if !cached {
			return fmt.Errorf("failed to store access token")
		}
		return nil
	}

	ok, err := rdb.SetNX(ctx, key, val, expiry).Result()
	if err != nil {
		s.mu.Lock()
		s.isRedisDown = true
		s.mu.Unlock()

		if !cached {
			return fmt.Errorf("failed to store access token")
		}
		return nil
	}
	if !ok {
		return v1.ErrTokenAlreadyRevoked
	}
	return nil
}

func (s *tokenStore) IsAccessTokenRevoked(ctx context.Context, tokenID string) (bool, error) {
	key := s.key(nsAccess, tokenID)
	val := "1"

	_, found := s.cache.Get(key)
	if found {
		return true, nil
	}

	rdb := s.getRedis()
	if rdb == nil {
		return false, nil
	}

	s.mu.RLock()
	redisDown := s.isRedisDown
	s.mu.RUnlock()

	if redisDown {
		return false, nil
	}

	exists, err := rdb.Exists(ctx, key).Result()
	if err != nil {
		s.mu.Lock()
		s.isRedisDown = true
		s.mu.Unlock()

		return false, nil
	}

	expiry, err := rdb.TTL(ctx, key).Result()
	if err != nil {
		s.mu.Lock()
		s.isRedisDown = true
		s.mu.Unlock()

		return exists > 0, nil
	}
	s.cache.SetWithTTL(key, val, int64(len(val)), expiry)

	return exists > 0, nil
}

func (s *tokenStore) syncPendingToRedis(ctx context.Context, rdb redislib.UniversalClient) error {
	if rdb == nil {
		return nil
	}

	s.pendingMu.Lock()
	defer s.pendingMu.Unlock()

	if len(s.pendingSync) == 0 {
		return nil
	}

	batchSize := 100
	keys := make([]string, 0, len(s.pendingSync))
	for key := range s.pendingSync {
		keys = append(keys, key)
	}

	for i := 0; i < len(keys); i += batchSize {
		end := i + batchSize
		if end > len(keys) {
			end = len(keys)
		}
		batch := keys[i:end]

		_, err := rdb.Pipelined(ctx, func(pipe redislib.Pipeliner) error {
			for _, key := range batch {
				data, found := s.cache.Get(key)
				if !found {
					continue
				}
				expiry, found := s.cache.GetTTL(key)
				if !found {
					continue
				}

				switch {
				case strings.HasPrefix(key, s.key(nsRefresh, "")):
					var token refreshTokenEntry
					if err := json.Unmarshal(data.([]byte), &token); err != nil {
						continue
					}

					pipe.SetEx(ctx, key, data, expiry)

					if token.FamilyID != "" {
						familyKey := s.key(nsFamily, token.FamilyID)
						pipe.SAdd(ctx, familyKey, token.TokenID)
						pipe.Expire(ctx, familyKey, expiry+15*time.Minute)
					}

					userFamiliesKey := s.key(nsUserFamilies, token.UserID)
					pipe.SAdd(ctx, userFamiliesKey, token.FamilyID)
					pipe.Expire(ctx, userFamiliesKey, expiry+24*time.Hour)

				case strings.HasPrefix(key, s.key(nsAccess, "")):
					pipe.SetEx(ctx, key, data, expiry)
				}
			}
			return nil
		})

		if err != nil {
			return fmt.Errorf("batch sync failed: %w", err)
		}

		for _, key := range batch {
			delete(s.pendingSync, key)
		}
	}
	return nil
}

func (s *tokenStore) healthCheck() {
	for {
		select {
		case <-s.healthTicker.C:
			rdb := s.getRedis()
			if rdb == nil {
				continue
			}

			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			_, err := rdb.Ping(ctx).Result()
			cancel()

			s.mu.Lock()
			if err != nil {
				if !s.isRedisDown {
					s.logger.Warn("redis disconnected, entering fallback mode", zap.Error(err))
				}
				s.isRedisDown = true
			} else {
				if s.isRedisDown {
					s.logger.Info("redis reconnected, resuming normal operations")
					s.isRedisDown = false

					if err := s.syncPendingToRedis(context.Background(), rdb); err != nil {
						s.logger.Error("failed to sync pending data to redis", zap.Error(err))
					}
				}
			}
			s.mu.Unlock()
		case <-s.stopChan:
			return
		}
	}
}

func (s *tokenStore) Close() {
	if s.healthTicker != nil {
		s.healthTicker.Stop()
	}
	close(s.stopChan)
}
