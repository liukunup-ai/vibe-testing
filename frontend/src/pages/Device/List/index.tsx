import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Progress, message } from 'antd';

import { useRef, useState } from 'react';
import { listDevices, deleteDevice } from '@/services/backend/device';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const DeviceList: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<API.Device | null>(null);
  const actionRef = useRef<ActionType>(null);

  const getStatusTag = (status?: number) => {
    switch (status) {
      case 0:
        return <Tag color="default">离线</Tag>;
      case 1:
        return <Tag color="green">空闲</Tag>;
      case 2:
        return <Tag color="blue">使用中</Tag>;
      case 3:
        return <Tag color="orange">维护中</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const columns: ProColumns<API.Device>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '设备编号',
      dataIndex: 'deviceNo',
      ellipsis: true,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
    },
    {
      title: '平台',
      dataIndex: 'platform',
    },
    {
      title: '型号',
      dataIndex: 'deviceModel',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '系统版本',
      dataIndex: 'osVersion',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '电量',
      dataIndex: 'battery',
      hideInSearch: true,
      render: (_, record) => {
        if (record.battery === undefined || record.battery === null) {
          return '-';
        }
        const percent = record.battery;
        let status: 'normal' | 'exception' | 'success' | 'active' = 'normal';
        if (percent < 20) status = 'exception';
        else if (percent > 80) status = 'success';
        return <Progress percent={percent} size="small" status={status} />;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentDevice(record);
            setUpdateVisible(true);
          }}
        >
          编辑
        </a>,
        <a key="detail" href={`#/device/detail/${record.id}`}>
          详情
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteDevice({ id: record.id });
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
      <ProTable<API.Device>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const { current = 1, pageSize = 20, deviceType, platform, status, name } = params;
          const result = await listDevices({
            page: current,
            pageSize,
            deviceType,
            platform,
            status,
            name,
          } as API.DeviceSearchRequest);
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
        headerTitle="设备列表"
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
        initialValues={currentDevice as API.Device}
      />
    </div>
  );
};

export default DeviceList;
