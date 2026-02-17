package repository

import (
	v1 "backend/api/v1"
	"backend/internal/model"
	"context"
)

type DeviceRepository interface {
	Get(ctx context.Context, id uint) (model.Device, error)
	GetByDeviceNo(ctx context.Context, deviceNo string) (model.Device, error)
	GetByUDID(ctx context.Context, udid string) (model.Device, error)
	List(ctx context.Context, req *v1.DeviceSearchRequest) ([]model.Device, int64, error)
	Create(ctx context.Context, m *model.Device) error
	Update(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
}

func NewDeviceRepository(repository *Repository) DeviceRepository {
	return &deviceRepository{Repository: repository}
}

type deviceRepository struct {
	*Repository
}

func (r *deviceRepository) Get(ctx context.Context, id uint) (model.Device, error) {
	m := model.Device{}
	return m, r.DB(ctx).Where("id = ?", id).First(&m).Error
}

func (r *deviceRepository) GetByDeviceNo(ctx context.Context, deviceNo string) (model.Device, error) {
	m := model.Device{}
	return m, r.DB(ctx).Where("device_no = ?", deviceNo).First(&m).Error
}

func (r *deviceRepository) GetByUDID(ctx context.Context, udid string) (model.Device, error) {
	m := model.Device{}
	return m, r.DB(ctx).Where("udid = ?", udid).First(&m).Error
}

func (r *deviceRepository) List(ctx context.Context, req *v1.DeviceSearchRequest) ([]model.Device, int64, error) {
	var list []model.Device
	var total int64
	scope := r.DB(ctx).Model(&model.Device{})
	if req.DeviceType != "" {
		scope = scope.Where("device_type = ?", req.DeviceType)
	}
	if req.Platform != "" {
		scope = scope.Where("platform = ?", req.Platform)
	}
	if req.Status > 0 {
		scope = scope.Where("status = ?", req.Status)
	}
	if req.Name != "" {
		scope = scope.Where("name LIKE ?", "%"+req.Name+"%")
	}
	if err := scope.Count(&total).Error; err != nil {
		return nil, total, err
	}
	if err := scope.Offset((req.Page - 1) * req.PageSize).Limit(req.PageSize).Order("id DESC").Find(&list).Error; err != nil {
		return nil, total, err
	}
	return list, total, nil
}

func (r *deviceRepository) Create(ctx context.Context, m *model.Device) error {
	return r.DB(ctx).Create(m).Error
}

func (r *deviceRepository) Update(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.DB(ctx).Model(&model.Device{}).Where("id = ?", id).Updates(data).Error
}

func (r *deviceRepository) Delete(ctx context.Context, id uint) error {
	return r.DB(ctx).Where("id = ?", id).Delete(&model.Device{}).Error
}
