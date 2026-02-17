import { Descriptions, Drawer, Progress, Space, Tag } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';

interface DetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  record: API.TestRecord | null;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ visible, onClose, record }) => {
  const intl = useIntl();

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

  const passRateStatus = (): 'success' | 'exception' | 'normal' => {
    const rate = record?.passRate ?? 0;
    if (rate < 60) return 'exception';
    if (rate < 80) return 'normal';
    return 'success';
  };

  const getLabel = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  return (
    <Drawer
      title={getLabel('pages.testing.testrecord.detail.title', '测试记录详情')}
      width={720}
      onClose={onClose}
      open={visible}
      extra={
        record?.reportUrl ? (
          <a href={record.reportUrl} target="_blank" rel="noopener noreferrer">
            <FormattedMessage id="pages.testing.testrecord.viewReport" defaultMessage="查看报告" />
          </a>
        ) : undefined
      }
    >
      {record && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.id', '记录ID')}>
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.projectId', '项目ID')}>
            {record.projectId}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.planId', '计划ID')}>
            {record.planId ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={getLabel('pages.testing.testrecord.key.executorId', '执行人ID')}
          >
            {record.executorId ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.startTime', '开始时间')}>
            {record.startTime ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.endTime', '结束时间')}>
            {record.endTime ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.duration', '耗时')}>
            {formatDuration(record.duration)}
          </Descriptions.Item>
          <Descriptions.Item
            label={getLabel('pages.testing.testrecord.key.execStatus', '执行状态')}
          >
            {getStatusTag(record.execStatus)}
          </Descriptions.Item>
          <Descriptions.Item
            label={getLabel('pages.testing.testrecord.key.totalCases', '总用例数')}
          >
            {record.totalCases ?? 0}
          </Descriptions.Item>
          <Descriptions.Item
            label={getLabel('pages.testing.testrecord.key.casesDetail', '用例详情')}
          >
            <Space size="large">
              <span style={{ color: '#52c41a' }}>
                <FormattedMessage
                  id="pages.testing.testrecord.key.passedCases"
                  defaultMessage="通过"
                />
                : {record.passedCases ?? 0}
              </span>
              <span
                style={{
                  color: record.failedCases && record.failedCases > 0 ? '#ff4d4f' : undefined,
                }}
              >
                <FormattedMessage
                  id="pages.testing.testrecord.key.failedCases"
                  defaultMessage="失败"
                />
                : {record.failedCases ?? 0}
              </span>
              <span>
                <FormattedMessage
                  id="pages.testing.testrecord.key.blockedCases"
                  defaultMessage="阻塞"
                />
                : {record.blockedCases ?? 0}
              </span>
              <span>
                <FormattedMessage
                  id="pages.testing.testrecord.key.skippedCases"
                  defaultMessage="跳过"
                />
                : {record.skippedCases ?? 0}
              </span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.passRate', '通过率')}>
            <Progress
              percent={record.passRate ?? 0}
              status={passRateStatus()}
              format={(p) => `${p?.toFixed(1)}%`}
            />
          </Descriptions.Item>
          <Descriptions.Item
            label={getLabel('pages.testing.testrecord.key.reportFormat', '报告格式')}
          >
            {record.reportFormat ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.testing.testrecord.key.reportUrl', '报告地址')}>
            {record.reportUrl ? (
              <a href={record.reportUrl} target="_blank" rel="noopener noreferrer">
                {record.reportUrl}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.common.key.createdAt', '创建时间')}>
            {record.createdAt ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={getLabel('pages.common.key.updatedAt', '更新时间')}>
            {record.updatedAt ?? '-'}
          </Descriptions.Item>
          {record.execContext ? (
            <Descriptions.Item
              label={getLabel('pages.testing.testrecord.key.execContext', '执行上下文')}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '12px',
                }}
              >
                {record.execContext}
              </pre>
            </Descriptions.Item>
          ) : null}
        </Descriptions>
      )}
    </Drawer>
  );
};

export default DetailDrawer;
