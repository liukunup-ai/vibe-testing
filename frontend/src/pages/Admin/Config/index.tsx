import { PageContainer, ProCard } from '@ant-design/pro-components';
import { ProForm, ProFormText, ProFormTextArea, ProFormSwitch, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { message, Button, Modal, Input, Tooltip, Divider, Row, Col, Space, Typography } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { getSetting, updateSetting, testEmail } from '@/services/backend/setting';
import { clearSiteSettingCache } from '@/utils/settingCache';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MailOutlined, InfoCircleOutlined, SettingOutlined, 
  RobotOutlined, DatabaseOutlined, CloudServerOutlined,
  SafetyCertificateOutlined, KeyOutlined, BugOutlined, SendOutlined,
  GlobalOutlined, LinkOutlined, LockOutlined, UserOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { debounce } from 'lodash';

const { Text } = Typography;

const CardHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Space>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontWeight: 500 }}>{title}</span>
  </Space>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
    {children}
  </Text>
);

const Config: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testEmailAddr, setTestEmailAddr] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = ProForm.useForm();

  const debouncedSave = useRef(
    debounce(async (values: any) => {
      setSaving(true);
      try {
        const request = transformToRequest(values);
        const response = await updateSetting(request);
        if (response.success) {
          message.success(intl.formatMessage({ id: 'pages.common.update.success', defaultMessage: '已自动保存' }));
          // Clear cache so other components see the new settings
          clearSiteSettingCache();
        } else {
          message.error(response.errorMessage || intl.formatMessage({ id: 'pages.common.update.failure', defaultMessage: '保存失败' }));
        }
      } catch (error) {
        message.error(intl.formatMessage({ id: 'pages.common.update.failure', defaultMessage: '保存失败' }));
      } finally {
        setSaving(false);
      }
    }, 800)
  ).current;

  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    debouncedSave(allValues);
  }, [debouncedSave]);

  const transformToFlat = (data: any): any => {
    if (!data) return {};
    return {
      frontendBaseUrl: data.app?.frontendBaseUrl || '',
      siteTitle: data.site?.title || '',
      siteLogo: data.site?.logo || '',
      siteFavicon: data.site?.favicon || '',
      siteCopyright: data.site?.copyright || '',
      siteShowLinks: data.site?.showLinks || false,
      siteQuestionLink: data.site?.questionLink || '',
		smtpHost: data.smtp?.host || '',
      smtpPort: data.smtp?.port || 465,
      smtpUser: data.smtp?.user || '',
      smtpPassword: data.smtp?.password || '',
      smtpFrom: data.smtp?.from || '',
      smtpLocalName: data.smtp?.localName || '',
      smtpUseSSL: data.smtp?.useSSL || false,
      smtpUseTLS: data.smtp?.useTLS || false,
      redisAddrs: data.redis?.addrs?.join(',') || '',
      redisPassword: data.redis?.password || '',
		redisDB: data.redis?.db || 0,
      redisReadTimeout: data.redis?.readTimeout || 3,
      redisWriteTimeout: data.redis?.writeTimeout || 3,
      s3Endpoint: data.s3?.endpoint || '',
      s3AccessKey: data.s3?.accessKey || '',
      s3SecretKey: data.s3?.secretKey || '',
		s3BucketName: data.s3?.bucketName || '',
		s3Secure: data.s3?.secure || false,
		s3CACert: data.s3?.caCert || '',
		oidcEnabled: data.oidc?.enabled || false,
		oidcName: data.oidc?.name || '',
		oidcLogo: data.oidc?.logo || '',
		oidcIssuer: data.oidc?.issuer || '',
		oidcClientId: data.oidc?.clientId || '',
		oidcClientSecret: data.oidc?.clientSecret || '',
		oidcRedirectUrl: data.oidc?.redirectUrl || '',
		oidcScopes: data.oidc?.scopes || '',
		oidcAutoLogin: data.oidc?.autoLogin || false,
		oidcSignoutRedirectUrl: data.oidc?.signoutRedirectUrl || '',
		oidcInsecureSkipVerify: data.oidc?.insecureSkipVerify || false,
		oidcCaCert: data.oidc?.caCert || '',
		ldapHost: data.ldap?.host || '',
      ldapPort: data.ldap?.port || 389,
      ldapBindDn: data.ldap?.bindDn || '',
      ldapBindPassword: data.ldap?.bindPassword || '',
      ldapBaseDn: data.ldap?.baseDn || '',
      ldapUserFilter: data.ldap?.userFilter || '',
      ldapAttrUsername: data.ldap?.attrUsername || '',
      ldapAttrEmail: data.ldap?.attrEmail || '',
      ldapAttrName: data.ldap?.attrName || '',
      aiProvider: data.ai?.provider || '',
      aiBaseUrl: data.ai?.baseUrl || '',
      aiApiKey: data.ai?.apiKey || '',
      aiModel: data.ai?.model || '',
      sentryDsn: data.sentry?.dsn || '',
    };
  };

  const transformToRequest = (values: any): API.AdminSettingRequest => {
    const request: API.AdminSettingRequest = {};
    
    if (values.frontendBaseUrl !== undefined) {
      request.app = { frontendBaseUrl: values.frontendBaseUrl };
    }

    if (values.siteTitle !== undefined || values.siteLogo !== undefined || values.siteFavicon !== undefined || 
        values.siteCopyright !== undefined || values.siteShowLinks !== undefined || values.siteQuestionLink !== undefined) {
      request.site = {
        title: values.siteTitle || '',
        logo: values.siteLogo || '',
        favicon: values.siteFavicon || '',
        copyright: values.siteCopyright || '',
        showLinks: values.siteShowLinks || false,
        questionLink: values.siteQuestionLink || '',
      };
    }

	if (values.smtpHost !== undefined || values.smtpPort !== undefined || values.smtpUser !== undefined ||
        values.smtpPassword !== undefined || values.smtpFrom !== undefined || values.smtpLocalName !== undefined ||
        values.smtpUseSSL !== undefined || values.smtpUseTLS !== undefined) {
      request.smtp = {
        host: values.smtpHost || '',
        port: values.smtpPort || 0,
        user: values.smtpUser || '',
        password: values.smtpPassword || '',
        from: values.smtpFrom || '',
        localName: values.smtpLocalName || '',
        useSSL: values.smtpUseSSL || false,
        useTLS: values.smtpUseTLS || false,
      };
    }

    if (values.redisAddrs !== undefined || values.redisPassword !== undefined || values.redisDB !== undefined ||
        values.redisReadTimeout !== undefined || values.redisWriteTimeout !== undefined) {
      request.redis = {
        addrs: values.redisAddrs ? values.redisAddrs.split(',').map((s: string) => s.trim()) : [],
        password: values.redisPassword || '',
        db: values.redisDB || 0,
        readTimeout: values.redisReadTimeout || 0,
        writeTimeout: values.redisWriteTimeout || 0,
      };
    }

	if (values.s3Endpoint !== undefined || values.s3AccessKey !== undefined || values.s3SecretKey !== undefined ||
		values.s3BucketName !== undefined || values.s3Secure !== undefined || values.s3CACert !== undefined) {
		request.s3 = {
			endpoint: values.s3Endpoint || '',
			accessKey: values.s3AccessKey || '',
			secretKey: values.s3SecretKey || '',
			bucketName: values.s3BucketName || '',
			secure: values.s3Secure || false,
			caCert: values.s3CACert || '',
		};
	}

	if (values.oidcEnabled !== undefined || values.oidcName !== undefined || values.oidcLogo !== undefined ||
		values.oidcIssuer !== undefined || values.oidcClientId !== undefined ||
        values.oidcClientSecret !== undefined || values.oidcRedirectUrl !== undefined || values.oidcScopes !== undefined ||
        values.oidcAutoLogin !== undefined || values.oidcSignoutRedirectUrl !== undefined ||
        values.oidcInsecureSkipVerify !== undefined || values.oidcCaCert !== undefined) {
      request.oidc = {
        enabled: values.oidcEnabled || false,
        name: values.oidcName || '',
        logo: values.oidcLogo || '',
        issuer: values.oidcIssuer || '',
        clientId: values.oidcClientId || '',
        clientSecret: values.oidcClientSecret || '',
        redirectUrl: values.oidcRedirectUrl || '',
        scopes: values.oidcScopes || '',
        autoLogin: values.oidcAutoLogin || false,
        signoutRedirectUrl: values.oidcSignoutRedirectUrl || '',
        insecureSkipVerify: values.oidcInsecureSkipVerify || false,
        caCert: values.oidcCaCert || '',
      };
    }

	if (values.ldapEnabled !== undefined || values.ldapHost !== undefined || values.ldapPort !== undefined ||
        values.ldapBindDn !== undefined || values.ldapBindPassword !== undefined || values.ldapBaseDn !== undefined ||
        values.ldapUserFilter !== undefined || values.ldapAttrUsername !== undefined || values.ldapAttrEmail !== undefined ||
        values.ldapAttrName !== undefined) {
      request.ldap = {
        enabled: values.ldapEnabled || false,
        host: values.ldapHost || '',
        port: values.ldapPort || 0,
        bindDn: values.ldapBindDn || '',
        bindPassword: values.ldapBindPassword || '',
        baseDn: values.ldapBaseDn || '',
        userFilter: values.ldapUserFilter || '',
        attrUsername: values.ldapAttrUsername || '',
        attrEmail: values.ldapAttrEmail || '',
        attrName: values.ldapAttrName || '',
      };
    }

    if (values.aiProvider !== undefined || values.aiBaseUrl !== undefined || values.aiApiKey !== undefined || values.aiModel !== undefined) {
      request.ai = {
        provider: values.aiProvider || '',
        baseUrl: values.aiBaseUrl || '',
        apiKey: values.aiApiKey || '',
        model: values.aiModel || '',
      };
    }

    if (values.sentryDsn !== undefined) {
      request.sentry = {
        dsn: values.sentryDsn || '',
      };
    }

    return request;
  };

  const loadData = async () => {
    try {
      const response = await getSetting();
      if (response.success && response.data) {
        const flatData = transformToFlat(response.data);
        form.setFieldsValue(flatData);
        if (flatData.siteLogo) setLogoUrl(flatData.siteLogo);
        if (flatData.siteFavicon) setIconUrl(flatData.siteFavicon);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestEmail = async () => {
    if (!testEmailAddr) {
      message.error('请输入测试邮箱');
      return;
    }
    setTesting(true);
    try {
      const response = await testEmail({ to: testEmailAddr });
      if (response.success) {
        message.success('发送成功');
      } else {
        message.error(response.errorMessage || '发送失败');
      }
    } catch (error) {
      message.error('发送失败');
    } finally {
      setTesting(false);
    }
  };

  return (
    <PageContainer>
      <ProForm
        form={form}
        loading={saving}
        onValuesChange={handleValuesChange}
        initialValues={{}}
        params={{}}
        request={async () => {
          return {};
        }}
        submitter={false}
        grid
        rowProps={{ gutter: [16, 0] }}
      >
        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={12}>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<SettingOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.basic', defaultMessage: '网站' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormText
                    name="siteTitle"
                    label={intl.formatMessage({ id: 'pages.admin.config.siteTitle', defaultMessage: '标题' })}
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.siteTitle.placeholder', defaultMessage: '请输入标题' })}
                    colProps={{ span: 24 }}
                  />
                  <ProFormText
                    name="siteLogo"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.siteLogo', defaultMessage: '徽标' })}
                        <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.siteLogo.detail', defaultMessage: '建议尺寸：高度40-60px，宽度200-400px；支持格式：PNG、SVG（推荐）、JPG；显示在左上角菜单栏旁' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                        </Tooltip>
                      </span>
                    }
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.siteLogo.placeholder', defaultMessage: '请输入 Logo URL' })}
                    fieldProps={{ style: { width: '100%' }, onChange: (e) => setLogoUrl(e.target.value) }}
                  />
                  {logoUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <img src={logoUrl} alt="Logo Preview" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain', border: '1px solid #d9d9d9', padding: 4, borderRadius: 4 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <ProFormText
                    name="siteFavicon"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.siteFavicon', defaultMessage: '图标' })}
                        <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.siteFavicon.detail', defaultMessage: '建议尺寸：32x32px 或 16x16px；支持格式：ICO、PNG、SVG（推荐）；显示在浏览器标签页' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                        </Tooltip>
                      </span>
                    }
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.siteFavicon.placeholder', defaultMessage: '请输入 Icon URL' })}
                    fieldProps={{ style: { width: '100%' }, onChange: (e) => setIconUrl(e.target.value) }}
                  />
                  {iconUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <img src={iconUrl} alt="Favicon Preview" style={{ maxHeight: 32, maxWidth: 32, objectFit: 'contain', border: '1px solid #d9d9d9', padding: 2, borderRadius: 4 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <ProFormText
                    name="siteCopyright"
                    label={intl.formatMessage({ id: 'pages.admin.config.siteCopyright', defaultMessage: '版权信息' })}
                    placeholder="© 2026 Company Name. All rights reserved."
                    colProps={{ span: 24 }}
                  />
                  <ProFormSwitch
                    name="siteShowLinks"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.siteShowLinks', defaultMessage: '底部链接' })}
                      <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.siteShowLinks.extra', defaultMessage: '是否在页面底部显示链接' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                      </Tooltip>
                      </span>
                    }
                  />
                  <ProFormText
                    name="siteQuestionLink"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.siteQuestionLink', defaultMessage: '帮助链接' })}
                        <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.siteQuestionLink.extra', defaultMessage: '页面底部帮助按钮的跳转链接' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                        </Tooltip>
                      </span>
                    }
                    placeholder="https://pro.ant.design/docs/getting-started"
                    colProps={{ span: 24 }}
                  />
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<MailOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.email', defaultMessage: 'SMTP / 邮件' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                  extra={
                    <Button type="primary" icon={<SendOutlined />} onClick={() => setTestModalVisible(true)}>
                      <FormattedMessage id="pages.admin.config.testEmail" defaultMessage="测试" />
                    </Button>
                  }
                >
                  <ProForm.Group>
                    <ProFormText
                      name="smtpHost"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpHost', defaultMessage: 'Host' })}
                      placeholder="smtp.example.com"
                      colProps={{ span: 12 }}
                    />
						<ProFormDigit
                      name="smtpPort"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpPort', defaultMessage: 'Port' })}
                      placeholder="465"
                      initialValue={465}
                      min={1}
                      max={65535}
                      fieldProps={{ precision: 0 }}
                      colProps={{ span: 12 }}
                    />
                  </ProForm.Group>
                  <ProForm.Group>
                    <ProFormText
                      name="smtpUser"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpUser', defaultMessage: '用户名' })}
                      placeholder={intl.formatMessage({ id: 'pages.admin.config.smtpUser.placeholder', defaultMessage: '请输入用户名' })}
                      colProps={{ span: 12 }}
                    />
                    <ProFormText.Password
                      name="smtpPassword"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpPassword', defaultMessage: '密码' })}
                      placeholder={intl.formatMessage({ id: 'pages.admin.config.smtpPassword.placeholder', defaultMessage: '请输入密码' })}
                      colProps={{ span: 12 }}
                    />
                  </ProForm.Group>
                  <ProForm.Group>
                    <ProFormText
                      name="smtpFrom"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpFrom', defaultMessage: '发件人邮箱' })}
                      placeholder="noreply@example.com"
                      colProps={{ span: 12 }}
                    />
                    <ProFormText
                      name="smtpLocalName"
                      label={intl.formatMessage({ id: 'pages.admin.config.smtpFromName', defaultMessage: '发件人名称' })}
                      placeholder="系统通知"
                      colProps={{ span: 12 }}
                    />
                  </ProForm.Group>
                  <Divider style={{ margin: '12px 0' }} />
                  <ProForm.Group>
                    <ProFormSwitch
                      name="smtpUseSSL"
                      label={
                        <span>
                          {intl.formatMessage({ id: 'pages.admin.config.smtpUseSSL', defaultMessage: '使用SSL' })}
                        <Tooltip title="端口 465">
                            <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                        </Tooltip>
                        </span>
                      }
                      colProps={{ span: 12 }}
                    />
                    <ProFormSwitch
                      name="smtpUseTLS"
                      label={
                        <span>
                          {intl.formatMessage({ id: 'pages.admin.config.smtpUseTLS', defaultMessage: '使用TLS' })}
                        <Tooltip title="端口 587">
                            <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                        </Tooltip>
                        </span>
                      }
                      colProps={{ span: 12 }}
                    />
                  </ProForm.Group>
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<KeyOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.oidc', defaultMessage: 'OIDC / OAuth' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormSwitch
                    name="oidcEnabled"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.oidcEnabled', defaultMessage: '启用OIDC' })}
                      <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.oidcEnabled.extra', defaultMessage: '登录页面将显示OIDC登录按钮' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                      </Tooltip>
                      </span>
								}
								/>
                <ProFormText
                  name="oidcName"
                  label={intl.formatMessage({ id: 'pages.admin.config.oidcName', defaultMessage: '显示名称' })}
                  placeholder="Authentik"
                  colProps={{ span: 24 }}
                  tooltip={intl.formatMessage({ id: 'pages.admin.config.oidcName.detail', defaultMessage: '登录页面显示的名称' })}
                />
                <ProFormText
                  name="oidcLogo"
                  label={intl.formatMessage({ id: 'pages.admin.config.oidcLogo', defaultMessage: 'Logo URL' })}
                  placeholder="https://example.com/logo.png"
                  colProps={{ span: 24 }}
                />
								<Divider style={{ margin: '12px 0' }} />
                  <SectionLabel><FormattedMessage id="pages.admin.config.oidc.connection" defaultMessage="连接配置" /></SectionLabel>
                  <ProFormText name="oidcIssuer" label={intl.formatMessage({ id: 'pages.admin.config.oidcIssuer', defaultMessage: 'Issuer URL' })} placeholder="https://accounts.google.com" colProps={{ span: 24 }} tooltip={intl.formatMessage({ id: 'pages.admin.config.oidcIssuer.detail', defaultMessage: 'OIDC发现地址' })} />
                  <ProFormText name="oidcClientId" label={intl.formatMessage({ id: 'pages.admin.config.oidcClientId', defaultMessage: 'Client ID' })} placeholder="******" colProps={{ span: 24 }} />
                  <ProFormText.Password name="oidcClientSecret" label={intl.formatMessage({ id: 'pages.admin.config.oidcClientSecret', defaultMessage: 'Client Secret' })} placeholder="******" colProps={{ span: 24 }} />
                  <ProFormText name="oidcRedirectUrl" label={intl.formatMessage({ id: 'pages.admin.config.oidcRedirectUrl', defaultMessage: 'Redirect URL' })} placeholder="https://your-domain.com/auth/callback" colProps={{ span: 24 }} />
						<ProFormText name="oidcScopes" label={intl.formatMessage({ id: 'pages.admin.config.oidcScopes', defaultMessage: 'Scopes' })} placeholder="openid profile email" colProps={{ span: 24 }} />
						<Divider style={{ margin: '12px 0' }} />
						<SectionLabel><FormattedMessage id="pages.admin.config.oidc.tls" defaultMessage="TLS配置" /></SectionLabel>
						<ProFormSwitch 
							name="oidcInsecureSkipVerify" 
							label={
								<span>
									{intl.formatMessage({ id: 'pages.admin.config.oidcInsecureSkipVerify', defaultMessage: '跳过TLS验证' })}
									<Tooltip title={intl.formatMessage({ id: 'pages.admin.config.oidcInsecureSkipVerify.extra', defaultMessage: '不推荐在生产环境使用' })}>
										<InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
									</Tooltip>
								</span>
							}
						/>
						<ProFormTextArea
							name="oidcCaCert"
							label={
								<span>
									{intl.formatMessage({ id: 'pages.admin.config.oidcCaCert', defaultMessage: 'CA证书' })}
									<Tooltip title={intl.formatMessage({ id: 'pages.admin.config.oidcCaCert.extra', defaultMessage: '自签名证书时需要配置，PEM格式' })}>
										<InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
									</Tooltip>
								</span>
							}
							placeholder={intl.formatMessage({ id: 'pages.admin.config.oidcCaCert.placeholder', defaultMessage: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----' })}
							fieldProps={{ rows: 4 }}
							colProps={{ span: 24 }}
						/>
						<Divider style={{ margin: '12px 0' }} />
                  <SectionLabel><FormattedMessage id="pages.admin.config.oidc.behavior" defaultMessage="登录行为" /></SectionLabel>
                  <ProFormSwitch 
                    name="oidcAutoLogin" 
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.oidcAutoLogin', defaultMessage: '自动跳转' })}
                      <Tooltip title="访问登录页面时自动跳转到OIDC提供商">
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                      </Tooltip>
                      </span>
                    }
                  />
                  <ProFormText name="oidcSignoutRedirectUrl" label={intl.formatMessage({ id: 'pages.admin.config.oidcSignoutRedirectUrl', defaultMessage: 'Signout Redirect' })} placeholder="https://your-provider.com/logout" colProps={{ span: 24 }} />
                </ProCard>
              </Col>
            </Row>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={12}>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<DatabaseOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.redis', defaultMessage: 'Redis' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormText
                    name="redisAddrs"
                    label={intl.formatMessage({ id: 'pages.admin.config.redisAddrs', defaultMessage: '地址' })}
                    placeholder="localhost:6379"
                    colProps={{ span: 24 }}
                    tooltip={intl.formatMessage({ id: 'pages.admin.config.redisAddrs.detail', defaultMessage: '多个地址请使用英文逗号分隔' })}
                  />
                  <ProFormText.Password
                    name="redisPassword"
                    label={intl.formatMessage({ id: 'pages.admin.config.redisPassword', defaultMessage: '密码' })}
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.redisPassword.placeholder', defaultMessage: '请输入密码' })}
                    colProps={{ span: 24 }}
                  />
                  <ProForm.Group>
                    <ProFormDigit
                      name="redisDB"
                      label={intl.formatMessage({ id: 'pages.admin.config.redisDB', defaultMessage: '数据库' })}
                      initialValue={0}
                      min={0}
                      max={15}
                      colProps={{ span: 8 }}
                    />
						<ProFormDigit
                      name="redisReadTimeout"
                      label={intl.formatMessage({ id: 'pages.admin.config.redisReadTimeout', defaultMessage: '读取超时(s)' })}
                      placeholder="3"
                      initialValue={3}
                      min={1}
                      fieldProps={{ precision: 0 }}
                      colProps={{ span: 8 }}
                    />
                    <ProFormDigit
                      name="redisWriteTimeout"
                      label={intl.formatMessage({ id: 'pages.admin.config.redisWriteTimeout', defaultMessage: '写入超时(s)' })}
                      placeholder="3"
                      initialValue={3}
                      min={1}
                      fieldProps={{ precision: 0 }}
                      colProps={{ span: 8 }}
                    />
                  </ProForm.Group>
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<CloudServerOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.s3', defaultMessage: 'S3' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormText
                    name="s3Endpoint"
                    label={intl.formatMessage({ id: 'pages.admin.config.s3Endpoint', defaultMessage: 'Endpoint' })}
                    placeholder="https://s3.amazonaws.com"
                    colProps={{ span: 24 }}
                  />
                  <ProFormText
                    name="s3AccessKey"
                    label={intl.formatMessage({ id: 'pages.admin.config.s3AccessKey', defaultMessage: 'Access Key' })}
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.s3AccessKey.placeholder', defaultMessage: '请输入 Access Key' })}
                    colProps={{ span: 24 }}
                  />
                  <ProFormText.Password
                    name="s3SecretKey"
                    label={intl.formatMessage({ id: 'pages.admin.config.s3SecretKey', defaultMessage: 'Secret Key' })}
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.s3SecretKey.placeholder', defaultMessage: '请输入 Secret Key' })}
                    colProps={{ span: 24 }}
                  />
                  <ProFormText
                    name="s3BucketName"
                    label={intl.formatMessage({ id: 'pages.admin.config.s3Bucket', defaultMessage: 'Bucket' })}
                    placeholder="my-bucket"
                    colProps={{ span: 24 }}
                  />
						<ProFormSwitch
							name="s3Secure"
							label={intl.formatMessage({ id: 'pages.admin.config.s3Secure', defaultMessage: '使用 HTTPS' })}
						/>
						<ProFormTextArea
							name="s3CACert"
							label={
								<span>
									{intl.formatMessage({ id: 'pages.admin.config.s3CACert', defaultMessage: 'CA证书' })}
									<Tooltip title={intl.formatMessage({ id: 'pages.admin.config.s3CACert.extra', defaultMessage: '自签名证书时需要配置，PEM格式' })}>
										<InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
									</Tooltip>
								</span>
							}
							placeholder={intl.formatMessage({ id: 'pages.admin.config.s3CACert.placeholder', defaultMessage: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----' })}
							fieldProps={{ rows: 4 }}
							colProps={{ span: 24 }}
						/>
					</ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<SafetyCertificateOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.ldap', defaultMessage: 'LDAP' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormSwitch
                    name="ldapEnabled"
                    label={
                      <span>
                        {intl.formatMessage({ id: 'pages.admin.config.ldapEnabled', defaultMessage: '启用LDAP' })}
                      <Tooltip title={intl.formatMessage({ id: 'pages.admin.config.ldapEnabled.extra', defaultMessage: '用户可使用LDAP账号登录' })}>
                          <InfoCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
                      </Tooltip>
                      </span>
                    }
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <SectionLabel><FormattedMessage id="pages.admin.config.ldap.connection" defaultMessage="连接配置" /></SectionLabel>
                  <ProForm.Group>
						<ProFormText name="ldapHost" label={intl.formatMessage({ id: 'pages.admin.config.ldapHost', defaultMessage: 'Host' })} placeholder="localhost" colProps={{ span: 12 }} />
                    <ProFormDigit name="ldapPort" label={intl.formatMessage({ id: 'pages.admin.config.ldapPort', defaultMessage: 'Port' })} placeholder="389" initialValue={389} min={1} max={65535} fieldProps={{ precision: 0 }} colProps={{ span: 12 }} />
                  </ProForm.Group>
                  <ProFormText name="ldapBindDn" label={intl.formatMessage({ id: 'pages.admin.config.ldapBindDn', defaultMessage: 'Bind DN' })} placeholder="cn=admin,dc=example,dc=com" colProps={{ span: 24 }} />
                  <ProFormText.Password name="ldapBindPassword" label={intl.formatMessage({ id: 'pages.admin.config.ldapBindPassword', defaultMessage: 'Bind Password' })} placeholder="******" colProps={{ span: 24 }} />
                  <ProFormText name="ldapBaseDn" label={intl.formatMessage({ id: 'pages.admin.config.ldapBaseDn', defaultMessage: 'Base DN' })} placeholder="dc=example,dc=com" colProps={{ span: 24 }} />
                  <Divider style={{ margin: '12px 0' }} />
                  <SectionLabel><FormattedMessage id="pages.admin.config.ldap.search" defaultMessage="用户搜索" /></SectionLabel>
                  <ProFormText name="ldapUserFilter" label={intl.formatMessage({ id: 'pages.admin.config.ldapUserFilter', defaultMessage: 'User Filter' })} placeholder="(uid=%s)" colProps={{ span: 24 }} tooltip={intl.formatMessage({ id: 'pages.admin.config.ldapUserFilter.detail', defaultMessage: '使用 %s 作为用户名占位符' })} />
                  <Divider style={{ margin: '12px 0' }} />
                  <SectionLabel><FormattedMessage id="pages.admin.config.ldap.attributes" defaultMessage="属性映射" /></SectionLabel>
                  <ProForm.Group>
                    <ProFormText name="ldapAttrUsername" label={intl.formatMessage({ id: 'pages.admin.config.ldapAttrUsername', defaultMessage: 'Username' })} placeholder="uid" colProps={{ span: 8 }} />
                    <ProFormText name="ldapAttrEmail" label={intl.formatMessage({ id: 'pages.admin.config.ldapAttrEmail', defaultMessage: 'Email' })} placeholder="mail" colProps={{ span: 8 }} />
                    <ProFormText name="ldapAttrName" label={intl.formatMessage({ id: 'pages.admin.config.ldapAttrName', defaultMessage: 'Name' })} placeholder="cn" colProps={{ span: 8 }} />
                  </ProForm.Group>
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<RobotOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.ai', defaultMessage: 'AI' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormSelect
                    name="aiProvider"
                    label={intl.formatMessage({ id: 'pages.admin.config.aiProvider', defaultMessage: 'Provider' })}
                    options={[
                      { label: 'OpenAI', value: 'openai' },
                      { label: 'Anthropic', value: 'anthropic' },
                      { label: 'Ollama', value: 'ollama' },
                      { label: '千问', value: 'qwen' },
                      { label: '智谱', value: 'glm' },
                    ]}
                  />
                  <ProFormText
                    name="aiBaseUrl"
                    label={intl.formatMessage({ id: 'pages.admin.config.aiBaseUrl', defaultMessage: 'Base URL' })}
                    placeholder="https://api.openai.com/v1"
                    colProps={{ span: 24 }}
                  />
                  <ProFormText.Password
                    name="aiApiKey"
                    label={intl.formatMessage({ id: 'pages.admin.config.aiApiKey', defaultMessage: 'API Key' })}
                    placeholder={intl.formatMessage({ id: 'pages.admin.config.aiApiKey.placeholder', defaultMessage: '请输入API Key' })}
                    colProps={{ span: 24 }}
                  />
                  <ProFormText
                    name="aiModel"
                    label={intl.formatMessage({ id: 'pages.admin.config.aiModel', defaultMessage: 'Model' })}
                    placeholder="gpt-4o"
                    colProps={{ span: 24 }}
                  />
                </ProCard>
              </Col>
              <Col span={24}>
                <ProCard
                  title={<CardHeader icon={<BugOutlined />} title={intl.formatMessage({ id: 'pages.admin.config.sentry', defaultMessage: 'Sentry / 错误追踪' })} />}
                  bordered
                  style={{ marginBottom: 0 }}
                >
                  <ProFormText
                    name="sentryDsn"
                    label={intl.formatMessage({ id: 'pages.admin.config.sentryDsn', defaultMessage: 'DSN URL' })}
                    placeholder="https://example@sentry.io/123456"
                    colProps={{ span: 24 }}
                    tooltip={intl.formatMessage({ id: 'pages.admin.config.sentryDsn.detail', defaultMessage: 'Sentry数据源名称' })}
                  />
                </ProCard>
              </Col>
            </Row>
          </Col>
        </Row>
      </ProForm>

      <Modal
        title={intl.formatMessage({ id: 'pages.admin.config.testEmail', defaultMessage: '测试邮件' })}
        open={testModalVisible}
        onCancel={() => { setTestModalVisible(false); setTestEmailAddr(''); }}
        footer={[
          <Button key="cancel" onClick={() => { setTestModalVisible(false); setTestEmailAddr(''); }}>
            <FormattedMessage id="pages.common.cancel" defaultMessage="取消" />
          </Button>,
          <Button key="submit" type="primary" loading={testing} onClick={handleTestEmail}>
            <FormattedMessage id="pages.common.confirm" defaultMessage="发送" />
          </Button>,
        ]}
      >
        <Input
          placeholder={intl.formatMessage({ id: 'pages.admin.config.testEmail.placeholder', defaultMessage: '请输入测试邮箱地址' })}
          value={testEmailAddr}
          onChange={(e) => setTestEmailAddr(e.target.value)}
          onPressEnter={handleTestEmail}
        />
      </Modal>
    </PageContainer>
  );
};

export default Config;
