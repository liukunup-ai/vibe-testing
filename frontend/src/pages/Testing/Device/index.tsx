import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Progress, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useRef, useState } from 'react';
import { listDevices, deleteDevice } from '@/services/backend/device';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const Device: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<API.Device | null>(null);
  const actionRef = useRef<ActionType>(null);
  const intl = useIntl();

  const statusEnum = {
    0: {
      text: intl.formatMessage({
        id: 'pages.testing.device.status.offline',
        defaultMessage: '离线',
      }),
      status: 'Default',
    },
    1: {
      text: intl.formatMessage({ id: 'pages.testing.device.status.idle', defaultMessage: '空闲' }),
      status: 'Success',
    },
    2: {
      text: intl.formatMessage({
        id: 'pages.testing.device.status.busy',
        defaultMessage: '使用中',
      }),
      status: 'Processing',
    },
    3: {
      text: intl.formatMessage({
        id: 'pages.testing.device.status.maintenance',
        defaultMessage: '维护中',
      }),
      status: 'Warning',
    },
  };

  const deviceTypeEnum = {
    android: { text: 'Android' },
    ios: { text: 'iOS' },
    browser: { text: 'Browser' },
    windows: { text: 'Windows' },
    macos: { text: 'macOS' },
    linux: { text: 'Linux' },
  };

  const platformEnum = {
    android: { text: 'Android' },
    ios: { text: 'iOS' },
    windows: { text: 'Windows' },
    macos: { text: 'macOS' },
    linux: { text: 'Linux' },
  };

  const getStatusTag = (status?: number) => {
    switch (status) {
      case 0:
        return (
          <Tag color="default">
            <FormattedMessage id="pages.testing.device.status.offline" defaultMessage="离线" />
          </Tag>
        );
      case 1:
        return (
          <Tag color="green">
            <FormattedMessage id="pages.testing.device.status.idle" defaultMessage="空闲" />
          </Tag>
        );
      case 2:
        return (
          <Tag color="blue">
            <FormattedMessage id="pages.testing.device.status.busy" defaultMessage="使用中" />
          </Tag>
        );
      case 3:
        return (
          <Tag color="orange">
            <FormattedMessage
              id="pages.testing.device.status.maintenance"
              defaultMessage="维护中"
            />
          </Tag>
        );
      default:
        return (
          <Tag>
            <FormattedMessage id="pages.testing.device.status.unknown" defaultMessage="未知" />
          </Tag>
        );
    }
  };

  const columns: ProColumns<API.Device>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.deviceNo',
        defaultMessage: '设备编号',
      }),
      dataIndex: 'deviceNo',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.name',
        defaultMessage: '设备名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.deviceType',
        defaultMessage: '设备类型',
      }),
      dataIndex: 'deviceType',
      valueType: 'select',
      valueEnum: deviceTypeEnum,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.platform',
        defaultMessage: '平台',
      }),
      dataIndex: 'platform',
      valueType: 'select',
      valueEnum: platformEnum,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.deviceModel',
        defaultMessage: '型号',
      }),
      dataIndex: 'deviceModel',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.osVersion',
        defaultMessage: '系统版本',
      }),
      dataIndex: 'osVersion',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.device.key.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusEnum,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: intl.formatMessage({ id: 'pages.testing.device.key.battery', defaultMessage: '电量' }),
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
      title: intl.formatMessage({ id: 'pages.testing.device.key.cpuUsage', defaultMessage: 'CPU' }),
      dataIndex: 'cpuUsage',
      hideInSearch: true,
      render: (_, record) => {
        if (record.cpuUsage === undefined || record.cpuUsage === null) {
          return '-';
        }
        return `${record.cpuUsage.toFixed(1)}%`;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.memoryUsage',
        defaultMessage: '内存',
      }),
      dataIndex: 'memoryUsage',
      hideInSearch: true,
      render: (_, record) => {
        if (record.memoryUsage === undefined || record.memoryUsage === null) {
          return '-';
        }
        return `${record.memoryUsage.toFixed(1)}%`;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.device.key.lastHeartbeat',
        defaultMessage: '最后心跳',
      }),
      dataIndex: 'lastHeartbeat',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.table.key.actions', defaultMessage: '操作' }),
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentDevice(record);
            setUpdateVisible(true);
          }}
        >
          <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
        </a>,
        <a
          key="remove"
          onClick={async () => {
            if (record.id) {
              await deleteDevice({ id: record.id });
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
    deviceType?: string;
    platform?: string;
    status?: number;
    name?: string;
  }) => {
    try {
      const result = await listDevices(params as API.DeviceSearchRequest);
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
      <ProTable<API.Device>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const { current = 1, pageSize = 20, deviceType, platform, status, name } = params;
          const results = await search({
            page: current,
            pageSize,
            deviceType,
            platform,
            status,
            name,
          });
          return results;
        }}
        columnsState={{
          persistenceKey: 'pro-table-device',
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
          id: 'pages.testing.device.table.title',
          defaultMessage: '设备列表',
        })}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
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
        initialValues={currentDevice as API.Device}
      />
    </div>
  );
};

export default Device;
