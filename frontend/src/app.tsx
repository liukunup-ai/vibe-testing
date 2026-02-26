
import { fetchCurrentUser, fetchDynamicMenu } from '@/services/backend/user';
import {
  ExperimentOutlined,
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  HistoryOutlined,
  MobileOutlined,
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  DesktopOutlined,
  LineChartOutlined,
  FolderOutlined,
  BugOutlined,
  BellOutlined,
  CheckSquareOutlined,
  ShoppingOutlined,
  CodeOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  IdcardOutlined,
  SafetyOutlined,
  MenuOutlined,
  ApiOutlined,
  AuditOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { AvatarDropdown, AvatarName, Footer, Question, SelectLang, SelectDirection, SelectTimezone, SelectTheme } from '@/components';

import { getSiteSettingWithCache } from '@/utils/settingCache';
import { initToken } from '@/models/useTokenModel';
import { LinkOutlined, SmileOutlined, CrownOutlined, AppstoreOutlined, ProfileOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, Helmet, setLocale } from '@umijs/max';
import React, { useEffect } from 'react';
import { ConfigProvider, theme, App } from 'antd';
import { HappyProvider } from '@ant-design/happy-work-theme';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './utils/request';
import '@ant-design/v5-patch-for-react-19';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { initSentry } from '@/utils/sentry';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/login';

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

const updateFavicon = (href: string) => {
  let link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = href;
  document.getElementsByTagName('head')[0].appendChild(link);
};

const SiteMeta: React.FC<{ title?: string; icon?: string }> = ({ title, icon }) => {
  useEffect(() => {
    if (icon) {
      updateFavicon(icon);
    }
  }, [icon]);

  if (!title) return null;

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};

// 解决动态菜单图标问题
interface IconMapType {
  [key: string]: React.ReactNode;
}
const IconMap: IconMapType = {
  smile: <SmileOutlined />,
  crown: <CrownOutlined />,
  appstore: <AppstoreOutlined />,
  profile: <ProfileOutlined />,
  experiment: <ExperimentOutlined />,
  dashboard: <DashboardOutlined />,
  project: <ProjectOutlined />,
  fileText: <FileTextOutlined />,
  apartment: <ApartmentOutlined />,
  calendar: <CalendarOutlined />,
  history: <HistoryOutlined />,
  mobile: <MobileOutlined />,
  barChart: <BarChartOutlined />,
  setting: <SettingOutlined />,
  questionCircle: <QuestionCircleOutlined />,
  user: <UserOutlined />,
  desktop: <DesktopOutlined />,
  lineChart: <LineChartOutlined />,
  folder: <FolderOutlined />,
  bug: <BugOutlined />,
  bell: <BellOutlined />,
  checkSquare: <CheckSquareOutlined />,
  shopping: <ShoppingOutlined />,
  code: <CodeOutlined />,
  team: <TeamOutlined />,
  unorderedList: <UnorderedListOutlined />,
  idcard: <IdcardOutlined />,
  safety: <SafetyOutlined />,
  menu: <MenuOutlined />,
  api: <ApiOutlined />,
  audit: <AuditOutlined />,
  tool: <ToolOutlined />,
};
const loopMenuItem = (menus: API.MenuNode[]): MenuDataItem[] =>
  menus.map(({ icon, children, parentKeys, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon],
    children: children && loopMenuItem(children),
    parentKeys: typeof parentKeys === 'string' ? parentKeys.split(',') : [],
  }));

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.User;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.User | undefined>;
  fetchMenuData?: () => Promise<MenuDataItem[]>;
  menuData?: MenuDataItem[];
  siteSettings?: API.SiteSetting;
  themeMode?: 'light' | 'dark' | 'auto';
}> {
  const getStoredThemeMode = (): 'light' | 'dark' | 'auto' => {
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem('app-theme-mode');
    const validModes = ['light', 'dark', 'auto'] as const;
    if (stored && validModes.includes(stored as typeof validModes[number])) {
      return stored as 'light' | 'dark' | 'auto';
    }
    return 'auto';
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetchCurrentUser({
        skipErrorHandler: true,
      });
      return response.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchMenuData = async () => {
    try {
      const response = await fetchDynamicMenu({
        skipErrorHandler: true,
      });
      if (response.success) {
        return loopMenuItem(response.data?.list || []);
      }
    } catch (error) {
      console.error('failed to fetch menu data:', error);
    }
    return [];
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await getSiteSettingWithCache({
        skipErrorHandler: true,
      });
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('failed to fetch site settings:', error);
    }
    return undefined;
  };

  const siteSettings = await fetchSiteSettings();
  const siteTitle = siteSettings?.site?.title || defaultSettings.title;
  const mergedSettings = {
    ...defaultSettings,
    title: siteTitle,
    logo: siteSettings?.site?.logo || defaultSettings.logo,
  } as Partial<LayoutSettings>;

  if (siteTitle) {
    document.title = siteTitle;
  }

  if (siteSettings?.site?.favicon) {
    updateFavicon(siteSettings.site.favicon);
  }

  if (siteSettings?.sentry?.dsn) {
    initSentry(siteSettings.sentry.dsn);
  }

  if (location.pathname !== loginPath) {
    const tokenInitialized = await initToken();
    if (!tokenInitialized) {
      return {
        fetchUserInfo,
        fetchMenuData,
        menuData: [],
        settings: mergedSettings,
        siteSettings,
        themeMode: getStoredThemeMode(),
      };
    }
    const currentUser = await fetchUserInfo();
    const menuData = await fetchMenuData();
    return {
      fetchUserInfo,
      fetchMenuData,
      currentUser,
      menuData,
      settings: mergedSettings,
      siteSettings,
      themeMode: getStoredThemeMode(),
    };
  }
  return {
    fetchUserInfo,
    fetchMenuData,
    menuData: [],
    settings: mergedSettings,
    siteSettings,
    themeMode: getStoredThemeMode(),
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const getNavTheme = (): 'light' | 'realDark' => {
    const mode = initialState?.themeMode;
    if (mode === 'dark') return 'realDark';
    if (mode === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'realDark';
    }
    return 'light';
  };

  return {
    navTheme: getNavTheme(),
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="lang" />,
      <SelectDirection key="direction" />,
      <SelectTimezone key="timezone" />,
      <SelectTheme key="theme" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatarUrl,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser ? `${initialState.currentUser.fullName || ''} (${initialState.currentUser.userId || ''})` : undefined,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath && !location.pathname.startsWith('/auth/')) {
        history.push(`${loginPath}?redirect=${encodeURIComponent(location.pathname)}`);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      return (
        <>
          <SiteMeta
            title={initialState?.siteSettings?.site?.title}
            icon={initialState?.siteSettings?.site?.favicon}
          />
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    menuDataRender: () => initialState?.menuData || [],
    title: initialState?.siteSettings?.site?.title || initialState?.settings?.title,
    logo: initialState?.siteSettings?.site?.logo,
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { effectiveTheme, compactMode, happyMode } = useTheme();

  const algorithms = [];
  if (effectiveTheme === 'dark') {
    algorithms.push(darkAlgorithm);
  } else {
    algorithms.push(defaultAlgorithm);
  }
  if (compactMode) {
    algorithms.push(compactAlgorithm);
  }

  return (
    <HappyProvider disabled={!happyMode}>
      <ConfigProvider
        theme={{
          algorithm: algorithms,
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </HappyProvider>
  );
};

export function rootContainer(container: React.ReactNode) {
  return (
    <ThemeProvider>
      <ThemeWrapper>{container}</ThemeWrapper>
    </ThemeProvider>
  );
}
