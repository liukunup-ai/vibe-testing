import { PlusOutlined } from '@ant-design/icons';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listItems, deleteItem, createItem } from '../../services/backend/item';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const Item: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<API.Item | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const columns: ProColumns<API.Item>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.item.key.name',
        defaultMessage: '名称',
      }),
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'This field is required',
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.item.key.desc',
        defaultMessage: '描述',
      }),
      dataIndex: 'desc',
      ellipsis: true,
      tooltip: '描述项目的作用',
    },
    {
      title: intl.formatMessage({
        id: 'pages.item.key.owner',
        defaultMessage: '所有者',
      }),
      dataIndex: 'owner',
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
            console.log(record);
            setCurrentItem(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="duplicate"
          onClick={async () => {
            await createItem({
              name: record.name + '-Copy',
              desc: record.desc,
              owner: record.owner,
            });
            actionRef.current?.reload();
          }}
        >
          <FormattedMessage id="pages.common.duplicate" defaultMessage="复制" />
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={() => action?.reload()}
          menus={[
            {
              key: 'test',
              name: '测试',
              onClick: async () => {
                message.warning('此功能尚未实现');
              },
            },
            {
              key: 'delete',
              name: '删除',
              onClick: async () => {
                if (record.id) {
                  await deleteItem({ id: record.id });
                  message.success('删除成功');
                  actionRef.current?.reload();
                }
              },
            },
          ]}
        />,
      ],
    },
  ];

  const search = async (params: {
    page: number;
    pageSize: number;
    name?: string;
    desc?: string;
    owner?: string;
  }) => {
    try {
      const result = await listItems(params as API.ListItemsParams);
      return { data: result.data?.list || [], success: result.success, total: result.data?.total };
    } catch (error) {
      message.error('获取列表失败');
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <div>
      <ProTable<API.Item>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          const { current = 1, pageSize = 20, name, desc, owner } = params;
          const results = await search({
            page: current,
            pageSize,
            name,
            desc,
            owner,
          });
          return results;
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-item',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
          onChange(value) {
            console.log('value: ', value);
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
          id: 'pages.item.table.title',
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
        initialValues={currentItem as API.Item}
      />
    </div>
  );
};

export default Item;
