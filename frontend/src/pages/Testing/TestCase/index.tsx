import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useEffect, useState } from 'react';
import { listTestCases, deleteTestCase } from '@/services/backend/testCase';
import { listProjects } from '@/services/backend/project';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const TestCase: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentTestCase, setCurrentTestCase] = useState<API.TestCase | null>(null);
  const [projectOptions, setProjectOptions] = useState<API.Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectLoading(true);
      try {
        const response = await listProjects({ page: 1, pageSize: 100 });
        if (response.success) {
          setProjectOptions(response.data?.list || []);
        }
      } catch (error) {
        const msg = intl.formatMessage({
          id: 'pages.testing.testcase.fetchProjects.failure',
          defaultMessage: '获取项目列表失败',
        });
        if (error instanceof Error) {
          message.error(error.message || msg);
        } else {
          message.error(msg);
        }
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const columns: ProColumns<API.TestCase>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.caseNo',
        defaultMessage: '用例编号',
      }),
      dataIndex: 'caseNo',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.title',
        defaultMessage: '标题',
      }),
      dataIndex: 'title',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.testing.testcase.form.title.required',
              defaultMessage: '标题不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.module',
        defaultMessage: '模块',
      }),
      dataIndex: 'module',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.priority',
        defaultMessage: '优先级',
      }),
      dataIndex: 'priority',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.priority.low',
            defaultMessage: '低',
          }),
          status: 'Default',
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.priority.medium',
            defaultMessage: '中',
          }),
          status: 'Processing',
        },
        2: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.priority.high',
            defaultMessage: '高',
          }),
          status: 'Warning',
        },
        3: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.priority.critical',
            defaultMessage: '紧急',
          }),
          status: 'Error',
        },
      },
      render: (_, record) => (
        <Space>
          {record.priority === 0 ? (
            <Tag color="default">
              <FormattedMessage id="pages.testing.testcase.priority.low" defaultMessage="低" />
            </Tag>
          ) : record.priority === 1 ? (
            <Tag color="blue">
              <FormattedMessage id="pages.testing.testcase.priority.medium" defaultMessage="中" />
            </Tag>
          ) : record.priority === 2 ? (
            <Tag color="orange">
              <FormattedMessage id="pages.testing.testcase.priority.high" defaultMessage="高" />
            </Tag>
          ) : record.priority === 3 ? (
            <Tag color="red">
              <FormattedMessage
                id="pages.testing.testcase.priority.critical"
                defaultMessage="紧急"
              />
            </Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.caseType',
        defaultMessage: '用例类型',
      }),
      dataIndex: 'caseType',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        functional: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.caseType.functional',
            defaultMessage: '功能测试',
          }),
        },
        performance: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.caseType.performance',
            defaultMessage: '性能测试',
          }),
        },
        security: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.caseType.security',
            defaultMessage: '安全测试',
          }),
        },
        compatibility: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.caseType.compatibility',
            defaultMessage: '兼容性测试',
          }),
        },
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      search: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.status.draft',
            defaultMessage: '草稿',
          }),
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.status.reviewing',
            defaultMessage: '审核中',
          }),
        },
        2: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.status.active',
            defaultMessage: '启用',
          }),
        },
        3: {
          text: intl.formatMessage({
            id: 'pages.testing.testcase.status.deprecated',
            defaultMessage: '废弃',
          }),
        },
      },
      render: (_, record) => (
        <Space>
          {record.status === 0 ? (
            <Tag color="default">
              <FormattedMessage id="pages.testing.testcase.status.draft" defaultMessage="草稿" />
            </Tag>
          ) : record.status === 1 ? (
            <Tag color="processing">
              <FormattedMessage
                id="pages.testing.testcase.status.reviewing"
                defaultMessage="审核中"
              />
            </Tag>
          ) : record.status === 2 ? (
            <Tag color="success">
              <FormattedMessage id="pages.testing.testcase.status.active" defaultMessage="启用" />
            </Tag>
          ) : record.status === 3 ? (
            <Tag color="error">
              <FormattedMessage
                id="pages.testing.testcase.status.deprecated"
                defaultMessage="废弃"
              />
            </Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.key.tags',
        defaultMessage: '标签',
      }),
      dataIndex: 'tags',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.key.createdAt',
        defaultMessage: '创建时间',
      }),
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.key.updatedAt',
        defaultMessage: '更新时间',
      }),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.common.table.key.actions',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentTestCase(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteTestCase({ id: record.id });
              message.success(
                intl.formatMessage({
                  id: 'pages.common.remove.success',
                  defaultMessage: '删除成功',
                }),
              );
              action?.reload();
            }
          }}
        >
          <FormattedMessage id="pages.common.remove" defaultMessage="删除" />
        </a>,
      ],
    },
  ];

  const search = async (params: {
    page: number;
    pageSize: number;
    projectId?: number;
    title?: string;
    priority?: number;
    status?: number;
    module?: string;
  }) => {
    try {
      const result = await listTestCases(params as API.TestCaseSearchRequest);
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
    <div>
      <ProTable<API.TestCase>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, projectId, title, priority, status, module } = params;
          const results = await search({
            page: current,
            pageSize,
            projectId,
            title,
            priority,
            status,
            module,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-testcase',
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
        headerTitle={intl.formatMessage({
          id: 'pages.testing.testcase.table.title',
          defaultMessage: '测试用例列表',
        })}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCreateVisible(true);
            }}
            type="primary"
          >
            <FormattedMessage id="pages.common.new" defaultMessage="新建" />
          </Button>,
        ]}
      />
      <CreateForm
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => {
          setCreateVisible(false);
          actionRef.current?.reload();
        }}
        projectOptions={projectOptions}
        projectLoading={projectLoading}
      />
      <UpdateForm
        visible={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        onSuccess={() => {
          setUpdateVisible(false);
          actionRef.current?.reload();
        }}
        initialValues={currentTestCase as API.TestCase}
        projectOptions={projectOptions}
        projectLoading={projectLoading}
      />
    </div>
  );
};

export default TestCase;
