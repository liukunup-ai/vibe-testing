import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Divider,
  Descriptions,
  Tag,
  Spin,
  theme,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EditOutlined,
  SafetyOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import type { UploadChangeParam } from 'antd/es/upload';
import { createStyles } from 'antd-style';
import { useModel, useNavigate, useIntl } from '@umijs/max';
import { fetchCurrentUser, updateProfile, updatePassword } from '@/services/backend/user';
import { getAccessToken } from '@/models/useTokenModel';
import { formatInUserTimezone } from '@/utils/timezone';

const { Title, Text } = Typography;

const MAX_FULLNAME_LENGTH = 20;
const MAX_AVATAR_SIZE_MB = 2;
const MIN_PASSWORD_LENGTH = 6;
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif', 'image/webp'];
const useStyles = createStyles(({ token, css }) => ({
  container: css`
    min-height: 100vh;
  `,
  avatarCard: css`
    text-align: center;
    border-radius: ${token.borderRadiusLG}px;

    .ant-card-body {
      padding: 32px 24px;
    }
  `,
  avatarWrapper: css`
    margin-bottom: 16px;
    position: relative;
    display: inline-block;

    .ant-avatar {
      border: 4px solid ${token.colorBorderSecondary};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    &:hover .ant-avatar {
      transform: scale(1.05);
    }

    &:hover .upload-overlay {
      opacity: 1;
    }
  `,
  uploadOverlay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 114px;
    height: 114px;
    margin-top: -57px;
    margin-left: -57px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    font-size: 13px;
  `,
  userName: css`
    color: ${token.colorText};
    margin-bottom: 4px !important;
  `,
  userEmail: css`
    color: ${token.colorTextSecondary};
    margin-bottom: 12px !important;
  `,
  roleTag: css`
    background: ${token.colorPrimaryBg};
    border: none;
    color: ${token.colorPrimary};
    margin: 2px;
  `,
  infoCard: css`
    border-radius: ${token.borderRadiusLG}px;
    height: 100%;

    .ant-card-head {
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
  `,
  cardTitle: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  `,
  formItem: css`
    margin-bottom: 20px;

    .ant-form-item-label > label {
      font-weight: 500;
    }

    .ant-input-prefix,
    .ant-input-password-icon {
      color: ${token.colorTextPlaceholder};
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px ${token.colorBgContainer} inset !important;
      -webkit-text-fill-color: ${token.colorText} !important;
    }
  `,
  submitBtn: css`
    margin-top: 8px;
  `,
  loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  `,
  publicIdWrapper: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  copyBtn: css`
    padding: 0 8px;
    height: 24px;
    font-size: 12px;
  `,
  statusActive: css`
    color: ${token.colorSuccess};
  `,
  statusInactive: css`
    color: ${token.colorWarning};
  `,
  statusDisabled: css`
    color: ${token.colorError};
  `,
}));

const Profile: React.FC = () => {
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [profile, setProfile] = useState<API.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCurrentUser();
      if (response.success && response.data) {
        setProfile(response.data);
        profileForm.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({ id: 'pages.profile.loadFailed', defaultMessage: '加载用户资料失败' }),
      );
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profileForm, intl]);

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
      const requestValues: API.UserRequest = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
      };
      await updateProfile(requestValues);
      await loadProfile();
      message.success(
        intl.formatMessage({ id: 'pages.profile.updateSuccess', defaultMessage: '资料更新成功' }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({ id: 'pages.profile.updateFailed', defaultMessage: '资料更新失败' }),
      );
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
      message.success(
        intl.formatMessage({
          id: 'pages.profile.passwordUpdateSuccess',
          defaultMessage: '密码修改成功',
        }),
      );
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.profile.passwordUpdateFailed',
          defaultMessage: '密码修改失败',
        }),
      );
      console.error('Failed to update password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange: UploadProps['onChange'] = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Backend doesn't return avatar URL, reload profile to get it
      loadProfile();
      // Refresh global state to update top-right avatar
      if (initialState?.fetchUserInfo) {
        initialState.fetchUserInfo().then((user) => {
          if (user && setInitialState) {
            setInitialState((s) => ({ ...s, currentUser: user }));
          }
        });
      }
      message.success(
        intl.formatMessage({
          id: 'pages.profile.avatarUploadSuccess',
          defaultMessage: '头像上传成功',
        }),
      );
    } else if (info.file.status === 'error') {
      message.error(
        intl.formatMessage({
          id: 'pages.profile.avatarUploadFailed',
          defaultMessage: '头像上传失败',
        }),
      );
    }
    setLoading(false);
  };

  const beforeUploadAvatar = (file: RcFile) => {
    const isValidType = ALLOWED_AVATAR_TYPES.includes(file.type);
    const isLt2M = file.size / 1024 / 1024 < MAX_AVATAR_SIZE_MB;

    if (!isValidType) {
      message.error(
        intl.formatMessage({
          id: 'pages.profile.avatarFormatError',
          defaultMessage: '只支持 PNG/JPG/JPEG/SVG/GIF/WEBP 格式图片',
        }),
      );
      return false;
    }
    if (!isLt2M) {
      message.error(
        intl.formatMessage({
          id: 'pages.profile.avatarSizeError',
          defaultMessage: '图片大小不能超过 2MB',
        }),
      );
      return false;
    }
    return true;
  };

  const copyPublicId = async () => {
    if (profile?.userId) {
      try {
        await navigator.clipboard.writeText(profile.userId);
        setCopied(true);
        message.success('已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        message.error('复制失败');
      }
    }
  };

  const getRoleTags = () => {
    if (!profile?.roles || profile.roles.length === 0) {
      return <Tag className={styles.roleTag}>用户</Tag>;
    }
    return profile.roles.map((role) => (
      <Tag key={role.id} className={styles.roleTag}>
        {role.name}
      </Tag>
    ));
  };

  const getStatusDisplay = () => {
    const statusMap: Record<number, { text: string; className: string }> = {
      0: { text: '待激活', className: styles.statusInactive },
      1: { text: '正常', className: styles.statusActive },
      2: { text: '禁用', className: styles.statusDisabled },
    };
    const status = profile?.status ?? 1;
    return statusMap[status] || statusMap[1];
  };

  const renderAvatarCard = () => {
    return (
      <Card className={styles.avatarCard} variant="borderless">
        <Upload
          name="file"
          showUploadList={false}
          action="/v1/users/profile/avatar"
          headers={{
            Authorization: `Bearer ${getAccessToken()}`,
          }}
          beforeUpload={beforeUploadAvatar}
          onChange={handleAvatarChange}
          className={styles.avatarWrapper}
        >
          {profile?.avatarUrl ? (
            <Avatar size={100} src={profile.avatarUrl} />
          ) : (
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimaryBg }} />
          )}
          <div className={`${styles.uploadOverlay} upload-overlay`}>
            <UploadOutlined /> 点击上传
          </div>
        </Upload>
        <Title level={4} className={styles.userName}>
          {profile?.fullName || profile?.username || '用户'}
        </Title>
        <Text 
          className={styles.userEmail} 
          copyable={{ text: profile?.email || '', tooltips: ['复制邮箱', '已复制'] }}
        >
          {profile?.email || '未设置邮箱'}
        </Text>
        <div>{getRoleTags()}</div>
      </Card>
    );
  };

  const renderAccountInfoCard = () => {
    const statusDisplay = getStatusDisplay();
    return (
      <Card
        className={styles.infoCard}
        title={
          <span className={styles.cardTitle}>
            <UserOutlined />
            账户信息
          </span>
        }
      >
        <Descriptions column={1} styles={{ label: { width: 80 } }}>
          <Descriptions.Item label="用户ID">
            <Text copyable={{ text: profile?.userId || '', tooltips: ['复制', '已复制'] }}>
              {profile?.userId || '-'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="全名">{profile?.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机">{profile?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <span className={statusDisplay.className}>{statusDisplay.text}</span>
          </Descriptions.Item>
          <Descriptions.Item label="个人简介">{profile?.bio || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatInUserTimezone(profile?.createdAt) || '-'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatInUserTimezone(profile?.updatedAt) || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  const renderEditProfileCard = () => (
    <Card
      className={styles.infoCard}
      title={
        <span className={styles.cardTitle}>
          <EditOutlined />
          编辑资料
        </span>
      }
    >
      <Form form={profileForm} layout="vertical" onFinish={handleProfileChange}>
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              className={styles.formItem}
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名不能超过20个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              className={styles.formItem}
              label="全名"
              name="fullName"
              rules={[
                { required: true, message: '请输入全名' },
                { max: MAX_FULLNAME_LENGTH, message: `全名长度不能超过${MAX_FULLNAME_LENGTH}位` },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入全名" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              className={styles.formItem}
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              className={styles.formItem}
              label="手机"
              name="phone"
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className={styles.formItem} label="个人简介" name="bio">
          <Input.TextArea rows={3} placeholder="介绍一下自己..." showCount maxLength={200} />
        </Form.Item>
        <Form.Item className={styles.submitBtn}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const renderPasswordCard = () => (
    <Card
      className={styles.infoCard}
      title={
        <span className={styles.cardTitle}>
          <LockOutlined />
          修改密码
        </span>
      }
    >
      <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
        <Form.Item
          className={styles.formItem}
          label="当前密码"
          name="currentPassword"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
        </Form.Item>
        <Form.Item
          className={styles.formItem}
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: MIN_PASSWORD_LENGTH, message: `密码长度不能少于${MIN_PASSWORD_LENGTH}位` },
            { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字' },
          ]}
        >
          <Input.Password prefix={<SafetyOutlined />} placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          className={styles.formItem}
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
          <Input.Password prefix={<SafetyOutlined />} placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item className={styles.submitBtn}>
          <Button type="primary" htmlType="submit" loading={loading}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div className={styles.container} style={{ opacity: loading && !profile ? 0 : 1 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={24}>
            {renderAvatarCard()}
            {renderAccountInfoCard()}
          </Space>
        </Col>
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: '100%' }} size={24}>
            {renderEditProfileCard()}
            {renderPasswordCard()}
          </Space>
        </Col>
      </Row>
      {loading && !profile && (
        <div className={styles.loadingContainer} style={{ position: 'absolute', inset: 0 }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default Profile;
