import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listProjects, deleteProject } from '@/services/backend/project';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const Project: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState<API.Project | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const columns: ProColumns<API.Project>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.code',
        defaultMessage: '项目代码',
      }),
      dataIndex: 'code',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.testing.project.form.code.required',
              defaultMessage: '项目代码不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.name',
        defaultMessage: '项目名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.testing.project.form.name.required',
              defaultMessage: '项目名称不能为空',
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.description',
        defaultMessage: '描述',
      }),
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.status',
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
            id: 'pages.testing.project.status.inactive',
            defaultMessage: '未激活',
          }),
          status: 'Inactive',
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.testing.project.status.active',
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
                id="pages.testing.project.status.inactive"
                defaultMessage="未激活"
              />
            </Tag>
          ) : (
            <Tag color="green">
              <FormattedMessage id="pages.testing.project.status.active" defaultMessage="已激活" />
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.tags',
        defaultMessage: '标签',
      }),
      dataIndex: 'tags',
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.tags
            ?.split(',')
            .filter(Boolean)
            .map((tag, index) => (
              <Tag key={index} color="blue">
                {tag.trim()}
              </Tag>
            ))}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.gitRepo',
        defaultMessage: 'Git仓库',
      }),
      dataIndex: 'gitRepo',
      ellipsis: true,
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.caseCount',
        defaultMessage: '用例数',
      }),
      dataIndex: 'caseCount',
      hideInSearch: true,
      width: 80,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.project.key.execCount',
        defaultMessage: '执行数',
      }),
      dataIndex: 'execCount',
      hideInSearch: true,
      width: 80,
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
            setCurrentProject(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteProject({ id: record.id });
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
    name?: string;
    code?: string;
    status?: number;
  }) => {
    try {
      const result = await listProjects(params as API.ProjectSearchRequest);
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
      <ProTable<API.Project>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, name, code, status } = params;
          const results = await search({
            page: current,
            pageSize,
            name,
            code,
            status,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-project',
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
          id: 'pages.testing.project.table.title',
          defaultMessage: '项目列表',
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
        initialValues={currentProject as API.Project}
      />
    </div>
  );
};

export default Project;
