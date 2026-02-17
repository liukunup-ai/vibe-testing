import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import React from 'react';

const RequirementList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumns<API.Requirement>[] = [
    {
      title: '需求编号',
      dataIndex: 'code',
      width: 120,
    },
    {
      title: '需求标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          P0: 'red',
          P1: 'orange',
          P2: 'blue',
          P3: 'default',
        };
        return <Tag color={colorMap[record.priority] || 'default'}>{record.priority}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        pending: { text: '待评审', status: 'Processing' },
        approved: { text: '已批准', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Error' },
        implemented: { text: '已实现', status: 'Success' },
      },
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      width: 120,
    },
    {
      title: '计划日期',
      dataIndex: 'plannedDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit">编辑</a>,
        <a key="detail" href={`#/requirement/detail/${record.id}`}>
          详情
        </a>,
      ],
    },
  ];

  const data: API.Requirement[] = [
    {
      id: 1,
      code: 'REQ-001',
      title: '用户登录功能',
      priority: 'P0',
      status: 'implemented',
      assignee: '张三',
      plannedDate: '2024-01-15',
    },
    {
      id: 2,
      code: 'REQ-002',
      title: '订单管理模块',
      priority: 'P1',
      status: 'approved',
      assignee: '李四',
      plannedDate: '2024-01-20',
    },
    {
      id: 3,
      code: 'REQ-003',
      title: '报表导出功能',
      priority: 'P2',
      status: 'pending',
      assignee: '王五',
      plannedDate: '2024-01-25',
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.requirement.list.title',
          defaultMessage: '需求列表',
        }),
        breadcrumb: {},
      }}
    >
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <Button type="primary" icon={<PlusOutlined />} key="new">
            新建需求
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default RequirementList;
