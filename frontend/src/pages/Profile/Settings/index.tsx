import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { useIntl } from '@umijs/max';
import { updatePassword } from '@/services/backend/user';

const MIN_PASSWORD_LENGTH = 6;

const ProfileSettings: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [pwdForm] = Form.useForm();

  const handlePasswordChange = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);

      if (values.currentPassword === values.newPassword) {
        message.error('新密码不能与当前密码相同');
        return;
      }

      await updatePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功');
      pwdForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const passwordForm = (
    <Card title="修改密码">
      <Form form={pwdForm} layout="vertical" onFinish={handlePasswordChange}>
        <Form.Item
          label="当前密码"
          name="currentPassword"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: MIN_PASSWORD_LENGTH, message: `密码长度不能少于${MIN_PASSWORD_LENGTH}位` },
            { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const preferenceForm = (
    <Card title="偏好设置">
      <Form layout="vertical">
        <Form.Item label="语言">
          <Input disabled defaultValue="简体中文" />
        </Form.Item>
        <Form.Item label="时区">
          <Input disabled defaultValue="Asia/Shanghai" />
        </Form.Item>
        <Form.Item label="主题">
          <Input disabled defaultValue="默认主题" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" disabled>
            保存偏好
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.profile.settings.title',
          defaultMessage: '个人设置',
        }),
        breadcrumb: {},
      }}
    >
      <Tabs defaultActiveKey="password">
        <Tabs.TabPane tab="安全设置" key="password">
          {passwordForm}
        </Tabs.TabPane>
        <Tabs.TabPane tab="偏好设置" key="preference">
          {preferenceForm}
        </Tabs.TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default ProfileSettings;
