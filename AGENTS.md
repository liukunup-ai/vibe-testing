# AGENTS.md - 编码代理指南

## 项目概述

Monorepo 项目，包含 Go 后端 (`backend/`) 和 React 前端 (`frontend/`)。

- **后端**: Go 1.23, Gin, GORM, Wire (依赖注入), Swagger, zap 日志
- **前端**: React 19, Ant Design Pro, UmiJS, TypeScript 5.6

---

## 构建/检查/测试命令

### 后端 (Go)

```bash
# 开发
cd backend
make init          # 安装工具: wire, mockgen, swag, dlv
make bootstrap     # 启动 Docker 依赖 + 迁移 + 服务器

# 构建
make build         # 构建二进制文件到 ./bin/server
make swag          # 生成 Swagger 文档 (docs/)

# 测试
make test          # 运行所有测试并生成覆盖率报告
make mock          # 重新生成 mock 文件

# 运行单个测试
go test -v ./test/server/handler -run TestUserHandler_Get
go test -v ./test/server/service -run TestUserService_Create

# 开发服务器 (热重载)
nunu run ./cmd/server
```

### 前端 (React/TypeScript)

```bash
# 开发
cd frontend
npm install        # 初始安装
npm run dev        # 启动开发服务器 (带后端代理)
npm start          # 备选: 使用 mock 数据

# 构建
npm run build      # 生产构建
npm run preview    # 预览生产构建

# 代码检查
npm run lint       # 运行所有: ESLint + Prettier + tsc
npm run lint:fix   # 自动修复 lint 错误
npm run tsc        # 仅类型检查

# 测试
npm test                    # 运行所有测试
npm run test:coverage       # 运行并生成覆盖率
npm test -- Login           # 运行匹配模式的测试

# API 生成
npm run openapi    # 从 Swagger 生成 API 服务
```

---

## 代码风格指南

### Go (后端)

**导入** - 按顺序分组: 标准库, 外部库, 内部库
```go
import (
    "context"
    "net/http"

    "github.com/gin-gonic/gin"
    "go.uber.org/zap"

    v1 "backend/api/v1"
    "backend/internal/service"
)
```

**命名**
- 结构体/接口: `PascalCase` (如 `UserService`, `UserRepository`)
- 私有字段: `camelCase` (如 `userRepository`, `logger`)
- 常量: 导出用 `PascalCase`, 私有用 `camelCase`
- 错误: `ErrSomething` (如 `ErrBadRequest`, `ErrUnauthorized`)

**Handler 模式**
```go
func (h *UserHandler) GetUser(ctx *gin.Context) {
    // 1. 解析并验证输入
    idStr := ctx.Param("id")
    uid, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        h.logger.WithContext(ctx).Error("parse id error", zap.Error(err))
        v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
        return
    }

    // 2. 调用 service
    data, err := h.userService.Get(ctx, uint(uid))
    if err != nil {
        h.logger.WithContext(ctx).Error("service error", zap.Error(err))
        v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
        return
    }

    // 3. 返回响应
    v1.HandleSuccess(ctx, data)
}
```

**错误处理**
- 始终向上返回错误，不要吞掉
- 使用结构化日志 `zap.Error(err)`
- 使用 `api/v1` 包中的领域错误 (如 `v1.ErrBadRequest`)
- 添加上下文: `h.logger.WithContext(ctx).Error("message", zap.Error(err))`

**Swagger 注释** - 所有 API handler 必须添加:
```go
// GetUser godoc
// @Summary 获取用户详情
// @Tags User
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "用户ID"
// @Success 200 {object} v1.UserResponse
// @Router /users/{id} [get]
// @ID GetUserByID
```

**测试**
- 使用 `github.com/golang/mock/gomock` 进行 mock
- 使用 `github.com/gavv/httpexpect/v2` 进行 HTTP 测试
- 测试文件位置: `test/server/handler/`, `test/server/service/`
- 运行单个测试: `go test -v ./path/to/package -run TestName`

### TypeScript/React (前端)

**格式化** (Prettier)
- 单引号, 尾逗号, 100 字符宽度, LF 换行
- 运行: `npm run lint:prettier`

**导入** - 使用 `@/` 别名代替 `src/`
```typescript
import { Footer } from '@/components';
import { login } from '@/services/backend/user';
import { FormattedMessage, history, useIntl } from '@umijs/max';
import { Alert, message } from 'antd';
```

**组件结构**
```typescript
const Login: React.FC = () => {
  const [state, setState] = useState<Type>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

  const handleSubmit = async (values: API.LoginRequest) => {
    try {
      const resp = await login(values);
      if (resp.success) {
        message.success(intl.formatMessage({ id: 'success' }));
        history.push('/');
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'failure' }));
    }
  };

  return (
    // JSX
  );
};

export default Login;
```

**命名**
- 组件: `PascalCase` (如 `LoginForm`, `UserDropdown`)
- 函数: `camelCase` (如 `handleSubmit`, `fetchUserInfo`)
- 文件: 与组件名匹配 (如 `LoginForm.tsx`)
- 类型: 使用 `services/` 中生成的 `API.*` 类型

**API 类型** - 使用 OpenAPI 生成的类型:
```typescript
import { postLogin, postRegister } from '@/services/backend/user';

const handleLogin = async (values: API.LoginRequest) => {
  const response: API.LoginResponse = await postLogin(values);
};
```

**错误处理**
- 异步操作使用 try/catch
- 使用 `message.error()` 显示用户友好消息
- 使用 `FormattedMessage` 进行国际化

---

## 项目结构

```
backend/
├── api/v1/           # 请求/响应类型, 错误定义
├── cmd/
│   ├── server/       # HTTP 服务器入口
│   ├── migration/    # 数据库迁移
│   └── task/         # 后台任务
├── internal/
│   ├── handler/      # HTTP 处理器
│   ├── service/      # 业务逻辑
│   ├── repository/   # 数据访问
│   ├── model/        # 数据库模型
│   └── middleware/   # HTTP 中间件
├── pkg/              # 共享工具
├── config/           # 配置文件
└── test/
    ├── server/       # 集成测试
    └── mocks/        # 生成的 mocks

frontend/
├── src/
│   ├── pages/        # 页面组件
│   ├── components/   # 共享组件
│   ├── services/     # 生成的 API 服务
│   └── utils/        # 工具函数
└── config/           # UmiJS 配置
```

---

## 关键模式

**依赖注入 (后端)**
- 使用 Wire 进行依赖注入: `cmd/server/wire/wire.go`
- Service 接收接口而非具体类型
- 修改依赖后运行 `wire`

**API 响应格式**
```json
{
  "success": true,
  "errorMessage": "ok",
  "data": { ... },
  "code": 0
}
```

**身份认证**
- JWT 令牌: `Authorization: Bearer <token>`
- 令牌存储: `utils/auth.ts` (`setToken`, `getToken`)
- 中间件: `middleware/jwt.go`

**数据库事务**
```go
err := s.db.Transaction(func(tx *gorm.DB) error {
    // 事务内的多个操作
    return nil
})
```

**系统设置缓存 (前端)**
- 站点设置 (`SiteSetting`) 使用 localStorage 缓存，有效期 5 分钟
- 登录/登出时自动清理缓存
- 相关函数: `getSiteSetting`, `clearSiteSettingCache` (位于 `services/backend/setting.ts`)
