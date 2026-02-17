package service

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/internal/repository"
	"context"
	"errors"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	_ = v1.ErrDeviceNoExists
	_ = v1.ErrDeviceNotFound
	_ = v1.ErrDeviceUDIDExists
)

type DeviceService interface {
	List(ctx context.Context, req *v1.DeviceSearchRequest) (*v1.DeviceSearchResponseData, error)
	Create(ctx context.Context, req *v1.DeviceRequest) error
	Update(ctx context.Context, id uint, req *v1.DeviceRequest) error
	Delete(ctx context.Context, id uint) error
	Get(ctx context.Context, id uint) (*v1.DeviceDataItem, error)
	Heartbeat(ctx context.Context, req *v1.DeviceHeartbeatRequest) error
}

func NewDeviceService(
	service *Service,
	deviceRepository repository.DeviceRepository,
) DeviceService {
	return &deviceService{
		Service:          service,
		deviceRepository: deviceRepository,
	}
}

type deviceService struct {
	*Service
	deviceRepository repository.DeviceRepository
}

func (s *deviceService) List(ctx context.Context, req *v1.DeviceSearchRequest) (*v1.DeviceSearchResponseData, error) {
	list, total, err := s.deviceRepository.List(ctx, req)
	if err != nil {
		return nil, err
	}

	data := &v1.DeviceSearchResponseData{
		List:  make([]v1.DeviceDataItem, 0),
		Total: total,
	}
	for _, device := range list {
		data.List = append(data.List, s.toDataItem(device))
	}
	return data, nil
}

func (s *deviceService) Create(ctx context.Context, req *v1.DeviceRequest) error {
	_, err := s.deviceRepository.GetByDeviceNo(ctx, req.DeviceNo)
	if err == nil {
		return v1.ErrDeviceNoExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if req.UDID != "" {
		_, err = s.deviceRepository.GetByUDID(ctx, req.UDID)
		if err == nil {
			return v1.ErrDeviceUDIDExists
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	device := &model.Device{
		DeviceNo:    req.DeviceNo,
		Name:        req.Name,
		DeviceType:  req.DeviceType,
		Platform:    req.Platform,
		DeviceModel: req.DeviceModel,
		OSVersion:   req.OSVersion,
		ScreenSize:  req.ScreenSize,
		ScreenDPI:   req.ScreenDPI,
		UDID:        req.UDID,
		IPAddress:   req.IPAddress,
		Port:        req.Port,
		ConnectMode: req.ConnectMode,
		GroupID:     req.GroupID,
		Tags:        req.Tags,
		Status:      model.DeviceStatusOffline,
	}
	return s.deviceRepository.Create(ctx, device)
}

func (s *deviceService) Update(ctx context.Context, id uint, req *v1.DeviceRequest) error {
	_, err := s.deviceRepository.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrDeviceNotFound
		}
		return err
	}

	data := map[string]interface{}{
		"name":         req.Name,
		"device_type":  req.DeviceType,
		"platform":     req.Platform,
		"device_model": req.DeviceModel,
		"os_version":   req.OSVersion,
		"screen_size":  req.ScreenSize,
		"screen_dpi":   req.ScreenDPI,
		"udid":         req.UDID,
		"ip_address":   req.IPAddress,
		"port":         req.Port,
		"connect_mode": req.ConnectMode,
		"group_id":     req.GroupID,
		"tags":         req.Tags,
	}
	return s.deviceRepository.Update(ctx, id, data)
}

func (s *deviceService) Delete(ctx context.Context, id uint) error {
	return s.deviceRepository.Delete(ctx, id)
}

func (s *deviceService) Get(ctx context.Context, id uint) (*v1.DeviceDataItem, error) {
	device, err := s.deviceRepository.Get(ctx, id)
	if err != nil {
		s.logger.WithContext(ctx).Error("deviceRepository.Get error", zap.Error(err))
		return nil, err
	}
	item := s.toDataItem(device)
	return &item, nil
}

func (s *deviceService) Heartbeat(ctx context.Context, req *v1.DeviceHeartbeatRequest) error {
	_, err := s.deviceRepository.Get(ctx, req.DeviceID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return v1.ErrDeviceNotFound
		}
		return err
	}

	now := time.Now().Format(constant.DateTimeLayout)
	data := map[string]interface{}{
		"status":         req.Status,
		"battery":        req.Battery,
		"is_charging":    req.IsCharging,
		"cpu_usage":      req.CPUUsage,
		"memory_usage":   req.MemoryUsage,
		"storage_free":   req.StorageFree,
		"last_heartbeat": now,
	}
	return s.deviceRepository.Update(ctx, req.DeviceID, data)
}

func (s *deviceService) toDataItem(device model.Device) v1.DeviceDataItem {
	return v1.DeviceDataItem{
		ID:            device.ID,
		CreatedAt:     device.CreatedAt.Format(constant.DateTimeLayout),
		UpdatedAt:     device.UpdatedAt.Format(constant.DateTimeLayout),
		DeviceNo:      device.DeviceNo,
		Name:          device.Name,
		DeviceType:    device.DeviceType,
		Platform:      device.Platform,
		DeviceModel:   device.DeviceModel,
		OSVersion:     device.OSVersion,
		ScreenSize:    device.ScreenSize,
		ScreenDPI:     device.ScreenDPI,
		UDID:          device.UDID,
		IPAddress:     device.IPAddress,
		Port:          device.Port,
		ConnectMode:   device.ConnectMode,
		Status:        device.Status,
		Battery:       device.Battery,
		IsCharging:    device.IsCharging,
		CPUUsage:      device.CPUUsage,
		MemoryUsage:   device.MemoryUsage,
		MemoryTotal:   device.MemoryTotal,
		StorageFree:   device.StorageFree,
		GroupID:       device.GroupID,
		Tags:          device.Tags,
		LastHeartbeat: device.LastHeartbeat,
	}
}
