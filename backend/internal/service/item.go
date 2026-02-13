package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
)

type ItemService interface {
	Get(ctx context.Context, id uint) (model.Item, error)
	List(ctx context.Context, req *v1.ItemSearchRequest) (*v1.ItemSearchResponseData, error)
	Create(ctx context.Context, req *v1.ItemRequest) error
	Update(ctx context.Context, id uint, req *v1.ItemRequest) error
	Delete(ctx context.Context, id uint) error
}

func NewItemService(
	service *Service,
	itemRepository repository.ItemRepository,
) ItemService {
	return &itemService{
		Service:        service,
		itemRepository: itemRepository,
	}
}

type itemService struct {
	*Service
	itemRepository repository.ItemRepository
}

func (s *itemService) Get(ctx context.Context, id uint) (model.Item, error) {
	return s.itemRepository.Get(ctx, id)
}

func (s *itemService) List(ctx context.Context, req *v1.ItemSearchRequest) (*v1.ItemSearchResponseData, error) {
	list, total, err := s.itemRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}
	data := &v1.ItemSearchResponseData{
		List:  make([]v1.ItemDataItem, 0),
		Total: total,
	}
	for _, item := range list {
		data.List = append(data.List, v1.ItemDataItem{
			Id:        item.ID,
			CreatedAt: item.CreatedAt.Format(constant.DateTimeLayout),
			UpdatedAt: item.UpdatedAt.Format(constant.DateTimeLayout),
			Name:      item.Name,
			Desc:      item.Desc,
			Owner:     item.Owner,
		})
	}
	return data, nil
}

func (s *itemService) Create(ctx context.Context, req *v1.ItemRequest) error {
	return s.itemRepository.Create(ctx, &model.Item{
		Name:  req.Name,
		Desc:  req.Desc,
		Owner: req.Owner,
	})
}

func (s *itemService) Update(ctx context.Context, id uint, req *v1.ItemRequest) error {
	data := map[string]interface{}{
		"name":  req.Name,
		"desc":  req.Desc,
		"owner": req.Owner,
	}
	return s.itemRepository.Update(ctx, id, data)
}

func (s *itemService) Delete(ctx context.Context, id uint) error {
	return s.itemRepository.Delete(ctx, id)
}
