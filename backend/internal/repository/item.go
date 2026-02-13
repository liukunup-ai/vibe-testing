package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type ItemRepository interface {
	Get(ctx context.Context, id uint) (model.Item, error)
	List(ctx context.Context, req *v1.ItemSearchRequest) ([]model.Item, int64, error)
	Create(ctx context.Context, item *model.Item) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewItemRepository(
	repository *Repository,
) ItemRepository {
	return &itemRepository{
		Repository: repository,
	}
}

type itemRepository struct {
	*Repository
}

func (r *itemRepository) Get(ctx context.Context, id uint) (model.Item, error) {
	m := model.Item{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *itemRepository) List(ctx context.Context, req *v1.ItemSearchRequest) ([]model.Item, int64, error) {
	var list []model.Item
	var total int64
	scope := r.DB(ctx).Model(&model.Item{})
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if req.Desc != "" {
		scope = scope.Where("desc LIKE ?", "%"+req.Desc+"%")
	}
	if req.Owner != "" {
		scope = scope.Where("owner = ?", req.Owner)
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *itemRepository) Create(ctx context.Context, m *model.Item) error {
	return r.DB(ctx).Create(m).Error
}

func (r *itemRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Item{}).Where("id = ?", id).Updates(data).Error
}

func (r *itemRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Item{}).Error
}
