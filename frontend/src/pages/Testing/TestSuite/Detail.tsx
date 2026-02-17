import { PageContainer } from '@ant-design/pro-components';
import { Card, Descriptions, Tag, Button, Table, Tabs } from 'antd';
import { useIntl, useParams, useRequest } from '@umijs/max';
import { getTestSuite } from '@/services/backend/testsuite';
import { listTestCases } from '@/services/backend/testcase';
import {
  EditOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import React from 'react';

const SuiteDetail: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const suiteId = parseInt(id || '0', 10);

  const { data: suiteData, loading } = useRequest(() => getTestSuite({ id: suiteId }), {
    ready: !!suiteId,
  });

  const suite = suiteData?.data;
  const caseIds = suite?.caseIds?.split(',').map(Number).filter(Boolean) || [];

  const { data: caseData } = useRequest(
    () => listTestCases({ page: 1, pageSize: 100, projectId: suite?.projectId || 0 }),
    { ready: !!suite?.projectId },
  );

  const allCases = caseData?.data?.list || [];
  const selectedCases = allCases.filter((c) => caseIds.includes(c.id as number));

  const getStatusTag = (status?: number) => {
    const colors = ['default', 'success'];
    const labels = ['禁用', '启用'];
    return <Tag color={colors[status || 0] || 'default'}>{labels[status || 0] || '禁用'}</Tag>;
  };

  const caseColumns = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.caseNo',
        defaultMessage: '用例编号',
      }),
      dataIndex: 'caseNo',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.testcase.key.title', defaultMessage: '标题' }),
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.priority',
        defaultMessage: '优先级',
      }),
      dataIndex: 'priority',
      width: 80,
      render: (v: number) => {
        const colors = ['default', 'blue', 'orange', 'red'];
        const labels = ['低', '中', '高', '紧急'];
        return <Tag color={colors[v] || 'default'}>{labels[v] || '低'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      width: 80,
      render: (v: number) => {
        const colors = ['default', 'processing', 'success', 'error'];
        const labels = ['草稿', '审核中', '已发布', '废弃'];
        return <Tag color={colors[v] || 'default'}>{labels[v] || '草稿'}</Tag>;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.module',
        defaultMessage: '模块',
      }),
      dataIndex: 'module',
      width: 100,
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: intl.formatMessage({
        id: 'pages.testing.suite.detail.overview',
        defaultMessage: '概览',
      }),
      icon: <SettingOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.testing.suite.detail.basicInfo',
            defaultMessage: '基本信息',
          })}
        >
          <Descriptions column={2}>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.suiteNo',
                defaultMessage: '套件编号',
              })}
            >
              {suite?.suiteNo}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.name',
                defaultMessage: '名称',
              })}
            >
              {suite?.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.status',
                defaultMessage: '状态',
              })}
            >
              {getStatusTag(suite?.status)}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.suiteType',
                defaultMessage: '类型',
              })}
            >
              {suite?.suiteType || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.parallelism',
                defaultMessage: '并行度',
              })}
            >
              {suite?.parallelism || 1}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.timeout',
                defaultMessage: '超时(秒)',
              })}
            >
              {suite?.timeout || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.retryCount',
                defaultMessage: '重试次数',
              })}
            >
              {suite?.retryCount || 0}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.continueOnFail',
                defaultMessage: '失败继续',
              })}
            >
              {suite?.continueOnFail ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.description',
                defaultMessage: '描述',
              })}
              span={2}
            >
              {suite?.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'cases',
      label: intl.formatMessage({
        id: 'pages.testing.suite.detail.cases',
        defaultMessage: '用例列表',
      }),
      icon: <FileTextOutlined />,
      children: (
        <Card
          title={`${intl.formatMessage({ id: 'pages.testing.suite.detail.caseCount', defaultMessage: '包含用例' })} (${selectedCases.length})`}
        >
          <Table
            columns={caseColumns}
            dataSource={selectedCases}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title:
          suite?.name ||
          intl.formatMessage({
            id: 'pages.testing.suite.detail.title',
            defaultMessage: '套件详情',
          }),
        breadcrumb: {},
        extra: [
          <Button key="edit" icon={<EditOutlined />}>
            {intl.formatMessage({ id: 'pages.common.edit', defaultMessage: '编辑' })}
          </Button>,
          <Button key="execute" type="primary" icon={<PlayCircleOutlined />}>
            {intl.formatMessage({
              id: 'pages.testing.suite.detail.execute',
              defaultMessage: '执行测试',
            })}
          </Button>,
        ],
      }}
      loading={loading}
    >
      <Tabs defaultActiveKey="overview" items={tabItems} />
    </PageContainer>
  );
};

export default SuiteDetail;
