# Frontend 项目描述文档

## 一、项目概述

### 1.1 基本信息

| 属性 | 值 |
|-----|-----|
| 项目名称 | frontend |
| 项目类型 | 前端 Web 应用 |
| 开发框架 | Umi.js 4.x |
| UI 组件库 | Ant Design 5.x |
| 模板来源 | Ant Design Pro 6.0.0 |
| 开发语言 | TypeScript 5.6.3 |
| 许可证 | MIT |
| Node.js 要求 | >= 20.0.0 |

### 1.2 项目定位

本项目是自动化测试平台的 **Web 管理前端**，基于 Ant Design Pro 企业级中后台模板构建，负责提供可视化操作界面，支持用户通过浏览器访问平台的所有功能。项目采用现代化的前端技术栈，具备良好的用户体验、可维护性和可扩展性。

### 1.3 核心功能

- **用户认证**：登录、登出、Token 刷新、权限控制
- **仪表盘**：数据概览、统计图表、最近任务
- **项目管理**：项目的增删改查、用例管理、套件管理
- **任务中心**：任务创建、执行监控、任务控制
- **设备管理**：设备池监控、设备详情、设备控制
- **报告分析**：测试报告查看、趋势分析、失败分析
- **系统配置**：用户管理、角色权限、系统配置
- **国际化**：支持多语言（中文、英文、日文等）

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 用途说明 |
|-----|---------|---------|
| 框架 | Umi.js 4.3.24 | 企业级前端框架 |
| UI 组件库 | Ant Design 5.25.4 | React 组件库 |
| 状态管理 | 内置 (dva/Umi State) | 全局状态管理 |
| 路由 | Umi Router | 客户端路由 |
| 语言 | TypeScript 5.6.3 | 类型安全 |
| 构建工具 | Vite | 开发构建 |
| CSS 方案 | Ant Design Tokens | 主题定制 |
| 样式方案 | Less + CSS Modules | 样式管理 |
| HTTP 客户端 | Axios (Umi Request) | 网络请求 |
| 图表 | ECharts | 数据可视化 |
| 国际化 | Umi i18n | 多语言支持 |
| 代码规范 | Biome + ESLint | 代码检查 |
| 测试 | Jest + React Testing Library | 单元测试 |
| 代码美化 | Prettier | 代码格式化 |
| Git Hooks | Husky + lint-staged | Git 提交检查 |

### 2.2 架构模式

本项目采用 **MVVM**（Model-View-ViewModel）架构模式，结合 Umi.js 的约定式路由和插件体系，实现前后端分离的前端应用。

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              视图层 (View)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Pages         │  │  Components     │  │   Layouts       │                │
│  │  (页面组件)     │  │  (业务组件)     │  │  (布局组件)     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           视图模型层 (ViewModel)                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Hooks         │  │   Services     │  │   Models        │                │
│  │  (组合式函数)    │  │  (API 服务)    │  │  (状态模型)     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              模型层 (Model)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Global Store  │  │   Page Store    │  │   Request Cache │                │
│  │  (全局状态)     │  │  (页面状态)     │  │  (请求缓存)     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              服务层 (Services)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Umi Request    │  │   Mock 数据     │  │   Third-party  │                │
│  │  (HTTP 客户端)    │  │  (本地模拟)     │  │  (第三方服务)   │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 项目结构

```
frontend/
├── config/                           # 配置文件
│   ├── config.ts                    # 主配置文件
│   ├── defaultSettings.ts            # 默认设置（标题、logo等）
│   ├── oneapi.json                  # OneAPI 配置
│   ├── proxy.ts                     # 代理配置
│   └── routes.ts                    # 路由配置
│
├── mock/                             # Mock 数据
│   ├── listTableList.ts             # 列表模拟数据
│   ├── monitor.mock.ts              # 监控模拟数据
│   ├── notices.ts                   # 通知模拟数据
│   ├── requestRecord.mock.js        # 请求记录模拟
│   ├── route.ts                     # 路由模拟
│   └── user.ts                      # 用户模拟数据
│
├── public/                           # 静态资源
│   ├── icons/                       # 图标文件
│   │   ├── icon-128x128.png
│   │   ├── icon-192x192.png
│   │   └── icon-512x128.png
│   ├── scripts/
│   │   └── loading.js              # 加载脚本
│   ├── CNAME                       # 域名配置
│   ├── favicon.ico                  # 网站图标
│   ├── logo.svg                    # Logo
│   └── pro_icon.svg                # Pro Logo
│
├── src/                             # 源码目录
│   ├── components/                  # 公共组件
│   │   ├── Footer/                 # 页脚组件
│   │   │   └── index.tsx
│   │   ├── HeaderDropdown/         # 头部下拉菜单
│   │   │   └── index.tsx
│   │   ├── RightContent/           # 右侧内容区
│   │   │   ├── AvatarDropdown.tsx  # 头像下拉菜单
│   │   │   └── index.tsx
│   │   └── index.ts                # 组件导出
│   │
│   ├── locales/                     # 国际化文案
│   │   ├── zh-CN/                  # 简体中文
│   │   │   ├── component.ts
│   │   │   ├── globalHeader.ts
│   │   │   ├── menu.ts
│   │   │   ├── pages.ts
│   │   │   ├── pwa.ts
│   │   │   ├── settingDrawer.ts
│   │   │   └── settings.ts
│   │   ├── en-US/                  # 英文（可扩展）
│   │   ├── ja-JP/                   # 日文
│   │   ├── zh-TW/                   # 繁体中文
│   │   ├── pt-BR/                   # 葡萄牙文
│   │   ├── id-ID/                   # 印尼文
│   │   ├── fa-IR/                   # 波斯文
│   │   └── bn-BD.ts                 # 孟加拉文
│   │
│   ├── pages/                       # 页面组件
│   │   ├── 404.tsx                 # 404 页面
│   │   ├── Admin.tsx               # 管理员页面
│   │   ├── Welcome.tsx             # 欢迎页面
│   │   ├── table-list/             # 列表示例
│   │   │   ├── components/
│   │   │   │   ├── CreateForm.tsx  # 新建表单
│   │   │   │   └── UpdateForm.tsx # 更新表单
│   │   │   └── index.tsx          # 列表页面
│   │   └── user/
│   │       └── login/              # 登录页面
│   │           ├── index.tsx
│   │           ├── login.test.tsx
│   │           └── __snapshots__/
│   │               └── login.test.tsx.snap
│   │
│   ├── services/                    # API 服务
│   │   ├── ant-design-pro/         # Ant Design Pro API
│   │   │   ├── api.ts
│   │   │   ├── index.ts
│   │   │   ├── login.ts
│   │   │   └── typings.d.ts
│   │   └── swagger/                # Swagger API
│   │       ├── index.ts
│   │       ├── pet.ts
│   │       ├── store.ts
│   │       ├── typings.d.ts
│   │       ├── user.ts
│   │       └── ...
│   │
│   ├── access.ts                    # 权限控制
│   ├── app.tsx                      # 应用入口
│   ├── global.less                  # 全局样式
│   ├── global.tsx                   # 全局配置
│   ├── loading.tsx                  # 加载组件
│   ├── manifest.json                # PWA 配置
│   ├── requestErrorConfig.ts        # 请求错误配置
│   ├── service-worker.js            # Service Worker
│   └── typings.d.ts                 # 类型声明
│
├── tests/                           # 测试配置
│   └── setupTests.jsx              # 测试初始化
│
├── types/                          # 类型定义
│   └── index.d.ts                   # 全局类型
│
├── README.md                       # 项目自述
├── biome.json                      # Biome 配置
├── jest.config.ts                  # Jest 配置
├── package.json                    # 依赖配置
└── tsconfig.json                  # TypeScript 配置
```

---

## 三、核心配置

### 3.1 路由配置

```typescript
// config/routes.ts
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/login',
          },
        ],
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    routes: [
      {
        path: '/dashboard',
        redirect: '/dashboard/analysis',
      },
      {
        path: '/dashboard/analysis',
        name: 'analysis',
        component: './dashboard/analysis',
      },
    ],
  },
  {
    path: '/projects',
    name: 'projects',
    icon: 'project',
    routes: [
      {
        path: '/projects/list',
        name: 'project-list',
        component: './projects/list',
      },
      {
        path: '/projects/:id',
        component: './projects/detail',
      },
    ],
  },
  {
    path: '/tasks',
    name: 'tasks',
    icon: 'task',
    routes: [
      {
        path: '/tasks',
        redirect: '/tasks/list',
      },
      {
        path: '/tasks/list',
        name: 'task-list',
        component: './tasks/list',
      },
      {
        path: '/tasks/create',
        name: 'task-create',
        component: './tasks/create',
      },
      {
        path: '/tasks/monitor/:id',
        name: 'task-monitor',
        component: './tasks/monitor',
      },
    ],
  },
  {
    path: '/devices',
    name: 'devices',
    icon: 'mobile',
    routes: [
      {
        path: '/devices',
        redirect: '/devices/list',
      },
      {
        path: '/devices/list',
        name: 'device-list',
        component: './devices/list',
      },
    ],
  },
  {
    path: '/reports',
    name: 'reports',
    icon: 'barChart',
    routes: [
      {
        path: '/reports',
        redirect: '/reports/list',
      },
      {
        path: '/reports/list',
        name: 'report-list',
        component: './reports/list',
      },
      {
        path: '/reports/detail/:id',
        name: 'report-detail',
        component: './reports/detail',
      },
    ],
  },
  {
    path: '/settings',
    name: 'settings',
    icon: 'setting',
    routes: [
      {
        path: '/settings/users',
        name: 'user-management',
        component: './settings/users',
      },
      {
        path: '/settings/roles',
        name: 'role-management',
        component: './settings/roles',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    component: './404',
  },
];
```

### 3.2 代理配置

```typescript
// config/proxy.ts
export default {
  dev: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  test: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
};
```

### 3.3 默认设置

```typescript
// config/defaultSettings.ts
export default {
  navTheme: 'light',
  // 主题模式：'light' | 'dark'
  
  primaryColor: '#1890FF',
  // 主色调
  
  layout: 'mix',
  // 布局模式：'side' | 'top' | 'mix'
  
  contentWidth: 'Fluid',
  // 内容宽度：'Fixed' | 'Fluid'
  
  fixedHeader: false,
  // 固定 Header
  
  fixSiderbar: true,
  // 固定侧边栏
  
  colorWeak: false,
  // 色弱模式
  
  title: '自动化测试平台',
  // 网站标题
  
  pwa: false,
  // PWA 模式
  
  iconfontUrl: '//at.alicdn.com/t/xxx.js',
  // Iconfont URL
  
  logo: '/logo.svg',
  // Logo
  
  defaultLanguage: 'zh-CN',
  // 默认语言
};
```

### 3.4 环境配置

```typescript
// config/config.ts
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

export default defineConfig({
  // 开启 chunks 优化
  chunks: ['vendors', 'umi'],
  
  // 主题配置
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  
  // 国际化
  locale: {
    default: defaultSettings.defaultLanguage,
    antd: true,
    title: false,
    baseNavigator: true,
  },
  
  // 动态路由
  dynamicRoutes: [
    {
      path: '/dashboard',
      component: './pages/dashboard',
    },
    // ...
  ],
  
  // 代理配置
  proxy: proxy,
  
  // 路由配置
  routes: routes,
  
  // 基础路径
  base: '/',
  
  // 公共路径
  publicPath: '/',
  
  // 输出目录
  outputPath: './dist',
  
  // 面包屑
  breadcrumbs: [],
  
  // 钩子
  define: {
    REACT_APP_ENV: process.env.REACT_APP_ENV,
  },
  
  // 忽略 moment locale
  ignoreMomentLocale: true,
  
  // 压缩 CSS
  compressCss: true,
  
  // less-loader 配置
  lessLoader: {
    lessOptions: {
      modifyVars: {
        'root-entry-name': 'default',
      },
    },
  },
  
  // 外部链接
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  
  // HTML 模板
  // 使用默认模板
});
```

---

## 四、页面结构

### 4.1 页面目录

```
src/pages/
├── 404.tsx                          # 404 页面
├── Admin.tsx                        # 管理员页面模板
├── Welcome.tsx                      # 欢迎页面
│
├── dashboard/                       # 仪表盘模块
│   └── index.tsx                    # 仪表盘首页
│
├── projects/                        # 项目管理模块
│   ├── list/                       # 项目列表
│   │   └── index.tsx
│   ├── detail/                     # 项目详情
│   │   └── index.tsx
│   ├── cases/                      # 用例管理
│   │   ├── list/
│   │   │   └── index.tsx
│   │   ├── edit/
│   │   │   └── index.tsx
│   │   └── import/
│   │       └── index.tsx
│   └── suites/                     # 套件管理
│       ├── list/
│       │   └── index.tsx
│       ├── create/
│       │   └── index.tsx
│       └── detail/
│           └── index.tsx
│
├── tasks/                           # 任务中心模块
│   ├── list/                       # 任务列表
│   │   └── index.tsx
│   ├── create/                     # 创建任务
│   │   └── index.tsx
│   └── monitor/                    # 执行监控
│       └── index.tsx
│
├── devices/                        # 设备管理模块
│   ├── list/                       # 设备池
│   │   └── index.tsx
│   └── detail/                     # 设备详情
│       └── index.tsx
│
├── reports/                        # 报告分析模块
│   ├── list/                       # 报告列表
│   │   └── index.tsx
│   ├── detail/                     # 报告详情
│   │   └── index.tsx
│   └── trends/                     # 趋势分析
│       └── index.tsx
│
├── settings/                       # 系统设置模块
│   ├── users/                      # 用户管理
│   │   └── index.tsx
│   ├── roles/                      # 角色权限
│   │   └── index.tsx
│   ├── systems/                    # 系统配置
│   │   └── index.tsx
│   └── audit/                      # 审计日志
│       └── index.tsx
│
└── help/                           # 帮助中心
    └── index.tsx
```

### 4.2 页面组件规范

```tsx
// 页面组件模板
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useModel } from 'umi';

interface DataType {
  id: number;
  name: string;
  status: number;
  createdAt: string;
}

const PageName: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [total, setTotal] = useState(0);
  
  // 全局状态
  const { initialState } = useModel('global');
  
  // 获取数据
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/xxx?page=${page}&pageSize=${pageSize}`);
      const result = await response.json();
      setData(result.data.list);
      setTotal(result.data.total);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化加载
  useEffect(() => {
    fetchData();
  }, []);
  
  // 表格列定义
  const columns: ColumnsType<DataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const config: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '禁用' },
          1: { color: 'success', text: '启用' },
        };
        const { color, text } = config[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];
  
  // 分页配置
  const pagination = {
    current: 1,
    pageSize: 10,
    total,
    onChange: (page: number, pageSize: number) => {
      fetchData(page, pageSize);
    },
  };
  
  return (
    <PageContainer
      header={{
        title: '页面标题',
        breadcrumb: {
          routes: [
            { path: '/', breadcrumbName: '首页' },
            { path: '/projects', breadcrumbName: '项目管理' },
            { path: '', breadcrumbName: '列表' },
          ],
        },
      }}
      extra={[
        <Button key="add" type="primary" onClick={() => handleAdd()}>
          新增
        </Button>,
      ]}
    >
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
        />
      </Card>
    </PageContainer>
  );
};

export default PageName;
```

---

## 五、组件结构

### 5.1 公共组件

```
src/components/
├── Footer/
│   └── index.tsx                  # 全局页脚组件
├── HeaderDropdown/
│   └── index.tsx                   # 头部下拉菜单组件
├── RightContent/
│   ├── AvatarDropdown.tsx          # 头像下拉菜单
│   └── index.tsx                   # 右侧内容组件
└── index.ts                        # 组件统一导出
```

### 5.2 业务组件

```
src/components/
├── common/                         # 通用业务组件
│   ├── PageHeader/                 # 页面头部
│   │   └── index.tsx
│   ├── SearchForm/                 # 搜索表单
│   │   └── index.tsx
│   ├── DataTable/                  # 数据表格
│   │   └── index.tsx
│   ├── Pagination/                 # 分页组件
│   │   └── index.tsx
│   └── StatusTag/                 # 状态标签
│       └── index.tsx
│
├── dashboard/                      # 仪表盘组件
│   ├── StatCard/                  # 统计卡片
│   │   └── index.tsx
│   ├── TrendChart/                # 趋势图表
│   │   └── index.tsx
│   └── DeviceGrid/                # 设备网格
│       └── index.tsx
│
├── project/                        # 项目组件
│   ├── CaseTree/                  # 用例树
│   │   └── index.tsx
│   ├── CaseEditor/                # 用例编辑器
│   │   └── index.tsx
│   └── SuiteBuilder/              # 套件构建器
│       └── index.tsx
│
├── task/                          # 任务组件
│   ├── TaskProgress/              # 任务进度
│   │   └── index.tsx
│   ├── DeviceCard/                # 设备卡片
│   │   └── index.tsx
│   ├── RealTimeLog/               # 实时日志
│   │   └── index.tsx
│   └── ScreenCast/                # 屏幕投射
│       └── index.tsx
│
├── device/                        # 设备组件
│   ├── DeviceCard/                # 设备卡片
│   │   └── index.tsx
│   ├── PerformanceChart/         # 性能图表
│   │   └── index.tsx
│   └── DeviceControl/             # 设备控制面板
│       └── index.tsx
│
└── report/                        # 报告组件
    ├── ReportSummary/             # 报告摘要
    │   └── index.tsx
    ├── ResultChart/              # 结果图表
    │   └── index.tsx
    └── FailureAnalysis/           # 失败分析
        └── index.tsx
```

---

## 六、API 服务

### 6.1 服务结构

```
src/services/
├── ant-design-pro/               # Ant Design Pro API
│   ├── api.ts                    # 通用 API 方法
│   ├── index.ts                  # 服务导出
│   ├── login.ts                  # 登录相关 API
│   └── typings.d.ts              # 类型声明
│
└── swagger/                      # Swagger API
    ├── index.ts                  # 服务导出
    ├── pet.ts                    # Pet Store 示例
    ├── store.ts                  # Store API
    ├── user.ts                   # User API
    ├── typings.d.ts              # 类型声明
    └── ...
```

### 6.2 API 请求封装

```typescript
// src/services/ant-design-pro/api.ts
import { request, history } from 'umi';
import type { RequestOptions } from 'umi';

// 响应数据类型
export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页数据类型
export interface ListData<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 基础请求方法
export const requestAPI = async <T>(
  url: string,
  options?: RequestOptions
): Promise<T> => {
  const response = await request<ResponseData<T>>(url, {
    timeout: 30000,
    ...options,
  });
  
  if (response.code !== 0) {
    throw new Error(response.message || '请求失败');
  }
  
  return response.data;
};

// 封装常见请求
export const get = <T>(url: string, params?: object) =>
  requestAPI<T>(url, { method: 'GET', params });

export const post = <T>(url: string, data?: object) =>
  requestAPI<T>(url, { method: 'POST', data });

export const put = <T>(url: string, data?: object) =>
  requestAPI<T>(url, { method: 'PUT', data });

export const del = <T>(url: string, params?: object) =>
  requestAPI<T>(url, { method: 'DELETE', params });
```

### 6.3 业务 API 定义

```typescript
// src/services/api.ts
import { get, post, put, del } from './ant-design-pro/api';
import type { ResponseData, ListData } from './ant-design-pro/api';

// ========== 用户相关 ==========

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  userInfo: {
    id: number;
    username: string;
    avatar: string;
  };
}

export const login = (data: LoginParams) =>
  post<LoginResult>('/api/v1/auth/login', data);

export const logout = () => post('/api/v1/auth/logout');

export const getCurrentUser = () =>
  get<ResponseData>('/api/v1/users/me');

export const updateProfile = (data: object) =>
  put<ResponseData>('/api/v1/users/me', data);

// ========== 项目相关 ==========

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  createdAt: string;
}

export const getProjects = (params?: object) =>
  get<ListData<Project>>('/api/v1/projects', params);

export const getProject = (id: number) =>
  get<Project>(`/api/v1/projects/${id}`);

export const createProject = (data: object) =>
  post<Project>('/api/v1/projects', data);

export const updateProject = (id: number, data: object) =>
  put<Project>(`/api/v1/projects/${id}`, data);

export const deleteProject = (id: number) =>
  del(`/api/v1/projects/${id}`);

// ========== 任务相关 ==========

export interface Task {
  id: number;
  name: string;
  status: number;
  progress: number;
  createdAt: string;
}

export const getTasks = (params?: object) =>
  get<ListData<Task>>('/api/v1/tasks', params);

export const getTask = (id: number) =>
  get<Task>(`/api/v1/tasks/${id}`);

export const createTask = (data: object) =>
  post<Task>('/api/v1/tasks', data);

export const cancelTask = (id: number) =>
  post(`/api/v1/tasks/${id}/cancel`);

export const retryTask = (id: number) =>
  post(`/api/v1/tasks/${id}/retry`);

// ========== 设备相关 ==========

export interface Device {
  id: number;
  name: string;
  type: number;
  status: number;
  online: boolean;
}

export const getDevices = (params?: object) =>
  get<ListData<Device>>('/api/v1/devices', params);

export const getDevice = (id: number) =>
  get<Device>(`/api/v1/devices/${id}`);
```

---

## 七、状态管理

### 7.1 全局状态

```typescript
// src/models/global.ts
import { useState, useCallback } from 'react';

export interface GlobalState {
  collapsed: boolean;
  notices: NoticeItem[];
  currentUser: CurrentUser | undefined;
  settings: typeof defaultSettings;
}

export const useModel = (key: 'global') => {
  const [globalState, setGlobalState] = useState<GlobalState>({
    collapsed: false,
    notices: [],
    currentUser: undefined,
    settings: defaultSettings,
  });

  const setCollapsed = useCallback((collapsed: boolean) => {
    setGlobalState((prev) => ({ ...prev, collapsed }));
  }, []);

  const setNotices = useCallback((notices: NoticeItem[]) => {
    setGlobalState((prev) => ({ ...prev, notices }));
  }, []);

  const setCurrentUser = useCallback((user: CurrentUser) => {
    setGlobalState((prev) => ({ ...prev, currentUser: user }));
  }, []);

  return {
    initialState: globalState,
    setCollapsed,
    setNotices,
    setCurrentUser,
  };
};
```

### 7.2 页面状态

```typescript
// 示例：任务列表页面的状态管理
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getTasks, Task } from '@/services/api';

export const useTaskList = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTasks({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      setTasks(result.list);
      setTotal(result.total);
    } catch (error) {
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  return {
    loading,
    tasks,
    total,
    pagination,
    fetchTasks,
    handleTableChange,
  };
};
```

---

## 八、国际化

### 8.1 语言配置

```typescript
// src/locales/zh-CN.ts
export default {
  'menu.dashboard': '仪表盘',
  'menu.projects': '项目管理',
  'menu.tasks': '任务中心',
  'menu.devices': '设备管理',
  'menu.reports': '报告分析',
  'menu.settings': '系统设置',
  
  'common.save': '保存',
  'common.cancel': '取消',
  'common.submit': '提交',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.add': '新增',
  'common.search': '搜索',
  'common.reset': '重置',
  
  'status.enabled': '启用',
  'status.disabled': '禁用',
  'status.pending': '待执行',
  'status.running': '执行中',
  'status.completed': '已完成',
  'status.failed': '失败',
  
  'login.title': '登录',
  'login.username': '用户名',
  'login.password': '密码',
  'login.submit': '登录',
  
  'project.list': '项目列表',
  'project.create': '创建项目',
  'project.edit': '编辑项目',
  
  'task.list': '任务列表',
  'task.create': '创建任务',
  'task.monitor': '执行监控',
  
  'device.list': '设备列表',
  'device.online': '在线',
  'device.offline': '离线',
  'device.busy': '忙碌',
  
  // 更多国际化文案...
};
```

### 8.2 使用方式

```tsx
import React from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { Button } from 'antd';

const Component: React.FC = () => {
  const intl = useIntl();
  
  return (
    <div>
      <Button>
        <FormattedMessage id="common.save" defaultMessage="保存" />
      </Button>
      <span>
        {intl.formatMessage({
          id: 'welcome',
          defaultMessage: '欢迎使用自动化测试平台',
        })}
      </span>
    </div>
  );
};

export default Component;
```

---

## 九、主题定制

### 9.1 主题配置

```typescript
// config/config.ts
import { defineConfig } from 'umi';

export default defineConfig({
  theme: {
    // 主色调
    'primary-color': '#1890FF',
    
    // 成功色
    'success-color': '#52C41A',
    
    // 警告色
    'warning-color': '#FAAD14',
    
    // 错误色
    'error-color': '#FF4D4F',
    
    // 字体
    'font-family':
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    
    // 边框圆角
    'border-radius-base': '4px',
    'border-radius-sm': '2px',
    'border-radius-lg': '8px',
  },
  
  lessLoader: {
    lessOptions: {
      modifyVars: {
        'root-entry-name': 'default',
      },
    },
  },
});
```

### 9.2 全局样式

```less
/* src/global.less */

// 全局样式覆盖
.ant-layout {
  min-height: 100vh;
}

.ant-pro-layout {
  min-height: 100vh;
}

// 暗色主题适配
.dark {
  .ant-layout {
    background: #141414;
  }
  
  .ant-card {
    background: #1f1f1f;
  }
}

// 表格样式优化
.ant-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }
}

// 表单样式优化
.ant-form-item-label > label {
  font-weight: 500;
}

// 按钮样式优化
.ant-btn-primary {
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}
```

---

## 十、权限控制

### 10.1 权限定义

```typescript
// src/access.ts
import type { InitialState } from './app';

export type AccessName =
  | 'admin'
  | 'user'
  | 'guest'
  | 'project_admin'
  | 'test_engineer'
  | 'viewer';

export type InitialStateAccess = {
  currentUser: {
    id: number;
    username: string;
    roles: AccessName[];
  } | undefined;
  canAccess: (authority: AccessName | AccessName[]) => boolean;
};

export default function access(
  initialState: InitialState
): InitialStateAccess {
  const { currentUser } = initialState || {};

  return {
    currentUser,
    canAccess: (authority: AccessName | AccessName[]) => {
      if (!currentUser) {
        return false;
      }

      if (authority.includes('admin')) {
        return currentUser.roles.includes('admin');
      }

      if (Array.isArray(authority)) {
        return authority.some((item) => currentUser.roles.includes(item));
      }

      return currentUser.roles.includes(authority);
    },
  };
}
```

### 10.2 权限使用

```tsx
import React from 'react';
import { useAccess, Access } from 'umi';
import { Button } from 'antd';

const Component: React.FC = () => {
  const access = useAccess();
  
  return (
    <div>
      {/* 普通按钮 */}
      <Button>基础操作</Button>
      
      {/* 需要权限的按钮 */}
      <Access accessible={access.canAccess('admin')}>
        <Button type="primary">管理员操作</Button>
      </Access>
      
      {/* 多权限或条件 */}
      <Access
        accessible={
          access.canAccess(['project_admin', 'test_engineer'])
        }
      >
        <Button>测试操作</Button>
      </Access>
    </div>
  );
};
```

---

## 十一、开发规范

### 11.1 代码规范

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",
  "extends": [],
  "files": {
    "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": "warn",
      "correctness": "error",
      "suspicious": "warn",
      "style": "warn",
      "nursery": "warn"
    }
  },
  "organizeImports": {
    "enabled": true
  }
}
```

### 11.2 命名规范

| 类型 | 规范 | 示例 |
|-----|------|-----|
| 文件名 | 小写下划线 | `user-list.tsx` |
| 组件名 | 大驼峰 | `UserList.tsx` |
| 变量名 | 小驼峰 | `userList` |
| 常量名 | 全大写 | `MAX_COUNT` |
| CSS 类名 | BEM 风格 | `.user-list__item` |
| 状态名 | 小驼峰，以 State 结尾 | `loadingState` |

### 11.3 Git 规范

```bash
# 提交信息规范
feat: 新增 xxx 功能
fix: 修复 xxx 问题
docs: 更新 xxx 文档
style: 代码格式调整
refactor: 重构 xxx 代码
test: 新增/修改测试
chore: 构建/工具更新

# 示例
git commit -m "feat(project): 新增项目创建功能"
git commit -m "fix(task): 修复任务列表分页问题"
git commit -m "docs(readme): 更新项目文档"
```

---

## 十二、测试

### 12.1 测试配置

```typescript
// jest.config.ts
import { configUmi } from '@umijs/max/jest';

export default {
  ...configUmi,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
};
```

### 12.2 测试示例

```tsx
// src/pages/user/login/__tests__/login.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../index';

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
  });

  it('shows error when username is empty', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('登录'));
    
    expect(await screen.findByText('请输入用户名')).toBeInTheDocument();
  });
});
```

---

## 十三、构建部署

### 13.1 构建命令

```bash
# 开发环境启动
npm run start
npm run start:dev        # 不使用 Mock
npm run start:no-mock    # 不使用 Mock
npm run start:pre       # 预发布环境

# 构建生产版本
npm run build

# 构建分析
npm run analyze

# 预览构建结果
npm run preview

# 代码检查
npm run lint
npm run biome:lint      # Biome 检查
npm run tsc             # TypeScript 检查

# 测试
npm run test
npm run test:update     # 更新快照
npm run test:coverage   # 生成覆盖率报告

# 国际化
npm run i18n-remove     # 移除国际化代码

# 部署
npm run deploy          # 构建并部署到 GitHub Pages
```

### 13.2 环境变量

| 变量名 | 说明 | 可选值 |
|-------|------|-------|
| `REACT_APP_ENV` | 应用环境 | `dev` / `test` / `pre` / `prod` |
| `MOCK` | 是否启用 Mock | `none` / `always` |
| `UMI_ENV` | Umi 环境 | `dev` / `prod` |
| `PORT` | 开发服务器端口 | 默认 `8000` |

### 13.3 构建产物

```
dist/
├── index.html              # 入口 HTML
├── favicon.ico             # 网站图标
├── logo.svg                # Logo
├── umi.css                 # Umi 样式
├── umi.js                  # Umi 入口
├── chunk-xxx.js            # 代码分片
├── vendors.css             # 第三方库样式
├── vendors.js              # 第三方库代码
└── static/                 # 静态资源
    ├── icons/
    └── scripts/
```

---

## 十四、常见问题

### Q1: 如何添加新页面？

1. 在 `src/pages/` 下创建页面目录
2. 创建 `index.tsx` 文件
3. 在 `config/routes.ts` 中注册路由

### Q2: 如何添加 API？

1. 在 `src/services/api.ts` 中添加 API 方法
2. 使用 `get/post/put/del` 封装请求
3. 在 `src/typings.d.ts` 中添加类型定义

### Q3: 如何使用 Mock 数据？

```typescript
// 方式一：本地 Mock
// 在 mock/user.ts 中定义
export default {
  'GET /api/users': { list: [...] },
  'POST /api/users': (req, res) => { ... },
};

// 方式二：关闭 Mock，使用真实接口
npm run start:no-mock
```

### Q4: 如何自定义主题？

修改 `config/config.ts` 中的 `theme` 配置：

```typescript
export default defineConfig({
  theme: {
    'primary-color': '#1890FF',
    'success-color': '#52C41A',
    // ...
  },
});
```

### Q5: 如何处理权限？

```typescript
// 路由级别权限控制
{
  path: '/settings',
  name: 'settings',
  access: 'admin',  // 需要 admin 权限
  routes: [...]
}

// 组件级别权限控制
import { useAccess, Access } from 'umi';

<Access accessible={canAccess('admin')}>
  <AdminButton />
</Access>
```

---

## 十五、参考资源

| 资源 | 链接 |
|-----|------|
| Ant Design Pro | https://pro.ant.design |
| Ant Design | https://ant.design |
| Umi.js | https://umijs.org |
| TypeScript | https://www.typescriptlang.org |
| React | https://react.dev |
| Vite | https://vitejs.dev |
| Biome | https://biomejs.dev |
