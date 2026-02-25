import { Form, Input, Modal, message, Avatar, Select } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { createItem } from '@/services/backend/item';
import { listUsers } from '@/services/backend/user';
import { UserOutlined } from '@ant-design/icons';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateForm = ({ visible, onCancel, onSuccess }: CreateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<API.User[]>([]);
  const [fetching, setFetching] = useState(false);
  const [form] = useForm<API.ItemRequest>();
  const intl = useIntl();

  useEffect(() => {
    if (visible) {
      setFetching(true);
      listUsers({ page: 1, pageSize: 100 })
        .then((res) => {
          if (res.success && res.data?.list) {
            setUsers(res.data.list);
          }
        })
        .finally(() => setFetching(false));
    }
  }, [visible]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await createItem(values as API.ItemRequest);
      message.success(intl.formatMessage({ id: 'pages.common.new.success', defaultMessage: '新建成功' }));
      form.resetFields();
      onSuccess();
    } catch (error) {
      const msg = intl.formatMessage({ id: 'pages.common.new.failure', defaultMessage: '新建失败' });
      if (error instanceof Error) {
        message.error(error.message || msg);
      } else {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const renderUserOption = (user: API.User) => {
    const displayName = user.fullName || user.username || '';
    return (
      <Select.Option key={user.username} value={user.username || ''} username={user.username}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={user.avatarUrl} size="small" icon={!user.avatarUrl && <UserOutlined />} />
          <span>{displayName}</span>
          {user.fullName && <span style={{ color: '#999', fontSize: 12 }}>({user.username})</span>}
        </div>
      </Select.Option>
    );
  };

  const filterOption = (input: string, option: any) => {
    const user = option as unknown as API.User;
    const searchText = input.toLowerCase();
    return (
      (user.fullName?.toLowerCase() || '').includes(searchText) ||
      (user.username?.toLowerCase() || '').includes(searchText) ||
      (user.email?.toLowerCase() || '').includes(searchText)
    );
  };

  return (
    <Modal
      title={<FormattedMessage id="pages.item.modal.createForm.title" defaultMessage="新建项目" />}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="name"
          label={<FormattedMessage id="pages.item.key.name" defaultMessage="名称" />}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.item.form.name.required', defaultMessage: '名称不能为空' }) },
            { max: 20, message: intl.formatMessage({ id: 'pages.item.form.name.maxlen', defaultMessage: '名称不能超过20个字符' }) },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'pages.item.form.name.placeholder', defaultMessage: '取一个有意义的名字吧' })} />
        </Form.Item>

        <Form.Item
          name="desc"
          label={<FormattedMessage id="pages.item.key.desc" defaultMessage="描述" />}
        >
          <Input.TextArea placeholder={intl.formatMessage({ id: 'pages.item.form.desc.placeholder', defaultMessage: '简要描述功能，比如它可以用来做什么' })} />
        </Form.Item>

        <Form.Item
          name="owner"
          label={<FormattedMessage id="pages.item.key.owner" defaultMessage="所有者" />}
        >
          <Select
            showSearch
            allowClear
            placeholder="选择所有者"
            loading={fetching}
            filterOption={filterOption}
            style={{ width: '100%' }}
          >
            {users.map(renderUserOption)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
