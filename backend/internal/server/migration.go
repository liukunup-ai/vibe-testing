package server

import (
	v1 "backend/api/v1"
	"backend/internal/constant"
	"backend/internal/model"
	"backend/pkg/log"
	"backend/pkg/sid"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/casbin/casbin/v2"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type MigrateServer struct {
	db  *gorm.DB
	log *log.Logger
	sid *sid.Sid
	e   *casbin.SyncedEnforcer
}

func NewMigrateServer(
	db *gorm.DB,
	log *log.Logger,
	sid *sid.Sid,
	e *casbin.SyncedEnforcer,
) *MigrateServer {
	return &MigrateServer{
		db:  db,
		log: log,
		sid: sid,
		e:   e,
	}
}

func (m *MigrateServer) Start(ctx context.Context) error {
	m.db.Migrator().DropTable(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.Api{},
		&model.Model{},
		&model.Setting{},
		&model.Item{},
		&model.Project{},
		&model.ProjectUser{},
		&model.TestCase{},
		&model.TestSuite{},
		&model.TestPlan{},
		&model.TestRecord{},
		&model.TestData{},
		&model.TestEnv{},
		&model.Device{},
		&model.DeviceGroup{},
		&model.Bug{},
		&model.BugHistory{},
		&model.Requirement{},
		&model.UserFeedback{},
		&model.Artifact{},
		&model.AIProvider{},
		&model.AIAnalysisResult{},
	)
	if err := m.db.AutoMigrate(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.Api{},
		&model.Model{},
		&model.Setting{},
		&model.Item{},
		&model.Project{},
		&model.ProjectUser{},
		&model.TestCase{},
		&model.TestSuite{},
		&model.TestPlan{},
		&model.TestRecord{},
		&model.TestData{},
		&model.TestEnv{},
		&model.Device{},
		&model.DeviceGroup{},
		&model.Bug{},
		&model.BugHistory{},
		&model.Requirement{},
		&model.UserFeedback{},
		&model.Artifact{},
		&model.AIProvider{},
		&model.AIAnalysisResult{},
	); err != nil {
		m.log.Error("AutoMigrate error", zap.Error(err))
		return err
	}
	err := m.initialUser(ctx)
	if err != nil {
		m.log.Error("initialUser error", zap.Error(err))
	}

	err = m.initialMenuData(ctx)
	if err != nil {
		m.log.Error("initialMenuData error", zap.Error(err))
	}

	err = m.initialApisData(ctx)
	if err != nil {
		m.log.Error("initialApisData error", zap.Error(err))
	}

	err = m.initialRBAC(ctx)
	if err != nil {
		m.log.Error("initialRBAC error", zap.Error(err))
	}

	err = m.initialItems(ctx)
	if err != nil {
		m.log.Error("initialItems error", zap.Error(err))
	}

	m.initialModelData(ctx)

	err = m.initialSettings(ctx)
	if err != nil {
		m.log.Error("initialSettings error", zap.Error(err))
	}

	m.log.Info("AutoMigrate success")
	os.Exit(0)
	return nil
}
func (m *MigrateServer) Stop(ctx context.Context) error {
	m.log.Info("AutoMigrate stop")
	return nil
}

func (m *MigrateServer) initialUser(ctx context.Context) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err = m.db.Create(&model.User{
		Model:          gorm.Model{ID: 1},
		UserID:         constant.AdminUserID,
		Username:       "admin",
		HashedPassword: string(hashedPassword),
		FullName:       "超级管理员",
		Email:          "admin@example.com",
		Status:         1,
	}).Error; err != nil {
		return err
	}

	operatorUserID, err := m.sid.GenString()
	if err != nil {
		return err
	}
	if err = m.db.Create(&model.User{
		Model:          gorm.Model{ID: 2},
		UserID:         operatorUserID,
		Username:       "operator",
		HashedPassword: string(hashedPassword),
		FullName:       "运营人员",
		Email:          "operator@example.com",
		Status:         0,
	}).Error; err != nil {
		return err
	}
	return nil
}

func (m *MigrateServer) initialModelData(ctx context.Context) {
	initFuncs := []func(context.Context) error{
		m.initialProjects,
		m.initialTestCases,
		m.initialTestSuites,
		m.initialTestPlans,
		m.initialTestEnvs,
		m.initialTestData,
		m.initialDeviceGroups,
		m.initialDevices,
		m.initialBugs,
		m.initialRequirements,
		m.initialUserFeedbacks,
		m.initialArtifacts,
		m.initialAIProviders,
		m.initialAIAnalysisResults,
	}

	for _, fn := range initFuncs {
		if err := fn(ctx); err != nil {
			m.log.Error("initial model data error", zap.Error(err))
		}
	}
}

func (m *MigrateServer) initialItems(ctx context.Context) error {
	items := []model.Item{
		{Name: "用户认证模块", Desc: "实现用户登录、注册、JWT token 管理等功能", Owner: "admin"},
		{Name: "权限管理系统", Desc: "基于 Casbin 的 RBAC 权限控制，支持角色和菜单权限", Owner: "admin"},
		{Name: "API 网关服务", Desc: "统一的 API 入口，支持限流、熔断、负载均衡", Owner: "operator"},
		{Name: "日志监控平台", Desc: "集中式日志收集和分析，支持实时告警", Owner: "operator"},
		{Name: "数据报表系统", Desc: "多维度数据分析和可视化报表生成", Owner: "admin"},
	}
	return m.db.Create(&items).Error
}

func (m *MigrateServer) initialProjects(ctx context.Context) error {
	projects := []model.Project{
		{
			Model:       gorm.Model{ID: 1},
			Code:        "PROJ-001",
			Name:        "电商APP测试项目",
			Description: "包含商品管理、订单系统、支付流程等核心功能测试",
			CreatorID:   1,
			Icon:        "https://gw.alipayobjects.com/zos/rmsportal/sfjbOQmnsBpLkBofhKaO.png",
			Tags:        "电商,APP,支付",
			GitRepo:     "https://github.com/example/ecommerce-app",
			Status:      1,
			CaseCount:   156,
			ExecCount:   89,
		},
		{
			Model:       gorm.Model{ID: 2},
			Code:        "PROJ-002",
			Name:        "在线教育平台",
			Description: "视频课程、直播互动、作业考试等功能测试",
			CreatorID:   1,
			Icon:        "https://gw.alipayobjects.com/zos/rmsportal/SiHcrBjojyWqGmgKwCsQ.png",
			Tags:        "教育,视频,直播",
			GitRepo:     "https://github.com/example/education-platform",
			Status:      1,
			CaseCount:   234,
			ExecCount:   156,
		},
		{
			Model:       gorm.Model{ID: 3},
			Code:        "PROJ-003",
			Name:        "智能家居系统",
			Description: "IoT设备管理、场景联动、远程控制等测试",
			CreatorID:   2,
			Icon:        "https://gw.alipayobjects.com/zos/rmsportal/BWUPRI.png",
			Tags:        "IoT,智能硬件,家居",
			GitRepo:     "https://github.com/example/smart-home",
			Status:      1,
			CaseCount:   89,
			ExecCount:   45,
		},
	}
	if err := m.db.Create(&projects).Error; err != nil {
		return err
	}

	projectUsers := []model.ProjectUser{
		{Model: gorm.Model{ID: 1}, ProjectID: 1, UserID: 1, Role: model.ProjectRoleOwner, Status: 1},
		{Model: gorm.Model{ID: 2}, ProjectID: 1, UserID: 2, Role: model.ProjectRoleDeveloper, Status: 1},
		{Model: gorm.Model{ID: 3}, ProjectID: 2, UserID: 1, Role: model.ProjectRoleOwner, Status: 1},
		{Model: gorm.Model{ID: 4}, ProjectID: 3, UserID: 2, Role: model.ProjectRoleAdmin, Status: 1},
	}
	return m.db.Create(&projectUsers).Error
}

func (m *MigrateServer) initialTestCases(ctx context.Context) error {
	testCases := []model.TestCase{
		{
			Model:       gorm.Model{ID: 1},
			ProjectID:   1,
			CaseNo:      "TC-001",
			Title:       "用户正常登录功能验证",
			Description: "验证用户使用正确的用户名和密码可以成功登录系统",
			Priority:    model.CasePriorityP0,
			CaseType:    model.CaseTypeFunctional,
			Module:      "用户认证",
			Tags:        "登录,正向测试",
			Status:      model.CaseStatusPublished,
			Version:     1,
			CreatorID:   1,
			StepsData:   `{"preconditions": ["用户已注册", "网络连接正常"], "steps": [{"order": 1, "action": "打开登录页面", "expected": "显示登录表单"}, {"order": 2, "action": "输入有效用户名和密码", "expected": "输入框显示输入内容"}, {"order": 3, "action": "点击登录按钮", "expected": "登录成功，跳转到首页"}], "tags": ["P0", "核心功能"]}`,
		},
		{
			Model:       gorm.Model{ID: 2},
			ProjectID:   1,
			CaseNo:      "TC-002",
			Title:       "错误密码登录验证",
			Description: "验证用户使用错误密码登录时系统提示正确错误信息",
			Priority:    model.CasePriorityP1,
			CaseType:    model.CaseTypeFunctional,
			Module:      "用户认证",
			Tags:        "登录,异常测试",
			Status:      model.CaseStatusPublished,
			Version:     1,
			CreatorID:   1,
			StepsData:   `{"preconditions": ["用户已注册"], "steps": [{"order": 1, "action": "打开登录页面", "expected": "显示登录表单"}, {"order": 2, "action": "输入有效用户名和错误密码", "expected": "输入框显示输入内容"}, {"order": 3, "action": "点击登录按钮", "expected": "提示密码错误，留在登录页"}], "tags": ["P1"]}`,
		},
		{
			Model:       gorm.Model{ID: 3},
			ProjectID:   1,
			CaseNo:      "TC-003",
			Title:       "商品添加到购物车",
			Description: "验证用户可以将商品添加到购物车",
			Priority:    model.CasePriorityP0,
			CaseType:    model.CaseTypeFunctional,
			Module:      "购物车",
			Tags:        "购物车,核心功能",
			Status:      model.CaseStatusPublished,
			Version:     2,
			CreatorID:   1,
			StepsData:   `{"preconditions": ["用户已登录", "商品库存充足"], "steps": [{"order": 1, "action": "浏览商品列表", "expected": "显示商品列表"}, {"order": 2, "action": "点击商品详情", "expected": "显示商品详情页"}, {"order": 3, "action": "点击加入购物车", "expected": "提示添加成功，购物车数量+1"}], "tags": ["P0"]}`,
		},
		{
			Model:       gorm.Model{ID: 4},
			ProjectID:   2,
			CaseNo:      "TC-004",
			Title:       "视频课程播放功能",
			Description: "验证用户可以正常播放视频课程",
			Priority:    model.CasePriorityP0,
			CaseType:    model.CaseTypeFunctional,
			Module:      "视频播放",
			Tags:        "视频,播放",
			Status:      model.CaseStatusPublished,
			Version:     1,
			CreatorID:   2,
			StepsData:   `{"preconditions": ["用户已登录", "已购买课程"], "steps": [{"order": 1, "action": "进入课程详情页", "expected": "显示课程信息"}, {"order": 2, "action": "点击播放按钮", "expected": "视频开始播放"}], "tags": ["P0"]}`,
		},
		{
			Model:       gorm.Model{ID: 5},
			ProjectID:   3,
			CaseNo:      "TC-005",
			Title:       "设备连接稳定性测试",
			Description: "验证IoT设备在网络波动时的连接稳定性",
			Priority:    model.CasePriorityP1,
			CaseType:    model.CaseTypePerformance,
			Module:      "设备连接",
			Tags:        "稳定性,网络,IoT",
			Status:      model.CaseStatusDraft,
			Version:     1,
			CreatorID:   1,
			StepsData:   `{"preconditions": ["设备已配网"], "steps": [{"order": 1, "action": "模拟网络波动", "expected": "设备保持连接"}], "tags": ["P1", "性能测试"]}`,
		},
	}
	return m.db.Create(&testCases).Error
}

func (m *MigrateServer) initialTestSuites(ctx context.Context) error {
	testSuites := []model.TestSuite{
		{
			Model:          gorm.Model{ID: 1},
			ProjectID:      1,
			SuiteNo:        "TS-001",
			Name:           "用户认证测试套件",
			Description:    "覆盖登录、注册、密码重置等认证功能",
			SuiteType:      model.SuiteTypeStatic,
			CaseIDs:        `[1, 2]`,
			Parallelism:    1,
			Timeout:        3600,
			RetryCount:     2,
			ContinueOnFail: false,
			Status:         model.SuiteStatusNormal,
			CreatorID:      1,
		},
		{
			Model:          gorm.Model{ID: 2},
			ProjectID:      1,
			SuiteNo:        "TS-002",
			Name:           "购物车功能套件",
			Description:    "覆盖商品添加、修改数量、结算等功能",
			SuiteType:      model.SuiteTypeStatic,
			CaseIDs:        `[3]`,
			Parallelism:    2,
			Timeout:        7200,
			RetryCount:     1,
			ContinueOnFail: true,
			Status:         model.SuiteStatusNormal,
			CreatorID:      1,
		},
		{
			Model:       gorm.Model{ID: 3},
			ProjectID:   2,
			SuiteNo:     "TS-003",
			Name:        "P0级功能套件",
			Description: "动态筛选所有P0级用例",
			SuiteType:   model.SuiteTypeDynamic,
			FilterRule:  `{"priority": "P0", "status": "published"}`,
			Parallelism: 4,
			Timeout:     10800,
			RetryCount:  0,
			Status:      model.SuiteStatusNormal,
			CreatorID:   2,
		},
	}
	return m.db.Create(&testSuites).Error
}

func (m *MigrateServer) initialTestPlans(ctx context.Context) error {
	testPlans := []model.TestPlan{
		{
			Model:             gorm.Model{ID: 1},
			ProjectID:         1,
			PlanNo:            "PLAN-001",
			Name:              "电商APP V1.2回归测试",
			Description:       "版本1.2的全量回归测试计划",
			PlanType:          model.PlanTypeManual,
			ContentData:       `{"test_suites": ["1", "2"], "test_env": "1"}`,
			TriggerType:       model.PlanTriggerManual,
			Parallelism:       4,
			Timeout:           7200,
			RetryCount:        1,
			NotifyConfig:      `{"methods": ["email"], "timing": ["complete", "fail"], "receivers": ["admin"]}`,
			ExpectedStartTime: "2026-03-01T09:00:00Z",
			ExpectedEndTime:   "2026-03-05T18:00:00Z",
			ExecStatus:        model.PlanExecStatusPending,
			CreatorID:         1,
		},
		{
			Model:             gorm.Model{ID: 2},
			ProjectID:         2,
			PlanNo:            "PLAN-002",
			Name:              "视频模块冒烟测试",
			Description:       "视频播放相关功能的冒烟测试",
			PlanType:          model.PlanTypeManual,
			ContentData:       `{"test_cases": ["4"], "test_env": "2"}`,
			TriggerType:       model.PlanTriggerScheduled,
			CronExpr:          "0 9 * * 1-5",
			Parallelism:       2,
			Timeout:           3600,
			RetryCount:        0,
			NotifyConfig:      `{"methods": ["dingtalk"], "timing": ["start", "complete"], "receivers": ["operator"]}`,
			ExpectedStartTime: "2026-02-20T09:00:00Z",
			ExpectedEndTime:   "2026-02-20T18:00:00Z",
			ExecStatus:        model.PlanExecStatusPending,
			CreatorID:         2,
		},
	}
	return m.db.Create(&testPlans).Error
}

func (m *MigrateServer) initialTestEnvs(ctx context.Context) error {
	testEnvs := []model.TestEnv{
		{
			Model:       gorm.Model{ID: 1},
			ProjectID:   1,
			EnvNo:       "ENV-001",
			Name:        "电商测试环境",
			Description: "电商项目预发布测试环境",
			EnvType:     model.EnvTypeTest,
			ConfigData:  `[{"key": "base_url", "value": "https://test.ecommerce.com", "encrypted": false}, {"key": "api_key", "value": "test-api-key-123", "encrypted": true}]`,
			EnvVars:     `[{"name": "NODE_ENV", "value": "test"}, {"name": "DEBUG", "value": "true"}]`,
			Status:      model.EnvStatusNormal,
			CreatorID:   1,
		},
		{
			Model:       gorm.Model{ID: 2},
			ProjectID:   2,
			EnvNo:       "ENV-002",
			Name:        "教育平台开发环境",
			Description: "教育平台功能开发环境",
			EnvType:     model.EnvTypeDev,
			ConfigData:  `[{"key": "base_url", "value": "https://dev.edu.com", "encrypted": false}]`,
			EnvVars:     `[{"name": "NODE_ENV", "value": "development"}]`,
			Status:      model.EnvStatusNormal,
			CreatorID:   1,
		},
	}
	return m.db.Create(&testEnvs).Error
}

func (m *MigrateServer) initialTestData(ctx context.Context) error {
	testData := []model.TestData{
		{
			Model:       gorm.Model{ID: 1},
			ProjectID:   1,
			DataNo:      "DATA-001",
			Name:        "用户测试数据",
			Description: "包含100个测试用户账号",
			FileName:    "test_users.xlsx",
			FileType:    model.DataFileTypeExcel,
			FileSize:    102400,
			FilePath:    "data/projects/1/test_users.xlsx",
			Checksum:    "abc123def456",
			Version:     1,
			CaseID:      1,
			UploaderID:  1,
		},
		{
			Model:       gorm.Model{ID: 2},
			ProjectID:   1,
			DataNo:      "DATA-002",
			Name:        "商品数据",
			Description: "测试用商品SKU数据",
			FileName:    "products.csv",
			FileType:    model.DataFileTypeCSV,
			FileSize:    51200,
			FilePath:    "data/projects/1/products.csv",
			Checksum:    "xyz789uvw012",
			Version:     2,
			CaseID:      3,
			UploaderID:  2,
		},
	}
	return m.db.Create(&testData).Error
}

func (m *MigrateServer) initialDeviceGroups(ctx context.Context) error {
	deviceGroups := []model.DeviceGroup{
		{
			Model:       gorm.Model{ID: 1},
			Name:        "Android设备组",
			Description: "所有Android测试设备",
			CreatorID:   1,
		},
		{
			Model:       gorm.Model{ID: 2},
			Name:        "iOS设备组",
			Description: "所有iOS测试设备",
			CreatorID:   1,
		},
		{
			Model:       gorm.Model{ID: 3},
			ParentID:    1,
			Name:        "Android高性能组",
			Description: "高配Android设备",
			CreatorID:   1,
		},
	}
	return m.db.Create(&deviceGroups).Error
}

func (m *MigrateServer) initialDevices(ctx context.Context) error {
	devices := []model.Device{
		{
			Model:         gorm.Model{ID: 1},
			DeviceNo:      "DEV-001",
			Name:          "小米13",
			DeviceType:    model.DeviceTypeAndroid,
			Platform:      "android",
			DeviceModel:   "Xiaomi 13",
			OSVersion:     "14.0",
			ScreenSize:    "1080x2400",
			ScreenDPI:     420,
			UDID:          "android-device-001-udid",
			IPAddress:     "192.168.1.101",
			Port:          5555,
			ConnectMode:   "usb",
			Status:        model.DeviceStatusOnline,
			Battery:       85,
			IsCharging:    true,
			CPUUsage:      15.5,
			MemoryUsage:   42.3,
			MemoryTotal:   8192,
			StorageFree:   65536,
			GroupID:       1,
			Tags:          `["android", "xiaomi", "p0"]`,
			LastHeartbeat: "2026-02-16T18:00:00Z",
		},
		{
			Model:         gorm.Model{ID: 2},
			DeviceNo:      "DEV-002",
			Name:          "iPhone 15 Pro",
			DeviceType:    model.DeviceTypeIOS,
			Platform:      "ios",
			DeviceModel:   "iPhone15,2",
			OSVersion:     "17.0",
			ScreenSize:    "1179x2556",
			ScreenDPI:     460,
			UDID:          "ios-device-001-udid",
			IPAddress:     "192.168.1.102",
			Port:          8100,
			ConnectMode:   "network",
			Status:        model.DeviceStatusOnline,
			Battery:       72,
			IsCharging:    false,
			CPUUsage:      8.2,
			MemoryUsage:   35.6,
			MemoryTotal:   8192,
			StorageFree:   131072,
			GroupID:       2,
			Tags:          `["ios", "apple", "p0"]`,
			LastHeartbeat: "2026-02-16T17:59:00Z",
		},
		{
			Model:         gorm.Model{ID: 3},
			DeviceNo:      "DEV-003",
			Name:          "Samsung Galaxy S24",
			DeviceType:    model.DeviceTypeAndroid,
			Platform:      "android",
			DeviceModel:   "SM-S921B",
			OSVersion:     "14.0",
			ScreenSize:    "1080x2340",
			ScreenDPI:     416,
			UDID:          "android-device-002-udid",
			IPAddress:     "192.168.1.103",
			Port:          5555,
			ConnectMode:   "usb",
			Status:        model.DeviceStatusBusy,
			Battery:       45,
			IsCharging:    false,
			CPUUsage:      45.8,
			MemoryUsage:   68.2,
			MemoryTotal:   12288,
			StorageFree:   262144,
			GroupID:       3,
			Tags:          `["android", "samsung", "high-perf"]`,
			LastHeartbeat: "2026-02-16T17:55:00Z",
		},
	}
	return m.db.Create(&devices).Error
}

func (m *MigrateServer) initialBugs(ctx context.Context) error {
	bugs := []model.Bug{
		{
			Model:          gorm.Model{ID: 1},
			BugNo:          "BUG-001",
			Title:          "购物车商品数量修改失效",
			Desc:           "在购物车页面修改商品数量后，点击保存按钮无响应",
			Severity:       model.BugSeverityMajor,
			Priority:       model.BugPriorityP1,
			Status:         model.BugStatusFixed,
			CreatorID:      1,
			AssigneeID:     2,
			VerifierID:     1,
			ProjectID:      1,
			TestCaseID:     3,
			Environment:    model.BugEnvTest,
			DeviceInfo:     "Xiaomi 13, Android 14",
			OS:             "Android",
			Browser:        "Chrome 120",
			Preconditions:  "用户已登录，购物车中有商品",
			Steps:          "1. 进入购物车 2. 点击商品数量+1 3. 点击保存",
			ExpectedResult: "商品数量更新成功",
			ActualResult:   "点击保存无反应，数量未更新",
			FixedAt:        "2026-02-15T10:00:00Z",
			VerifiedAt:     "2026-02-15T14:00:00Z",
		},
		{
			Model:          gorm.Model{ID: 2},
			BugNo:          "BUG-002",
			Title:          "视频播放卡顿严重",
			Desc:           "1080P视频播放时出现明显卡顿，帧率不稳定",
			Severity:       model.BugSeverityCritical,
			Priority:       model.BugPriorityP0,
			Status:         model.BugStatusAssigned,
			CreatorID:      2,
			AssigneeID:     1,
			ProjectID:      2,
			TestCaseID:     4,
			Environment:    model.BugEnvStaging,
			DeviceInfo:     "iPhone 15 Pro, iOS 17",
			OS:             "iOS",
			Browser:        "Safari",
			Preconditions:  "网络带宽>10Mbps",
			Steps:          "1. 打开视频课程 2. 选择1080P清晰度 3. 开始播放",
			ExpectedResult: "视频流畅播放",
			ActualResult:   "播放卡顿，帧率波动",
		},
		{
			Model:          gorm.Model{ID: 3},
			BugNo:          "BUG-003",
			Title:          "登录页面样式错位",
			Desc:           "在iPad上登录按钮位置偏移，页面显示不完整",
			Severity:       model.BugSeverityMinor,
			Priority:       model.BugPriorityP2,
			Status:         model.BugStatusNew,
			CreatorID:      1,
			ProjectID:      1,
			Environment:    model.BugEnvProd,
			DeviceInfo:     "iPad Air, iOS 16",
			OS:             "iOS",
			Browser:        "Safari",
			Steps:          "1. 打开登录页面",
			ExpectedResult: "页面布局正确",
			ActualResult:   "登录按钮偏移出屏幕",
		},
	}
	if err := m.db.Create(&bugs).Error; err != nil {
		return err
	}

	bugHistory := []model.BugHistory{
		{
			Model:    gorm.Model{ID: 1},
			BugID:    1,
			Operator: 1,
			Action:   "create",
			Changes:  `{"field": "status", "old": "", "new": "new"}`,
		},
		{
			Model:    gorm.Model{ID: 2},
			BugID:    1,
			Operator: 1,
			Action:   "assign",
			Changes:  `{"field": "assignee_id", "old": "", "new": "2"}`,
		},
		{
			Model:    gorm.Model{ID: 3},
			BugID:    1,
			Operator: 2,
			Action:   "fix",
			Changes:  `{"field": "status", "old": "assigned", "new": "fixed"}`,
		},
		{
			Model:    gorm.Model{ID: 4},
			BugID:    2,
			Operator: 2,
			Action:   "create",
			Changes:  `{"field": "status", "old": "", "new": "new"}`,
		},
	}
	return m.db.Create(&bugHistory).Error
}

func (m *MigrateServer) initialRequirements(ctx context.Context) error {
	requirements := []model.Requirement{
		{
			Model:         gorm.Model{ID: 1},
			RequirementNo: "REQ-001",
			Title:         "用户登录功能",
			Description:   "实现基于邮箱/手机号的用户登录功能，支持记住密码",
			Priority:      model.RequirementPriorityP0,
			Status:        model.RequirementStatusCompleted,
			Owner:         1,
			ProjectID:     1,
			CreatorID:     1,
			ExpectedAt:    "2026-01-31",
			CompletedAt:   "2026-01-25",
			Version:       1,
			TestCaseIds:   `["1", "2"]`,
			BugIds:        `[]`,
		},
		{
			Model:         gorm.Model{ID: 2},
			RequirementNo: "REQ-002",
			Title:         "购物车功能",
			Description:   "实现商品加入购物车、修改数量、删除等功能",
			Priority:      model.RequirementPriorityP0,
			Status:        model.RequirementStatusInDevelopment,
			Owner:         2,
			ProjectID:     1,
			CreatorID:     1,
			ExpectedAt:    "2026-03-15",
			Version:       2,
			TestCaseIds:   `["3"]`,
			BugIds:        `["1"]`,
		},
		{
			Model:         gorm.Model{ID: 3},
			RequirementNo: "REQ-003",
			Title:         "视频播放优化",
			Description:   "优化视频加载速度，支持清晰度切换",
			Priority:      model.RequirementPriorityP1,
			Status:        model.RequirementStatusReviewed,
			Owner:         1,
			ProjectID:     2,
			CreatorID:     2,
			ExpectedAt:    "2026-02-28",
			Version:       1,
			TestCaseIds:   `["4"]`,
			BugIds:        `["2"]`,
		},
	}
	return m.db.Create(&requirements).Error
}

func (m *MigrateServer) initialUserFeedbacks(ctx context.Context) error {
	now := time.Now()
	userFeedbacks := []model.UserFeedback{
		{
			Model:           gorm.Model{ID: 1},
			FeedbackNo:      "FB-001",
			Title:           "登录页面加载慢",
			Content:         "每次打开登录页面都需要等3秒以上才能加载完成",
			Channel:         model.UserFeedbackChannelInApp,
			Reporter:        "用户张三",
			OccurredAt:      now.AddDate(0, 0, -3),
			Status:          model.UserFeedbackStatusConverted,
			Handler:         "admin",
			ProjectID:       1,
			DeviceModel:     "Xiaomi 13",
			OSVersion:       "Android 14",
			AppVersion:      "1.2.0",
			AttachmentPaths: []string{"https://example.com/screenshot1.png"},
			BugID:           func() *uint { v := uint(1); return &v }(),
			ConvertedAt:     func() *time.Time { v := now.AddDate(0, 0, -2); return &v }(),
			ConvertedBy:     "admin",
		},
		{
			Model:           gorm.Model{ID: 2},
			FeedbackNo:      "FB-002",
			Title:           "视频无法播放",
			Content:         "点击视频课程后黑屏，无法播放",
			Channel:         model.UserFeedbackChannelCustomerService,
			Reporter:        "用户李四",
			OccurredAt:      now.AddDate(0, 0, -1),
			Status:          model.UserFeedbackStatusProcessing,
			Handler:         "operator",
			ProjectID:       2,
			DeviceModel:     "iPhone 15",
			OSVersion:       "iOS 17",
			AppVersion:      "2.1.0",
			AttachmentPaths: []string{},
		},
		{
			Model:           gorm.Model{ID: 3},
			FeedbackNo:      "FB-003",
			Title:           "建议增加暗黑模式",
			Content:         "希望APP能支持暗黑模式，晚上使用更舒适",
			Channel:         model.UserFeedbackChannelSurvey,
			Reporter:        "用户王五",
			OccurredAt:      now.AddDate(0, 0, -5),
			Status:          model.UserFeedbackStatusPending,
			ProjectID:       1,
			DeviceModel:     "Samsung S24",
			OSVersion:       "Android 14",
			AppVersion:      "1.2.1",
			AttachmentPaths: []string{},
		},
	}
	return m.db.Create(&userFeedbacks).Error
}

func (m *MigrateServer) initialArtifacts(ctx context.Context) error {
	artifacts := []model.Artifact{
		{
			Model:         gorm.Model{ID: 1},
			ProjectID:     1,
			ArtifactNo:    "ART-001",
			Name:          "ecommerce-app-v1.2.0",
			Version:       "1.2.0",
			BuildType:     model.ArtifactBuildRelease,
			BuildTime:     "2026-02-10T14:30:00Z",
			BuildDuration: 420,
			GitCommit:     "a1b2c3d4e5f6789",
			BuilderID:     1,
			FilePath:      "artifacts/prod/ecommerce-app-v1.2.0.apk",
			FileSize:      52428800,
			Checksum:      "sha256:abc123...",
			BuildLogPath:  "logs/build-20260210-143000.log",
			ReleaseNote:   "修复购物车bug，优化登录体验",
			ReqIDs:        `["REQ-001", "REQ-002"]`,
		},
		{
			Model:         gorm.Model{ID: 2},
			ProjectID:     2,
			ArtifactNo:    "ART-002",
			Name:          "education-app-v2.1.0-debug",
			Version:       "2.1.0",
			BuildType:     model.ArtifactBuildDebug,
			BuildTime:     "2026-02-15T09:00:00Z",
			BuildDuration: 180,
			GitCommit:     "f6g7h8i9j0k1l2m3",
			BuilderID:     2,
			FilePath:      "artifacts/dev/education-app-v2.1.0-debug.ipa",
			FileSize:      157286400,
			Checksum:      "sha256:def456...",
			BuildLogPath:  "logs/build-20260215-090000.log",
			ReleaseNote:   "开发版本，包含视频播放新功能",
			ReqIDs:        `["REQ-003"]`,
		},
	}
	return m.db.Create(&artifacts).Error
}

func (m *MigrateServer) initialAIProviders(ctx context.Context) error {
	now := time.Now()
	aiProviders := []model.AIProvider{
		{
			Model:           gorm.Model{ID: 1},
			ProviderNo:      "AI-001",
			ProviderName:    "OpenAI GPT-4",
			ProviderType:    model.AIProviderTypeOpenAI,
			BaseURL:         "https://api.openai.com/v1",
			APIKey:          "sk-****",
			Status:          model.AIProviderStatusEnabled,
			CreatedBy:       1,
			UpdatedBy:       1,
			ModelConfig:     `{"models": [{"model_id": "gpt-4", "model_name": "GPT-4", "model_type": "chat", "max_tokens": 8192, "supported_features": ["text", "code"], "enabled": true, "priority": 1}], "default_model": "gpt-4"}`,
			RateLimitConfig: `{"rpm": 60, "tpm": 10000, "concurrent": 10, "daily_tokens": 1000000}`,
			CostConfig:      `{"input_price_per_1k": 0.03, "output_price_per_1k": 0.06, "currency": "USD"}`,
			TotalCalls:      1250,
			SuccessCalls:    1234,
			FailedCalls:     16,
			AvgResponseTime: 1200,
			TotalTokens:     567890,
			InputTokens:     345678,
			OutputTokens:    222212,
			TotalCost:       "18.50",
			LastUsedAt:      &now,
			LastSuccessAt:   &now,
		},
		{
			Model:           gorm.Model{ID: 2},
			ProviderNo:      "AI-002",
			ProviderName:    "DeepSeek",
			ProviderType:    model.AIProviderTypeDeepSeek,
			BaseURL:         "https://api.deepseek.com/v1",
			APIKey:          "sk-****",
			Status:          model.AIProviderStatusEnabled,
			CreatedBy:       1,
			UpdatedBy:       1,
			ModelConfig:     `{"models": [{"model_id": "deepseek-chat", "model_name": "DeepSeek Chat", "model_type": "chat", "max_tokens": 4096, "supported_features": ["text", "code", "reasoning"], "enabled": true, "priority": 2}], "default_model": "deepseek-chat"}`,
			RateLimitConfig: `{"rpm": 30, "tpm": 5000, "concurrent": 5}`,
			CostConfig:      `{"input_price_per_1k": 0.001, "output_price_per_1k": 0.002, "currency": "USD"}`,
			TotalCalls:      567,
			SuccessCalls:    560,
			FailedCalls:     7,
			AvgResponseTime: 2500,
			TotalTokens:     234567,
			InputTokens:     123456,
			OutputTokens:    111111,
			TotalCost:       "0.35",
			LastUsedAt:      &now,
			LastSuccessAt:   &now,
		},
	}
	return m.db.Create(&aiProviders).Error
}

func (m *MigrateServer) initialAIAnalysisResults(ctx context.Context) error {
	aiAnalysisResults := []model.AIAnalysisResult{
		{
			Model:             gorm.Model{ID: 1},
			AnalysisNo:        "ANA-001",
			AnalysisType:      model.AnalysisTypeCaseGeneration,
			RelatedObjectID:   1,
			RelatedObjectType: model.AnalysisRelatedTestCase,
			AnalyzedAt:        "2026-02-15T10:00:00Z",
			ModelVersion:      "gpt-4",
			AnalysisContent:   `{"generatedCases": [{"title": "用户密码错误三次锁定", "priority": "P1"}, {"title": "用户登录记住密码", "priority": "P2"}], "recommendationReason": "基于登录功能的核心业务流程，补充异常处理场景"}`,
			RelatedDataIDs:    `["1"]`,
			HumanVerified:     true,
			VerifiedAt:        "2026-02-15T11:00:00Z",
			AccuracyScore:     92,
			ProviderID:        "AI-001",
			ModelID:           "gpt-4",
			APICallTime:       2345,
			TokenUsage:        4567,
			CreatorID:         1,
		},
		{
			Model:             gorm.Model{ID: 2},
			AnalysisNo:        "ANA-002",
			AnalysisType:      model.AnalysisTypeDiagnosis,
			RelatedObjectID:   2,
			RelatedObjectType: model.AnalysisRelatedBug,
			AnalyzedAt:        "2026-02-16T09:00:00Z",
			ModelVersion:      "deepseek-chat",
			AnalysisContent:   `{"rootCause": "视频解码器配置不当，未启用硬件加速", "fixSuggestion": "启用GPU硬件加速解码，降低CPU占用", "confidence": 0.95}`,
			RelatedDataIDs:    `["2"]`,
			HumanVerified:     false,
			AccuracyScore:     0,
			ProviderID:        "AI-002",
			ModelID:           "deepseek-chat",
			APICallTime:       1567,
			TokenUsage:        2345,
			CreatorID:         2,
		},
	}
	return m.db.Create(&aiAnalysisResults).Error
}

func (m *MigrateServer) initialRBAC(ctx context.Context) error {
	// 创建角色
	roles := []model.Role{
		{CasbinRole: constant.AdminRole, Name: "超级管理员"},
		{CasbinRole: constant.OperatorRole, Name: "运营人员"},
		{CasbinRole: constant.UserRole, Name: "普通用户"},
	}
	if err := m.db.Create(&roles).Error; err != nil {
		return err
	}
	m.e.ClearPolicy()
	err := m.e.SavePolicy()
	if err != nil {
		m.log.Error("m.e.SavePolicy error", zap.Error(err))
		return err
	}

	// 给管理员加角色
	if _, err := m.e.AddRoleForUser(constant.AdminUserID, constant.AdminRole); err != nil {
		m.log.Error("m.e.AddRoleForUser error", zap.Error(err))
		return err
	}
	// 给管理员加菜单权限
	menuList := make([]model.Menu, 0)
	if err := m.db.Find(&menuList).Error; err != nil {
		m.log.Error("m.db.Find(&menuList).Error error", zap.Error(err))
		return err
	}
	for _, menu := range menuList {
		m.addPermissionForRole(constant.AdminRole, constant.MenuResourcePrefix+menu.Path, "read")
	}
	// 给管理员加接口权限
	apiList := make([]model.Api, 0)
	if err := m.db.Find(&apiList).Error; err != nil {
		m.log.Error("m.db.Find(&apiList).Error error", zap.Error(err))
		return err
	}
	for _, api := range apiList {
		m.addPermissionForRole(constant.AdminRole, constant.ApiResourcePrefix+api.Path, api.Method)
	}

	// 从数据库查询用户
	var operator model.User
	if err := m.db.First(&operator, 2).Error; err != nil {
		return err
	}
	// 添加运营人员权限
	if _, err := m.e.AddRoleForUser(operator.UserID, constant.OperatorRole); err != nil {
		m.log.Error("m.e.AddRoleForUser error", zap.Error(err))
		return err
	}

	// 运营人员
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/welcome", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/profile", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/admin", "read")
	m.addPermissionForRole(constant.OperatorRole, constant.MenuResourcePrefix+"/admin/user", "read")

	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/profile/avatar", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/menu", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/users/password", http.MethodPut)

	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users", http.MethodGet)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id", http.MethodDelete)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/send-reset-email", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/revoke-sessions", http.MethodPost)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/status", http.MethodPut)
	m.addPermissionForRole(constant.OperatorRole, constant.ApiResourcePrefix+"/v1/admin/users/:id/reset-avatar", http.MethodPut)

	// 普通用户
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/welcome", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/item", "read")
	m.addPermissionForRole(constant.UserRole, constant.MenuResourcePrefix+"/profile", "read")

	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile", http.MethodPut)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/profile/avatar", http.MethodPost)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/menu", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/users/password", http.MethodPut)

	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodGet)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items", http.MethodPost)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodPut)
	m.addPermissionForRole(constant.UserRole, constant.ApiResourcePrefix+"/v1/items/:id", http.MethodDelete)

	return nil
}

func (m *MigrateServer) addPermissionForRole(role, resource, action string) {
	_, err := m.e.AddPermissionForUser(role, resource, action)
	if err != nil {
		m.log.Sugar().Info("为角色 %s 添加权限 %s:%s 失败: %v", role, resource, action, err)
		return
	}
	fmt.Printf("为角色 %s 添加权限: %s %s\n", role, resource, action)
}

func (m *MigrateServer) initialApisData(ctx context.Context) error {
	initialApis := []model.Api{

		// 基础API - 公开接口
		{Group: "基础API", Name: "登录", Path: "/v1/login", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "注册", Path: "/v1/register", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "忘记密码", Path: "/v1/forgot-password", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "重置密码", Path: "/v1/reset-password", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "刷新token", Path: "/v1/refresh-token", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "OIDC认证", Path: "/v1/auth/oidc", Method: http.MethodPost, IsPublic: true},

		// 基础API - 需认证但跳过权限检查（所有角色默认拥有）
		{Group: "基础API", Name: "登出", Path: "/v1/logout", Method: http.MethodPost, IsPublic: true},
		{Group: "基础API", Name: "获取当前用户信息", Path: "/v1/users/:id", Method: http.MethodGet, IsPublic: true},

		// 用户
		{Group: "用户", Name: "获取Profile", Path: "/v1/users/profile", Method: http.MethodGet},
		{Group: "用户", Name: "更新Profile", Path: "/v1/users/profile", Method: http.MethodPut},
		{Group: "用户", Name: "更新头像", Path: "/v1/users/profile/avatar", Method: http.MethodPost},
		{Group: "用户", Name: "获取菜单", Path: "/v1/users/menu", Method: http.MethodGet},
		{Group: "用户", Name: "更新密码", Path: "/v1/users/password", Method: http.MethodPut},

		// 用户管理
		{Group: "用户管理", Name: "获取用户列表", Path: "/v1/admin/users", Method: http.MethodGet},
		{Group: "用户管理", Name: "创建用户", Path: "/v1/admin/users", Method: http.MethodPost},
		{Group: "用户管理", Name: "更新用户", Path: "/v1/admin/users/:id", Method: http.MethodPut},
		{Group: "用户管理", Name: "删除用户", Path: "/v1/admin/users/:id", Method: http.MethodDelete},
		{Group: "用户管理", Name: "发送重置邮件", Path: "/v1/admin/users/:id/send-reset-email", Method: http.MethodPost},
		{Group: "用户管理", Name: "撤销会话", Path: "/v1/admin/users/:id/revoke-sessions", Method: http.MethodPost},
		{Group: "用户管理", Name: "更新用户状态", Path: "/v1/admin/users/:id/status", Method: http.MethodPut},
		{Group: "用户管理", Name: "重置头像", Path: "/v1/admin/users/:id/reset-avatar", Method: http.MethodPut},

		// 角色管理
		{Group: "角色管理", Name: "获取角色列表", Path: "/v1/admin/roles", Method: http.MethodGet},
		{Group: "角色管理", Name: "创建角色", Path: "/v1/admin/roles", Method: http.MethodPost},
		{Group: "角色管理", Name: "更新角色", Path: "/v1/admin/roles/:id", Method: http.MethodPut},
		{Group: "角色管理", Name: "删除角色", Path: "/v1/admin/roles/:id", Method: http.MethodDelete},
		{Group: "角色管理", Name: "获取角色权限", Path: "/v1/admin/roles/permissions", Method: http.MethodGet},
		{Group: "角色管理", Name: "更新角色权限", Path: "/v1/admin/roles/permissions", Method: http.MethodPut},
		{Group: "角色管理", Name: "获取角色接口", Path: "/v1/admin/roles/:id/apis", Method: http.MethodGet},
		{Group: "角色管理", Name: "更新角色接口", Path: "/v1/admin/roles/:id/apis", Method: http.MethodPut},

		// 接口管理
		{Group: "接口管理", Name: "获取接口列表", Path: "/v1/admin/apis", Method: http.MethodGet},
		{Group: "接口管理", Name: "创建接口", Path: "/v1/admin/apis", Method: http.MethodPost},
		{Group: "接口管理", Name: "更新接口", Path: "/v1/admin/apis/:id", Method: http.MethodPut},
		{Group: "接口管理", Name: "删除接口", Path: "/v1/admin/apis/:id", Method: http.MethodDelete},
		{Group: "接口管理", Name: "获取接口角色", Path: "/v1/admin/apis/:id/roles", Method: http.MethodGet},
		{Group: "接口管理", Name: "更新接口角色", Path: "/v1/admin/apis/:id/roles", Method: http.MethodPut},

		// 菜单管理
		{Group: "菜单管理", Name: "获取菜单列表", Path: "/v1/admin/menus", Method: http.MethodGet},
		{Group: "菜单管理", Name: "创建菜单", Path: "/v1/admin/menus", Method: http.MethodPost},
		{Group: "菜单管理", Name: "更新菜单", Path: "/v1/admin/menus/:id", Method: http.MethodPut},
		{Group: "菜单管理", Name: "删除菜单", Path: "/v1/admin/menus/:id", Method: http.MethodDelete},

		// 模型管理
		{Group: "模型管理", Name: "获取模型列表", Path: "/v1/admin/models", Method: http.MethodGet},
		{Group: "模型管理", Name: "获取模型详情", Path: "/v1/admin/models/:id", Method: http.MethodGet},
		{Group: "模型管理", Name: "创建模型", Path: "/v1/admin/models", Method: http.MethodPost},
		{Group: "模型管理", Name: "更新模型", Path: "/v1/admin/models/:id", Method: http.MethodPut},
		{Group: "模型管理", Name: "删除模型", Path: "/v1/admin/models/:id", Method: http.MethodDelete},
		{Group: "模型管理", Name: "测试模型连接", Path: "/v1/admin/models/test-connection", Method: http.MethodPost},

		// 系统设置
		{Group: "系统设置", Name: "获取系统设置", Path: "/v1/admin/settings", Method: http.MethodGet},
		{Group: "系统设置", Name: "更新系统设置", Path: "/v1/admin/settings", Method: http.MethodPut},
		{Group: "系统设置", Name: "测试邮件发送", Path: "/v1/admin/settings/test-email", Method: http.MethodPost},
		{Group: "系统设置", Name: "获取公开设置", Path: "/v1/settings", Method: http.MethodGet, IsPublic: true},

		// 项目管理
		{Group: "项目管理", Name: "获取项目列表", Path: "/v1/items", Method: http.MethodGet},
		{Group: "项目管理", Name: "获取项目详情", Path: "/v1/items/:id", Method: http.MethodGet},
		{Group: "项目管理", Name: "创建项目", Path: "/v1/items", Method: http.MethodPost},
		{Group: "项目管理", Name: "更新项目", Path: "/v1/items/:id", Method: http.MethodPut},
		{Group: "项目管理", Name: "删除项目", Path: "/v1/items/:id", Method: http.MethodDelete},
	}

	return m.db.Create(&initialApis).Error
}

func (m *MigrateServer) initialMenuData(ctx context.Context) error {
	menuList := make([]v1.MenuDataItem, 0)
	err := json.Unmarshal([]byte(menuData), &menuList)
	if err != nil {
		m.log.Error("json.Unmarshal error", zap.Error(err))
		return err
	}
	menuListDb := make([]model.Menu, 0)
	for _, item := range menuList {
		menuListDb = append(menuListDb, model.Menu{
			Model: gorm.Model{
				ID: item.ID,
			},
			ParentID:           item.ParentID,
			Icon:               item.Icon,
			Name:               item.Name,
			Path:               item.Path,
			Component:          item.Component,
			Access:             item.Access,
			Locale:             item.Locale,
			Redirect:           item.Redirect,
			Target:             item.Target,
			HideChildrenInMenu: item.HideChildrenInMenu,
			HideInMenu:         item.HideInMenu,
			FlatMenu:           item.FlatMenu,
			Disabled:           item.Disabled,
			Tooltip:            item.Tooltip,
			DisabledTooltip:    item.DisabledTooltip,
			Key:                item.Key,
			ParentKeys:         item.ParentKeys,
		})
	}
	return m.db.Create(&menuListDb).Error
}

var menuData = `[
  {
    "id": 1,
    "path": "/",
    "redirect": "/dashboard"
  },
  {
    "id": 10,
    "path": "/dashboard",
    "name": "dashboard",
    "icon": "dashboard",
    "component": "@/pages/Dashboard",
    "access": "canUser"
  },
  {
    "id": 20,
    "path": "/workbench",
    "name": "workbench",
    "icon": "desktop",
    "access": "canUser"
  },
  {
    "id": 21,
    "parentId": 20,
    "path": "/workbench",
    "redirect": "/workbench/overview"
  },
  {
    "id": 22,
    "parentId": 20,
    "path": "/workbench/overview",
    "name": "overview",
    "icon": "appstore",
    "component": "@/pages/Workbench/Overview"
  },
  {
    "id": 23,
    "parentId": 20,
    "path": "/workbench/notification",
    "name": "notification",
    "icon": "bell",
    "component": "@/pages/Workbench/Notification"
  },
  {
    "id": 24,
    "parentId": 20,
    "path": "/workbench/todo",
    "name": "todo",
    "icon": "checkSquare",
    "component": "@/pages/Workbench/Todo"
  },
  {
    "id": 30,
    "path": "/efficiency",
    "name": "efficiency",
    "icon": "lineChart",
    "access": "canUser"
  },
  {
    "id": 31,
    "parentId": 30,
    "path": "/efficiency",
    "redirect": "/efficiency/project"
  },
  {
    "id": 32,
    "parentId": 30,
    "path": "/efficiency/project",
    "name": "project",
    "icon": "project",
    "component": "@/pages/Efficiency/Project"
  },
  {
    "id": 33,
    "parentId": 30,
    "path": "/efficiency/product",
    "name": "product",
    "icon": "shopping",
    "component": "@/pages/Efficiency/Product"
  },
  {
    "id": 34,
    "parentId": 30,
    "path": "/efficiency/development",
    "name": "development",
    "icon": "code",
    "component": "@/pages/Efficiency/Development"
  },
  {
    "id": 35,
    "parentId": 30,
    "path": "/efficiency/testing",
    "name": "testing",
    "icon": "experiment",
    "component": "@/pages/Efficiency/Testing"
  },
  {
    "id": 40,
    "path": "/project",
    "name": "project",
    "icon": "folder",
    "access": "canUser"
  },
  {
    "id": 41,
    "parentId": 40,
    "path": "/project",
    "redirect": "/project/list"
  },
  {
    "id": 42,
    "parentId": 40,
    "path": "/project/list",
    "name": "list",
    "icon": "unorderedList",
    "component": "@/pages/Project/List"
  },
  {
    "id": 43,
    "parentId": 40,
    "path": "/project/members",
    "name": "members",
    "icon": "team",
    "component": "@/pages/Project/Members"
  },
  {
    "id": 50,
    "path": "/requirement",
    "name": "requirement",
    "icon": "fileText",
    "access": "canUser"
  },
  {
    "id": 51,
    "parentId": 50,
    "path": "/requirement",
    "redirect": "/requirement/list"
  },
  {
    "id": 52,
    "parentId": 50,
    "path": "/requirement/list",
    "name": "list",
    "icon": "unorderedList",
    "component": "@/pages/Requirement/List"
  },
  {
    "id": 60,
    "path": "/testing",
    "name": "testing",
    "icon": "experiment",
    "access": "canUser"
  },
  {
    "id": 61,
    "parentId": 60,
    "path": "/testing",
    "redirect": "/testing/testcase"
  },
  {
    "id": 62,
    "parentId": 60,
    "path": "/testing/testcase",
    "name": "testcase",
    "icon": "fileText",
    "component": "@/pages/Testing/TestCase"
  },
  {
    "id": 63,
    "parentId": 60,
    "path": "/testing/testplan",
    "name": "testplan",
    "icon": "calendar",
    "component": "@/pages/Testing/TestPlan"
  },
  {
    "id": 64,
    "parentId": 60,
    "path": "/testing/report",
    "name": "report",
    "icon": "barChart",
    "component": "@/pages/Testing/Report"
  },
  {
    "id": 70,
    "path": "/bug",
    "name": "bug",
    "icon": "bug",
    "access": "canUser"
  },
  {
    "id": 71,
    "parentId": 70,
    "path": "/bug",
    "redirect": "/bug/list"
  },
  {
    "id": 72,
    "parentId": 70,
    "path": "/bug/list",
    "name": "list",
    "icon": "unorderedList",
    "component": "@/pages/Bug/List"
  },
  {
    "id": 80,
    "path": "/device",
    "name": "device",
    "icon": "mobile",
    "access": "canUser"
  },
  {
    "id": 81,
    "parentId": 80,
    "path": "/device",
    "redirect": "/device/list"
  },
  {
    "id": 82,
    "parentId": 80,
    "path": "/device/list",
    "name": "list",
    "icon": "unorderedList",
    "component": "@/pages/Device/List"
  },
  {
    "id": 999,
    "path": "/profile",
    "name": "profile",
    "icon": "profile",
	"component": "@/pages/Profile",
	"access": "canUser"
  },
  {
    "id": 1000,
    "path": "/admin",
    "name": "admin",
    "icon": "crown",
    "access": "canOperate"
  },
  {
    "id": 1001,
    "parentId": 1000,
    "path": "/admin",
    "redirect": "/admin/user"
  },
  {
    "id": 1002,
    "parentId": 1000,
    "path": "/admin/user",
    "name": "user",
    "component": "@/pages/Admin/User",
	"access": "canAdmin"
  },
  {
    "id": 1003,
    "parentId": 1000,
    "path": "/admin/role",
    "name": "role",
    "component": "@/pages/Admin/Role",
	"access": "canAdmin"
  },
  {
    "id": 1004,
    "parentId": 1000,
    "path": "/admin/menu",
    "name": "menu",
    "component": "@/pages/Admin/Menu",
	"access": "canAdmin"
  },
  {
    "id": 1005,
    "parentId": 1000,
    "path": "/admin/api",
    "name": "api",
    "component": "@/pages/Admin/Api",
	"access": "canAdmin"
  },
  {
    "id": 1006,
    "parentId": 1000,
    "path": "/admin/audit",
    "name": "audit",
    "component": "@/pages/Admin/Audit",
	"access": "canAdmin"
  },
  {
    "id": 1007,
    "parentId": 1000,
    "path": "/admin/model",
    "name": "model",
	"component": "@/pages/Admin/Model",
	"access": "canAdmin"
  },
  {
    "id": 1008,
    "parentId": 1000,
    "path": "/admin/config",
    "name": "config",
	"component": "@/pages/Admin/Config",
	"access": "canAdmin"
  },
  {
    "id": 2000,
    "path": "/help",
    "name": "help",
    "icon": "questionCircle",
    "component": "@/pages/Help",
    "access": "canUser"
  }
]`

func (m *MigrateServer) initialSettings(ctx context.Context) error {
	// 初始化 SiteConfig.ShowLinks 为 true
	setting := &model.Setting{
		Key:   model.SettingKeySiteShowLinks,
		Value: "true",
	}
	return m.db.Create(setting).Error
}
