package model

import "gorm.io/gorm"

// Device 设备表
type Device struct {
	gorm.Model

	// 核心字段
	DeviceNo   string `gorm:"column:device_no;type:varchar(64);not null;uniqueIndex;comment:'设备编号'"`
	Name       string `gorm:"column:name;type:varchar(255);not null;comment:'设备名称'"`
	DeviceType string `gorm:"column:device_type;type:varchar(32);not null;index;comment:'设备类型 android/ios/desktop/hardware'"`

	// 设备信息
	Platform    string `gorm:"column:platform;type:varchar(32);comment:'平台 android/ios/windows/macos/linux'"`
	DeviceModel string `gorm:"column:device_model;type:varchar(128);comment:'设备型号'"`
	OSVersion   string `gorm:"column:os_version;type:varchar(64);comment:'操作系统版本'"`
	ScreenSize  string `gorm:"column:screen_size;type:varchar(32);comment:'屏幕尺寸(宽x高)'"`
	ScreenDPI   int    `gorm:"column:screen_dpi;default:0;comment:'屏幕DPI'"`
	UDID        string `gorm:"column:udid;type:varchar(128);index;comment:'设备唯一标识'"`

	// 连接信息
	IPAddress   string `gorm:"column:ip_address;type:varchar(64);comment:'IP地址'`
	Port        int    `gorm:"column:port;default:0;comment:'端口'`
	AgentID     uint   `gorm:"column:agent_id;index;comment:'代理节点ID'`
	ConnectMode string `gorm:"column:connect_mode;type:varchar(32);default:'usb';comment:'连接模式 usb/network'`

	// 状态信息
	Status     int  `gorm:"column:status;type:int;default:1;comment:'状态 1:离线 2:在线 3:忙碌 4:维护 5:故障'"`
	Battery    int  `gorm:"column:battery;default:0;comment:'电池电量(百分比)'"`
	IsCharging bool `gorm:"column:is_charging;default:false;comment:'是否充电中'`

	// 资源信息
	CPUUsage    float64 `gorm:"column:cpu_usage;default:0;comment:'CPU使用率'`
	MemoryUsage float64 `gorm:"column:memory_usage;default:0;comment:'内存使用率'`
	MemoryTotal int64   `gorm:"column:memory_total;default:0;comment:'总内存(MB)'`
	StorageFree int64   `gorm:"column:storage_free;default:0;comment:'可用存储(MB)'`

	// 分组信息
	GroupID uint   `gorm:"column:group_id;index;comment:'设备分组ID'"`
	Tags    string `gorm:"column:tags;type:text;comment:'标签JSON数组'`

	// 最后心跳
	LastHeartbeat string `gorm:"column:last_heartbeat;type:varchar(32);comment:'最后心跳时间'`
}

func (m *Device) TableName() string {
	return "device"
}

// Device type constants
const (
	DeviceTypeAndroid  = "android"
	DeviceTypeIOS      = "ios"
	DeviceTypeDesktop  = "desktop"
	DeviceTypeHardware = "hardware"
)

// Device status constants
const (
	DeviceStatusOffline  = 1 // 离线
	DeviceStatusOnline   = 2 // 在线
	DeviceStatusBusy     = 3 // 忙碌
	DeviceStatusMaintain = 4 // 维护
	DeviceStatusFault    = 5 // 故障
)

// DeviceGroup 设备分组表
type DeviceGroup struct {
	gorm.Model

	Name        string `gorm:"column:name;type:varchar(255);not null;comment:'分组名称'"`
	Description string `gorm:"column:description;type:text;comment:'分组描述'`
	ParentID    uint   `gorm:"column:parent_id;index;comment:'父分组ID'"`
	CreatorID   uint   `gorm:"column:creator_id;index;comment:'创建者ID'`
}

func (m *DeviceGroup) TableName() string {
	return "device_group"
}
