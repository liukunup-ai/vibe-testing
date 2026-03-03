import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Spin } from 'antd';
import type { MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import { useTokenModel } from '@/models/useTokenModel';
import { logout } from '@/services/backend/auth';
export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      {currentUser?.fullName}
    </span>
  );
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  const { clearTokens } = useTokenModel();
  const { initialState, setInitialState } = useModel('@@initialState');
  const siteConfig = initialState?.siteConfig;

  const loginOut = async () => {
    // 先清除本地 tokens
    clearTokens();
    
    try {
      // 调用后端 logout API
      const resp = await logout();
      const endSessionUrl = (resp as any)?.data?.endSessionUrl;
      
      // 优先使用后端返回的 endSessionUrl，否则使用配置的 signoutRedirectUrl
      const signoutUrl = endSessionUrl || siteConfig?.oidc?.signoutRedirectUrl;
      if (signoutUrl) {
        window.location.href = signoutUrl;
        return;
      }
    } catch (error) {
      // 即使 API 调用失败，也继续使用配置的 signoutRedirectUrl
      const signoutUrl = siteConfig?.oidc?.signoutRedirectUrl;
      if (signoutUrl) {
        window.location.href = signoutUrl;
        return;
      }
    }
    
    // 没有 OIDC 登出 URL，跳转到登录页
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const searchParams = new URLSearchParams({
      redirect: pathname + search,
    });
    const redirect = urlParams.get('redirect');
    if (window.location.pathname !== '/login' && !redirect) {
      history.replace({
        pathname: '/login',
        search: searchParams.toString(),
      });
    }
  };
  const { styles } = useStyles();

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.fullName) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
