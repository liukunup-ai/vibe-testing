import { Form, Input, Modal, message, Select, InputNumber } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { updateDevice } from '@/services/backend/device';

interface UpdateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: Partial<API.Device>;
}

const UpdateForm = ({ visible, onCancel, onSuccess, initialValues }: UpdateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<API.Device>();
  const intl = useIntl();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      if (!values.id) {
        throw new Error('Record ID not found during update operation');
      }
      await updateDevice({ id: values.id }, values as API.DeviceRequest);
      message.success(
        intl.formatMessage({ id: 'pages.common.update.success', defaultMessage: '更新成功' }),
      );
      form.resetFields();
      onSuccess();
    } catch (error) {
      const msg = intl.formatMessage({
        id: 'pages.common.update.failure',
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
    onCancel();
  };

  return (
    <Modal
      title={
        <FormattedMessage
          id="pages.testing.device.modal.updateForm.title"
          defaultMessage="更新设备"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" className="update-device-form">
        <Form.Item name="id" label="ID" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="deviceNo"
          label={
            <FormattedMessage id="pages.testing.device.key.deviceNo" defaultMessage="设备编号" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.device.form.deviceNo.required',
                defaultMessage: '设备编号不能为空',
              }),
            },
            {
              max: 50,
              message: intl.formatMessage({
                id: 'pages.testing.device.form.deviceNo.maxlen',
                defaultMessage: '设备编号不能超过50个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.deviceNo.placeholder',
              defaultMessage: '请输入设备编号',
            })}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={<FormattedMessage id="pages.testing.device.key.name" defaultMessage="设备名称" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.device.form.name.required',
                defaultMessage: '设备名称不能为空',
              }),
            },
            {
              max: 100,
              message: intl.formatMessage({
                id: 'pages.testing.device.form.name.maxlen',
                defaultMessage: '设备名称不能超过100个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.name.placeholder',
              defaultMessage: '请输入设备名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="deviceType"
          label={
            <FormattedMessage id="pages.testing.device.key.deviceType" defaultMessage="设备类型" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.device.form.deviceType.required',
                defaultMessage: '设备类型不能为空',
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.deviceType.placeholder',
              defaultMessage: '请选择设备类型',
            })}
          >
            <Select.Option value="android">Android</Select.Option>
            <Select.Option value="ios">iOS</Select.Option>
            <Select.Option value="browser">Browser</Select.Option>
            <Select.Option value="windows">Windows</Select.Option>
            <Select.Option value="macos">macOS</Select.Option>
            <Select.Option value="linux">Linux</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="platform"
          label={<FormattedMessage id="pages.testing.device.key.platform" defaultMessage="平台" />}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.platform.placeholder',
              defaultMessage: '请选择平台',
            })}
            allowClear
          >
            <Select.Option value="android">Android</Select.Option>
            <Select.Option value="ios">iOS</Select.Option>
            <Select.Option value="windows">Windows</Select.Option>
            <Select.Option value="macos">macOS</Select.Option>
            <Select.Option value="linux">Linux</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="deviceModel"
          label={
            <FormattedMessage id="pages.testing.device.key.deviceModel" defaultMessage="型号" />
          }
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.deviceModel.placeholder',
              defaultMessage: '请输入设备型号',
            })}
          />
        </Form.Item>

        <Form.Item
          name="osVersion"
          label={
            <FormattedMessage id="pages.testing.device.key.osVersion" defaultMessage="系统版本" />
          }
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.osVersion.placeholder',
              defaultMessage: '请输入系统版本',
            })}
          />
        </Form.Item>

        <Form.Item
          name="screenSize"
          label={
            <FormattedMessage id="pages.testing.device.key.screenSize" defaultMessage="屏幕尺寸" />
          }
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.screenSize.placeholder',
              defaultMessage: '请输入屏幕尺寸',
            })}
          />
        </Form.Item>

        <Form.Item
          name="screenDpi"
          label={
            <FormattedMessage id="pages.testing.device.key.screenDpi" defaultMessage="屏幕DPI" />
          }
        >
          <InputNumber
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.screenDpi.placeholder',
              defaultMessage: '请输入屏幕DPI',
            })}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="udid"
          label={<FormattedMessage id="pages.testing.device.key.udid" defaultMessage="UDID" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.udid.placeholder',
              defaultMessage: '请输入UDID',
            })}
          />
        </Form.Item>

        <Form.Item
          name="ipAddress"
          label={
            <FormattedMessage id="pages.testing.device.key.ipAddress" defaultMessage="IP地址" />
          }
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.ipAddress.placeholder',
              defaultMessage: '请输入IP地址',
            })}
          />
        </Form.Item>

        <Form.Item
          name="port"
          label={<FormattedMessage id="pages.testing.device.key.port" defaultMessage="端口" />}
        >
          <InputNumber
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.port.placeholder',
              defaultMessage: '请输入端口',
            })}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="connectMode"
          label={
            <FormattedMessage id="pages.testing.device.key.connectMode" defaultMessage="连接模式" />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.connectMode.placeholder',
              defaultMessage: '请选择连接模式',
            })}
            allowClear
          >
            <Select.Option value="usb">USB</Select.Option>
            <Select.Option value="network">Network</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="groupId"
          label={<FormattedMessage id="pages.testing.device.key.groupId" defaultMessage="分组ID" />}
        >
          <InputNumber
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.groupId.placeholder',
              defaultMessage: '请输入分组ID',
            })}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label={<FormattedMessage id="pages.testing.device.key.tags" defaultMessage="标签" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.device.form.tags.placeholder',
              defaultMessage: '请输入标签，多个用逗号分隔',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
