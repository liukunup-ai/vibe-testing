import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import React from 'react';

const BugList: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumns<API.Bug>[] = [
    {
      title: '缺陷编号',
      dataIndex: 'code',
      width: 120,
    },
    {
      title: '缺陷标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 100,
      valueEnum: {
        critical: { text: '致命', status: 'Error' },
        major: { text: '严重', status: 'Warning' },
        minor: { text: '一般', status: 'Default' },
        trivial: { text: '轻微', status: 'Default' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          critical: 'red',
          major: 'orange',
          minor: 'blue',
          trivial: 'default',
        };
        const textMap: Record<string, string> = {
          critical: '致命',
          major: '严重',
          minor: '一般',
          trivial: '轻微',
        };
        return (
          <Tag color={colorMap[record.severity] || 'default'}>
            {textMap[record.severity] || record.severity}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        new: { text: '新建', status: 'Default' },
        assigned: { text: '已分配', status: 'Processing' },
        fixed: { text: '已修复', status: 'Success' },
        reopened: { text: '重开', status: 'Error' },
        closed: { text: '已关闭', status: 'Success' },
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
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
      title: '报告人',
      dataIndex: 'reporter',
      width: 100,
    },
    {
      title: '指派给',
      dataIndex: 'assignee',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="detail" href={`#/bug/detail/${record.id}`}>
          详情
        </a>,
        <a key="edit">编辑</a>,
      ],
    },
  ];

  const data: API.Bug[] = [
    {
      id: 1,
      code: 'BUG-001',
      title: '登录页面加载缓慢',
      severity: 'major',
      status: 'assigned',
      priority: 'P1',
      reporter: '张三',
      assignee: '李四',
      createdAt: '2024-01-20 10:30:00',
    },
    {
      id: 2,
      code: 'BUG-002',
      title: '订单提交按钮无效',
      severity: 'critical',
      status: 'new',
      priority: 'P0',
      reporter: '王五',
      assignee: '-',
      createdAt: '2024-01-20 09:15:00',
    },
    {
      id: 3,
      code: 'BUG-003',
      title: '页面显示错位',
      severity: 'minor',
      status: 'fixed',
      priority: 'P2',
      reporter: '赵六',
      assignee: '钱七',
      createdAt: '2024-01-19 16:30:00',
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.bug.list.title', defaultMessage: '缺陷列表' }),
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
            提交缺陷
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default BugList;
