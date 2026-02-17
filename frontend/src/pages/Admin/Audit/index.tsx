import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, DatePicker, Input } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const AdminAudit: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumns<API.AuditLog>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 120,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 140,
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.status === 'success' ? 'success' : 'error'}>
          {record.status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
    },
  ];

  const data: API.AuditLog[] = [
    {
      id: 1,
      username: 'admin',
      action: '用户登录',
      module: '认证',
      ip: '192.168.1.100',
      content: '用户 admin 登录系统',
      status: 'success',
      createdAt: '2024-01-20 14:30:00',
    },
    {
      id: 2,
      username: 'admin',
      action: '创建用户',
      module: '用户管理',
      ip: '192.168.1.100',
      content: '创建用户 user1',
      status: 'success',
      createdAt: '2024-01-20 14:25:00',
    },
    {
      id: 3,
      username: 'operator',
      action: '修改配置',
      module: '系统配置',
      ip: '192.168.1.101',
      content: '修改系统参数',
      status: 'failed',
      createdAt: '2024-01-20 14:20:00',
    },
    {
      id: 4,
      username: 'admin',
      action: '删除角色',
      module: '角色管理',
      ip: '192.168.1.100',
      content: '删除角色 test_role',
      status: 'success',
      createdAt: '2024-01-20 14:15:00',
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.admin.audit.title', defaultMessage: '审计日志' }),
        breadcrumb: {},
      }}
    >
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <Space key="search">
            <Input placeholder="搜索用户" prefix={<SearchOutlined />} style={{ width: 200 }} />
            <RangePicker />
            <Button type="primary">搜索</Button>
          </Space>,
          <Button key="export">导出日志</Button>,
        ]}
      />
    </PageContainer>
  );
};

export default AdminAudit;
