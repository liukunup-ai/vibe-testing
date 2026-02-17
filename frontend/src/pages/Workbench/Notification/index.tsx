import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Button } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const Notification: React.FC = () => {
  const intl = useIntl();

  const columns: ProColumns<API.Notification>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      valueEnum: {
        info: { text: '信息', status: 'Processing' },
        success: { text: '成功', status: 'Success' },
        warning: { text: '警告', status: 'Warning' },
        error: { text: '错误', status: 'Error' },
      },
    },
    {
      title: '状态',
      dataIndex: 'read',
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.read ? 'default' : 'processing'}
          text={record.read ? '已读' : '未读'}
        />
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [<a key="view">查看</a>, !record.read && <a key="mark">标记已读</a>],
    },
  ];

  const data: API.Notification[] = [
    {
      id: 1,
      title: '系统维护通知',
      content: '系统将于本周六凌晨2:00-4:00进行维护',
      type: 'info',
      read: false,
      createdAt: '2024-01-20T10:30:00',
    },
    {
      id: 2,
      title: '测试任务完成',
      content: '项目A的回归测试已完成，通过率98%',
      type: 'success',
      read: false,
      createdAt: '2024-01-20T09:15:00',
    },
    {
      id: 3,
      title: '新成员加入',
      content: '张三加入了测试项目组',
      type: 'info',
      read: true,
      createdAt: '2024-01-20T08:00:00',
    },
    {
      id: 4,
      title: '缺陷提醒',
      content: '发现3个高优先级缺陷需要处理',
      type: 'warning',
      read: false,
      createdAt: '2024-01-19T16:30:00',
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.workbench.notification.title',
          defaultMessage: '通知中心',
        }),
        breadcrumb: {},
      }}
    >
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <Button key="all">全部标记已读</Button>,
          <Button key="clear">清空已读</Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Notification;
