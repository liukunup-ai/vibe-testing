import { AvatarDropdown, AvatarName, Footer, Question, SelectLang, SelectDirection, SelectTimezone, SelectTheme } from '@/components';
import { fetchCurrentUser } from '@/services/backend/user';
import { getSiteConfigWithCache } from '@/utils/settingCache';
import { initToken } from '@/models/useTokenModel';
import { LinkOutlined, SmileOutlined, CrownOutlined, AppstoreOutlined, ProfileOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, Helmet } from '@umijs/max';
import React, { useEffect } from 'react';
import { ConfigProvider, theme, App } from 'antd';
import { HappyProvider } from '@ant-design/happy-work-theme';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './utils/request';
import '@ant-design/v5-patch-for-react-19';
import { fetchDynamicMenu } from '@/services/backend/user';

import { initSentry } from '@/utils/sentry';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';

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
};
const loopMenuItem = (menus: API.MenuNode[]): MenuDataItem[] =>
  menus.map(({ icon, children, parentKeys, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon],
    children: children && loopMenuItem(children),
    parentKeys: typeof parentKeys === 'string' ? parentKeys.split(',') : [],
  })
);

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
  siteConfig?: API.PublicSiteConfig;
  themeMode?: 'light' | 'dark' | 'auto';
  effectiveTheme?: 'light' | 'dark';
  compactMode?: boolean;
  happyWorkMode?: boolean;
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

  const getEffectiveTheme = (mode: 'light' | 'dark' | 'auto'): 'light' | 'dark' => {
    if (mode === 'auto') {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return mode;
  };

  const getStoredBoolean = (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) === 'true';
  };

  const themeMode = getStoredThemeMode();
  const effectiveTheme = getEffectiveTheme(themeMode);
  const compactMode = getStoredBoolean('app-compact-mode');
  const happyWorkMode = getStoredBoolean('app-happy-work');

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

  const fetchSiteConfig = async () => {
    try {
      const response = await getSiteConfigWithCache({
        skipErrorHandler: true,
      });
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('failed to fetch site config:', error);
    }
    return undefined;
  };

  const siteConfig = await fetchSiteConfig();
  const siteTitle = siteConfig?.site?.title || defaultSettings.title;
  const mergedSettings = {
    ...defaultSettings,
    title: siteTitle,
    logo: siteConfig?.site?.logo || defaultSettings.logo,
  } as Partial<LayoutSettings>;

  if (siteTitle) {
    document.title = siteTitle;
  }

  if (siteConfig?.site?.favicon) {
    updateFavicon(siteConfig.site.favicon);
  }

  if (siteConfig?.sentry?.dsn) {
    initSentry(siteConfig.sentry.dsn);
  }

  if (location.pathname !== loginPath) {
    const tokenInitialized = await initToken();
    if (!tokenInitialized) {
      return {
        fetchUserInfo,
        fetchMenuData,
        menuData: [],
        settings: mergedSettings,
        siteConfig,
        themeMode,
        effectiveTheme,
        compactMode,
        happyWorkMode,
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
      siteConfig,
      themeMode,
      effectiveTheme,
      compactMode,
      happyWorkMode,
    };
  }
  return {
    fetchUserInfo,
    fetchMenuData,
    menuData: [],
    settings: mergedSettings,
    siteConfig,
    themeMode,
    effectiveTheme,
    compactMode,
    happyWorkMode,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const effectiveTheme = initialState?.effectiveTheme || 'light';
  const navTheme = effectiveTheme === 'dark' ? 'realDark' : 'light';

  return {
    navTheme,
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
        // 如果 OIDC 启用且配置了自动登录，直接跳转到 OIDC 提供商
        if (initialState?.siteConfig?.oidc?.enabled && initialState?.siteConfig?.oidc?.autoLogin) {
          const cfg = initialState.siteConfig.oidc;
          if (cfg.authorizeUrl && cfg.clientId && cfg.redirectUrl) {
            const redirectUri = encodeURIComponent(cfg.redirectUrl);
            const state = Math.random().toString(36).substring(7);
            sessionStorage.setItem('oidc_state', state);
            const redirectPath = location.pathname;
            sessionStorage.setItem('oidc_redirect', redirectPath);
            const authUrl = `${cfg.authorizeUrl}?client_id=${cfg.clientId}&redirect_uri=${redirectUri}&response_type=${cfg.responseType || 'code'}&scope=${encodeURIComponent(cfg.scopes || 'openid profile email')}&state=${state}`;
            window.location.href = authUrl;
            return;
          }
        }
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
            title={initialState?.siteConfig?.site?.title}
            icon={initialState?.siteConfig?.site?.favicon}
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
    title: initialState?.siteConfig?.site?.title || initialState?.settings?.title,
    logo: initialState?.siteConfig?.site?.logo,
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
  const { effectiveTheme, compactMode, happyWorkMode } = useThemeContext();

  const algorithms = [];
  algorithms.push(effectiveTheme === 'dark' ? darkAlgorithm : defaultAlgorithm);
  if (compactMode) {
    algorithms.push(compactAlgorithm);
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: algorithms,
      }}
    >
      <HappyProvider disabled={!happyWorkMode}>
        <App>
          {children}
        </App>
      </HappyProvider>
    </ConfigProvider>
  );
};

export function rootContainer(container: React.ReactNode) {
  return (
    <ThemeProvider>
      <ThemeWrapper>{container}</ThemeWrapper>
    </ThemeProvider>
  );
}
