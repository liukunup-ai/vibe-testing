import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import React, { useState } from 'react';

const ProjectMembers: React.FC = () => {
  const intl = useIntl();
  const [loading] = useState(false);

  const columns: ProColumns<API.ProjectMember>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'nickname',
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (_, record) => (
        <Tag color={record.role === 'owner' ? 'red' : record.role === 'admin' ? 'blue' : 'default'}>
          {record.role === 'owner' ? '负责人' : record.role === 'admin' ? '管理员' : '成员'}
        </Tag>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      valueType: 'dateTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'success' : 'default'}>
          {record.status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="role">修改角色</a>,
        record.role !== 'owner' && (
          <a key="remove" style={{ color: '#ff4d4f' }}>
            移除
          </a>
        ),
      ],
    },
  ];

  const data: API.ProjectMember[] = [
    {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      role: 'owner',
      status: 1,
      joinedAt: '2024-01-01',
    },
    {
      id: 2,
      username: 'user1',
      nickname: '张三',
      role: 'admin',
      status: 1,
      joinedAt: '2024-01-05',
    },
    {
      id: 3,
      username: 'user2',
      nickname: '李四',
      role: 'member',
      status: 1,
      joinedAt: '2024-01-10',
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.project.members.title',
          defaultMessage: '项目成员',
        }),
        breadcrumb: {},
      }}
    >
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={false}
        loading={loading}
        toolBarRender={() => [
          <Button type="primary" icon={<PlusOutlined />} key="add">
            添加成员
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default ProjectMembers;
