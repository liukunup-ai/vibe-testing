import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Tabs,
  List,
  Typography,
  Space,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Badge,
} from 'antd';
import { useIntl } from '@umijs/max';
import { TeamOutlined, SafetyOutlined, AuditOutlined, ToolOutlined } from '@ant-design/icons';
import React from 'react';

const { Text } = Typography;
const { Search } = Input;

const Settings: React.FC = () => {
  const intl = useIntl();

  const auditLogs = [
    {
      id: 1,
      user: 'admin',
      action: '登录',
      module: '认证',
      ip: '192.168.1.100',
      time: '2024-01-20 14:30:00',
      status: 'success',
    },
    {
      id: 2,
      user: 'admin',
      action: '创建用户',
      module: '用户管理',
      ip: '192.168.1.100',
      time: '2024-01-20 14:25:00',
      status: 'success',
    },
    {
      id: 3,
      user: 'operator',
      action: '执行测试',
      module: '测试任务',
      ip: '192.168.1.101',
      time: '2024-01-20 14:20:00',
      status: 'success',
    },
    {
      id: 4,
      user: 'admin',
      action: '修改配置',
      module: '系统设置',
      ip: '192.168.1.100',
      time: '2024-01-20 14:15:00',
      status: 'failed',
    },
  ];

  const systemConfig = [
    {
      key: 'siteName',
      label: intl.formatMessage({
        id: 'pages.settings.system.siteName',
        defaultMessage: '站点名称',
      }),
      value: 'Vibe Testing Platform',
    },
    {
      key: 'siteUrl',
      label: intl.formatMessage({ id: 'pages.settings.system.siteUrl', defaultMessage: '站点URL' }),
      value: 'https://testing.example.com',
    },
    {
      key: 'email',
      label: intl.formatMessage({ id: 'pages.settings.system.email', defaultMessage: '系统邮箱' }),
      value: 'noreply@example.com',
    },
    {
      key: 'maxUploadSize',
      label: intl.formatMessage({
        id: 'pages.settings.system.maxUploadSize',
        defaultMessage: '最大上传大小',
      }),
      value: '100MB',
    },
    {
      key: 'sessionTimeout',
      label: intl.formatMessage({
        id: 'pages.settings.system.sessionTimeout',
        defaultMessage: '会话超时',
      }),
      value: '30分钟',
    },
    {
      key: 'logRetention',
      label: intl.formatMessage({
        id: 'pages.settings.system.logRetention',
        defaultMessage: '日志保留天数',
      }),
      value: '90天',
    },
  ];

  const auditColumns = [
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.user', defaultMessage: '用户' }),
      dataIndex: 'user',
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.action', defaultMessage: '操作' }),
      dataIndex: 'action',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.module', defaultMessage: '模块' }),
      dataIndex: 'module',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.ip', defaultMessage: 'IP地址' }),
      dataIndex: 'ip',
      width: 140,
    },
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.time', defaultMessage: '时间' }),
      dataIndex: 'time',
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'pages.settings.audit.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      width: 80,
      render: (v: string) => (
        <Badge
          status={v === 'success' ? 'success' : 'error'}
          text={v === 'success' ? '成功' : '失败'}
        />
      ),
    },
  ];

  const tabItems = [
    {
      key: 'users',
      label: intl.formatMessage({ id: 'pages.settings.users', defaultMessage: '用户管理' }),
      icon: <TeamOutlined />,
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space>
              <Search
                placeholder={intl.formatMessage({
                  id: 'pages.settings.users.search',
                  defaultMessage: '搜索用户名',
                })}
                style={{ width: 300 }}
              />
              <Select
                placeholder={intl.formatMessage({
                  id: 'pages.settings.users.status',
                  defaultMessage: '状态',
                })}
                style={{ width: 120 }}
              />
              <Button type="primary">
                {intl.formatMessage({ id: 'pages.common.new', defaultMessage: '新建' })}
              </Button>
            </Space>
            <Text type="secondary">
              {intl.formatMessage({
                id: 'pages.settings.users.tip',
                defaultMessage: '用户管理功能请使用顶部导航的"系统管理 -> 用户管理"',
              })}
            </Text>
            <Button onClick={() => (window.location.href = '/admin/user')}>
              {intl.formatMessage({
                id: 'pages.settings.users.goto',
                defaultMessage: '前往用户管理',
              })}
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: 'roles',
      label: intl.formatMessage({ id: 'pages.settings.roles', defaultMessage: '角色权限' }),
      icon: <SafetyOutlined />,
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Text type="secondary">
              {intl.formatMessage({
                id: 'pages.settings.roles.tip',
                defaultMessage: '角色权限管理功能请使用顶部导航的"系统管理 -> 角色管理"',
              })}
            </Text>
            <Button onClick={() => (window.location.href = '/admin/role')}>
              {intl.formatMessage({
                id: 'pages.settings.roles.goto',
                defaultMessage: '前往角色管理',
              })}
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: 'system',
      label: intl.formatMessage({ id: 'pages.settings.system', defaultMessage: '系统配置' }),
      icon: <ToolOutlined />,
      children: (
        <Card
          title={intl.formatMessage({
            id: 'pages.settings.system.title',
            defaultMessage: '系统配置',
          })}
        >
          <List
            dataSource={systemConfig}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a key="edit">
                    {intl.formatMessage({ id: 'pages.common.edit', defaultMessage: '编辑' })}
                  </a>,
                ]}
              >
                <List.Item.Meta title={item.label} description={item.value} />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'audit',
      label: intl.formatMessage({ id: 'pages.settings.audit', defaultMessage: '审计日志' }),
      icon: <AuditOutlined />,
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space>
              <Search
                placeholder={intl.formatMessage({
                  id: 'pages.settings.audit.searchUser',
                  defaultMessage: '搜索用户',
                })}
                style={{ width: 200 }}
              />
              <Select
                placeholder={intl.formatMessage({
                  id: 'pages.settings.audit.module',
                  defaultMessage: '模块',
                })}
                style={{ width: 150 }}
              />
              <DatePicker.RangePicker />
              <Button type="primary">
                {intl.formatMessage({ id: 'pages.common.search', defaultMessage: '搜索' })}
              </Button>
            </Space>
            <Table
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.settings.title', defaultMessage: '系统设置' }),
        breadcrumb: {},
      }}
    >
      <Tabs defaultActiveKey="users" items={tabItems} />
    </PageContainer>
  );
};

export default Settings;
