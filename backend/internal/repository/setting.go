package repository

import (
	"backend/internal/model"
	"context"

	"gorm.io/gorm"
)

type SettingRepository interface {
	Get(ctx context.Context, key string) (model.Setting, error)
	GetAll(ctx context.Context) ([]model.Setting, error)
	Set(ctx context.Context, key, value string) error
	SetMany(ctx context.Context, settings map[string]string) error
	UpdateRuntimeConfig(ctx context.Context) error
}

func NewSettingRepository(
	repository *Repository,
) SettingRepository {
	return &settingRepository{
		Repository: repository,
	}
}

type settingRepository struct {
	*Repository
}

func (r *settingRepository) Get(ctx context.Context, key string) (model.Setting, error) {
	var m model.Setting
	err := r.DB(ctx).Where("key = ?", key).First(&m).Error
	return m, err
}

func (r *settingRepository) GetAll(ctx context.Context) ([]model.Setting, error) {
	var list []model.Setting
	err := r.DB(ctx).Find(&list).Error
	return list, err
}

func (r *settingRepository) Set(ctx context.Context, key, value string) error {
	var m model.Setting
	err := r.DB(ctx).Where("key = ?", key).First(&m).Error
	if err != nil {
		m.Key = key
		m.Value = value
		return r.DB(ctx).Create(&m).Error
	}
	return r.DB(ctx).Model(&m).Update("value", value).Error
}

func (r *settingRepository) SetMany(ctx context.Context, settings map[string]string) error {
	return r.DB(ctx).Transaction(func(tx *gorm.DB) error {
		for key, value := range settings {
			var m model.Setting
			if err := tx.Where("key = ?", key).First(&m).Error; err != nil {
				m.Key = key
				m.Value = value
				if err := tx.Create(&m).Error; err != nil {
					return err
				}
			} else {
				if err := tx.Model(&m).Update("value", value).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *settingRepository) UpdateRuntimeConfig(ctx context.Context) error {
	return r.Repository.UpdateRuntimeConfig(ctx)
}
