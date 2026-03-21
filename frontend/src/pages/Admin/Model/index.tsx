import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message, Modal } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listModels, deleteModel, testConnection } from '@/services/backend/model';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const PROVIDER_MAP: Record<number, { text: string; color: string }> = {
  1: { text: 'OpenAI', color: 'green' },
  2: { text: 'Azure', color: 'blue' },
  3: { text: 'Ollama', color: 'orange' },
  4: { text: 'LMStudio', color: 'purple' },
  5: { text: 'vLLM', color: 'cyan' },
  6: { text: 'Groq', color: 'magenta' },
  7: { text: 'Anthropic', color: 'red' },
};

const getProviderBadge = (provider: number) => {
  const info = PROVIDER_MAP[provider];
  if (!info) return <Tag>Unknown</Tag>;
  return <Tag color={info.color}>{info.text}</Tag>;
};

const Model: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState<API.Model | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'pages.admin.model.delete.confirmTitle',
        defaultMessage: '确认删除',
      }),
      content: intl.formatMessage({
        id: 'pages.admin.model.delete.confirmContent',
        defaultMessage: '确定要删除该模型吗？此操作不可恢复。',
      }),
      onOk: async () => {
        try {
          await deleteModel({ id });
          message.success(
            intl.formatMessage({
              id: 'pages.common.remove.success',
              defaultMessage: '删除成功',
            })
          );
          actionRef.current?.reload();
        } catch (error: any) {
          message.error(
            error.message ||
              intl.formatMessage({
                id: 'pages.common.operation.failure',
                defaultMessage: '操作失败',
              })
          );
        }
      },
    });
  };

  const handleTestConnection = async (record: API.Model) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'pages.admin.model.testConnection.title',
        defaultMessage: '测试连接',
      }),
      content: intl.formatMessage({
        id: 'pages.admin.model.testConnection.content',
        defaultMessage: '确定要测试该模型的连接吗？',
      }),
      onOk: async () => {
        try {
          const response = await testConnection({
            provider: String(record.provider),
            baseUrl: record.baseUrl,
          });
          if (response.success) {
            if (response.success && response.models) {
              message.success(
                intl.formatMessage({
                  id: 'pages.admin.model.testConnection.success',
                  defaultMessage: '连接成功',
                }) +
                  (response.models?.length
                    ? `: ${response.models.join(', ')}`
                    : '')
              );
            } else {
              message.error(
                response.message ||
                  intl.formatMessage({
                    id: 'pages.admin.model.testConnection.failure',
                    defaultMessage: '连接失败',
                  })
              );
            }
          } else {
            message.error(
              response.errorMessage ||
                intl.formatMessage({
                  id: 'pages.admin.model.testConnection.failure',
                  defaultMessage: '连接失败',
                })
            );
          }
        } catch (error: any) {
          message.error(
            error.message ||
              intl.formatMessage({
                id: 'pages.common.operation.failure',
                defaultMessage: '操作失败',
              })
          );
        }
      },
    });
  };

  const columns: ProColumns<API.Model>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.id',
        defaultMessage: 'ID',
      }),
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.provider',
        defaultMessage: '提供商',
      }),
      dataIndex: 'provider',
      valueType: 'select',
      filters: true,
      onFilter: true,
      valueEnum: {
        1: { text: 'OpenAI', status: 'OpenAI' },
        2: { text: 'Azure', status: 'Azure' },
        3: { text: 'Ollama', status: 'Ollama' },
        4: { text: 'LMStudio', status: 'LMStudio' },
        5: { text: 'vLLM', status: 'vLLM' },
        6: { text: 'Groq', status: 'Groq' },
        7: { text: 'Anthropic', status: 'Anthropic' },
      },
      render: (_, record) => getProviderBadge(record.provider || 0),
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.name',
        defaultMessage: '模型名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.admin.model.form.name.required',
              defaultMessage: '模型名称不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.baseUrl',
        defaultMessage: 'API 地址',
      }),
      dataIndex: 'baseUrl',
      ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.modelId',
        defaultMessage: '模型 ID',
      }),
      dataIndex: 'modelId',
      ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.timeout',
        defaultMessage: '超时(秒)',
      }),
      dataIndex: 'timeout',
      width: 100,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.admin.model.key.temperature',
        defaultMessage: '温度',
      }),
      dataIndex: 'temperature',
      width: 80,
      search: false,
      render: (_, record) => (record.temperature !== undefined ? record.temperature.toFixed(2) : '-'),
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
      width: 180,
      render: (_text, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentModel(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="test"
          onClick={() => handleTestConnection(record)}
        >
          <ThunderboltOutlined />
          <FormattedMessage id="pages.admin.model.testConnection" defaultMessage="测试" />
        </a>,
        <a
          key="delete"
          onClick={() => record.id && handleDelete(record.id)}
          style={{ color: '#ff4d4f' }}
        >
          <FormattedMessage id="pages.common.remove" defaultMessage="删除" />
        </a>,
      ],
    },
  ];

  const search = async (params: {
    page: number;
    pageSize: number;
    name?: string;
    provider?: number;
  }) => {
    try {
      const result = await listModels(params as API.ListModelsParams);
      return { data: result.data?.list || [], success: result.success, total: result.data?.total };
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.common.fetchData.failure',
          defaultMessage: '获取数据失败',
        })
      );
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <div>
      <ProTable<API.Model>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, name, provider } = params;
          const results = await search({
            page: current,
            pageSize,
            name,
            provider,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-model',
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
          id: 'pages.admin.model.table.title',
          defaultMessage: '模型列表',
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
        initialValues={currentModel as API.Model}
      />
    </div>
  );
};

export default Model;
