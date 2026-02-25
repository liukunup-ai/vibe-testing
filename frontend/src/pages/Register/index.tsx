import { Footer } from '@/components';
import { register } from '@/services/backend/auth';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, SelectLang, useIntl } from '@umijs/max';
import { Alert, ConfigProvider, message, theme } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../config/defaultSettings';

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
    loginLink: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
      color: token.colorTextSecondary,
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

const RegisterMessage: React.FC<{
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

const Register: React.FC = () => {
  const [registerState, setRegisterState] = useState<{ success?: boolean; message?: string }>({});
  const { styles } = useStyles();
  const intl = useIntl();

  const handleSubmit = async (values: API.RegisterRequest) => {
    try {
      const resp = await register({ ...values });
      if (resp.success) {
        const defaultRegisterSuccessMessage = intl.formatMessage({
          id: 'pages.register.success',
          defaultMessage: '注册成功！',
        });
        message.success(defaultRegisterSuccessMessage);
        history.push('/login');
        return;
      }
      setRegisterState({ success: false, message: resp.errorMessage });
    } catch (error) {
      const defaultRegisterFailureMessage = intl.formatMessage({
        id: 'pages.register.failure',
        defaultMessage: '注册失败，请重试！',
      });
      message.error(defaultRegisterFailureMessage);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div className={styles.container}>
        <Helmet>
          <title>
            {intl.formatMessage({
              id: 'menu.register',
              defaultMessage: '注册页',
            })}
            {Settings.title && ` - ${Settings.title}`}
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
            logo={<img alt="logo" src="/logo.svg" />}
            title="Ant Design"
            subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.register.submit',
                  defaultMessage: '注册',
                }),
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.RegisterRequest);
            }}
        >
          {!registerState.success && registerState.message && (
            <RegisterMessage content={registerState.message} />
          )}
          
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.email.placeholder',
              defaultMessage: '邮箱',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.email.required"
                    defaultMessage="请输入邮箱!"
                  />
                ),
              },
              {
                type: 'email',
                message: (
                  <FormattedMessage
                    id="pages.register.email.invalid"
                    defaultMessage="请输入有效的邮箱地址!"
                  />
                ),
              },
            ]}
          />
          <ProFormText
            name="fullName"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.fullName.placeholder',
              defaultMessage: '全名 (可选)',
            })}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.password.placeholder',
              defaultMessage: '密码 (至少6位)',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
              {
                min: 6,
                message: (
                  <FormattedMessage
                    id="pages.register.password.minlength"
                    defaultMessage="密码至少6位！"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.register.confirmPassword.placeholder',
              defaultMessage: '确认密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.register.confirmPassword.required"
                    defaultMessage="请确认密码！"
                  />
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({
                        id: 'pages.register.confirmPassword.mismatch',
                        defaultMessage: '两次输入的密码不一致！',
                      }),
                    ),
                  );
                },
              }),
            ]}
          />

          <div className={styles.loginLink}>
            <span>
              <FormattedMessage id="pages.register.hasAccount" defaultMessage="已有账号？" />
              &nbsp;
              <a onClick={() => history.push('/login')}>
                <FormattedMessage id="pages.register.login" defaultMessage="立即登录" />
              </a>
            </span>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
    </ConfigProvider>
  );
};

export default Register;