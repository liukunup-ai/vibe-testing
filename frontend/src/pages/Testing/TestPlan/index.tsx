import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listTestPlans, deleteTestPlan } from '@/services/backend/testplan';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const TestPlan: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentTestPlan, setCurrentTestPlan] = useState<API.TestPlan | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const getExecStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: {
        color: 'gold',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.status.pending',
          defaultMessage: '待执行',
        }),
      },
      1: {
        color: 'processing',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.status.running',
          defaultMessage: '执行中',
        }),
      },
      2: {
        color: 'green',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.status.completed',
          defaultMessage: '已完成',
        }),
      },
      3: {
        color: 'red',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.status.failed',
          defaultMessage: '执行失败',
        }),
      },
      4: {
        color: 'default',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.status.cancelled',
          defaultMessage: '已取消',
        }),
      },
    };
    const config = statusMap[status || 0] || statusMap[0];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPlanTypeTag = (planType?: string) => {
    if (planType === 'manual') {
      return (
        <Tag color="blue">
          <FormattedMessage id="pages.testing.testplan.planType.manual" defaultMessage="手动" />
        </Tag>
      );
    }
    return (
      <Tag color="purple">
        <FormattedMessage id="pages.testing.testplan.planType.automated" defaultMessage="自动" />
      </Tag>
    );
  };

  const getTriggerTypeTag = (triggerType?: string) => {
    const triggerMap: Record<string, { color: string; text: string }> = {
      manual: {
        color: 'blue',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.triggerType.manual',
          defaultMessage: '手动触发',
        }),
      },
      scheduled: {
        color: 'green',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.triggerType.scheduled',
          defaultMessage: '定时触发',
        }),
      },
      api: {
        color: 'orange',
        text: intl.formatMessage({
          id: 'pages.testing.testplan.triggerType.api',
          defaultMessage: 'API触发',
        }),
      },
    };
    const config = triggerMap[triggerType || 'manual'] || triggerMap.manual;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ProColumns<API.TestPlan>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.planNo',
        defaultMessage: '计划编号',
      }),
      dataIndex: 'planNo',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.name',
        defaultMessage: '计划名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.testing.testplan.form.name.required',
              defaultMessage: '计划名称不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.description',
        defaultMessage: '描述',
      }),
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.planType',
        defaultMessage: '计划类型',
      }),
      dataIndex: 'planType',
      hideInSearch: true,
      render: (_, record) => getPlanTypeTag(record.planType),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.triggerType',
        defaultMessage: '触发类型',
      }),
      dataIndex: 'triggerType',
      hideInSearch: true,
      render: (_, record) => getTriggerTypeTag(record.triggerType),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.parallelism',
        defaultMessage: '并发数',
      }),
      dataIndex: 'parallelism',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.execStatus',
        defaultMessage: '执行状态',
      }),
      dataIndex: 'execStatus',
      valueType: 'select',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.testing.testplan.status.pending',
            defaultMessage: '待执行',
          }),
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.testplan.status.running',
            defaultMessage: '执行中',
          }),
        },
        2: {
          text: intl.formatMessage({
            id: 'pages.testing.testplan.status.completed',
            defaultMessage: '已完成',
          }),
        },
        3: {
          text: intl.formatMessage({
            id: 'pages.testing.testplan.status.failed',
            defaultMessage: '执行失败',
          }),
        },
        4: {
          text: intl.formatMessage({
            id: 'pages.testing.testplan.status.cancelled',
            defaultMessage: '已取消',
          }),
        },
      },
      render: (_, record) => getExecStatusTag(record.execStatus),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.expectedStartTime',
        defaultMessage: '期望开始时间',
      }),
      dataIndex: 'expectedStartTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testplan.key.actualStartTime',
        defaultMessage: '实际开始时间',
      }),
      dataIndex: 'actualStartTime',
      valueType: 'dateTime',
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
        id: 'pages.common.table.key.actions',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentTestPlan(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteTestPlan({ id: record.id });
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
    execStatus?: number;
  }) => {
    try {
      const result = await listTestPlans(params as API.TestPlanSearchRequest);
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
      <ProTable<API.TestPlan>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const { current = 1, pageSize = 20, projectId, name, execStatus } = params;
          const results = await search({
            page: current,
            pageSize,
            projectId,
            name,
            execStatus,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-testplan',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
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
        params={{
          projectId: undefined,
        }}
        form={{
          syncToUrl: (values) => {
            return values;
          },
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle={intl.formatMessage({
          id: 'pages.testing.testplan.table.title',
          defaultMessage: '测试计划列表',
        })}
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
        initialValues={currentTestPlan as API.TestPlan}
      />
    </div>
  );
};

export default TestPlan;
