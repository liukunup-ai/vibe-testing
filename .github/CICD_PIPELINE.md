# CI/CD Pipeline 说明

Vibe Testing 的 GitHub Actions 自动化工作流。

## 🎯 工作流概述

完整的 CI/CD Pipeline，包含代码检查、构建、测试、Docker 镜像构建和发布。

### 触发条件

- **Push 到主分支**: `main`, `release/*`
- **Pull Request**: 目标分支 `main`, `dev`, `feature/*`
- **手动触发**: 支持通过 GitHub Actions UI 手动运行

## 📋 Pipeline 阶段

```
┌─────────────────────────────────────────────────────────────┐
│ 阶段 1: 代码质量检查 (Lint)                                 │
├─────────────────────────────────────────────────────────────┤
│  ├─ lint-backend   (golangci-lint)                          │
│  └─ lint-frontend  (ESLint)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 2: 构建验证 (Build)                                    │
├─────────────────────────────────────────────────────────────┤
│  ├─ build-backend  (Go build)                               │
│  │   ├─ server binary                                       │
│  │   ├─ migration binary                                    │
│  │   └─ task binary                                         │
│  └─ build-frontend (npm run build)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 3: 测试 (Test)                                         │
├─────────────────────────────────────────────────────────────┤
│  ├─ test-backend   (单元测试 + 覆盖率)                      │
│  │   └─ 覆盖率阈值: 50%                                     │
│  └─ test-frontend  (Jest 测试)                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 4: Docker 镜像构建 (仅在测试通过后)                    │
├─────────────────────────────────────────────────────────────┤
│  ├─ docker-build (matrix: server, migration, task)          │
│  │   ├─ 多架构支持: linux/amd64, linux/arm64                │
│  │   ├─ 推送到 Docker Hub                                   │
│  │   └─ 推送到 GitHub Container Registry                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 5: 更新文档 (仅主分支)                                 │
├─────────────────────────────────────────────────────────────┤
│  └─ update-docs (更新 Docker Hub 描述)                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 详细说明

### 阶段 1: 代码质量检查

#### lint-backend
- **工具**: golangci-lint v2.1
- **检查**: Go 代码规范、潜在问题、最佳实践
- **超时**: 5 分钟
- **缓存**: Go 依赖缓存

#### lint-frontend
- **工具**: ESLint
- **检查**: TypeScript/React 代码规范
- **缓存**: npm 依赖缓存

### 阶段 2: 构建验证

#### build-backend
- **Go 版本**: 1.23
- **输出**:
  - `bin/server` - 主应用服务器
  - `bin/migrate` - 数据库迁移工具
  - `bin/task` - 后台任务执行器
- **优化**: `-ldflags="-s -w"` 减小二进制大小
- **产物**: 上传到 Actions Artifacts (保留 1 天)

#### build-frontend
- **Node 版本**: 22
- **输出**: `dist/` 目录
- **检查**: 验证构建产物大小和内容
- **产物**: 上传到 Actions Artifacts (保留 1 天)

### 阶段 3: 测试

#### test-backend
- **测试类型**: 单元测试
- **竞态检测**: `-race` 标志
- **覆盖率**:
  - 范围: `handler`, `service`, `repository`
  - 最低阈值: **50%**
  - 模式: `atomic`
- **报告**:
  - `coverage.out` - 覆盖率数据
  - `coverage.html` - HTML 报告
  - 控制台输出函数级覆盖率
- **产物**: 上传报告 (保留 7 天)

#### test-frontend
- **测试框架**: Jest
- **命令**: `npm run test:ci`
- **状态**: 可选（如果未配置不会失败）

### 阶段 4: Docker 镜像构建

#### 触发条件
- ✅ Push 到主分支
- ✅ 手动触发且勾选 "Push Docker image"
- ❌ Pull Request (不推送镜像)

#### 多镜像构建 (Matrix Strategy)

构建三个独立的 Docker 镜像：

| 镜像 | 用途 | 入口点 |
|------|------|--------|
| `vibe-testing-server` | 主应用服务器 | `./cmd/server` |
| `vibe-testing-migration` | 数据库迁移 | `./cmd/migration` |
| `vibe-testing-task` | 后台任务 | `./cmd/task` |

#### 多架构支持

- **linux/amd64**: Intel/AMD x86_64 处理器
- **linux/arm64**: ARM64 处理器 (Apple Silicon, AWS Graviton)

#### 镜像仓库

**Docker Hub** (如果配置了密钥):
```
your-username/vibe-testing-server:latest
your-username/vibe-testing-migration:latest
your-username/vibe-testing-task:latest
```

**GitHub Container Registry** (自动):
```
ghcr.io/your-org/vibe-testing-server:latest
ghcr.io/your-org/vibe-testing-migration:latest
ghcr.io/your-org/vibe-testing-task:latest
```

#### 镜像标签策略

| 事件 | 标签示例 |
|------|----------|
| Push 到 main | `latest`, `main-abc1234` |
| 创建 Tag v1.2.3 | `1.2.3`, `1.2`, `1`, `latest` |
| Push 到分支 dev | `dev`, `dev-abc1234` |
| Pull Request #42 | `pr-42` |

#### 构建优化

- **BuildKit 缓存**: GitHub Actions 缓存
- **缓存模式**: `mode=max` 最大化缓存
- **缓存作用域**: 每个镜像独立缓存
- **并行构建**: 三个镜像并行构建

#### 镜像元数据

自动添加 OCI 标准标签：
```yaml
org.opencontainers.image.title: Vibe Testing server
org.opencontainers.image.description: Main application server
org.opencontainers.image.vendor: Vibe Testing
org.opencontainers.image.version: 1.2.3
org.opencontainers.image.created: 2024-11-12T10:00:00Z
org.opencontainers.image.revision: abc1234
org.opencontainers.image.source: https://github.com/your-org/vibe-testing
```

构建参数：
```yaml
APP_RELATIVE_PATH: ./cmd/server
BUILD_TIME: 2024-11-12T10:00:00Z
GIT_COMMIT: abc1234
GIT_BRANCH: main
VERSION: 1.2.3
```

### 阶段 5: 更新文档

仅在主分支更新 Docker Hub 仓库描述，使用 README.md 内容。

## 🔐 必需的 Secrets

在 GitHub Repository Settings → Secrets and variables → Actions 中配置：

### Docker Hub (可选)

```
DOCKER_HUB_USERNAME    # Docker Hub 用户名
DOCKER_HUB_TOKEN       # Docker Hub Access Token
```

如果不配置，仅推送到 GitHub Container Registry。

### GitHub Container Registry (自动)

使用内置的 `GITHUB_TOKEN`，无需额外配置。

## 📊 工作流示例

### Pull Request 流程

```bash
# 开发者创建 PR
git checkout -b feature/new-feature
git push origin feature/new-feature

# GitHub Actions 自动运行
1. ✓ lint-backend
2. ✓ lint-frontend
3. ✓ build-backend
4. ✓ build-frontend
5. ✓ test-backend (覆盖率 65%)
6. ✓ test-frontend
7. ⊗ docker-build (跳过，不推送镜像)

# PR 状态: All checks passed ✓
```

### 合并到主分支

```bash
# 合并 PR 到 main
git checkout main
git merge feature/new-feature
git push origin main

# GitHub Actions 自动运行
1. ✓ lint-backend
2. ✓ lint-frontend
3. ✓ build-backend
4. ✓ build-frontend
5. ✓ test-backend (覆盖率 65%)
6. ✓ test-frontend
7. ✓ docker-build
   ├─ vibe-testing-server (amd64, arm64) → Docker Hub & GHCR
   ├─ vibe-testing-migration (amd64, arm64) → Docker Hub & GHCR
   └─ vibe-testing-task (amd64, arm64) → Docker Hub & GHCR
8. ✓ update-docs

# 镜像已推送:
# - your-username/vibe-testing-server:latest
# - ghcr.io/your-org/vibe-testing-server:latest
```

### 发布版本

```bash
# 创建版本标签
git tag v1.2.3
git push origin v1.2.3

# GitHub Actions 自动运行
# 镜像标签:
# - your-username/vibe-testing-server:latest
# - your-username/vibe-testing-server:1.2.3
# - your-username/vibe-testing-server:1.2
# - your-username/vibe-testing-server:1
```

## 🚀 手动触发

在 GitHub Actions 页面点击 "Run workflow"：

1. 选择分支
2. 勾选 "Push Docker image to registries" (可选)
3. 点击 "Run workflow"

## 📦 使用构建的镜像

### Docker Compose

```yaml
services:
  app:
    image: your-username/vibe-testing-server:latest
    # 或使用 GHCR
    # image: ghcr.io/your-org/vibe-testing-server:latest
    platform: linux/amd64  # 或 linux/arm64
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibe-testing
spec:
  template:
    spec:
      containers:
      - name: app
        image: ghcr.io/your-org/vibe-testing-server:1.2.3
        # 自动选择架构
```

### 直接运行

```bash
# AMD64
docker run -p 8000:8000 your-username/vibe-testing-server:latest

# ARM64 (Apple Silicon)
docker run -p 8000:8000 \
  --platform linux/arm64 \
  your-username/vibe-testing-server:latest

# 数据库迁移
docker run your-username/vibe-testing-migration:latest

# 后台任务
docker run your-username/vibe-testing-task:latest
```

## 🔧 本地测试

### 模拟 Lint

```bash
# Backend
cd backend
golangci-lint run --timeout=5m

# Frontend
cd frontend
npm run lint
```

### 模拟 Build

```bash
# Backend
cd backend
go build -ldflags="-s -w" -o ./bin/server ./cmd/server

# Frontend
cd frontend
npm ci
npm run build
```

### 模拟 Test

```bash
# Backend
cd backend
go test -v -race \
  -coverpkg=./internal/handler,./internal/service,./internal/repository \
  -coverprofile=./coverage.out \
  ./test/server/...
go tool cover -func=./coverage.out

# Frontend
cd frontend
npm run test:ci
```

### 模拟 Docker Build

```bash
# 多架构构建（需要 Docker Buildx）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f deploy/build/Dockerfile \
  --build-arg APP_RELATIVE_PATH=./cmd/server \
  -t vibe-testing-server:local-test \
  --load \
  .
```

## 📈 监控和调试

### 查看工作流运行

```
https://github.com/your-org/vibe-testing/actions
```

### 查看构建日志

点击具体的工作流运行 → 点击具体的 Job → 查看步骤日志

### 查看测试覆盖率

下载 `coverage-report` Artifact → 打开 `coverage.html`

### 查看镜像详情

**Docker Hub**:
```
https://hub.docker.com/r/your-username/vibe-testing-server
```

**GitHub Container Registry**:
```
https://github.com/orgs/your-org/packages/container/vibe-testing-server
```

## 🐛 常见问题

### 测试覆盖率不足

```
❌ Coverage 45% is below threshold 50%
```

**解决**: 增加单元测试以提高覆盖率。

### Docker Hub 推送失败

```
❌ Error: Cannot perform an interactive login from a non TTY device
```

**解决**: 检查 `DOCKER_HUB_USERNAME` 和 `DOCKER_HUB_TOKEN` 是否正确配置。

### 多架构构建失败

```
❌ ERROR: failed to solve: no match for platform in manifest
```

**解决**: 确保 QEMU 和 Buildx 正确配置。这在 GitHub Actions 中是自动的。

### 构建超时

**解决**: 
- 使用 BuildKit 缓存（已配置）
- 优化 Dockerfile 以减少构建时间
- 增加 timeout 设置

## 🎯 最佳实践

1. **频繁提交**: 每次提交都会触发 CI 检查
2. **小的 PR**: 更快的测试反馈
3. **覆盖率**: 保持 ≥50% 测试覆盖率
4. **语义化版本**: 使用 `v1.2.3` 格式的 Git Tags
5. **镜像标签**: 生产环境使用具体版本号，避免 `latest`
6. **架构选择**: 根据部署环境选择合适的架构

## 📚 参考资料

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Buildx 多架构构建](https://docs.docker.com/build/building/multi-platform/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
