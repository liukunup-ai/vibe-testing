import { PlusOutlined, MoreOutlined, MailOutlined, LogoutOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message, Dropdown, Avatar, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useEffect, useState } from 'react';
import { listUsers, deleteUser, sendResetEmail, revokeSessions, updateStatus, resetAvatar } from '@/services/backend/user';
import { listRoles } from '@/services/backend/role';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const User: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<API.User | null>(null);
  const [roleOptions, setRoleOptions] = useState<API.Role[]>([]);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await listRoles({});
        if (response.success) {
          setRoleOptions(response.data?.list || []);
        }
      } catch (error) {
        const msg = intl.formatMessage({ id: 'pages.admin.user.fetchRoles.failure', defaultMessage: '获取角色列表失败' });
        if (error instanceof Error) {
          message.error(error.message || msg);
        } else {
          message.error(msg);
        }
      }
    };
    fetchRoles();
  }, []);

  const getAvatarContent = (record: API.User) => {
    if (record.avatarUrl) {
      return <Avatar src={record.avatarUrl} />;
    }
    const name = record.fullName || record.username || '';
    const initial = name.charAt(0).toUpperCase();
    return <Avatar style={{ backgroundColor: '#1677ff' }}>{initial}</Avatar>;
  };

  const handleMoreAction = async (key: string, record: API.User) => {
    if (!record.userId) return;

    try {
      switch (key) {
        case 'sendResetEmail':
          await sendResetEmail({ id: record.userId });
          message.success(intl.formatMessage({ id: 'pages.admin.user.sendResetEmail.success', defaultMessage: '重置密码邮件已发送' }));
          break;
        case 'revokeSessions':
          await revokeSessions({ id: record.userId });
          message.success(intl.formatMessage({ id: 'pages.admin.user.revokeSessions.success', defaultMessage: '已撤销所有登录态' }));
          break;
        case 'disableAccount':
          Modal.confirm({
            title: intl.formatMessage({ id: 'pages.admin.user.disableAccount.confirmTitle', defaultMessage: '确认禁用账号' }),
            content: intl.formatMessage({ id: 'pages.admin.user.disableAccount.confirmContent', defaultMessage: '确定要禁用该账号吗？禁用后用户将无法登录' }),
            onOk: async () => {
              await updateStatus({ id: record.userId! }, { status: 2 });
              message.success(intl.formatMessage({ id: 'pages.admin.user.disableAccount.success', defaultMessage: '账号已禁用' }));
              actionRef.current?.reload();
            },
          });
          break;
        case 'enableAccount':
          await updateStatus({ id: record.userId }, { status: 1 });
          message.success(intl.formatMessage({ id: 'pages.admin.user.enableAccount.success', defaultMessage: '账号已启用' }));
          actionRef.current?.reload();
          break;
        case 'resetAvatar':
          Modal.confirm({
            title: intl.formatMessage({ id: 'pages.admin.user.resetAvatar.confirmTitle', defaultMessage: '确认重置头像' }),
            content: intl.formatMessage({ id: 'pages.admin.user.resetAvatar.confirmContent', defaultMessage: '确定要重置该用户的头像吗？' }),
            onOk: async () => {
              await resetAvatar({ id: record.userId! });
              message.success(intl.formatMessage({ id: 'pages.admin.user.resetAvatar.success', defaultMessage: '头像已重置' }));
              actionRef.current?.reload();
            },
          });
          break;
      }
    } catch (error: any) {
      message.error(error.message || intl.formatMessage({ id: 'pages.common.operation.failure', defaultMessage: '操作失败' }));
    }
  };

  const getMoreMenuItems = (record: API.User): MenuProps['items'] => [
    {
      key: 'sendResetEmail',
      icon: <MailOutlined />,
      label: intl.formatMessage({ id: 'pages.admin.user.sendResetEmail', defaultMessage: '发送重置密码邮件' }),
    },
    {
      key: 'revokeSessions',
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: 'pages.admin.user.revokeSessions', defaultMessage: '撤销登录态' }),
    },
    {
      key: 'resetAvatar',
      icon: <UserOutlined />,
      label: intl.formatMessage({ id: 'pages.admin.user.resetAvatar', defaultMessage: '重置头像' }),
    },
  ];

  const columns: ProColumns<API.User>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.avatar',
        defaultMessage: '头像'
      }),
      dataIndex: 'avatarUrl',
      width: 60,
      search: false,
      render: (_, record) => getAvatarContent(record),
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.username',
        defaultMessage: '用户名'
      }),
      dataIndex: 'username',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.admin.user.form.username.required',
              defaultMessage: '用户名不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.fullName',
        defaultMessage: '全名',
      }),
      dataIndex: 'fullName',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.email',
        defaultMessage: '邮箱',
      }),
      dataIndex: 'email',
      copyable: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.admin.user.form.email.required',
              defaultMessage: '邮箱不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.phone',
        defaultMessage: '手机',
      }),
      dataIndex: 'phone',
      copyable: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.admin.user.status.inactive',
            defaultMessage: '待激活'
          }),
          status: 'Inactive'
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.admin.user.status.normal',
            defaultMessage: '正常'
          }),
          status: 'Normal'
        },
        2: {
          text: intl.formatMessage({
            id: 'pages.admin.user.status.disabled',
            defaultMessage: '禁用'
          }),
          status: 'Disabled'
        },
      },
      render: (_, record) => (
        <Space>
          {record.status === 0 ? (
            <Tag color="gold">
              <FormattedMessage id="pages.admin.user.status.inactive" defaultMessage="待激活" />
            </Tag>
          ) : record.status === 1 ? (
            <Tag color="green">
              <FormattedMessage id="pages.admin.user.status.normal" defaultMessage="正常" />
            </Tag>
          ) : (
            <Tag color="red">
              <FormattedMessage id="pages.admin.user.status.disabled" defaultMessage="禁用" />
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.user.key.roles',
        defaultMessage: '角色',
      }),
      dataIndex: 'roles',
      hideInSearch: true,
      filters: roleOptions?.map(({ id, name }) => ({ text: name as string, value: id as number })) || [],
      onFilter: (value, record) => record.roles?.some(({ id }) => id === value) ?? false,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {record.roles?.map((r) => (
            <Tag key={r.id} color="blue">{r.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.key.createdAt',
        defaultMessage: '创建时间',
      }),
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.key.updatedAt',
        defaultMessage: '更新时间',
      }),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.table.key.actions',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentUser(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="toggleStatus"
          onClick={() => {
            if (record.status === 2) {
              handleMoreAction('enableAccount', record);
            } else {
              handleMoreAction('disableAccount', record);
            }
          }}
        >
          {record.status === 2 
            ? <FormattedMessage id="pages.admin.user.enableAccount" defaultMessage="启用" />
            : <FormattedMessage id="pages.admin.user.disableAccount" defaultMessage="禁用" />}
        </a>,
        <Dropdown
          key="more"
          menu={{
            items: getMoreMenuItems(record),
            onClick: ({ key }) => handleMoreAction(key, record),
          }}
          trigger={['click']}
        >
          <a onClick={(e) => e.preventDefault()}>
            <MoreOutlined />
          </a>
        </Dropdown>,
      ],
    },
  ];

  const search = async (params: {
    page: number;
    pageSize: number;
    username?: string;
    nickname?: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      const result = await listUsers(params as API.ListUsersParams);
      return { data: result.data?.list || [], success: result.success, total: result.data?.total };
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.common.fetchData.failure',
        defaultMessage: '获取数据失败',
      }));
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <div>
      <ProTable<API.User>
        columns={columns}
        actionRef={actionRef}
        cardBordered

        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, username, nickname, email, phone } = params;
          const results = await search({
            page: current,
            pageSize,
            username,
            nickname,
            email,
            phone,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-user',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle={intl.formatMessage({
          id: 'pages.admin.user.table.title',
          defaultMessage: '用户列表',
        })}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCreateVisible(true);
            }}
            type="primary"
          >
            <FormattedMessage id="pages.common.new" defaultMessage="新建" />
          </Button>,
        ]}
      />
      <CreateForm
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => {
          setCreateVisible(false);
          actionRef.current?.reload();
        }}
      />
      <UpdateForm
        visible={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        onSuccess={() => {
          setUpdateVisible(false);
          actionRef.current?.reload();
        }}
        initialValues={currentUser as API.User}
      />
    </div>
  );
};

export default User;
