import { Footer } from '@/components';
import { resetPassword } from '@/services/backend/auth';
import { MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, SelectLang, useIntl } from '@umijs/max';
import { Alert, ConfigProvider, message, theme } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => ({
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
}));

const Lang = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const { styles } = useStyles();
  const intl = useIntl();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleSubmit = async (values: API.ResetPasswordRequest) => {
    try {
      const resp = await resetPassword(values);
      if (resp.success) {
        setSuccess(true);
        message.success(
          intl.formatMessage({
            id: 'pages.resetPassword.success',
            defaultMessage: '密码重置邮件已发送',
          }),
        );
        setTimeout(() => {
          history.push('/login');
        }, 2000);
      } else {
        setErrorMessage(resp.errorMessage);
      }
    } catch {
      message.error(
        intl.formatMessage({
          id: 'pages.resetPassword.failure',
          defaultMessage: '重置失败，请重试',
        }),
      );
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div className={styles.container}>
        <Helmet>
          <title>
            {intl.formatMessage({ id: 'menu.resetPassword', defaultMessage: '重置密码' })}
            {Settings.title && ` - ${Settings.title}`}
          </title>
        </Helmet>
        <Lang />
        <div style={{ flex: '1', padding: '32px 0' }}>
          <LoginForm
            contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
            logo={<img alt="logo" src="/logo.svg" />}
            title="Ant Design"
            subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.resetPassword.submit',
                defaultMessage: '重置密码',
              }),
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.ResetPasswordRequest);
          }}
        >
          {errorMessage && <Alert style={{ marginBottom: 24 }} message={errorMessage} type="error" showIcon />}
          {success && (
            <Alert
              style={{ marginBottom: 24 }}
              message={intl.formatMessage({
                id: 'pages.resetPassword.success',
                defaultMessage: '密码重置邮件已发送，请查收',
              })}
              type="success"
              showIcon
            />
          )}
          <ProFormText
            name="email"
            fieldProps={{ size: 'large', prefix: <MailOutlined /> }}
            placeholder={intl.formatMessage({
              id: 'pages.resetPassword.email.placeholder',
              defaultMessage: '请输入注册邮箱',
            })}
            rules={[
              { required: true, message: <FormattedMessage id="pages.resetPassword.email.required" defaultMessage="请输入邮箱!" /> },
              { type: 'email', message: <FormattedMessage id="pages.resetPassword.email.invalid" defaultMessage="请输入有效的邮箱!" /> },
            ]}
          />
          <div className={styles.loginLink}>
            <span>
              <FormattedMessage id="pages.resetPassword.rememberPassword" defaultMessage="想起密码了？" />
              &nbsp;
              <a onClick={() => history.push('/login')}>
                <FormattedMessage id="pages.resetPassword.login" defaultMessage="立即登录" />
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

export default ResetPassword;
