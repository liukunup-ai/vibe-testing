# Vibe Testing

一个现代化的全栈 Web 应用，提供完整的用户管理、权限控制和项目管理功能。

## ✨ 特性

- 🔐 **安全认证**: AccessToken + RefreshToken 双 token 机制
- 📧 **邮件服务**: 支持邮件找回密码功能
- 📁 **文件管理**: 支持本地存储和 MinIO 对象存储
- 🎨 **动态菜单**: 可配置的动态菜单系统
- 🔑 **权限管理**: 完整的 RBAC 权限控制
- 🧪 **自动化测试平台**: 完整的测试项目管理、用例管理、测试执行、缺陷跟踪
- 🤖 **AI 集成**: 支持 AI 用例生成、智能诊断、覆盖率分析
- 🚀 **容器化部署**: Docker + Docker Compose 一键部署
- 📊 **监控支持**: 可选的 Prometheus + Grafana 监控

## 🚀 快速开始

### 生产环境部署

```bash
# 1. 克隆代码
git clone https://github.com/your-org/vibe-testing.git
cd vibe-testing

# 2. 配置环境（自动生成密钥）
./deploy/scripts/init-env.sh

# 3. 验证配置
./deploy/scripts/validate-env.sh

# 4. 一键部署
./deploy/scripts/deploy-prod.sh
```

详细步骤请参考 [快速部署指南](./deploy/QUICKSTART.md)

### 开发环境

```bash
# 1. 克隆代码
git clone https://github.com/your-org/vibe-testing.git
cd vibe-testing

# 2. 启动开发环境
docker-compose up -d

# 3. 访问应用
# 前端: http://localhost:8000
# 后端: http://localhost:7001
```

## 📖 文档

### 部署文档
- [快速部署指南](./deploy/QUICKSTART.md) - 5分钟快速部署
- [生产环境部署](./deploy/PRODUCTION_DEPLOYMENT.md) - 完整的生产部署文档
- [环境变量配置](./ENV_CONFIG.md) - 环境变量配置说明（VT_ 前缀）

### 开发文档
- [开发指南](./DEV.zh-CN.md) - 开发环境配置和开发流程
- [系统设计](./DESIGN.zh-CN.md) - 架构设计和技术选型
- [静态文件嵌入](./EMBED_STATIC_FILES.md) - Go Embed 前端文件说明
- [CI/CD Pipeline](./.github/CICD_PIPELINE.md) - 自动化构建和部署流程

### 集成文档
- [LLM 应用](./LLMs.zh-CN.md) - LLM 集成说明

### 其他文档
- [AGENTS.md](./AGENTS.md) - AI 代理协作规范与数据库表结构

## 🛠️ 技术栈

### 前端
- React 18
- Ant Design Pro
- TypeScript
- UmiJS

### 后端
- Go 1.23
- Gin Framework
- GORM
- Wire (依赖注入)

### 基础设施
- Docker & Docker Compose
- MySQL 8
- Redis 7
- MinIO (对象存储)
- Nginx (可选)

## 📦 项目结构

```
vibe-testing/
├── frontend/           # 前端代码 (React + Ant Design Pro)
├── backend/            # 后端代码 (Go + Gin)
│   ├── internal/
│   │   ├── model/      # 数据模型定义
│   │   ├── repository/ # 数据访问层
│   │   ├── service/    # 业务逻辑层
│   │   ├── handler/    # HTTP 处理器
│   │   └── server/     # 服务器配置 & 数据迁移
│   └── cmd/            # 入口程序
├── deploy/             # 部署相关
│   ├── build/          # Dockerfile
│   ├── docker-compose/ # Docker Compose 配置
│   └── scripts/        # 部署脚本
├── .env.example        # 环境变量模板
├── .env.prod           # 生产环境配置模板
├── AGENTS.md           # AI 代理协作规范
└── README.md
```

## 🔧 环境配置

### 必需的环境变量

```env
# 应用配置
APP_ENV=prod
APP_NAME=vibe-testing
APP_DOMAIN=https://your-domain.com

# 数据库配置
MYSQL_ROOT_PASSWORD=your-strong-password
MYSQL_PASSWORD=your-strong-password
DB_MYSQL_PASSWORD=your-strong-password

# Redis 配置
REDIS_PASSWORD=your-redis-password

# JWT 配置
JWT_SECRET_KEY=your-64-char-random-string

# API 安全
API_SIGN_APP_SECRET=your-api-secret
```

使用配置向导自动生成：
```bash
./deploy/scripts/init-env.sh
```

或手动配置：
```bash
cp .env.prod .env
vim .env  # 修改相关配置
```

## 🗄️ 数据库与样例数据

### 数据库表结构

本项目使用 MySQL 数据库，包含以下核心表：

**基础数据表**: user, menu, role, api, item  
**测试平台表**: project, test_case, test_suite, test_plan, test_record, test_data, test_env  
**设备管理表**: device, device_group  
**缺陷管理表**: bug, bug_history  
**需求与反馈表**: requirement, user_feedback  
**CI/CD 相关表**: artifact  
**AI 功能表**: ai_provider, ai_analysis_result

### 自动数据初始化

后端服务启动时会自动执行：
1. **数据库迁移** - 自动创建/更新表结构
2. **基础数据初始化** - 用户、菜单、API、权限等
3. **样例数据初始化** - 项目、用例、设备、缺陷等模拟数据

> 💡 **提示**: 首次启动后会自动填充样例数据，方便快速体验和开发调试。

### 数据初始化配置

数据初始化代码位于 `backend/internal/server/migration.go`，包含以下初始化函数：

- `initialUser()` - 管理员和运营人员账号
- `initialMenuData()` - 系统菜单配置
- `initialApisData()` - API 接口定义
- `initialRBAC()` - 角色权限配置
- `initialProjects()` - 测试项目数据
- `initialTestCases()` - 测试用例样例
- `initialTestSuites()` - 测试套件样例
- `initialTestPlans()` - 测试计划样例
- `initialDevices()` - 测试设备样例
- `initialBugs()` - 缺陷数据样例
- `initialRequirements()` - 需求数据样例
- `initialAIProviders()` - AI 供应商配置

## 🧪 测试

### 运行测试脚本

```bash
# 本地构建测试
./deploy/scripts/build-local.sh

# 运行时测试
./deploy/scripts/run-local.sh

# 完整测试
./deploy/scripts/test-all.sh
```

### 验证环境配置

```bash
./deploy/scripts/validate-env.sh
```

## 📊 监控

### 启用监控（可选）

在 `.env` 中配置：
```env
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

GRAFANA_ENABLED=true
GRAFANA_PORT=3000
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

访问监控面板：
- Prometheus: http://your-server:9090
- Grafana: http://your-server:3000

## 🔒 安全

生产环境部署建议：

- ✅ 使用强密码（至少 16 位）
- ✅ 启用 HTTPS/TLS
- ✅ 配置防火墙规则
- ✅ 定期备份数据
- ✅ 启用速率限制
- ✅ 配置 CORS 白名单
- ✅ 关闭 DEBUG 模式
- ✅ 定期更新依赖

详见 [生产环境部署文档](./PRODUCTION_DEPLOYMENT.md#安全加固)

## 🔄 更新与维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose build
docker-compose up -d
```

### 备份数据

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  ${MYSQL_DATABASE} > backup_$(date +%Y%m%d).sql
```

### 查看日志

```bash
# 实时日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[LICENSE](./LICENSE)

## 📮 联系方式

- GitHub Issues: https://github.com/your-org/vibe-testing/issues
- Email: support@example.com

---

**提示**: 首次部署请参考 [快速部署指南](./QUICKSTART.md)，生产环境部署请查看 [完整部署文档](./PRODUCTION_DEPLOYMENT.md)
