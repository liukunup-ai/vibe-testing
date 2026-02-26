import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row, Tag, List, Typography, Progress, Space, Badge } from 'antd';
import {
  ProjectOutlined,
  FileTextOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useIntl, useRequest } from '@umijs/max';
import { listProjects } from '@/services/backend/project';
import { listTestCases } from '@/services/backend/testCase';
import { listDevices } from '@/services/backend/device';
import { listTestRecords } from '@/services/backend/testRecord';
import React from 'react';

const { Text } = Typography;
const { Statistic } = StatisticCard;

const Dashboard: React.FC = () => {
  const intl = useIntl();

  const { data: projectData } = useRequest(() => listProjects({ page: 1, pageSize: 1000 }));

  const { data: caseData } = useRequest(() =>
    listTestCases({ page: 1, pageSize: 1000, projectId: 0 } as API.TestCaseSearchRequest),
  );

  const { data: deviceData } = useRequest(() => listDevices({ page: 1, pageSize: 1000 }));

  const { data: recordData } = useRequest(() => listTestRecords({ page: 1, pageSize: 10 }));

  const projectCount = projectData?.data?.total || 0;
  const caseCount = caseData?.data?.total || 0;
  const deviceCount = deviceData?.data?.total || 0;
  const todayExecutions =
    recordData?.data?.list?.filter((r: API.TestRecord) => {
      if (!r.startTime) return false;
      const today = new Date();
      const recordDate = new Date(r.startTime);
      return recordDate.toDateString() === today.toDateString();
    }).length || 0;

  const onlineDevices =
    deviceData?.data?.list?.filter((d: API.Device) => d.status === 1).length || 0;
  const busyDevices = deviceData?.data?.list?.filter((d: API.Device) => d.status === 2).length || 0;
  const offlineDevices =
    deviceData?.data?.list?.filter((d: API.Device) => d.status === 0).length || 0;

  const trendData = [
    { date: '01-01', passRate: 85 },
    { date: '01-02', passRate: 87 },
    { date: '01-03', passRate: 82 },
    { date: '01-04', passRate: 90 },
    { date: '01-05', passRate: 88 },
    { date: '01-06', passRate: 92 },
    { date: '01-07', passRate: 89 },
  ];

  const recentTasks = recordData?.data?.list?.slice(0, 5) || [];

  const pendingTasks = [
    { id: 1, title: '登录模块用例评审', priority: 'P0', status: 'pending' },
    { id: 2, title: '新增功能测试计划', priority: 'P1', status: 'pending' },
    { id: 3, title: '性能测试脚本编写', priority: 'P2', status: 'pending' },
    { id: 4, title: '测试报告导出', priority: 'P3', status: 'pending' },
  ];

  const getStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
      0: {
        color: 'gold',
        text: intl.formatMessage({
          id: 'pages.testing.testrecord.status.pending',
          defaultMessage: '待处理',
        }),
        icon: <ClockCircleOutlined />,
      },
      1: {
        color: 'processing',
        text: intl.formatMessage({
          id: 'pages.testing.testrecord.status.running',
          defaultMessage: '运行中',
        }),
        icon: <SyncOutlined spin />,
      },
      2: {
        color: 'success',
        text: intl.formatMessage({
          id: 'pages.testing.testrecord.status.completed',
          defaultMessage: '已完成',
        }),
        icon: <CheckCircleOutlined />,
      },
      3: {
        color: 'error',
        text: intl.formatMessage({
          id: 'pages.testing.testrecord.status.failed',
          defaultMessage: '失败',
        }),
        icon: <CloseCircleOutlined />,
      },
      4: {
        color: 'default',
        text: intl.formatMessage({
          id: 'pages.testing.testrecord.status.cancelled',
          defaultMessage: '已取消',
        }),
        icon: <CloseCircleOutlined />,
      },
    };
    const config = statusMap[status || 0] || statusMap[0];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getPriorityTag = (priority: string) => {
    const colorMap: Record<string, string> = {
      P0: 'red',
      P1: 'orange',
      P2: 'blue',
      P3: 'default',
    };
    return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.testing.dashboard.title',
          defaultMessage: '测试工作台',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: intl.formatMessage({
                id: 'pages.testing.dashboard.projectCount',
                defaultMessage: '项目总数',
              }),
              value: projectCount,
              icon: <ProjectOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
              suffix: intl.formatMessage({
                id: 'pages.testing.dashboard.projectCount.suffix',
                defaultMessage: '个',
              }),
            }}
            style={{ height: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: intl.formatMessage({
                id: 'pages.testing.dashboard.caseCount',
                defaultMessage: '累计用例',
              }),
              value: caseCount,
              icon: <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
              suffix: intl.formatMessage({
                id: 'pages.testing.dashboard.caseCount.suffix',
                defaultMessage: '条',
              }),
            }}
            style={{ height: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: intl.formatMessage({
                id: 'pages.testing.dashboard.deviceCount',
                defaultMessage: '设备总数',
              }),
              value: deviceCount,
              icon: <MobileOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
              suffix: intl.formatMessage({
                id: 'pages.testing.dashboard.deviceCount.suffix',
                defaultMessage: '台',
              }),
            }}
            style={{ height: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: intl.formatMessage({
                id: 'pages.testing.dashboard.todayExecution',
                defaultMessage: '今日执行',
              }),
              value: todayExecutions,
              icon: <PlayCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />,
              suffix: intl.formatMessage({
                id: 'pages.testing.dashboard.todayExecution.suffix',
                defaultMessage: '次',
              }),
              trend: todayExecutions > 0 ? 'up' : undefined,
              trendIcon: todayExecutions > 0 ? <RiseOutlined /> : undefined,
            }}
            style={{ height: '100%' }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.dashboard.passRateTrend',
              defaultMessage: '测试通过率趋势',
            })}
            style={{ height: 300 }}
          >
            <div style={{ padding: '20px 0' }}>
              {trendData.map((item) => (
                <div
                  key={item.date}
                  style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
                >
                  <Text style={{ width: 50 }}>{item.date}</Text>
                  <Progress
                    percent={item.passRate}
                    size="small"
                    style={{ flex: 1 }}
                    strokeColor={
                      item.passRate >= 90 ? '#52c41a' : item.passRate >= 80 ? '#1890ff' : '#faad14'
                    }
                  />
                </div>
              ))}
            </div>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.dashboard.deviceUsage',
              defaultMessage: '设备利用率分布',
            })}
            style={{ height: 300 }}
          >
            <Row gutter={[16, 16]} style={{ padding: '20px 0' }}>
              <Col span={8}>
                <StatisticCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.dashboard.deviceOnline',
                      defaultMessage: '在线',
                    })}
                    value={onlineDevices}
                    suffix={`/ ${deviceCount}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </StatisticCard>
              </Col>
              <Col span={8}>
                <StatisticCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.dashboard.deviceBusy',
                      defaultMessage: '忙碌',
                    })}
                    value={busyDevices}
                    suffix={`/ ${deviceCount}`}
                    valueStyle={{ color: '#faad14' }}
                  />
                </StatisticCard>
              </Col>
              <Col span={8}>
                <StatisticCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.dashboard.deviceOffline',
                      defaultMessage: '离线',
                    })}
                    value={offlineDevices}
                    suffix={`/ ${deviceCount}`}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </StatisticCard>
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.dashboard.recentTasks',
              defaultMessage: '最近执行任务',
            })}
            style={{ height: 350 }}
          >
            <List
              dataSource={recentTasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          item.execStatus === 2
                            ? 'success'
                            : item.execStatus === 3
                              ? 'error'
                              : item.execStatus === 1
                                ? 'processing'
                                : 'default'
                        }
                      />
                    }
                    title={
                      <Text>
                        {intl.formatMessage({
                          id: 'pages.testing.dashboard.task',
                          defaultMessage: '任务',
                        })}{' '}
                        #{item.id}
                      </Text>
                    }
                    description={
                      <Space>
                        {getStatusTag(item.execStatus)}
                        <Text type="secondary">
                          {intl.formatMessage({
                            id: 'pages.testing.dashboard.passRate',
                            defaultMessage: '通过率',
                          })}
                          : {item.passRate?.toFixed(1) || 0}%
                        </Text>
                      </Space>
                    }
                  />
                  <Text type="secondary">{item.startTime}</Text>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.dashboard.pendingTasks',
              defaultMessage: '待处理任务',
            })}
            style={{ height: 350 }}
          >
            <List
              dataSource={pendingTasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                    title={
                      <Space>
                        {getPriorityTag(item.priority)}
                        <Text>{item.title}</Text>
                      </Space>
                    }
                  />
                  <Tag>{item.status}</Tag>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.dashboard.announcement',
              defaultMessage: '系统公告',
            })}
            style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}
          >
            <Text>
              {intl.formatMessage({
                id: 'pages.testing.dashboard.announcement.content',
                defaultMessage:
                  '平台将于本周六凌晨 2:00-4:00 进行维护升级，届时系统将暂停服务，请提前安排好测试任务。',
              })}
            </Text>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
