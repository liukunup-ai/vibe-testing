import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listTestSuites, deleteTestSuite } from '@/services/backend/testSuite';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const TestSuite: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentTestSuite, setCurrentTestSuite] = useState<API.TestSuite | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const columns: ProColumns<API.TestSuite>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.suiteNo',
        defaultMessage: '套件编号',
      }),
      dataIndex: 'suiteNo',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.name',
        defaultMessage: '套件名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.testing.testsuite.form.name.required',
              defaultMessage: '套件名称不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.description',
        defaultMessage: '描述',
      }),
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.suiteType',
        defaultMessage: '套件类型',
      }),
      dataIndex: 'suiteType',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.suiteType === 'static' ? (
            <Tag color="blue">
              <FormattedMessage
                id="pages.testing.testsuite.suiteType.static"
                defaultMessage="静态"
              />
            </Tag>
          ) : record.suiteType === 'dynamic' ? (
            <Tag color="purple">
              <FormattedMessage
                id="pages.testing.testsuite.suiteType.dynamic"
                defaultMessage="动态"
              />
            </Tag>
          ) : (
            <Tag>{record.suiteType}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.parallelism',
        defaultMessage: '并行数',
      }),
      dataIndex: 'parallelism',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.timeout',
        defaultMessage: '超时时间',
      }),
      dataIndex: 'timeout',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.retryCount',
        defaultMessage: '重试次数',
      }),
      dataIndex: 'retryCount',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.continueOnFail',
        defaultMessage: '失败后继续',
      }),
      dataIndex: 'continueOnFail',
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.continueOnFail ? (
            <Tag color="green">
              <FormattedMessage id="pages.common.yes" defaultMessage="是" />
            </Tag>
          ) : (
            <Tag color="default">
              <FormattedMessage id="pages.common.no" defaultMessage="否" />
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testsuite.key.status',
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
            id: 'pages.testing.testsuite.status.inactive',
            defaultMessage: '未激活',
          }),
          status: 'Inactive',
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.testsuite.status.active',
            defaultMessage: '已激活',
          }),
          status: 'Normal',
        },
      },
      render: (_, record) => (
        <Space>
          {record.status === 0 ? (
            <Tag color="gold">
              <FormattedMessage
                id="pages.testing.testsuite.status.inactive"
                defaultMessage="未激活"
              />
            </Tag>
          ) : (
            <Tag color="green">
              <FormattedMessage
                id="pages.testing.testsuite.status.active"
                defaultMessage="已激活"
              />
            </Tag>
          )}
        </Space>
      ),
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
        id: 'pages.common.table.key.actions',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentTestSuite(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteTestSuite({ id: record.id });
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
    name?: string;
    status?: number;
  }) => {
    try {
      const result = await listTestSuites(params as API.TestSuiteSearchRequest);
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
      <ProTable<API.TestSuite>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, projectId, name, status } = params;
          const results = await search({
            page: current,
            pageSize,
            projectId,
            name,
            status,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-testsuite',
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
          id: 'pages.testing.testsuite.table.title',
          defaultMessage: '测试套件列表',
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
      />
      <UpdateForm
        visible={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        onSuccess={() => {
          setUpdateVisible(false);
          actionRef.current?.reload();
        }}
        initialValues={currentTestSuite as API.TestSuite}
      />
    </div>
  );
};

export default TestSuite;
