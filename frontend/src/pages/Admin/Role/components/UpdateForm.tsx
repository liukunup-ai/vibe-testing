import { Form, Input, Modal, message, Tabs, Tree, Spin, Space, Select, Tag } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect, useMemo } from 'react';
import { updateRole, getAdminRolesIdApis, putAdminRolesIdApis } from '@/services/backend/role';
import { listApis } from '@/services/backend/api';
import type { DataNode } from 'antd/es/tree';
import { SearchOutlined } from '@ant-design/icons';

interface UpdateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: Partial<API.Role>;
}

const UpdateForm = ({ visible, onCancel, onSuccess, initialValues }: UpdateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<API.Role>();
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('basic');
  const [apiList, setApiList] = useState<API.Api[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [loadingApis, setLoadingApis] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // 加载所有接口
  useEffect(() => {
    const loadApis = async () => {
      try {
        const response = await listApis({ page: 1, pageSize: 100 });
        if (response.data?.list) {
          setApiList(response.data.list);
        }
      } catch (error) {
        // ignore
      }
    };
    loadApis();
  }, []);

  // 当 visible 变化时，加载已授权的接口
  useEffect(() => {
    if (visible && initialValues?.id) {
      form.setFieldsValue(initialValues);
      setLoadingApis(true);
      getAdminRolesIdApis({ id: initialValues.id })
        .then((response) => {
          if (response) {
            setCheckedKeys(response.apiIds || []);
          }
        })
    } else if (!visible) {
      setCheckedKeys([]);
      setActiveTab('basic');
    }
  }, [visible, initialValues, form]);

  const getMethodColor = (method?: string) => {
    switch (method) {
      case 'GET':
        return 'green';
      case 'POST':
        return 'blue';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      default:
        return 'default';
    }
  };

  // 构建树形数据
  const treeData = useMemo((): DataNode[] => {
    const groupedApis: Record<string, API.Api[]> = {};
    apiList.forEach((api) => {
      // 应用搜索和方法筛选
      if (searchText) {
        const search = searchText.toLowerCase();
        if (
          !api.name?.toLowerCase().includes(search) &&
          !api.path?.toLowerCase().includes(search)
        ) {
          return;
        }
      }
      if (methodFilter !== 'ALL' && api.method !== methodFilter) {
        return;
      }

      const group = api.group || '未分组';
      if (!groupedApis[group]) {
        groupedApis[group] = [];
      }
      groupedApis[group].push(api);
    });

    // 转换为树形结构
    return Object.entries(groupedApis).map(([group, apis]) => ({
      key: `group-${group}`,
      title: (
        <Space>
          <span>{group}</span>
          <span style={{ color: '#999' }}>({apis.length})</span>
        </Space>
      ),
      children: apis.map((api) => ({
        key: api.id!,
        title: (
          <Space>
            <Tag color={getMethodColor(api.method)}>{api.method}</Tag>
            <span>{api.path}</span>
            <span style={{ color: '#999' }}>{api.name}</span>
          </Space>
        ),
      })),
    }));
  }, [apiList, searchText, methodFilter]);

  // 计算统计信息
  const stats = useMemo(() => {
    const checked = checkedKeys.filter((k) => typeof k === 'number').length;
    return {
      total: apiList.length,
      checked,
    };
  }, [checkedKeys, apiList]);


  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      if (!values.id) {
        throw new Error('Record ID not found during update operation');
      }
      // 更新基本信息
      await updateRole({id: values.id}, values as API.RoleRequest);
      // 更新接口权限
      const apiIds = checkedKeys.filter((k) => typeof k === 'number') as number[];
      await putAdminRolesIdApis({ id: values.id }, { apiIds });
      form.resetFields();
      setCheckedKeys([]);
      onSuccess();
    } catch (error) {
      const msg = intl.formatMessage({ id: 'pages.common.update.failure', defaultMessage: '更新失败' });
      if (error instanceof Error) {
        message.error(error.message || msg);
      } else {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCheckedKeys([]);
    setActiveTab('basic');
    onCancel();
  };

  return (
    <Modal
      title={<FormattedMessage id="pages.admin.role.modal.updateForm.title" defaultMessage="编辑角色" />}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden={true}
      width={700}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'basic',
            label: intl.formatMessage({ id: 'pages.admin.role.tab.basic', defaultMessage: '基本信息' }),
            children: (
              <Form
                form={form}
                layout="vertical"
                className="update-role-form"
              >
                <Form.Item name="id" label="ID" hidden>
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  name="name"
                  label={<FormattedMessage id="pages.admin.role.key.name" defaultMessage="名称" />}
                  rules={[
                    { required: true, message: intl.formatMessage({ id: 'pages.admin.role.form.name.required', defaultMessage: '名称不能为空' }) },
                    { max: 20, message: intl.formatMessage({ id: 'pages.admin.role.form.name.maxlen', defaultMessage: '名称不能超过20个字符' }) },
                  ]}
                >
                  <Input placeholder={intl.formatMessage({ id: 'pages.admin.role.form.name.placeholder', defaultMessage: '请输入角色的名称' })} />
                </Form.Item>

                <Form.Item
                  name="casbinRole"
                  label={<FormattedMessage id="pages.admin.role.key.role" defaultMessage="标识" />}
                  rules={[
                    { required: true, message: intl.formatMessage({ id: 'pages.admin.role.form.role.required', defaultMessage: '标识不能为空' }) },
                    { max: 20, message: intl.formatMessage({ id: 'pages.admin.role.form.role.maxlen', defaultMessage: '标识不能超过20个字符' }) },
                    { pattern: /^[a-zA-Z][a-zA-Z0-9]*$/, message: intl.formatMessage({ id: 'pages.admin.role.form.role.pattern', defaultMessage: '以字母开头，支持字母大小写、数字' }) },
                  ]}
                >
                  <Input placeholder={intl.formatMessage({ id: 'pages.admin.role.form.role.placeholder', defaultMessage: '请输入角色的标识' })} disabled />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'apis',
            label: intl.formatMessage({ id: 'pages.admin.role.tab.apis', defaultMessage: '接口权限' }),
            children: (
              <Spin spinning={loadingApis}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Space>
                    <Input
                      placeholder={intl.formatMessage({ id: 'pages.admin.role.apis.search.placeholder', defaultMessage: '搜索接口名称或路径' })}
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Select
                      value={methodFilter}
                      onChange={setMethodFilter}
                      style={{ width: 100 }}
                      options={[
                        { label: 'ALL', value: 'ALL' },
                        { label: 'GET', value: 'GET' },
                        { label: 'POST', value: 'POST' },
                        { label: 'PUT', value: 'PUT' },
                        { label: 'DELETE', value: 'DELETE' },
                      ]}
                    />
                    <span style={{ color: '#999' }}>
                      {intl.formatMessage(
                        { id: 'pages.admin.role.apis.stats', defaultMessage: '已授权 {checked}/{total} 个接口' },
                        { checked: stats.checked, total: stats.total }
                      )}
                    </span>
                  </Space>
                  <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8 }}>
                    <Tree
                      checkable
                      checkedKeys={checkedKeys}
                      onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
                      treeData={treeData}
                      defaultExpandAll
                    />
                  </div>
                </Space>
              </Spin>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default UpdateForm;
