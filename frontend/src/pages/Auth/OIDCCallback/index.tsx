import { oidcAuth } from '@/services/backend/auth';
import { Helmet, history, useIntl } from '@umijs/max';
import { message, Spin, Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTokenModel } from '@/models/useTokenModel';

const OIDCCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { setTokens } = useTokenModel();
  const intl = useIntl();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('OIDC Callback: Starting...');
      const urlParams = new URL(window.location.href).searchParams;
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('OIDC Callback: code=', !!code, 'state=', !!state, 'errorParam=', errorParam);

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      if (!code || !state) {
        setError(intl.formatMessage({ id: 'pages.login.oidc.missingCode', defaultMessage: '缺少授权码或状态参数' }));
        return;
      }

      const storedState = sessionStorage.getItem('oidc_state');
      const redirectPath = sessionStorage.getItem('oidc_redirect') || '/';
      console.log('OIDC Callback: storedState=', storedState, 'state=', state, 'match=', state === storedState);

      if (state !== storedState) {
        setError(intl.formatMessage({ id: 'pages.login.oidc.invalidState', defaultMessage: '状态验证失败，请重新登录' }));
        sessionStorage.removeItem('oidc_state');
        sessionStorage.removeItem('oidc_redirect');
        return;
      }

      sessionStorage.removeItem('oidc_state');
      sessionStorage.removeItem('oidc_redirect');

      try {
        console.log('OIDC Callback: Calling API...');
        
        const resp = await oidcAuth({ code, state });
        console.log('OIDC Callback: API response', resp);

        if (resp.success && resp.data?.accessToken && resp.data?.refreshToken && resp.data?.expiresIn !== undefined) {
          setTokens(resp.data.accessToken, resp.data.refreshToken, resp.data.expiresIn);
          message.success(intl.formatMessage({ id: 'pages.login.success', defaultMessage: '登录成功！' }));
          // Use full page reload to trigger getInitialState refresh
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 500);
        } else {
          setError(resp.errorMessage || intl.formatMessage({ id: 'pages.login.oidc.authFailed', defaultMessage: 'OIDC认证失败' }));
        }
      } catch (err: any) {
        console.error('OIDC callback error:', err);
        setError(err.message || intl.formatMessage({ id: 'pages.login.oidc.authFailed', defaultMessage: 'OIDC认证失败' }));
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
      }}>
        <Result
          status="error"
          title={intl.formatMessage({ id: 'pages.login.oidc.callbackError', defaultMessage: '登录失败' })}
          subTitle={error}
          extra={[
            <a key="login" onClick={() => history.push('/login')}>
              {intl.formatMessage({ id: 'pages.login.backToLogin', defaultMessage: '返回登录' })}
            </a>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
    }}>
      <Helmet>
        <title>
          {intl.formatMessage({ id: 'pages.login.oidc.processing', defaultMessage: '正在登录...' })}
        </title>
      </Helmet>
      <Spin size="large" />
      <p style={{ marginTop: 16, color: '#666' }}>
        {intl.formatMessage({ id: 'pages.login.oidc.processing', defaultMessage: '正在处理登录...' })}
      </p>
    </div>
  );
};

export default OIDCCallback;
