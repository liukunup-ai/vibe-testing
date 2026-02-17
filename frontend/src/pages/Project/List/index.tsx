import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';

import { useRef, useState } from 'react';
import { listProjects, deleteProject } from '@/services/backend/project';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const ProjectList: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState<API.Project | null>(null);
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<API.Project>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '项目代码',
      dataIndex: 'code',
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        0: { text: '未激活', status: 'Inactive' },
        1: { text: '已激活', status: 'Normal' },
      },
      render: (_, record) => (
        <Tag color={record.status === 0 ? 'gold' : 'green'}>
          {record.status === 0 ? '未激活' : '已激活'}
        </Tag>
      ),
    },
    {
      title: '标签',
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
      title: '用例数',
      dataIndex: 'caseCount',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentProject(record);
            setUpdateVisible(true);
          }}
        >
          编辑
        </a>,
        <a key="detail" href={`#/project/detail/${record.id}`}>
          详情
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteProject({ id: record.id });
              message.success('删除成功');
              action?.reload();
            }
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <div>
      <ProTable<API.Project>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const { current = 1, pageSize = 20, name, code, status } = params;
          const result = await listProjects({
            page: current,
            pageSize,
            name,
            code,
            status,
          } as API.ProjectSearchRequest);
          return {
            data: result.data?.list || [],
            success: result.success,
            total: result.data?.total,
          };
        }}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        headerTitle="项目列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
            type="primary"
          >
            新建
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

export default ProjectList;
