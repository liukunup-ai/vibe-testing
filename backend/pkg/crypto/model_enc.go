package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

// ModelEncryptionService handles AES-256-GCM encryption for model API keys
type ModelEncryptionService struct {
	key []byte // 32 bytes for AES-256
}

// NewModelEncryptionService creates encryption service from a 32-byte key string
// Returns error if key is not exactly 32 bytes
func NewModelEncryptionService(encryptionKey string) (*ModelEncryptionService, error) {
	key := []byte(encryptionKey)
	if len(key) != 32 {
		return nil, errors.New("encryption key must be exactly 32 bytes for AES-256")
	}
	return &ModelEncryptionService{key: key}, nil
}

// Encrypt encrypts plaintext using AES-256-GCM with a random nonce
// Returns base64-encoded string: nonce (12 bytes) || ciphertext || tag (16 bytes)
func (s *ModelEncryptionService) Encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts base64-encoded ciphertext encrypted with Encrypt()
// Returns plaintext string
func (s *ModelEncryptionService) Decrypt(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(s.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
