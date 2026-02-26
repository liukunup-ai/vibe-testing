import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Col, Progress, Row, Space, Statistic, Tag, message } from 'antd';
import { useIntl, useParams, useRequest, FormattedMessage } from '@umijs/max';
import { useMemo } from 'react';
import { getTestRecord } from '@/services/backend/testRecord';
import { getProject } from '@/services/backend/project';

interface FailedCaseRecord {
  key: string;
  caseId: string;
  failureReason: string;
  failureCount: number;
  affectedDevices: string[];
  status: string;
}

interface DeviceSummaryRecord {
  key: string;
  deviceName: string;
  caseCount: number;
  passed: number;
  failed: number;
  passRate: number;
  duration: string;
}

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();

  const { data: recordData, loading: recordLoading } = useRequest(
    () => getTestRecord({ id: Number(id) }),
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  const { data: projectData } = useRequest(
    () => getProject({ id: recordData?.data?.projectId || 0 }),
    {
      ready: !!recordData?.data?.projectId,
      refreshDeps: [recordData?.data?.projectId],
    },
  );

  const record = recordData?.data;

  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return '-';
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

  const getStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: { color: 'gold', text: 'pages.testing.testrecord.status.pending' },
      1: { color: 'processing', text: 'pages.testing.testrecord.status.running' },
      2: { color: 'green', text: 'pages.testing.testrecord.status.completed' },
      3: { color: 'red', text: 'pages.testing.testrecord.status.failed' },
      4: { color: 'default', text: 'pages.testing.testrecord.status.cancelled' },
    };
    const config = statusMap[status || 0] || statusMap[0];
    return (
      <Tag color={config.color}>
        <FormattedMessage id={config.text} defaultMessage="待处理" />
      </Tag>
    );
  };

  const totalCases = record?.totalCases || 0;
  const passedCases = record?.passedCases || 0;
  const failedCases = record?.failedCases || 0;
  const blockedCases = record?.blockedCases || 0;
  const skippedCases = record?.skippedCases || 0;

  const passedPercent = totalCases > 0 ? ((passedCases / totalCases) * 100).toFixed(1) : '0.0';
  const failedPercent = totalCases > 0 ? ((failedCases / totalCases) * 100).toFixed(1) : '0.0';
  const blockedPercent = totalCases > 0 ? ((blockedCases / totalCases) * 100).toFixed(1) : '0.0';
  const skippedPercent = totalCases > 0 ? ((skippedCases / totalCases) * 100).toFixed(1) : '0.0';

  const mockFailedCases: FailedCaseRecord[] = useMemo(() => {
    if (failedCases > 0) {
      return [
        {
          key: '1',
          caseId: 'TC001',
          failureReason: 'Element not found',
          failureCount: 3,
          affectedDevices: ['Android-12', 'iOS-16'],
          status: 'Open',
        },
        {
          key: '2',
          caseId: 'TC015',
          failureReason: 'Assertion failed',
          failureCount: 1,
          affectedDevices: ['Android-11'],
          status: 'Open',
        },
        {
          key: '3',
          caseId: 'TC023',
          failureReason: 'Timeout',
          failureCount: 2,
          affectedDevices: ['Android-12', 'Android-13'],
          status: 'In Progress',
        },
      ];
    }
    return [];
  }, [failedCases]);

  const mockDeviceSummary: DeviceSummaryRecord[] = useMemo(() => {
    return [
      {
        key: '1',
        deviceName: 'Android-12 (Pixel 5)',
        caseCount: 50,
        passed: 45,
        failed: 3,
        passRate: 90.0,
        duration: '25m 30s',
      },
      {
        key: '2',
        deviceName: 'Android-13 (Galaxy S21)',
        caseCount: 50,
        passed: 47,
        failed: 1,
        passRate: 94.0,
        duration: '24m 15s',
      },
      {
        key: '3',
        deviceName: 'iOS-16 (iPhone 14)',
        caseCount: 50,
        passed: 48,
        failed: 0,
        passRate: 96.0,
        duration: '26m 45s',
      },
      {
        key: '4',
        deviceName: 'iOS-15 (iPhone 13)',
        caseCount: 50,
        passed: 44,
        failed: 4,
        passRate: 88.0,
        duration: '27m 10s',
      },
    ];
  }, []);

  const failedCaseColumns: ProColumns<FailedCaseRecord>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.failedCase.caseId',
        defaultMessage: '用例ID',
      }),
      dataIndex: 'caseId',
      width: 120,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.failedCase.failureReason',
        defaultMessage: '失败原因',
      }),
      dataIndex: 'failureReason',
      width: 200,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.failedCase.failureCount',
        defaultMessage: '失败次数',
      }),
      dataIndex: 'failureCount',
      width: 100,
      render: (val) => (
        <span style={{ color: val && Number(val) > 1 ? '#ff4d4f' : undefined }}>{val}</span>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.failedCase.affectedDevices',
        defaultMessage: '受影响设备',
      }),
      dataIndex: 'affectedDevices',
      width: 200,
      render: (val) => (
        <Space wrap>
          {(val as string[])?.map((device, idx) => (
            <Tag key={idx}>{device}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.failedCase.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      width: 120,
      render: (val) => {
        const statusColor = val === 'Open' ? 'red' : val === 'In Progress' ? 'orange' : 'green';
        return <Tag color={statusColor}>{val}</Tag>;
      },
    },
  ];

  const deviceSummaryColumns: ProColumns<DeviceSummaryRecord>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.deviceName',
        defaultMessage: '设备名称',
      }),
      dataIndex: 'deviceName',
      width: 200,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.caseCount',
        defaultMessage: '用例数',
      }),
      dataIndex: 'caseCount',
      width: 100,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.passed',
        defaultMessage: '通过',
      }),
      dataIndex: 'passed',
      width: 100,
      render: (val) => <span style={{ color: '#52c41a' }}>{val}</span>,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.failed',
        defaultMessage: '失败',
      }),
      dataIndex: 'failed',
      width: 100,
      render: (val) => (
        <span style={{ color: val && Number(val) > 0 ? '#ff4d4f' : undefined }}>{val}</span>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.passRate',
        defaultMessage: '通过率',
      }),
      dataIndex: 'passRate',
      width: 150,
      render: (val) => {
        const rate = Number(val);
        let status: 'success' | 'exception' | 'normal' = 'success';
        if (rate < 60) status = 'exception';
        else if (rate < 80) status = 'normal';
        return (
          <Progress
            percent={rate}
            size="small"
            status={status}
            format={(p) => `${p?.toFixed(1)}%`}
          />
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.detail.deviceSummary.duration',
        defaultMessage: '耗时',
      }),
      dataIndex: 'duration',
      width: 120,
    },
  ];

  const handleExportPdf = () => {
    message.info(
      intl.formatMessage({
        id: 'pages.testing.report.export.pdf',
        defaultMessage: '导出PDF功能开发中',
      }),
    );
  };

  const handleExportExcel = () => {
    message.info(
      intl.formatMessage({
        id: 'pages.testing.report.export.excel',
        defaultMessage: '导出Excel功能开发中',
      }),
    );
  };

  return (
    <PageContainer
      header={{
        title: `${intl.formatMessage({ id: 'pages.testing.report.detail.title', defaultMessage: '测试报告' })} #${id}`,
        breadcrumb: {},
        extra: [
          <Space key="export">
            <a onClick={handleExportPdf}>
              <FilePdfOutlined />
              <FormattedMessage
                id="pages.testing.report.action.exportPdf"
                defaultMessage="导出PDF"
              />
            </a>
            ,
            <a onClick={handleExportExcel}>
              <FileExcelOutlined />
              <FormattedMessage
                id="pages.testing.report.action.exportExcel"
                defaultMessage="导出Excel"
              />
            </a>
            ,
          </Space>,
        ],
      }}
      loading={recordLoading}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ProCard>
            <Row gutter={16} align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <span style={{ color: '#999' }}>
                    <FormattedMessage
                      id="pages.testing.report.detail.project"
                      defaultMessage="项目"
                    />
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    {projectData?.data?.name || record?.projectId || '-'}
                  </span>
                </Space>
              </Col>
              <Col style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 16 }}>
                <Space direction="vertical" size={0}>
                  <span style={{ color: '#999' }}>
                    <FormattedMessage
                      id="pages.testing.report.detail.executionTime"
                      defaultMessage="执行时间"
                    />
                  </span>
                  <span style={{ fontSize: 14 }}>
                    {record?.startTime ? `${record.startTime} ~ ${record.endTime || '-'}` : '-'}
                  </span>
                </Space>
              </Col>
              <Col style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 16 }}>
                <Space direction="vertical" size={0}>
                  <span style={{ color: '#999' }}>
                    <FormattedMessage
                      id="pages.testing.report.detail.status"
                      defaultMessage="状态"
                    />
                  </span>
                  {getStatusTag(record?.execStatus)}
                </Space>
              </Col>
              <Col style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 16 }}>
                <Space direction="vertical" size={0}>
                  <span style={{ color: '#999' }}>
                    <FormattedMessage
                      id="pages.testing.report.detail.duration"
                      defaultMessage="耗时"
                    />
                  </span>
                  <span style={{ fontSize: 14 }}>{formatDuration(record?.duration)}</span>
                </Space>
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.totalCases',
                defaultMessage: '总用例',
              })}
              value={totalCases}
              valueStyle={{ color: '#1890ff' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.passedCases',
                defaultMessage: '通过',
              })}
              value={passedCases}
              suffix={`(${passedPercent}%)`}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.failedCases',
                defaultMessage: '失败',
              })}
              value={failedCases}
              suffix={`(${failedPercent}%)`}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.blockedCases',
                defaultMessage: '阻塞',
              })}
              value={blockedCases}
              suffix={`(${blockedPercent}%)`}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.skippedCases',
                defaultMessage: '跳过',
              })}
              value={skippedCases}
              suffix={`(${skippedPercent}%)`}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={18} lg={10}>
          <ProCard>
            <Statistic
              title={intl.formatMessage({
                id: 'pages.testing.report.detail.summary.passRate',
                defaultMessage: '总通过率',
              })}
              value={record?.passRate || 0}
              precision={1}
              suffix="%"
              valueStyle={{
                color:
                  (record?.passRate || 0) >= 80
                    ? '#52c41a'
                    : (record?.passRate || 0) >= 60
                      ? '#faad14'
                      : '#ff4d4f',
              }}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.report.detail.passRateTrend',
              defaultMessage: '通过率趋势',
            })}
          >
            <div
              style={{
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                borderRadius: 4,
              }}
            >
              <span style={{ color: '#999' }}>
                <FormattedMessage
                  id="pages.testing.report.detail.chart.placeholder"
                  defaultMessage="图表占位符 - 待集成图表库"
                />
              </span>
            </div>
          </ProCard>
        </Col>
        <Col span={12}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.report.detail.caseStatusDistribution',
              defaultMessage: '用例状态分布',
            })}
          >
            <div
              style={{
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                borderRadius: 4,
              }}
            >
              <span style={{ color: '#999' }}>
                <FormattedMessage
                  id="pages.testing.report.detail.chart.placeholder"
                  defaultMessage="图表占位符 - 待集成图表库"
                />
              </span>
            </div>
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.report.detail.failedCasesAnalysis',
              defaultMessage: '失败用例分析',
            })}
          >
            <ProTable<FailedCaseRecord>
              columns={failedCaseColumns}
              dataSource={mockFailedCases}
              rowKey="key"
              pagination={false}
              search={false}
              toolBarRender={false}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.report.detail.deviceExecutionSummary',
              defaultMessage: '设备执行摘要',
            })}
          >
            <ProTable<DeviceSummaryRecord>
              columns={deviceSummaryColumns}
              dataSource={mockDeviceSummary}
              rowKey="key"
              pagination={false}
              search={false}
              toolBarRender={false}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard
            title={intl.formatMessage({
              id: 'pages.testing.report.detail.performanceData',
              defaultMessage: '性能数据',
            })}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <ProCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.report.detail.performance.avgStartupTime',
                      defaultMessage: '平均启动时间',
                    })}
                    value={2.5}
                    suffix="s"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </ProCard>
              </Col>
              <Col xs={24} sm={8}>
                <ProCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.report.detail.performance.memoryUsage',
                      defaultMessage: '内存使用',
                    })}
                    value={156}
                    suffix="MB"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </ProCard>
              </Col>
              <Col xs={24} sm={8}>
                <ProCard>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.report.detail.performance.cpuUsage',
                      defaultMessage: 'CPU使用',
                    })}
                    value={23}
                    suffix="%"
                    valueStyle={{ color: '#faad14' }}
                  />
                </ProCard>
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ReportDetail;
