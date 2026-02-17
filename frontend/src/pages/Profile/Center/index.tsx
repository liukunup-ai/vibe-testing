import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Spin, Form, Input, Button, Upload, message, Card, Avatar, Descriptions } from 'antd';
import type { RcFile } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useModel, useNavigate, useIntl } from '@umijs/max';
import { fetchCurrentUser, updateProfile } from '@/services/backend/user';

const AVATAR_UPLOAD_URL = 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload';
const MAX_NICKNAME_LENGTH = 20;
const MAX_AVATAR_SIZE_MB = 2;

const ProfileCenter: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [profile, setProfile] = useState<API.User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const intl = useIntl();
  const [form] = Form.useForm();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCurrentUser();
      if (response.success) {
        setProfile(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('加载个人资料失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (!initialState?.currentUser) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [initialState?.currentUser, navigate, loadProfile]);

  const handleProfileChange = async (values: Partial<API.User>) => {
    try {
      setLoading(true);
      await updateProfile(values);
      await loadProfile();
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const beforeUploadAvatar = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < MAX_AVATAR_SIZE_MB;

    if (!isJpgOrPng) {
      message.error('只支持 JPG/PNG 格式');
      return false;
    }
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB');
      return false;
    }
    return true;
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.profile.center.title', defaultMessage: '个人中心' }),
        breadcrumb: {},
      }}
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={100} src={profile?.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 24 }}>
            <h2>{profile?.nickname || profile?.username}</h2>
            <p style={{ color: '#666' }}>{profile?.email}</p>
          </div>
        </div>

        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="用户名">{profile?.username}</Descriptions.Item>
          <Descriptions.Item label="昵称">{profile?.nickname}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{profile?.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{profile?.phone}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="编辑资料" style={{ marginTop: 16 }}>
        <Form form={form} onFinish={handleProfileChange} layout="vertical">
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              { max: MAX_NICKNAME_LENGTH, message: `昵称长度不能超过${MAX_NICKNAME_LENGTH}位` },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="头像">
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              action={AVATAR_UPLOAD_URL}
              beforeUpload={beforeUploadAvatar}
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" style={{ width: '100%' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ProfileCenter;
