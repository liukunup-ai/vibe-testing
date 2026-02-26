import { useParams, useRequest, history } from '@umijs/max';
import { useIntl } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { Row, Col, Descriptions, Tag, Progress, Button, Space, Statistic } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CameraOutlined,
  AppstoreOutlined,
  ToolOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import React from 'react';
import { getDevice } from '@/services/backend/device';
import { listTestRecords } from '@/services/backend/testRecord';

const DeviceDetail: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const deviceId = parseInt(id || '0', 10);

  const { data: deviceResponse, loading: deviceLoading } = useRequest(
    () => getDevice({ id: deviceId }),
    { ready: !!deviceId },
  );

  const { data: recordResponse } = useRequest(() => listTestRecords({ page: 1, pageSize: 10 }), {
    ready: !!deviceId,
  });

  const device = deviceResponse?.data;
  const testRecords = recordResponse?.data?.list || [];

  const getStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: {
        color: 'default',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.offline',
          defaultMessage: '离线',
        }),
      },
      1: {
        color: 'green',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.idle',
          defaultMessage: '空闲',
        }),
      },
      2: {
        color: 'blue',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.busy',
          defaultMessage: '使用中',
        }),
      },
      3: {
        color: 'orange',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.maintenance',
          defaultMessage: '维护中',
        }),
      },
    };
    const config = statusMap[status || 0];
    return config ? (
      <Tag color={config.color}>{config.text}</Tag>
    ) : (
      <Tag>
        {intl.formatMessage({ id: 'pages.testing.device.status.unknown', defaultMessage: '未知' })}
      </Tag>
    );
  };

  const getDeviceTypeTag = (deviceType?: string) => {
    const typeMap: Record<string, string> = {
      android: 'Android',
      ios: 'iOS',
      browser: 'Browser',
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
    };
    return deviceType ? typeMap[deviceType.toLowerCase()] || deviceType : '-';
  };

  const getPlatformTag = (platform?: string) => {
    const platformMap: Record<string, string> = {
      android: 'Android',
      ios: 'iOS',
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
    };
    return platform ? platformMap[platform.toLowerCase()] || platform : '-';
  };

  const basicInfoItems = [
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.deviceNo',
        defaultMessage: '设备编号',
      }),
      children: device?.deviceNo || '-',
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.name',
        defaultMessage: '设备名称',
      }),
      children: device?.name || '-',
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.deviceType',
        defaultMessage: '设备类型',
      }),
      children: getDeviceTypeTag(device?.deviceType),
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.platform',
        defaultMessage: '平台',
      }),
      children: getPlatformTag(device?.platform),
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.deviceModel',
        defaultMessage: '型号',
      }),
      children: device?.deviceModel || '-',
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.osVersion',
        defaultMessage: '系统版本',
      }),
      children: device?.osVersion || '-',
    },
  ];

  const connectionItems = [
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.ipAddress',
        defaultMessage: 'IP地址',
      }),
      children: device?.ipAddress || '-',
    },
    {
      label: intl.formatMessage({ id: 'pages.testing.device.key.port', defaultMessage: '端口' }),
      children: device?.port || '-',
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.connectMode',
        defaultMessage: '连接模式',
      }),
      children: device?.connectMode || '-',
    },
    {
      label: intl.formatMessage({ id: 'pages.testing.device.key.udid', defaultMessage: 'UDID' }),
      children: device?.udid || '-',
    },
  ];

  const screenItems = [
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.screenSize',
        defaultMessage: '屏幕尺寸',
      }),
      children: device?.screenSize || '-',
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.screenDpi',
        defaultMessage: 'DPI',
      }),
      children: device?.screenDpi || '-',
    },
  ];

  const statusItems = [
    {
      label: intl.formatMessage({ id: 'pages.testing.device.key.battery', defaultMessage: '电量' }),
      children:
        device?.battery !== undefined && device?.battery !== null ? (
          <Progress
            percent={device.battery}
            size="small"
            status={device.battery < 20 ? 'exception' : 'normal'}
          />
        ) : (
          '-'
        ),
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.isCharging',
        defaultMessage: '充电状态',
      }),
      children: device?.isCharging ? (
        <Tag color="green">
          {intl.formatMessage({ id: 'pages.testing.device.charging', defaultMessage: '充电中' })}
        </Tag>
      ) : (
        <Tag>
          {intl.formatMessage({ id: 'pages.testing.device.notCharging', defaultMessage: '未充电' })}
        </Tag>
      ),
    },
    {
      label: intl.formatMessage({
        id: 'pages.testing.device.key.lastHeartbeat',
        defaultMessage: '最后心跳',
      }),
      children: device?.lastHeartbeat || '-',
    },
  ];

  const cpuPercent = device?.cpuUsage ?? 0;
  const memoryPercent = device?.memoryUsage ?? 0;
  const memoryUsed =
    device?.memoryUsage && device?.memoryTotal
      ? (((device.memoryUsage / 100) * device.memoryTotal) / 1024 / 1024 / 1024).toFixed(1)
      : 0;
  const memoryTotal = device?.memoryTotal
    ? (device.memoryTotal / 1024 / 1024 / 1024).toFixed(1)
    : 0;
  const storageFreeGB = device?.storageFree
    ? (device.storageFree / 1024 / 1024 / 1024).toFixed(1)
    : 0;

  const recordColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testrecord.key.execStatus',
        defaultMessage: '状态',
      }),
      dataIndex: 'execStatus',
      width: 100,
      render: (v: number) => {
        const colors = ['gold', 'processing', 'success', 'error', 'default'];
        const labels = [
          intl.formatMessage({
            id: 'pages.testing.testrecord.status.pending',
            defaultMessage: '待处理',
          }),
          intl.formatMessage({
            id: 'pages.testing.testrecord.status.running',
            defaultMessage: '运行中',
          }),
          intl.formatMessage({
            id: 'pages.testing.testrecord.status.completed',
            defaultMessage: '已完成',
          }),
          intl.formatMessage({
            id: 'pages.testing.testrecord.status.failed',
            defaultMessage: '失败',
          }),
          intl.formatMessage({
            id: 'pages.testing.testrecord.status.cancelled',
            defaultMessage: '已取消',
          }),
        ];
        return <Tag color={colors[v] || 'default'}>{labels[v] || '待处理'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testrecord.key.totalCases',
        defaultMessage: '用例数',
      }),
      dataIndex: 'totalCases',
      width: 80,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testrecord.key.passRate',
        defaultMessage: '通过率',
      }),
      dataIndex: 'passRate',
      width: 120,
      render: (v: number) => <Progress percent={v || 0} size="small" />,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testrecord.key.startTime',
        defaultMessage: '开始时间',
      }),
      dataIndex: 'startTime',
      width: 160,
    },
  ];

  return (
    <PageContainer
      header={{
        title:
          device?.name ||
          intl.formatMessage({
            id: 'pages.testing.device.detail.title',
            defaultMessage: '设备详情',
          }),
        breadcrumb: {},
        extra: [
          <Button
            key="use"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              history.push(`/testing/device/use/${deviceId}`);
            }}
          >
            {intl.formatMessage({ id: 'pages.testing.device.action.use', defaultMessage: '使用' })}
          </Button>,
          <Button
            key="control"
            icon={<DesktopOutlined />}
            onClick={() => {
              history.push(`/testing/device/control/${deviceId}`);
            }}
          >
            {intl.formatMessage({
              id: 'pages.testing.device.action.control',
              defaultMessage: '控制',
            })}
          </Button>,
          <Button
            key="maintenance"
            icon={<ToolOutlined />}
            onClick={() => {
              history.push(`/testing/device/maintenance/${deviceId}`);
            }}
          >
            {intl.formatMessage({
              id: 'pages.testing.device.action.maintenance',
              defaultMessage: '维护',
            })}
          </Button>,
        ],
      }}
      loading={deviceLoading}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space style={{ marginBottom: 16 }}>{getStatusTag(device?.status)}</Space>
        </Col>

        <Col span={24}>
          <ProCard gutter={16} ghost>
            <ProCard
              colSpan={6}
              title={intl.formatMessage({
                id: 'pages.testing.device.detail.basicInfo',
                defaultMessage: '基本信息',
              })}
            >
              <Descriptions column={1} bordered size="small">
                {basicInfoItems.map((item, index) => (
                  <Descriptions.Item key={index} label={item.label}>
                    {item.children}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </ProCard>
            <ProCard
              colSpan={6}
              title={intl.formatMessage({
                id: 'pages.testing.device.detail.connection',
                defaultMessage: '连接信息',
              })}
            >
              <Descriptions column={1} bordered size="small">
                {connectionItems.map((item, index) => (
                  <Descriptions.Item key={index} label={item.label}>
                    {item.children}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </ProCard>
            <ProCard
              colSpan={6}
              title={intl.formatMessage({
                id: 'pages.testing.device.detail.screen',
                defaultMessage: '屏幕信息',
              })}
            >
              <Descriptions column={1} bordered size="small">
                {screenItems.map((item, index) => (
                  <Descriptions.Item key={index} label={item.label}>
                    {item.children}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </ProCard>
            <ProCard
              colSpan={6}
              title={intl.formatMessage({
                id: 'pages.testing.device.detail.status',
                defaultMessage: '状态信息',
              })}
            >
              <Descriptions column={1} bordered size="small">
                {statusItems.map((item, index) => (
                  <Descriptions.Item key={index} label={item.label}>
                    {item.children}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </ProCard>
          </ProCard>
        </Col>

        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.device.detail.performance',
              defaultMessage: '性能监控',
            })}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'pages.testing.device.detail.cpuUsage',
                    defaultMessage: 'CPU 使用率',
                  })}
                  suffix="%"
                  value={cpuPercent}
                />
                <Progress percent={cpuPercent} status={cpuPercent > 80 ? 'exception' : 'normal'} />
              </Col>
              <Col span={8}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'pages.testing.device.detail.memoryUsage',
                    defaultMessage: '内存使用',
                  })}
                  suffix={`/ ${memoryTotal} GB`}
                  value={memoryUsed}
                />
                <Progress
                  percent={memoryPercent}
                  status={memoryPercent > 80 ? 'exception' : 'normal'}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'pages.testing.device.detail.storageFree',
                    defaultMessage: '可用存储',
                  })}
                  suffix="GB"
                  value={parseFloat(storageFreeGB)}
                />
                <Progress
                  percent={
                    storageFreeGB ? Math.min(100, (parseFloat(storageFreeGB) / 128) * 100) : 0
                  }
                  status={parseFloat(storageFreeGB) < 10 ? 'exception' : 'normal'}
                />
              </Col>
            </Row>
          </ProCard>
        </Col>

        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.device.detail.controlPanel',
              defaultMessage: '控制面板',
            })}
          >
            <Space wrap>
              <Button icon={<PlayCircleOutlined />}>
                {intl.formatMessage({
                  id: 'pages.testing.device.control.start',
                  defaultMessage: '启动',
                })}
              </Button>
              <Button icon={<PauseCircleOutlined />}>
                {intl.formatMessage({
                  id: 'pages.testing.device.control.stop',
                  defaultMessage: '停止',
                })}
              </Button>
              <Button icon={<ReloadOutlined />}>
                {intl.formatMessage({
                  id: 'pages.testing.device.control.restart',
                  defaultMessage: '重启',
                })}
              </Button>
              <Button icon={<CameraOutlined />}>
                {intl.formatMessage({
                  id: 'pages.testing.device.control.screenshot',
                  defaultMessage: '截图',
                })}
              </Button>
              <Button icon={<AppstoreOutlined />}>
                {intl.formatMessage({
                  id: 'pages.testing.device.control.installApp',
                  defaultMessage: '安装应用',
                })}
              </Button>
            </Space>
          </ProCard>
        </Col>

        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.device.detail.executionHistory',
              defaultMessage: '执行历史',
            })}
          >
            <ProTable
              columns={recordColumns}
              dataSource={testRecords}
              rowKey="id"
              pagination={false}
              search={false}
              toolBarRender={false}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DeviceDetail;
