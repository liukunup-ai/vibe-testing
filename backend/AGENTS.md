# Backend 项目描述文档

## 一、项目概述

### 1.1 基本信息

| 属性 | 值 |
|-----|-----|
| 项目名称 | backend |
| 项目类型 | 后端 API 服务 |
| 开发语言 | Go |
| Go 版本 | 1.24.10 |
| 框架 | Gin + Nunu |
| 许可证 | MIT |
| 初始化脚手架 | [Nunu](https://github.com/go-nunu/nunu) |

### 1.2 项目定位

本项目是自动化测试平台的 **后端 API 服务**，负责提供 RESTful API 接口，支持用户认证、项目管理、用例管理、任务调度、设备管理、测试执行、报告分析等核心业务功能。项目采用 **Nunu** 脚手架构建，遵循 Clean Architecture 架构设计原则，具备良好的可维护性和可扩展性。

### 1.3 核心能力

- **用户认证与授权**：基于 JWT 的身份认证，支持细粒度的权限控制
- **项目管理**：测试项目的全生命周期管理
- **用例管理**：测试用例的增删改查、版本管理、导入导出
- **任务调度**：测试任务的创建、调度、执行、监控
- **设备管理**：设备资源池管理，支持 Android、iOS、桌面节点
- **报告分析**：测试结果聚合、智能分析、报告生成

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 用途说明 |
|-----|---------|---------|
| 编程语言 | Go 1.24.10 | 高性能、并发友好 |
| Web 框架 | Gin 1.11.0 | 轻量级 HTTP Web 框架 |
| ORM | GORM 1.31.1 | 数据库对象关系映射 |
| 数据库 | SQLite / MySQL / PostgreSQL | 数据持久化存储 |
| 依赖注入 | Google Wire 0.7.0 | 编译时依赖注入 |
| 配置管理 | Viper 1.21.0 | 支持多格式配置 |
| 认证授权 | JWT (golang-jwt) 5.3.0 | Token 认证 |
| 定时任务 | gocron 1.37.0 | 定时任务调度 |
| Redis 客户端 | go-redis v9.17.1 | 缓存和会话存储 |
| 日志 | Zap 1.27.1 | 结构化日志 |
| API 文档 | Swagger (swag) 1.16.6 | 自动生成 API 文档 |
| 测试 | testify + gomock | 单元测试 |
| HTTP 测试 | httpexpect 2.17.0 | 行为驱动测试 |
| 序列化 | codec | 高性能编解码 |
| 唯一 ID | sonyflake 1.3.0 | 分布式 ID 生成 |
| 工具库 | lancet 2.3.8 | Go 工具函数库 |

### 2.2 架构模式

本项目采用 **Clean Architecture**（清晰架构）设计，遵循依赖倒置原则，将系统分为以下几个核心层次：

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              应用层 (Application)                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    Handler      │  │    Service      │  │     Task        │                │
│  │  (HTTP 处理)    │  │  (业务逻辑)     │  │  (任务执行)     │                │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                │
└───────────┼────────────────────┼─────────────────────┼─────────────────────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              领域层 (Domain)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │     Model       │  │    Repository   │  │    Service     │                │
│  │   (数据模型)    │  │   (数据访问)    │  │  (领域服务)    │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              基础设施层 (Infrastructure)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │     Server      │  │      Job        │  │   Middleware    │                │
│  │  (HTTP/gRPC)    │  │   (定时任务)    │  │   (中间件)     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              第三方依赖 (Dependencies)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    Database     │  │     Cache       │  │      Config     │                │
│  │  (数据库适配)    │  │  (Redis)        │  │  (Viper 配置)   │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 项目结构

```
backend/
├── api/                              # API 定义层
│   └── v1/                           # API v1 版本
│       ├── errors.go                 # 错误定义
│       ├── user.go                   # 用户相关 API
│       └── v1.go                     # API 路由组定义
│
├── cmd/                              # 命令入口
│   ├── migration/                    # 数据库迁移命令
│   │   ├── main.go                   # 迁移程序入口
│   │   └── wire/                     # Wire 依赖注入
│   ├── server/                       # 服务启动命令
│   │   ├── main.go                   # 服务入口
│   │   └── wire/                     # Wire 依赖注入
│   └── task/                         # 任务执行命令
│       ├── main.go                   # 任务入口
│       └── wire/                     # Wire 依赖注入
│
├── config/                           # 配置文件
│   ├── local.yml                    # 本地开发配置
│   └── prod.yml                     # 生产环境配置
│
├── deploy/                           # 部署配置
│   ├── build/
│   │   └── Dockerfile               # Docker 构建文件
│   └── docker-compose/
│       └── docker-compose.yml        # Docker Compose 配置
│
├── docs/                            # API 文档
│   ├── docs.go                      # Swagger 文档生成
│   ├── swagger.json                 # Swagger JSON
│   └── swagger.yaml                 # Swagger YAML
│
├── internal/                        # 内部业务代码（不可被外部导入）
│   ├── handler/                     # HTTP 请求处理器
│   │   ├── handler.go               # Handler 接口定义
│   │   └── user.go                  # 用户相关 Handler
│   ├── job/                         # 定时任务
│   │   ├── job.go                   # Job 接口定义
│   │   └── user.go                  # 用户相关 Job
│   ├── middleware/                   # 中间件
│   │   ├── cors.go                  # CORS 跨域中间件
│   │   ├── jwt.go                   # JWT 认证中间件
│   │   ├── log.go                   # 日志中间件
│   │   └── sign.go                  # 签名验证中间件
│   ├── model/                        # 数据模型
│   │   └── user.go                  # 用户模型定义
│   ├── repository/                   # 数据访问层
│   │   ├── repository.go            # Repository 接口定义
│   │   └── user.go                  # 用户 Repository 实现
│   ├── router/                       # 路由定义
│   │   ├── router.go                # 路由接口定义
│   │   └── user.go                  # 用户相关路由
│   ├── server/                       # 服务器配置
│   │   ├── http.go                  # HTTP 服务器
│   │   ├── job.go                   # 定时任务服务器
│   │   ├── migration.go             # 迁移服务器
│   │   ├── task.go                  # 任务服务器
│   │   └── server.go                # 服务器基类
│   ├── service/                      # 业务服务层
│   │   ├── service.go               # Service 接口定义
│   │   └── user.go                  # 用户 Service 实现
│   └── task/                         # 任务执行
│       ├── task.go                   # Task 接口定义
│       └── user.go                  # 用户相关 Task
│
├── pkg/                             # 公共包（可被外部导入）
│   ├── app/                         # 应用工具
│   │   └── app.go                   # 应用初始化
│   ├── config/                      # 配置工具
│   │   └── config.go                # 配置加载
│   ├── jwt/                         # JWT 工具
│   │   └── jwt.go                   # JWT 封装
│   ├── log/                         # 日志工具
│   │   └── log.go                   # 日志封装
│   ├── server/                      # 服务器工具
│   │   ├── grpc/                    # gRPC 服务
│   │   │   └── grpc.go              # gRPC 服务封装
│   │   ├── http/                    # HTTP 服务
│   │   │   └── http.go              # HTTP 服务封装
│   │   └── server.go                # 服务器接口
│   ├── sid/                         # ID 生成
│   │   ├── convert.go               # ID 转换
│   │   └── sid.go                   # 雪花 ID 生成
│   └── zapgorm2/                    # GORM 日志插件
│       └── zapgorm2.go              # Zap 日志集成
│
├── scripts/                         # 脚本
│   └── README.md                    # 脚本说明文档
│
├── storage/                        # 存储目录
│   └── nunu-test.db               # SQLite 测试数据库
│
├── test/                           # 测试代码
│   ├── mocks/                      # Mock 数据
│   │   ├── repository/             # Repository Mock
│   │   │   ├── repository.go
│   │   │   └── user.go
│   │   └── service/               # Service Mock
│   │       └── user.go
│   └── server/                     # 服务器测试
│       ├── handler/
│       │   ├── main_test.go
│       │   └── user_test.go
│       ├── repository/
│       │   └── user_test.go
│       └── service/
│           └── user_test.go
│
├── web/                           # 前端静态资源
│   └── index.html                 # 静态页面
│
├── LICENSE
├── Makefile                       # Make 命令
├── README.md                      # 项目自述
├── README_zh.md                   # 中文自述
├── go.mod                        # Go 模块依赖
└── go.sum                        # Go 模块校验
```

---

## 三、核心模块说明

### 3.1 API 设计

API 采用 **RESTful** 设计风格，通过 `api/v1/` 目录组织版本化的 API 路由。

**API 分层结构**：

```
api/v1/
├── v1.go              # 路由组定义，定义 /api/v1 前缀
├── errors.go         # 统一错误码定义
├── user.go           # 用户相关 API 路由
│
├── # 后续可扩展模块
├── project.go        # 项目管理 API
├── case.go           # 用例管理 API
├── task.go           # 任务管理 API
├── device.go         # 设备管理 API
├── suite.go          # 套件管理 API
├── script.go         # 脚本管理 API
├── report.go         # 报告管理 API
├── execution.go      # 执行记录 API
└── analysis.go       # 分析报告 API
```

**响应格式规范**：

```go
// 统一响应结构
type Response struct {
    Code    int         `json:"code"`    // 业务状态码
    Message string      `json:"message"` // 提示信息
    Data    interface{} `json:"data"`    // 响应数据
}

// 分页响应结构
type ListResponse struct {
    Response
    Data struct {
        List     interface{} `json:"list"`
        Total    int64       `json:"total"`
        Page     int         `json:"page"`
        PageSize int         `json:"page_size"`
    } `json:"data"`
}
```

### 3.2 Handler 层

Handler 负责处理 HTTP 请求，进行参数校验、调用 Service 层业务逻辑、处理异常、返回响应。

**Handler 接口定义**：

```go
// internal/handler/handler.go
type Handler interface {
    RegisterRoutes(router.IRouter)  // 注册路由
}

// 示例：UserHandler
type UserHandler interface {
    Handler
    Login(c *gin.Context)           // 用户登录
    Register(c *gin.Context)        // 用户注册
    GetProfile(c *gin.Context)      // 获取用户信息
    UpdateProfile(c *gin.Context)   // 更新用户信息
    List(c *gin.Context)           // 用户列表
    Delete(c *gin.Context)          // 删除用户
}
```

### 3.3 Service 层

Service 层封装业务逻辑，是系统的核心业务处理层。

**Service 接口定义**：

```go
// internal/service/service.go
type Service interface {
    Serve()  // 启动服务
}

// 示例：UserService
type UserService interface {
    Register(ctx context.Context, req *dto.RegisterRequest) error
    Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
    GetUserByID(ctx context.Context, id int64) (*model.User, error)
    ListUsers(ctx context.Context, query *query.UserQuery) ([]*model.User, int64, error)
    UpdateUser(ctx context.Context, id int64, req *dto.UpdateUserRequest) error
    DeleteUser(ctx context.Context, id int64) error
}
```

### 3.4 Repository 层

Repository 层负责数据访问，封装数据库操作，对 Service 层屏蔽数据库实现细节。

**Repository 接口定义**：

```go
// internal/repository/repository.go
type Repository interface {
    DB() *gorm.DB
    AutoMigrate(dst ...interface{}) error
}

// 示例：UserRepository
type UserRepository interface {
    Repository
    Create(ctx context.Context, user *model.User) error
    FindByID(ctx context.Context, id int64) (*model.User, error)
    FindByUsername(ctx context.Context, username string) (*model.User, error)
    FindByEmail(ctx context.Context, email string) (*model.User, error)
    List(ctx context.Context, query *query.UserQuery) ([]*model.User, int64, error)
    Update(ctx context.Context, user *model.User) error
    Delete(ctx context.Context, id int64) error
    Count(ctx context.Context, query *query.UserQuery) (int64, error)
}
```

### 3.5 Model 层

Model 层定义数据模型，对应数据库表结构。

**示例用户模型**：

```go
// internal/model/user.go
type User struct {
    ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
    Username     string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
    PasswordHash string    `gorm:"size:255;not null" json:"-"`
    Email        string    `gorm:"size:100;uniqueIndex" json:"email"`
    Phone        string    `gorm:"size:20" json:"phone"`
    RealName     string    `gorm:"size:50" json:"real_name"`
    AvatarURL    string    `gorm:"size:500" json:"avatar_url"`
    Status       int       `gorm:"default:1" json:"status"`  // 0:禁用 1:启用 2:锁定
    LastLoginAt  *time.Time `json:"last_login_at"`
    LastLoginIP  string    `gorm:"size:45" json:"last_login_ip"`
    CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
```

### 3.6 Middleware 层

中间件层提供通用的横切关注点处理能力。

**已实现的中间件**：

| 中间件 | 文件 | 功能说明 |
|-------|------|---------|
| CORS | cors.go | 处理跨域请求，支持配置白名单 |
| JWT | jwt.go | JWT Token 认证，支持 Token 刷新 |
| Log | log.go | 请求日志记录，记录请求耗时、参数、响应 |
| Sign | sign.go | 请求签名验证，防止数据篡改 |

### 3.7 Task 层

Task 层负责测试任务的实际执行，与外部执行代理通信。

**Task 接口定义**：

```go
// internal/task/task.go
type Task interface {
    Execute(ctx context.Context, taskID int64) error
    Start()  // 启动任务监听
    Stop()   // 停止任务监听
}

// Task 状态流转
// Pending -> Running -> Success/Failed/Cancelled
```

### 3.8 Job 层

Job 层提供定时任务能力，支持定时触发测试任务。

**Job 接口定义**：

```go
// internal/job/job.go
type Job interface {
    Run()
    GetName() string
    GetSpec() string  // Cron 表达式
}
```

---

## 四、基础设施

### 4.1 配置管理

项目采用 **Viper** 作为配置管理组件，支持多格式配置文件（YAML、TOML、JSON 等）。

**配置文件结构**：

```yaml
# config/local.yml
app:
  name: "automated-testing-backend"
  host: "0.0.0.0"
  port: 8080
  mode: "debug"  # debug, release, test
  env: "local"   # local, dev, test, prod

database:
  driver: "sqlite"  # sqlite, mysql, postgres
  host: "localhost"
  port: 3306
  username: "root"
  password: "password"
  name: "backend"
  table_prefix: "nunu_"
  max_idle_conns: 10
  max_open_conns: 100
  conn_max_lifetime: 3600  # 秒

redis:
  host: "localhost"
  port: 6379
  password: ""
  db: 0
  key_prefix: "nunu:test:"

jwt:
  secret: "your-secret-key"
  access_expire: 86400      # 秒 (24小时)
  refresh_expire: 604800     # 秒 (7天)

log:
  level: "debug"  # debug, info, warn, error
  format: "json"  # json, text
  output: "stdout" # stdout, file
  filename: "logs/app.log"
  max_size: 100    # MB
  max_age: 30      # 天
  max_backups: 7

storage:
  type: "local"  # local, oss, s3
  local_path: "./storage"
  # OSS 配置
  oss_endpoint: ""
  oss_bucket: ""
  oss_access_key: ""
  oss_secret_key: ""
```

### 4.2 数据库

**支持的数据库**：

| 数据库 | 驱动 | 使用场景 |
|-------|------|---------|
| SQLite | glebarez/sqlite | 开发测试环境 |
| MySQL | gorm/mysql | 生产环境 |
| PostgreSQL | gorm/postgres | 生产环境（推荐） |

**数据表前缀**：默认 `nunu_`，可通过配置修改。

### 4.3 缓存

项目使用 **Redis** 作为缓存层，提供以下能力：

- **会话缓存**：用户登录状态缓存
- **配置缓存**：系统配置缓存
- **限流计数**：API 限流计数器
- **分布式锁**：并发控制锁

### 4.4 日志

项目使用 **Zap** 作为日志库，提供高性能的结构化日志。

**日志配置项**：

```go
type LogConfig struct {
    Level      string  // 日志级别
    Format     string  // 输出格式 (json/text)
    Output     string  // 输出位置 (stdout/file)
    Filename   string  // 文件路径
    MaxSize    int     // 单文件最大 MB
    MaxAge     int     // 最大保留天数
    MaxBackups int     // 最大备份数
    Compress   bool    // 是否压缩
}
```

### 4.5 API 文档

项目集成了 **Swagger** 自动生成 API 文档。

**访问地址**：`http://localhost:8080/swagger/index.html`

**文档生成**：

```bash
make swagger
```

---

## 五、依赖注入

### 5.1 Wire 集成

项目使用 **Google Wire** 实现编译时依赖注入，通过 `cmd/*/wire/` 目录组织注入配置。

**注入结构**：

```
cmd/
├── migration/
│   └── wire/
│       ├── wire.go       # Provider 定义
│       └── wire_gen.go   # 自动生成（勿手动编辑）
├── server/
│   └── wire/
│       ├── wire.go       # Provider 定义
│       └── wire_gen.go   # 自动生成
└── task/
    └── wire/
        ├── wire.go       # Provider 定义
        └── wire_gen.go   # 自动生成
```

**依赖注入示例**：

```go
// cmd/server/wire/wire.go
package wire

import (
    "github.com/go-nunu/backend/internal/handler"
    "github.com/go-nunu/backend/internal/repository"
    "github.com/go-nunu/backend/internal/service"
    "github.com/go-nunu/backend/pkg/server/http"
    "github.com/google/wire"
)

var ProviderSet = wire.NewSet(
    // Repository
    repository.NewUserRepository,
    
    // Service
    service.NewUserService,
    
    // Handler
    handler.NewUserHandler,
    
    // Server
    http.NewHTTPServer,
)
```

### 5.2 注入流程

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Wire 依赖注入流程                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

main.go (cmd/server/main.go)
        │
        ▼
wire.go (cmd/server/wire/wire.go)
        │
        ▼
┌─────────────────────────────────────┐
│ ProviderSet (wire.NewSet)           │
│ ├── repository.NewUserRepository    │
│ ├── service.NewUserService          │
│ ├── handler.NewUserHandler          │
│ ├── server.NewHTTPServer            │
│ └── ...                             │
└─────────────────────────────────────┘
        │
        ▼
wire_gen.go (自动生成)
        │
        ▼
Initialize() 函数
        │
        ▼
返回完整的依赖图
        │
        ▼
启动应用
```

---

## 六、部署与运维

### 6.1 编译构建

```bash
# 查看 Makefile 目标
make help

# 编译后端服务
make build

# 运行测试
make test

# 代码检查
make lint

# 生成 Swagger 文档
make swagger

# 数据库迁移
make migrate

# 运行开发环境
make run
```

### 6.2 Docker 部署

**Dockerfile 构建**：

```dockerfile
# deploy/build/Dockerfile
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/config ./config
COPY --from=builder /app/web ./web

EXPOSE 8080

CMD ["./main", "-config", "config/prod.yml"]
```

**Docker Compose**：

```yaml
# deploy/docker-compose/docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ../..
      dockerfile: deploy/build/Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./config/prod.yml:/app/config/prod.yml
      - ./storage:/app/storage
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### 6.3 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|-------|------|-------|-----|
| `APP_ENV` | 应用环境 | `local` | 否 |
| `APP_PORT` | 服务端口 | `8080` | 否 |
| `DB_DRIVER` | 数据库驱动 | `sqlite` | 否 |
| `DB_HOST` | 数据库地址 | - | 否 |
| `DB_PORT` | 数据库端口 | - | 否 |
| `DB_USERNAME` | 数据库用户名 | - | 否 |
| `DB_PASSWORD` | 数据库密码 | - | 否 |
| `DB_NAME` | 数据库名称 | - | 否 |
| `REDIS_HOST` | Redis 地址 | - | 否 |
| `REDIS_PORT` | Redis 端口 | - | 否 |
| `JWT_SECRET` | JWT 密钥 | - | 是 |

---

## 七、测试

### 7.1 测试框架

| 层级 | 框架 | 说明 |
|-----|------|-----|
| 单元测试 | `testing` + `testify` | 基础单元测试 |
| Mock | `gomock` | 生成 Mock 数据 |
| HTTP 测试 | `httpexpect` | REST API 测试 |
| Mock 数据 | `go-sqlmock` | 数据库 Mock |

### 7.2 测试结构

```
test/
├── mocks/                      # Mock 数据（代码生成）
│   ├── repository/
│   │   ├── repository.go       # Repository 接口定义
│   │   └── user.go             # User Repository Mock
│   └── service/
│       └── user.go             # User Service Mock
│
└── server/                     # 服务器测试
    ├── handler/
    │   ├── main_test.go        # Handler 测试入口
    │   └── user_test.go        # User Handler 测试
    ├── repository/
    │   └── user_test.go        # Repository 测试
    └── service/
        └── user_test.go        # Service 测试
```

### 7.3 测试命令

```bash
# 运行所有测试
make test

# 运行测试并生成覆盖率报告
make test-coverage

# 运行指定包测试
go test ./internal/handler/...

# 生成 Mock 数据
make mock
```

---

## 八、扩展指南

### 8.1 新增 API 模块

**步骤 1：创建 Model**

```go
// internal/model/project.go
type Project struct {
    BaseModel
    Name        string `gorm:"size:100;not null"`
    Code        string `gorm:"size:50;uniqueIndex;not null"`
    Description string `gorm:"type:text"`
    OwnerID     int64
    Owner       *User
    Status      int `gorm:"default:1"`
}
```

**步骤 2：创建 Repository**

```go
// internal/repository/project.go
type ProjectRepository interface {
    Create(ctx context.Context, project *model.Project) error
    FindByID(ctx context.Context, id int64) (*model.Project, error)
    // ...
}
```

**步骤 3：创建 Service**

```go
// internal/service/project.go
type ProjectService interface {
    CreateProject(ctx context.Context, req *dto.CreateProjectRequest) error
    GetProject(ctx context.Context, id int64) (*model.Project, error)
    // ...
}
```

**步骤 4：创建 Handler**

```go
// internal/handler/project.go
type ProjectHandler interface {
    Create(c *gin.Context)
    Get(c *gin.Context)
    List(c *gin.Context)
    Update(c *gin.Context)
    Delete(c *gin.Context)
}
```

**步骤 5：注册路由**

```go
// api/v1/project.go
func RegisterProjectRoutes(router IRouter) {
    group := router.Group("/projects")
    
    h := handler.NewProjectHandler()
    h.RegisterRoutes(group)
}
```

**步骤 6：更新 Wire 注入**

```go
// cmd/server/wire/wire.go
var ProviderSet = wire.NewSet(
    // 原有依赖...
    repository.NewProjectRepository,
    service.NewProjectService,
    handler.NewProjectHandler,
)
```

### 8.2 新增定时任务

```go
// internal/job/cleanup.go
type CleanupJob struct{}

func (j *CleanupJob) GetName() string {
    return "cleanup"
}

func (j *CleanupJob) GetSpec() string {
    return "0 0 * * *"  // 每天凌晨执行
}

func (j *CleanupJob) Run() {
    // 清理逻辑
}
```

### 8.3 新增 Middleware

```go
// internal/middleware/rate_limit.go
func RateLimit(limit int) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 限流逻辑
    }
}
```

---

## 九、最佳实践

### 9.1 代码规范

- 遵循 [Uber Go 语言编码规范](https://github.com/uber-go/guide/blob/master/style.md)
- 使用 `gofmt` 和 `golint` 进行代码格式化
- 公共方法必须编写注释
- 错误处理使用 `pkg/errors` 包装

### 9.2 命名规范

| 类型 | 规范 | 示例 |
|-----|------|-----|
| 文件名 | 小写下划线 | `user_repository.go` |
| 包名 | 小写简短 | `repository` |
| 结构体 | 大驼峰 | `UserRepository` |
| 变量 | 小驼峰 | `userName` |
| 常量 | 全大写下划线 | `MAX_RETRY_COUNT` |
| 接口名 | 大驼峰，以 er 结尾 | `Repository`, `Service` |

### 9.3 Git 规范

- 分支命名：`feature/*`, `bugfix/*`, `hotfix/*`
- 提交信息：`feat: 新增 xxx`, `fix: 修复 xxx`, `docs: 更新文档`
- 代码审查：所有合并到主分支的代码必须经过 Code Review

---

## 十、常见问题

### Q1: 如何切换数据库？

修改 `config/*.yml` 中的 `database.driver` 配置：

```yaml
# SQLite
database:
  driver: "sqlite"

# MySQL
database:
  driver: "mysql"
  host: "localhost"
  port: 3306
  username: "root"
  password: "password"
  name: "backend"

# PostgreSQL
database:
  driver: "postgres"
  host: "localhost"
  port: 5432
  username: "postgres"
  password: "password"
  name: "backend"
```

### Q2: 如何添加新的配置项？

1. 在 `config/*.yml` 中添加配置
2. 在 `pkg/config/config.go` 中定义对应的结构体
3. 在 Wire Provider 中注入配置

### Q3: 如何调试 API？

```bash
# 启动开发模式
make dev

# 访问 Swagger UI
http://localhost:8080/swagger/index.html
```

### Q4: 如何生成 Mock 数据？

```bash
make mock
```

---

## 十一、参考资源

| 资源 | 链接 |
|-----|------|
| Nunu 官方文档 | https://nunu.io |
| Gin 框架文档 | https://gin-gonic.com/ |
| GORM 文档 | https://gorm.io/ |
| Wire 文档 | https://github.com/google/wire |
| Swagger 文档 | https://swagger.io/ |
| Go 编码规范 | https://github.com/uber-go/guide |
