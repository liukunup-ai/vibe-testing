import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  DesktopOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProLayout } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Tabs,
  Input,
  Switch,
} from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect, useRef } from 'react';

interface TaskLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  deviceId?: number;
}

interface DeviceStatus {
  id: number;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentCase?: string;
  progress: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface TaskMonitorData {
  taskId: number;
  taskName: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  totalCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  skippedCases: number;
  startTime?: string;
  elapsedSeconds: number;
  etaSeconds?: number;
  devices: DeviceStatus[];
}

const useTaskMonitor = (taskId: number) => {
  const [data, setData] = useState<TaskMonitorData | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    setTimeout(() => {
      setData({
        taskId,
        taskName: `Test Task #${taskId}`,
        status: 'running',
        totalCases: 100,
        passedCases: 45,
        failedCases: 3,
        blockedCases: 2,
        skippedCases: 5,
        startTime: new Date().toISOString(),
        elapsedSeconds: 1234,
        etaSeconds: 1800,
        devices: [
          {
            id: 1,
            name: 'Android Device 1',
            status: 'running',
            currentCase: 'Login Test',
            progress: 65,
            cpuUsage: 45.2,
            memoryUsage: 62.8,
          },
          {
            id: 2,
            name: 'Android Device 2',
            status: 'running',
            currentCase: 'Payment Test',
            progress: 30,
            cpuUsage: 38.5,
            memoryUsage: 55.2,
          },
          {
            id: 3,
            name: 'iOS Device 1',
            status: 'paused',
            currentCase: 'Search Test',
            progress: 80,
            cpuUsage: 12.3,
            memoryUsage: 28.4,
          },
          {
            id: 4,
            name: 'Browser Chrome',
            status: 'completed',
            currentCase: 'UI Test',
            progress: 100,
            cpuUsage: 5.2,
            memoryUsage: 15.6,
          },
          {
            id: 5,
            name: 'Browser Firefox',
            status: 'failed',
            currentCase: 'API Test',
            progress: 45,
            cpuUsage: 0,
            memoryUsage: 0,
          },
          {
            id: 6,
            name: 'Android Device 3',
            status: 'idle',
            progress: 0,
            cpuUsage: 0,
            memoryUsage: 0,
          },
        ],
      });
      setLogs([
        {
          id: '1',
          timestamp: '2024-01-20 10:30:01',
          level: 'INFO',
          message: 'Task started',
          deviceId: 0,
        },
        {
          id: '2',
          timestamp: '2024-01-20 10:30:05',
          level: 'INFO',
          message: 'Device Android Device 1 connected',
          deviceId: 1,
        },
        {
          id: '3',
          timestamp: '2024-01-20 10:30:06',
          level: 'INFO',
          message: 'Device Android Device 2 connected',
          deviceId: 2,
        },
        {
          id: '4',
          timestamp: '2024-01-20 10:30:10',
          level: 'INFO',
          message: 'Running test case: Login Test',
          deviceId: 1,
        },
        {
          id: '5',
          timestamp: '2024-01-20 10:31:20',
          level: 'INFO',
          message: 'Test case passed: Login Test',
          deviceId: 1,
        },
        {
          id: '6',
          timestamp: '2024-01-20 10:31:25',
          level: 'WARN',
          message: 'Slow response detected in API call',
          deviceId: 2,
        },
        {
          id: '7',
          timestamp: '2024-01-20 10:32:00',
          level: 'ERROR',
          message: 'Test case failed: Element not found',
          deviceId: 5,
        },
      ]);
      setLoading(false);
      setConnected(true);
    }, 500);
  }, [taskId]);

  const pauseTask = () => {
    setData((prev) => (prev ? { ...prev, status: 'paused' } : null));
  };

  const resumeTask = () => {
    setData((prev) => (prev ? { ...prev, status: 'running' } : null));
  };

  const stopTask = () => {
    setData((prev) => (prev ? { ...prev, status: 'failed' } : null));
  };

  const retryTask = () => {
    setData((prev) =>
      prev
        ? { ...prev, status: 'running', passedCases: 0, failedCases: 0, elapsedSeconds: 0 }
        : null,
    );
    setLogs([]);
  };

  return {
    data,
    logs,
    loading,
    connected,
    pauseTask,
    resumeTask,
    stopTask,
    retryTask,
  };
};

const TaskMonitor: React.FC = () => {
  const intl = useIntl();
  const taskId = 1;
  const { data, logs, loading, connected, pauseTask, resumeTask, stopTask, retryTask } =
    useTaskMonitor(taskId);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'gold', text: 'pages.testing.task.status.pending' },
      running: { color: 'processing', text: 'pages.testing.task.status.running' },
      paused: { color: 'warning', text: 'pages.testing.task.status.paused' },
      completed: { color: 'success', text: 'pages.testing.task.status.completed' },
      failed: { color: 'error', text: 'pages.testing.task.status.failed' },
    };
    const config = statusMap[status || 'pending'] || statusMap.pending;
    return (
      <Tag color={config.color}>
        <FormattedMessage
          id={config.text}
          defaultMessage={config.text.replace('pages.testing.task.status.', '')}
        />
      </Tag>
    );
  };

  const getDeviceStatusIcon = (status?: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge
            status="processing"
            text={
              <FormattedMessage id="pages.testing.task.device.running" defaultMessage="运行中" />
            }
          />
        );
      case 'paused':
        return (
          <Badge
            status="warning"
            text={
              <FormattedMessage id="pages.testing.task.device.paused" defaultMessage="已暂停" />
            }
          />
        );
      case 'completed':
        return (
          <Badge
            status="success"
            text={
              <FormattedMessage id="pages.testing.task.device.completed" defaultMessage="已完成" />
            }
          />
        );
      case 'failed':
        return (
          <Badge
            status="error"
            text={<FormattedMessage id="pages.testing.task.device.failed" defaultMessage="失败" />}
          />
        );
      default:
        return (
          <Badge
            status="default"
            text={<FormattedMessage id="pages.testing.task.device.idle" defaultMessage="空闲" />}
          />
        );
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const completedCases =
    (data?.passedCases || 0) +
    (data?.failedCases || 0) +
    (data?.blockedCases || 0) +
    (data?.skippedCases || 0);
  const progressPercent = data?.totalCases
    ? Math.round((completedCases / data.totalCases) * 100)
    : 0;

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.testing.task.monitor.title',
          defaultMessage: 'Task Monitor',
        }),
        breadcrumb: {
          items: [
            {
              path: '/testing',
              breadcrumbName: intl.formatMessage({ id: 'menu.testing', defaultMessage: 'Testing' }),
            },
            {
              path: '/testing/task',
              breadcrumbName: intl.formatMessage({
                id: 'menu.testing.task',
                defaultMessage: 'Task',
              }),
            },
            {
              path: '/testing/task/monitor',
              breadcrumbName: intl.formatMessage({
                id: 'pages.testing.task.monitor.title',
                defaultMessage: 'Monitor',
              }),
            },
          ],
        },
      }}
    >
      <ProLayout>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ProCard loading={loading}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space size="middle">
                      <span style={{ fontSize: 18, fontWeight: 600 }}>
                        {data?.taskName ||
                          intl.formatMessage({
                            id: 'pages.testing.task.monitor.loading',
                            defaultMessage: 'Loading...',
                          })}
                      </span>
                      {getStatusBadge(data?.status)}
                      <Badge
                        status={connected ? 'success' : 'default'}
                        text={
                          connected
                            ? intl.formatMessage({
                                id: 'pages.testing.task.connected',
                                defaultMessage: 'Connected',
                              })
                            : intl.formatMessage({
                                id: 'pages.testing.task.disconnected',
                                defaultMessage: 'Disconnected',
                              })
                        }
                      />
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      {data?.status === 'running' && (
                        <Button icon={<PauseCircleOutlined />} onClick={pauseTask}>
                          <FormattedMessage
                            id="pages.testing.task.action.pause"
                            defaultMessage="Pause"
                          />
                        </Button>
                      )}
                      {data?.status === 'paused' && (
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={resumeTask}>
                          <FormattedMessage
                            id="pages.testing.task.action.continue"
                            defaultMessage="Continue"
                          />
                        </Button>
                      )}
                      {(data?.status === 'running' || data?.status === 'paused') && (
                        <Button danger icon={<StopOutlined />} onClick={stopTask}>
                          <FormattedMessage
                            id="pages.testing.task.action.stop"
                            defaultMessage="Stop"
                          />
                        </Button>
                      )}
                      {(data?.status === 'completed' || data?.status === 'failed') && (
                        <Button icon={<ReloadOutlined />} onClick={retryTask}>
                          <FormattedMessage
                            id="pages.testing.task.action.retry"
                            defaultMessage="Retry"
                          />
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={16}>
                    <ProCard
                      title={intl.formatMessage({
                        id: 'pages.testing.task.progress.title',
                        defaultMessage: 'Overall Progress',
                      })}
                    >
                      <Row gutter={16} align="middle">
                        <Col flex="auto">
                          <Progress
                            percent={progressPercent}
                            status={
                              data?.status === 'failed'
                                ? 'exception'
                                : data?.status === 'completed'
                                  ? 'success'
                                  : 'active'
                            }
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                          />
                        </Col>
                        <Col>
                          <Space size="large">
                            <Statistic
                              title={
                                <FormattedMessage
                                  id="pages.testing.task.elapsed"
                                  defaultMessage="Elapsed"
                                />
                              }
                              value={formatDuration(data?.elapsedSeconds || 0)}
                              prefix={<ClockCircleOutlined />}
                            />
                            {data?.etaSeconds && (
                              <Statistic
                                title={
                                  <FormattedMessage
                                    id="pages.testing.task.eta"
                                    defaultMessage="ETA"
                                  />
                                }
                                value={formatDuration(data.etaSeconds)}
                                prefix={<SyncOutlined />}
                              />
                            )}
                          </Space>
                        </Col>
                      </Row>
                    </ProCard>
                  </Col>
                  <Col xs={24} md={8}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title={
                            <FormattedMessage
                              id="pages.testing.task.stat.passed"
                              defaultMessage="Passed"
                            />
                          }
                          value={data?.passedCases || 0}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={
                            <FormattedMessage
                              id="pages.testing.task.stat.failed"
                              defaultMessage="Failed"
                            />
                          }
                          value={data?.failedCases || 0}
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={
                            <FormattedMessage
                              id="pages.testing.task.stat.blocked"
                              defaultMessage="Blocked"
                            />
                          }
                          value={data?.blockedCases || 0}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={
                            <FormattedMessage
                              id="pages.testing.task.stat.skipped"
                              defaultMessage="Skipped"
                            />
                          }
                          value={data?.skippedCases || 0}
                          valueStyle={{ color: '#8c8c8c' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Space>
            </ProCard>
          </Col>

          <Col span={24}>
            <ProCard
              title={intl.formatMessage({
                id: 'pages.testing.task.devices.title',
                defaultMessage: 'Device Status',
              })}
            >
              <Row gutter={[16, 16]}>
                {data?.devices.map((device) => (
                  <Col key={device.id} xs={24} sm={12} lg={8}>
                    <ProCard hoverable style={{ height: '100%' }} bodyStyle={{ padding: 12 }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Space>
                              <DesktopOutlined />
                              <span style={{ fontWeight: 500 }}>{device.name}</span>
                            </Space>
                          </Col>
                          <Col>{getDeviceStatusIcon(device.status)}</Col>
                        </Row>
                        {device.currentCase && (
                          <div>
                            <FileTextOutlined style={{ marginRight: 8 }} />
                            <span style={{ color: '#666' }}>{device.currentCase}</span>
                          </div>
                        )}
                        <Progress percent={device.progress} size="small" />
                        {device.status === 'running' || device.status === 'paused' ? (
                          <Row gutter={16}>
                            <Col span={12}>
                              <small>
                                <FormattedMessage
                                  id="pages.testing.task.device.cpu"
                                  defaultMessage="CPU"
                                />
                                : {device.cpuUsage.toFixed(1)}%
                              </small>
                            </Col>
                            <Col span={12}>
                              <small>
                                <FormattedMessage
                                  id="pages.testing.task.device.memory"
                                  defaultMessage="Memory"
                                />
                                : {device.memoryUsage.toFixed(1)}%
                              </small>
                            </Col>
                          </Row>
                        ) : null}
                        <Row justify="end">
                          <Space size="small">
                            <Button size="small" type="text">
                              <FormattedMessage
                                id="pages.testing.task.device.action.screen"
                                defaultMessage="Screen"
                              />
                            </Button>
                            <Button size="small" type="text">
                              <FormattedMessage
                                id="pages.testing.task.device.action.logs"
                                defaultMessage="Logs"
                              />
                            </Button>
                            {device.status === 'running' && (
                              <Button size="small" type="text">
                                <FormattedMessage
                                  id="pages.testing.task.device.action.pause"
                                  defaultMessage="Pause"
                                />
                              </Button>
                            )}
                          </Space>
                        </Row>
                      </Space>
                    </ProCard>
                  </Col>
                ))}
              </Row>
            </ProCard>
          </Col>

          <Col span={24}>
            <ProCard
              title={intl.formatMessage({
                id: 'pages.testing.task.logs.title',
                defaultMessage: 'Real-time Logs',
              })}
            >
              <Tabs
                defaultActiveKey="ALL"
                items={[
                  {
                    key: 'ALL',
                    label: intl.formatMessage({
                      id: 'pages.testing.task.logs.filter.all',
                      defaultMessage: 'All',
                    }),
                  },
                  {
                    key: 'INFO',
                    label: intl.formatMessage({
                      id: 'pages.testing.task.logs.filter.info',
                      defaultMessage: 'INFO',
                    }),
                  },
                  {
                    key: 'WARN',
                    label: intl.formatMessage({
                      id: 'pages.testing.task.logs.filter.warn',
                      defaultMessage: 'WARN',
                    }),
                  },
                  {
                    key: 'ERROR',
                    label: intl.formatMessage({
                      id: 'pages.testing.task.logs.filter.error',
                      defaultMessage: 'ERROR',
                    }),
                  },
                ]}
                onChange={(key) => setLogFilter(key as 'ALL' | 'INFO' | 'WARN' | 'ERROR')}
              />
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Input.Search
                    placeholder={intl.formatMessage({
                      id: 'pages.testing.task.logs.search',
                      defaultMessage: 'Search logs...',
                    })}
                    style={{ width: 300 }}
                    allowClear
                  />
                </Col>
                <Col>
                  <Space>
                    <span>
                      <FormattedMessage
                        id="pages.testing.task.logs.autoScroll"
                        defaultMessage="Auto-scroll"
                      />
                    </span>
                    <Switch checked={autoScroll} onChange={setAutoScroll} size="small" />
                  </Space>
                </Col>
              </Row>
              <div
                ref={logContainerRef}
                style={{
                  height: 300,
                  overflow: 'auto',
                  background: '#1e1e1e',
                  padding: 12,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {filteredLogs.map((log) => (
                  <div key={log.id} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#666' }}>{log.timestamp}</span>
                    <span
                      style={{
                        marginLeft: 8,
                        color:
                          log.level === 'INFO'
                            ? '#4fc3f7'
                            : log.level === 'WARN'
                              ? '#ffb74d'
                              : '#ef5350',
                      }}
                    >
                      [{log.level}]
                    </span>
                    <span style={{ marginLeft: 8, color: '#e0e0e0' }}>{log.message}</span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div style={{ color: '#666', textAlign: 'center', paddingTop: 100 }}>
                    <FormattedMessage
                      id="pages.testing.task.logs.empty"
                      defaultMessage="No logs available"
                    />
                  </div>
                )}
              </div>
            </ProCard>
          </Col>
        </Row>
      </ProLayout>
    </PageContainer>
  );
};

export default TaskMonitor;
