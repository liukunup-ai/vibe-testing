package model

import "gorm.io/gorm"

type Model struct {
	gorm.Model

	Provider         int     `gorm:"column:provider;type:int;not null;comment:'ModelProvider enum (1-7)'"`
	Name             string  `gorm:"column:name;type:varchar(100);not null;comment:'Display name for this config'"`
	BaseURL          string  `gorm:"column:base_url;type:varchar(500);not null;comment:'API endpoint'"`
	ApiKeyEncrypted  string  `gorm:"column:api_key_encrypted;type:varchar(500);not null;comment:'AES-256-GCM encrypted'"`
	ModelID          string  `gorm:"column:model_id;type:varchar(100);not null;comment:'e.g., gpt-4o, claude-3-opus'"`
	Timeout          int     `gorm:"column:timeout;type:int;default:30;comment:'seconds'"`
	MaxRetries       int     `gorm:"column:max_retries;type:int;default:3;comment:'Maximum retry attempts'"`
	RateLimit        int     `gorm:"column:rate_limit;type:int;default:0;comment:'0 = unlimited'"`
	Headers          string  `gorm:"column:headers;type:text;comment:'JSON string for custom headers'"`
	Temperature      float64 `gorm:"column:temperature;type:decimal(3,2);default:0.7;comment:'Sampling temperature'"`
	TopP             float64 `gorm:"column:top_p;type:decimal(3,2);default:1.0;comment:'Nucleus sampling threshold'"`
	MaxTokens        int     `gorm:"column:max_tokens;type:int;default:4096;comment:'Maximum tokens in response'"`
	TopK             int     `gorm:"column:top_k;type:int;default:0;comment:'0 = unlimited'"`
	FrequencyPenalty float64 `gorm:"column:frequency_penalty;type:decimal(3,2);default:0.0;comment:'Frequency penalty'"`
	PresencePenalty  float64 `gorm:"column:presence_penalty;type:decimal(3,2);default:0.0;comment:'Presence penalty'"`
}

func (m *Model) TableName() string {
	return "models"
}
