import { PageContainer } from '@ant-design/pro-components';
import {
  Tabs,
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
} from 'antd';
import { useIntl, useParams, useRequest, history } from '@umijs/max';
import { getProject } from '@/services/backend/project';
import { listTestCases } from '@/services/backend/testcase';
import { listTestSuites } from '@/services/backend/testsuite';
import { listTestRecords } from '@/services/backend/testrecord';
import {
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React from 'react';

const ProjectDetail: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '0', 10);

  const { data: projectData, loading: projectLoading } = useRequest(
    () => getProject({ id: projectId }),
    { ready: !!projectId },
  );

  const { data: caseData } = useRequest(
    () => listTestCases({ page: 1, pageSize: 100, projectId }),
    { ready: !!projectId },
  );

  const { data: suiteData } = useRequest(
    () => listTestSuites({ page: 1, pageSize: 100, projectId }),
    { ready: !!projectId },
  );

  const { data: recordData } = useRequest(
    () => listTestRecords({ page: 1, pageSize: 10, projectId }),
    { ready: !!projectId },
  );

  const project = projectData?.data;
  const caseCount = caseData?.data?.total || 0;
  const suiteCount = suiteData?.data?.total || 0;
  const recentRecords = recordData?.data?.list || [];

  const getStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: {
        color: 'gold',
        text: intl.formatMessage({
          id: 'pages.testing.project.status.inactive',
          defaultMessage: '未激活',
        }),
      },
      1: {
        color: 'green',
        text: intl.formatMessage({
          id: 'pages.testing.project.status.active',
          defaultMessage: '已激活',
        }),
      },
    };
    const config = statusMap[status || 0] || statusMap[0];
    return <Tag color={config.color}>{config.text}</Tag>;
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
  ];

  const suiteColumns = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.suiteNo',
        defaultMessage: '套件编号',
      }),
      dataIndex: 'suiteNo',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.testsuite.key.name', defaultMessage: '名称' }),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      width: 80,
      render: (v: number) => {
        const colors = ['default', 'success'];
        const labels = ['禁用', '启用'];
        return <Tag color={colors[v] || 'default'}>{labels[v] || '禁用'}</Tag>;
      },
    },
  ];

  const recordColumns = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.testrecord.key.id',
        defaultMessage: '记录ID',
      }),
      dataIndex: 'id',
      width: 80,
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
        const labels = ['待处理', '运行中', '已完成', '失败', '已取消'];
        return <Tag color={colors[v] || 'default'}>{labels[v] || '待处理'}</Tag>;
      },
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

  const tabItems = [
    {
      key: 'overview',
      label: intl.formatMessage({
        id: 'pages.testing.project.detail.overview',
        defaultMessage: '概览',
      }),
      icon: <AppstoreOutlined />,
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Row gutter={24}>
                <Col span={6}>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.project.detail.caseCount',
                      defaultMessage: '用例数',
                    })}
                    value={caseCount}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.project.detail.suiteCount',
                      defaultMessage: '套件数',
                    })}
                    value={suiteCount}
                    prefix={<AppstoreOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.project.detail.execCount',
                      defaultMessage: '执行数',
                    })}
                    value={project?.execCount || 0}
                    prefix={<PlayCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={intl.formatMessage({
                      id: 'pages.testing.project.detail.avgPassRate',
                      defaultMessage: '平均通过率',
                    })}
                    value={85.5}
                    suffix="%"
                    prefix={<Progress percent={85.5} size="small" style={{ width: 60 }} />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card
              title={intl.formatMessage({
                id: 'pages.testing.project.detail.basicInfo',
                defaultMessage: '基本信息',
              })}
            >
              <Descriptions column={2}>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.code',
                    defaultMessage: '项目代码',
                  })}
                >
                  {project?.code}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.name',
                    defaultMessage: '项目名称',
                  })}
                >
                  {project?.name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.status',
                    defaultMessage: '状态',
                  })}
                >
                  {getStatusTag(project?.status)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.gitRepo',
                    defaultMessage: 'Git仓库',
                  })}
                >
                  {project?.gitRepo || '-'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.description',
                    defaultMessage: '描述',
                  })}
                  span={2}
                >
                  {project?.description || '-'}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({
                    id: 'pages.testing.project.key.tags',
                    defaultMessage: '标签',
                  })}
                  span={2}
                >
                  <Space>
                    {project?.tags
                      ?.split(',')
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <Tag key={idx} color="blue">
                          {tag.trim()}
                        </Tag>
                      ))}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'cases',
      label: intl.formatMessage({
        id: 'pages.testing.project.detail.cases',
        defaultMessage: '用例管理',
      }),
      icon: <FileTextOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.testing.testcase.table.title',
            defaultMessage: '用例列表',
          })}
          extra={
            <Button
              type="primary"
              onClick={() => history.push(`/testing/testcase/edit?projectId=${projectId}`)}
            >
              {intl.formatMessage({ id: 'pages.common.new', defaultMessage: '新建' })}
            </Button>
          }
        >
          <Table
            columns={caseColumns}
            dataSource={caseData?.data?.list || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => history.push(`/testing/testcase/edit?id=${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>
      ),
    },
    {
      key: 'suites',
      label: intl.formatMessage({
        id: 'pages.testing.project.detail.suites',
        defaultMessage: '套件管理',
      }),
      icon: <AppstoreOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.testing.testsuite.table.title',
            defaultMessage: '套件列表',
          })}
          extra={
            <Button type="primary">
              {intl.formatMessage({ id: 'pages.common.new', defaultMessage: '新建' })}
            </Button>
          }
        >
          <Table
            columns={suiteColumns}
            dataSource={suiteData?.data?.list || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: 'history',
      label: intl.formatMessage({
        id: 'pages.testing.project.detail.history',
        defaultMessage: '执行历史',
      }),
      icon: <HistoryOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.testing.testrecord.table.title',
            defaultMessage: '测试记录',
          })}
        >
          <Table
            columns={recordColumns}
            dataSource={recentRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: 'settings',
      label: intl.formatMessage({
        id: 'pages.testing.project.detail.settings',
        defaultMessage: '项目设置',
      }),
      icon: <SettingOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.testing.project.detail.settings',
            defaultMessage: '项目设置',
          })}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<EditOutlined />}>
              {intl.formatMessage({ id: 'pages.common.edit', defaultMessage: '编辑项目' })}
            </Button>
            <Button icon={<DeleteOutlined />} danger>
              {intl.formatMessage({ id: 'pages.common.remove', defaultMessage: '删除项目' })}
            </Button>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title:
          project?.name ||
          intl.formatMessage({
            id: 'pages.testing.project.detail.title',
            defaultMessage: '项目详情',
          }),
        breadcrumb: {},
        extra: [
          <Button key="edit" icon={<EditOutlined />}>
            {intl.formatMessage({ id: 'pages.common.edit', defaultMessage: '编辑' })}
          </Button>,
          <Button key="execute" type="primary" icon={<PlayCircleOutlined />}>
            {intl.formatMessage({
              id: 'pages.testing.project.detail.execute',
              defaultMessage: '执行测试',
            })}
          </Button>,
        ],
      }}
      loading={projectLoading}
    >
      <Tabs defaultActiveKey="overview" items={tabItems} />
    </PageContainer>
  );
};

export default ProjectDetail;
