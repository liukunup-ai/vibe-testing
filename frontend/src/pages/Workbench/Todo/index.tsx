import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const Todo: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumns<API.Todo>[] = [
    {
      title: '任务名称',
      dataIndex: 'title',
      width: 300,
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
        const priority = record.priority || 'P3';
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
      },
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      width: 150,
      valueType: 'date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        pending: { text: '待处理', status: 'Default' },
        processing: { text: '进行中', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        record.status !== 'completed' && <a key="complete">完成</a>,
        <a key="detail">详情</a>,
      ],
    },
  ];

  const data: API.Todo[] = [
    {
      id: 1,
      title: '审核新提交的测试用例',
      priority: 'P0',
      deadline: '2024-01-20',
      status: 'pending',
    },
    {
      id: 2,
      title: '完成登录模块测试计划',
      priority: 'P1',
      deadline: '2024-01-21',
      status: 'processing',
    },
    {
      id: 3,
      title: '处理设备异常告警',
      priority: 'P0',
      deadline: '2024-01-20',
      status: 'processing',
    },
    { id: 4, title: '编写性能测试报告', priority: 'P2', deadline: '2024-01-22', status: 'pending' },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.workbench.todo.title', defaultMessage: '待办事项' }),
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
          <Button type="primary" key="new">
            新建任务
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Todo;
