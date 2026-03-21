import access from '@/access';
import Icon from '@ant-design/icons';

/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    redirect: '/dashboard',
  },
  // 1. 数据大盘
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    component: '@/pages/Dashboard',
  },
  // 2. 工作台
  {
    path: '/workbench',
    name: 'workbench',
    icon: 'desktop',
    routes: [
      {
        path: '/workbench',
        redirect: '/workbench/overview',
      },
      {
        path: '/workbench/overview',
        name: 'overview',
        icon: 'appstore',
        component: '@/pages/Workbench/Overview',
      },
      {
        path: '/workbench/notification',
        name: 'notification',
        icon: 'bell',
        component: '@/pages/Workbench/Notification',
      },
      {
        path: '/workbench/todo',
        name: 'todo',
        icon: 'checkSquare',
        component: '@/pages/Workbench/Todo',
      },
    ],
  },
  // 3. 效能
  {
    path: '/efficiency',
    name: 'efficiency',
    icon: 'lineChart',
    routes: [
      {
        path: '/efficiency',
        redirect: '/efficiency/project',
      },
      {
        path: '/efficiency/project',
        name: 'project',
        icon: 'project',
        component: '@/pages/Efficiency/Project',
      },
      {
        path: '/efficiency/product',
        name: 'product',
        icon: 'shopping',
        component: '@/pages/Efficiency/Product',
      },
      {
        path: '/efficiency/development',
        name: 'development',
        icon: 'code',
        component: '@/pages/Efficiency/Development',
      },
      {
        path: '/efficiency/testing',
        name: 'testing',
        icon: 'experiment',
        component: '@/pages/Efficiency/Testing',
      },
    ],
  },
  // 4. 项目
  {
    path: '/project',
    name: 'project',
    icon: 'folder',
    routes: [
      {
        path: '/project',
        redirect: '/project/list',
      },
      {
        path: '/project/list',
        name: 'list',
        icon: 'unorderedList',
        component: '@/pages/Project/List',
      },
      {
        path: '/project/detail/:id',
        name: 'detail',
        component: '@/pages/Project/Detail',
        hideInMenu: true,
      },
      {
        path: '/project/members',
        name: 'members',
        icon: 'team',
        component: '@/pages/Project/Members',
      },
    ],
  },
  // 5. 需求
  {
    path: '/requirement',
    name: 'requirement',
    icon: 'fileText',
    routes: [
      {
        path: '/requirement',
        redirect: '/requirement/list',
      },
      {
        path: '/requirement/list',
        name: 'list',
        icon: 'unorderedList',
        component: '@/pages/Requirement/List',
      },
      {
        path: '/requirement/detail/:id',
        name: 'detail',
        component: '@/pages/Requirement/Detail',
        hideInMenu: true,
      },
    ],
  },
  // 6. 测试
  {
    path: '/testing',
    name: 'testing',
    icon: 'experiment',
    routes: [
      {
        path: '/testing',
        redirect: '/testing/testcase',
      },
      {
        path: '/testing/testcase',
        name: 'testcase',
        icon: 'fileText',
        component: '@/pages/Testing/TestCase',
      },
      {
        path: '/testing/testcase/edit',
        name: 'testCaseEdit',
        component: '@/pages/Testing/TestCase/Edit',
        hideInMenu: true,
      },
      {
        path: '/testing/testcase/import',
        name: 'testCaseImport',
        component: '@/pages/Testing/TestCase/Import',
        hideInMenu: true,
      },
      {
        path: '/testing/testplan',
        name: 'testplan',
        icon: 'calendar',
        component: '@/pages/Testing/TestPlan',
      },
      {
        path: '/testing/report',
        name: 'report',
        icon: 'barChart',
        component: '@/pages/Testing/Report',
      },
      {
        path: '/testing/report/detail/:id',
        name: 'reportDetail',
        component: '@/pages/Testing/Report/Detail',
        hideInMenu: true,
      },
    ],
  },
  // 7. 缺陷
  {
    path: '/bug',
    name: 'bug',
    icon: 'bug',
    routes: [
      {
        path: '/bug',
        redirect: '/bug/list',
      },
      {
        path: '/bug/list',
        name: 'list',
        icon: 'unorderedList',
        component: '@/pages/Bug/List',
      },
      {
        path: '/bug/detail/:id',
        name: 'detail',
        component: '@/pages/Bug/Detail',
        hideInMenu: true,
      },
    ],
  },
  // 8. 设备
  {
    path: '/device',
    name: 'device',
    icon: 'mobile',
    routes: [
      {
        path: '/device',
        redirect: '/device/list',
      },
      {
        path: '/device/list',
        name: 'list',
        icon: 'unorderedList',
        component: '@/pages/Device/List',
      },
      {
        path: '/device/detail/:id',
        name: 'detail',
        component: '@/pages/Device/Detail',
        hideInMenu: true,
      },
    ],
  },
  // 9. 个人中心
  {
    path: '/profile',
    name: 'profile',
    icon: 'user',
    routes: [
      {
        path: '/profile',
        redirect: '/profile/center',
      },
      {
        path: '/profile/center',
        name: 'center',
        icon: 'idcard',
        component: '@/pages/Profile/Center',
      },
      {
        path: '/profile/settings',
        name: 'settings',
        icon: 'setting',
        component: '@/pages/Profile/Settings',
      },
    ],
  },
  // 10. 管理中心
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/user',
      },
      {
        path: '/admin/user',
        name: 'user',
        icon: 'user',
        component: '@/pages/Admin/User',
      },
      {
        path: '/admin/role',
        name: 'role',
        icon: 'safety',
        component: '@/pages/Admin/Role',
      },
      {
        path: '/admin/menu',
        name: 'menu',
        icon: 'menu',
        component: '@/pages/Admin/Menu',
      },
      {
        path: '/admin/api',
        name: 'api',
        icon: 'api',
        component: '@/pages/Admin/Api',
      },
      {
        path: '/admin/audit',
        name: 'audit',
        icon: 'audit',
        component: '@/pages/Admin/Audit',
      },
      {
        path: '/admin/model',
        name: 'model',
        icon: 'product',
        component: '@/pages/Admin/Model',
      },
      {
        path: '/admin/config',
        name: 'config',
        icon: 'tool',
        component: '@/pages/Admin/Config',
      },
    ],
  },
  // 11. 使用帮助
  {
    path: '/help',
    name: 'help',
    icon: 'questionCircle',
    component: '@/pages/Help',
  },
  {
    name: 'login',
    path: '/login',
    component: '@/pages/Login',
    layout: false,
  },
  {
    name: 'oidc-callback',
    path: '/auth/callback',
    component: '@/pages/Auth/OIDCCallback',
    layout: false,
  },
  {
    name: 'register',
    path: '/register',
    component: '@/pages/Register',
    layout: false,
  },
  {
    name: 'forgot-password',
    path: '/forgot-password',
    component: '@/pages/ForgotPassword',
    layout: false,
  },
  {
    name: 'reset-password',
    path: '/reset-password',
    component: '@/pages/ResetPassword',
    layout: false,
  },
  {
    path: '*',
    layout: false,
    component: '@/pages/404',
  },
];
