import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Form, Input, Button, message, Switch, InputNumber } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const AdminConfig: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('保存成功');
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.admin.config.title', defaultMessage: '系统配置' }),
        breadcrumb: {},
      }}
    >
      <ProCard title="基础配置">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="站点名称"
            name="siteName"
            initialValue="Vibe Testing"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="系统邮箱"
            name="systemEmail"
            initialValue="admin@example.com"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="最大上传大小(MB)" name="maxUploadSize" initialValue={100}>
            <InputNumber min={1} max={500} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="会话超时时间(分钟)" name="sessionTimeout" initialValue={30}>
            <InputNumber min={5} max={1440} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            label="启用注册"
            name="enableRegister"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="启用邮箱验证"
            name="enableEmailVerification"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </ProCard>

      <ProCard title="安全配置" style={{ marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item label="密码最小长度" name="passwordMinLength" initialValue={8}>
            <InputNumber min={6} max={32} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="登录失败次数限制" name="loginFailLimit" initialValue={5}>
            <InputNumber min={3} max={10} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            label="启用IP白名单"
            name="enableIpWhitelist"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </ProCard>
    </PageContainer>
  );
};

export default AdminConfig;
