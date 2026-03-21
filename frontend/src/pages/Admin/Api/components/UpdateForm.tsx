import { Form, Input, Modal, message, Select, Spin, Tag } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { updateApi, getAdminApisIdRoles, putAdminApisIdRoles } from '@/services/backend/api';
import { listRoles } from '@/services/backend/role';
interface UpdateFormProps {
  visible: boolean; // 弹窗是否可见
  onCancel: () => void; // 取消回调
  onSuccess: () => void; // 成功回调
  initialValues?: Partial<API.Api>; // 初始值
}
const UpdateForm = ({ visible, onCancel, onSuccess, initialValues }: UpdateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<API.Api>();
  const intl = useIntl();
  const [roleOptions, setRoleOptions] = useState<API.Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // 加载所有角色
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await listRoles({ page: 1, pageSize: 1000 });
        if (response.data?.list) {
          setRoleOptions(response.data.list);
        }
      } catch (error) {
        // ignore
      }
    };
    loadRoles();
  }, []);

  // 当 visible 变化时，加载已授权的角色
  useEffect(() => {
    if (visible && initialValues?.id) {
      form.setFieldsValue(initialValues);
      setLoadingRoles(true);
      getAdminApisIdRoles({ id: initialValues.id })
        .then((response) => {
          if (response?.data) {
            setSelectedRoles(response.data.roleIds || []);
          }
        })
        .finally(() => {
          setLoadingRoles(false);
        });
    } else if (!visible) {
      setSelectedRoles([]);
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      if (!values.id) {
        throw new Error('更新操作时未找到记录ID');
      }
      await updateApi({ id: values.id }, values as API.ApiRequest);
      message.success(
        intl.formatMessage({
          id: 'pages.common.object.update.success',
          defaultMessage: '更新成功',
        }),
      );
      // 更新角色授权
      await putAdminApisIdRoles({ id: values.id }, { roleIds: selectedRoles });
      form.resetFields();
      setSelectedRoles([]);
      onSuccess();
    } catch (error) {
      const msg = intl.formatMessage({
        id: 'pages.common.object.update.failed',
        defaultMessage: '更新失败',
      });
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
    setSelectedRoles([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <FormattedMessage id="pages.admin.api.modal.updateForm.title" defaultMessage="更新接口" />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" className="update-api-form">
        <Form.Item name="id" label="ID" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="group"
          label={<FormattedMessage id="pages.admin.api.key.group" defaultMessage="分组" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.api.form.group.required',
                defaultMessage: '请输入分组',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.api.form.group.placeholder',
              defaultMessage: '请输入分组',
            })}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={<FormattedMessage id="pages.admin.api.key.name" defaultMessage="名称" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.api.form.name.required',
                defaultMessage: '请输入名称',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.api.form.name.placeholder',
              defaultMessage: '请输入名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="path"
          label={<FormattedMessage id="pages.admin.api.key.path" defaultMessage="路径" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.api.form.path.required',
                defaultMessage: '请输入路径',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.api.form.path.placeholder',
              defaultMessage: '请输入路径',
            })}
          />
        </Form.Item>

        <Form.Item
          name="method"
          label={<FormattedMessage id="pages.admin.api.key.method" defaultMessage="方法" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.api.form.method.required',
                defaultMessage: '请输入方法',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.api.form.method.placeholder',
              defaultMessage: '请输入方法',
            })}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="pages.admin.api.key.roles" defaultMessage="授权角色" />}
        >
          <Spin spinning={loadingRoles}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({ id: 'pages.admin.api.form.roles.placeholder', defaultMessage: '请选择授权角色' })}
              value={selectedRoles}
              onChange={setSelectedRoles}
              optionRender={(option) => (
                <span>
                  <Tag color="blue">{option.data.label}</Tag>
                </span>
              )}
              options={roleOptions.map((r) => ({ label: r.name, value: r.id }))}
            />
          </Spin>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
