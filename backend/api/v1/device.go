package v1

type DeviceSearchRequest struct {
	Page       int    `form:"page" binding:"required,min=1" example:"1"`
	PageSize   int    `form:"pageSize" binding:"required,min=1,max=1000" example:"10"`
	DeviceType string `form:"deviceType" example:"android"`
	Platform   string `form:"platform" example:"android"`
	Status     int    `form:"status" example:"2"`
	Name       string `form:"name" example:"Pixel 6"`
}

type DeviceDataItem struct {
	ID            uint    `json:"id,omitempty" example:"1"`
	CreatedAt     string  `json:"createdAt,omitempty" example:"2006-01-02 15:04:05"`
	UpdatedAt     string  `json:"updatedAt,omitempty" example:"2006-01-02 15:04:05"`
	DeviceNo      string  `json:"deviceNo" example:"DEV001"`
	Name          string  `json:"name" example:"Pixel 6"`
	DeviceType    string  `json:"deviceType" example:"android"`
	Platform      string  `json:"platform,omitempty" example:"android"`
	DeviceModel   string  `json:"deviceModel,omitempty" example:"Pixel 6"`
	OSVersion     string  `json:"osVersion,omitempty" example:"13"`
	ScreenSize    string  `json:"screenSize,omitempty" example:"1080x2400"`
	ScreenDPI     int     `json:"screenDpi" example:"420"`
	UDID          string  `json:"udid,omitempty" example:"emulator-5554"`
	IPAddress     string  `json:"ipAddress,omitempty" example:"192.168.1.100"`
	Port          int     `json:"port" example:"5555"`
	ConnectMode   string  `json:"connectMode" example:"usb"`
	Status        int     `json:"status" example:"2"`
	Battery       int     `json:"battery" example:"85"`
	IsCharging    bool    `json:"isCharging" example:"true"`
	CPUUsage      float64 `json:"cpuUsage" example:"25.5"`
	MemoryUsage   float64 `json:"memoryUsage" example:"45.2"`
	MemoryTotal   int64   `json:"memoryTotal" example:"8192"`
	StorageFree   int64   `json:"storageFree" example:"32768"`
	GroupID       uint    `json:"groupId,omitempty" example:"1"`
	Tags          string  `json:"tags,omitempty" example:"[\"phone\",\"test\"]"`
	LastHeartbeat string  `json:"lastHeartbeat,omitempty" example:"2024-01-01 12:00:00"`
}

type DeviceSearchResponseData struct {
	List  []DeviceDataItem `json:"list"`
	Total int64            `json:"total"`
}

type DeviceSearchResponse struct {
	Response
	Data DeviceSearchResponseData
}

type DeviceResponse struct {
	Response
	Data DeviceDataItem
}

type DeviceRequest struct {
	DeviceNo    string `json:"deviceNo" binding:"required" example:"DEV001"`
	Name        string `json:"name" binding:"required" example:"Pixel 6"`
	DeviceType  string `json:"deviceType" binding:"required" example:"android"`
	Platform    string `json:"platform" example:"android"`
	DeviceModel string `json:"deviceModel" example:"Pixel 6"`
	OSVersion   string `json:"osVersion" example:"13"`
	ScreenSize  string `json:"screenSize" example:"1080x2400"`
	ScreenDPI   int    `json:"screenDpi" example:"420"`
	UDID        string `json:"udid" example:"emulator-5554"`
	IPAddress   string `json:"ipAddress" example:"192.168.1.100"`
	Port        int    `json:"port" example:"5555"`
	ConnectMode string `json:"connectMode" example:"usb"`
	GroupID     uint   `json:"groupId" example:"1"`
	Tags        string `json:"tags" example:"[\"phone\",\"test\"]"`
}

type DeviceHeartbeatRequest struct {
	DeviceID    uint    `json:"deviceId" binding:"required" example:"1"`
	Status      int     `json:"status" example:"2"`
	Battery     int     `json:"battery" example:"85"`
	IsCharging  bool    `json:"isCharging" example:"true"`
	CPUUsage    float64 `json:"cpuUsage" example:"25.5"`
	MemoryUsage float64 `json:"memoryUsage" example:"45.2"`
	StorageFree int64   `json:"storageFree" example:"32768"`
}
