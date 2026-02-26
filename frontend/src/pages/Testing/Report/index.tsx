import { DeleteOutlined, EyeOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Modal, Progress, Space, Tag, message } from 'antd';
import { FormattedMessage, useIntl, useNavigate } from '@umijs/max';
import { useRef, useState } from 'react';
import { deleteTestRecord, listTestRecords } from '@/services/backend/testRecord';
import { listProjects } from '@/services/backend/project';

const Report: React.FC = () => {
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: number }[]>([]);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();
  const navigate = useNavigate();

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

  const loadProjects = async () => {
    try {
      const result = await listProjects({ page: 1, pageSize: 1000 });
      if (result.success && result.data?.list) {
        const options = result.data.list.map((p) => ({
          label: p.name || `Project ${p.id}`,
          value: p.id || 0,
        }));
        setProjectOptions(options);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

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

  const columns: ProColumns<API.TestRecord>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.report.key.id', defaultMessage: '记录ID' }),
      dataIndex: 'id',
      hideInSearch: true,
      width: 80,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.key.projectId',
        defaultMessage: '项目',
      }),
      dataIndex: 'projectId',
      hideInSearch: false,
      width: 150,
      valueType: 'select',
      request: async () => {
        await loadProjects();
        return projectOptions;
      },
      render: (_, record) => {
        const project = projectOptions.find((p) => p.value === record.projectId);
        return project?.label || record.projectId;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.report.key.planId', defaultMessage: '计划' }),
      dataIndex: 'planId',
      hideInSearch: true,
      width: 100,
      render: (_, record) => record.planId || '-',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.key.startTime',
        defaultMessage: '开始时间',
      }),
      dataIndex: 'startTime',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 180,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.key.duration',
        defaultMessage: '耗时',
      }),
      dataIndex: 'duration',
      hideInSearch: true,
      width: 100,
      render: (_, record) => formatDuration(record.duration),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.key.execStatus',
        defaultMessage: '状态',
      }),
      dataIndex: 'execStatus',
      width: 120,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.testing.testrecord.status.pending',
            defaultMessage: '待处理',
          }),
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.testrecord.status.running',
            defaultMessage: '运行中',
          }),
        },
        2: {
          text: intl.formatMessage({
            id: 'pages.testing.testrecord.status.completed',
            defaultMessage: '已完成',
          }),
        },
        3: {
          text: intl.formatMessage({
            id: 'pages.testing.testrecord.status.failed',
            defaultMessage: '失败',
          }),
        },
        4: {
          text: intl.formatMessage({
            id: 'pages.testing.testrecord.status.cancelled',
            defaultMessage: '已取消',
          }),
        },
      },
      render: (_, record) => getStatusTag(record.execStatus),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.report.key.passRate',
        defaultMessage: '通过率',
      }),
      dataIndex: 'passRate',
      hideInSearch: true,
      width: 150,
      render: (_, record) => {
        const passRate = record.passRate ?? 0;
        let progressStatus: 'success' | 'exception' | 'normal' | 'active' = 'success';
        if (passRate < 60) progressStatus = 'exception';
        else if (passRate < 80) progressStatus = 'normal';

        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress
              percent={passRate}
              size="small"
              status={progressStatus}
              format={(p) => `${p?.toFixed(1)}%`}
            />
          </Space>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.common.key.createdAt', defaultMessage: '创建时间' }),
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.table.key.actions', defaultMessage: '操作' }),
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="view"
          onClick={() => {
            navigate(`/testing/report/${record.id}`);
          }}
        >
          <EyeOutlined />
          <FormattedMessage id="pages.common.view" defaultMessage="查看" />
        </a>,
        <a key="exportPdf" onClick={() => handleExportPdf()}>
          <FilePdfOutlined />
          <FormattedMessage id="pages.testing.report.action.exportPdf" defaultMessage="PDF" />
        </a>,
        <a key="exportExcel" onClick={() => handleExportExcel()}>
          <FileExcelOutlined />
          <FormattedMessage id="pages.testing.report.action.exportExcel" defaultMessage="Excel" />
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              title: intl.formatMessage({
                id: 'pages.common.delete.confirm.title',
                defaultMessage: '确认删除',
              }),
              content: intl.formatMessage({
                id: 'pages.testing.report.delete.confirm.content',
                defaultMessage: '确定要删除这条测试记录吗？此操作不可恢复。',
              }),
              onOk: async () => {
                if (record.id) {
                  try {
                    await deleteTestRecord({ id: record.id });
                    message.success(
                      intl.formatMessage({
                        id: 'pages.common.remove.success',
                        defaultMessage: '删除成功',
                      }),
                    );
                    action?.reload();
                  } catch (error) {
                    message.error(
                      intl.formatMessage({
                        id: 'pages.common.remove.failure',
                        defaultMessage: '删除失败',
                      }),
                    );
                  }
                }
              },
            });
          }}
        >
          <DeleteOutlined />
          <FormattedMessage id="pages.common.remove" defaultMessage="删除" />
        </a>,
      ],
    },
  ];

  const search = async (params: {
    page: number;
    pageSize: number;
    projectId?: number;
    execStatus?: number;
  }) => {
    try {
      const result = await listTestRecords(params as API.TestRecordSearchRequest);
      return { data: result.data?.list || [], success: result.success, total: result.data?.total };
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.common.fetchData.failure',
          defaultMessage: '获取数据失败',
        }),
      );
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.testing.report.title', defaultMessage: '测试报告' }),
        breadcrumb: {},
      }}
    >
      <ProTable<API.TestRecord>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const { current = 1, pageSize = 20, projectId, execStatus } = params;
          const results = await search({
            page: current,
            pageSize,
            projectId,
            execStatus,
          });
          return results;
        }}
        columnsState={{
          persistenceKey: 'pro-table-report',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        toolBarRender={() => []}
      />
    </PageContainer>
  );
};

export default Report;
