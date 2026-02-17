import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, List, Tag, Typography, Space, Badge } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  NotificationOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Text } = Typography;

const Overview: React.FC = () => {
  const intl = useIntl();

  const statistics = [
    { title: '待办任务', value: 12, icon: ClockCircleOutlined, color: '#faad14' },
    { title: '未读通知', value: 5, icon: NotificationOutlined, color: '#1890ff' },
    { title: '我的项目', value: 8, icon: ProjectOutlined, color: '#52c41a' },
    { title: '我的用例', value: 156, icon: FileTextOutlined, color: '#722ed1' },
  ];

  const todoList = [
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
      status: 'pending',
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

  const notifications = [
    {
      id: 1,
      title: '系统维护通知',
      content: '系统将于本周六凌晨进行维护',
      time: '10分钟前',
      type: 'info',
    },
    {
      id: 2,
      title: '测试任务完成',
      content: '项目A的回归测试已完成',
      time: '30分钟前',
      type: 'success',
    },
    { id: 3, title: '新成员加入', content: '张三加入了项目组', time: '1小时前', type: 'info' },
    { id: 4, title: '缺陷提醒', content: '发现3个高优先级缺陷', time: '2小时前', type: 'warning' },
  ];

  const getPriorityTag = (priority: string) => {
    const colorMap: Record<string, string> = { P0: 'red', P1: 'orange', P2: 'blue', P3: 'default' };
    return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      pending: { color: 'default', icon: <ClockCircleOutlined />, text: '待处理' },
      processing: { color: 'processing', icon: <ExclamationCircleOutlined />, text: '进行中' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.workbench.overview.title',
          defaultMessage: '工作台总览',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatisticCard
              statistic={{
                title: stat.title,
                value: stat.value,
                icon: <stat.icon style={{ fontSize: 32, color: stat.color }} />,
              }}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.workbench.overview.todo',
              defaultMessage: '待办任务',
            })}
            extra={<a href="#/workbench/todo">查看更多</a>}
          >
            <List
              dataSource={todoList}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {getPriorityTag(item.priority)}
                        <Text>{item.title}</Text>
                      </Space>
                    }
                    description={<Text type="secondary">截止: {item.deadline}</Text>}
                  />
                  {getStatusTag(item.status)}
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.workbench.overview.notifications',
              defaultMessage: '最新通知',
            })}
            extra={<a href="#/workbench/notification">查看更多</a>}
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          item.type === 'success'
                            ? 'success'
                            : item.type === 'warning'
                              ? 'warning'
                              : 'processing'
                        }
                      />
                    }
                    title={item.title}
                    description={item.content}
                  />
                  <Text type="secondary">{item.time}</Text>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Overview;
