import { Footer } from '@/components';
import { login } from '@/services/backend/auth';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, ConfigProvider, message, Tabs, theme, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState, useMemo } from 'react';
import Settings from '../../../config/defaultSettings';
import { useTokenModel } from '@/models/useTokenModel';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: token.colorTextDisabled,
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
    oidcButton: {
      width: '100%',
      height: 40,
    },
    title: {
      color: 'rgba(0, 0, 0, 0.85)',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResponse>({});
  const { initialState } = useModel('@@initialState');
  const { setTokens } = useTokenModel();
  const { styles } = useStyles();
  const intl = useIntl();

  const siteConfig = (initialState?.siteConfig as API.PublicSiteConfig) || {};

  const siteTitle = siteConfig.site?.title || Settings.title;
  const siteLogo = siteConfig.site?.logo || '/logo.svg';

  const oidcEnabled = siteConfig.oidc?.enabled;
  const rawProvider = siteConfig.oidc?.name || 'OpenID Connect';
  const oidcProvider = rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1);
  const oidcLogo = siteConfig.oidc?.logo;
  const defaultTab = useMemo(() => {
    return oidcEnabled ? 'oidc' : 'account';
  }, [oidcEnabled]);

  const [type, setType] = useState<string>(defaultTab);

  const handleOIDCLogin = async () => {
    const cfg = siteConfig.oidc;
    if (!cfg?.authorizeUrl || !cfg?.clientId || !cfg?.redirectUrl) {
      message.error(intl.formatMessage({ id: 'pages.login.oidc.configError', defaultMessage: 'OIDC配置不完整' }));
      return;
    }

    const redirectUri = encodeURIComponent(cfg.redirectUrl);
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oidc_state', state);
    // 优先使用 URL 中的 redirect 参数，否则使用根路由
    const urlParams = new URL(window.location.href).searchParams;
    const redirectPath = urlParams.get('redirect') || '/';
    sessionStorage.setItem('oidc_redirect', redirectPath);

    const authUrl = `${cfg.authorizeUrl}?client_id=${cfg.clientId}&redirect_uri=${redirectUri}&response_type=${cfg.responseType || 'code'}&scope=${encodeURIComponent(cfg.scopes || 'openid profile email')}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleSubmit = async (values: API.LoginRequest) => {
    try {
      const resp = await login({ ...values });
      if (resp.success && resp.data?.accessToken && resp.data?.refreshToken && resp.data?.expiresIn !== undefined) {
        setTokens(resp.data.accessToken, resp.data.refreshToken, resp.data.expiresIn);
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        
        const urlParams = new URL(window.location.href).searchParams;
        const redirect = urlParams.get('redirect') || '/';
        window.location.href = redirect;
        return;
      }
      setUserLoginState(resp);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { errorMessage: status } = userLoginState;

  const tabItems = [
    {
      key: 'oidc',
      label: intl.formatMessage({ id: 'pages.login.oidc.tab', defaultMessage: '{provider} 登录' }, { provider: oidcProvider }),
      children: (
        <div style={{ padding: '24px 0' }}>
          <Button
            type="primary"
            size="large"
            className={styles.oidcButton}
            onClick={handleOIDCLogin}
          >
            {oidcLogo && (
              <img src={oidcLogo} alt={oidcProvider} style={{ width: 20, height: 20, marginRight: 8 }} />
            )}
            {intl.formatMessage({ id: 'pages.login.oidc.login', defaultMessage: '使用 {provider} 登录' }, { provider: oidcProvider })}
          </Button>
        </div>
      ),
    },
    {
      key: 'account',
      label: intl.formatMessage({
        id: 'pages.login.accountLogin.tab',
        defaultMessage: '账户密码登录',
      }),
      children: (
        <>
          {status === 'error' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.username.placeholder',
              defaultMessage: '用户名: admin',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码: 123456',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={() => history.push('/forgot-password')}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a>
          </div>
        </>
      ),
    },
  ];

  // 根据 OIDC 是否启用过滤 Tab
  const filteredTabItems = oidcEnabled ? tabItems : [tabItems[1]];

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div className={styles.container}>
        <Helmet>
          <title>
            {intl.formatMessage({
              id: 'menu.login',
              defaultMessage: '登录页',
            })}
            {siteTitle && ` - ${siteTitle}`}
          </title>
        </Helmet>
        <Lang />
        <div
          style={{
            flex: '1',
            padding: '32px 0',
          }}
        >
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            logo={<img alt="logo" src={siteLogo} style={{ height: 44 }} />}
            title={<span className={styles.title}>{siteTitle}</span>}
            subTitle={<span className={styles.title}>{intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}</span>}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              if (type === 'account') {
                await handleSubmit(values as API.LoginRequest);
              }
            }}
            submitter={
              type === 'account'
                ? {
                    searchConfig: {
                      submitText: intl.formatMessage({ id: 'pages.login.submit', defaultMessage: '登录' }),
                    },
                  }
                : false
            }
          >
            <Tabs
              activeKey={type}
              onChange={setType}
              centered
              items={filteredTabItems}
            />

            {type === 'account' && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <FormattedMessage id="pages.login.noAccount" defaultMessage="还没有账号？" />
                &nbsp;
                <a onClick={() => history.push('/register')}>
                  <FormattedMessage id="pages.login.register" defaultMessage="立即注册" />
                </a>
              </div>
            )}

          </LoginForm>
        </div>
        <Footer />
      </div>
    </ConfigProvider>
  );
};

export default Login;
