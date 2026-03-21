import { Select, Form, Input, Modal, message, InputNumber, Button, Space } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { updateModel, testConnection } from '@/services/backend/model';

const PROVIDER_PRESETS = [
  { value: 1, label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { value: 2, label: 'Azure', baseUrl: 'https://{your-resource}.openai.azure.com' },
  { value: 3, label: 'Ollama', baseUrl: 'http://localhost:11434' },
  { value: 4, label: 'LMStudio', baseUrl: 'http://localhost:1234/v1' },
  { value: 5, label: 'vLLM', baseUrl: 'http://localhost:8000/v1' },
  { value: 6, label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { value: 7, label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1' },
];

interface UpdateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: API.Model;
}

const UpdateForm = ({ visible, onCancel, onSuccess, initialValues }: UpdateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [form] = useForm<API.ModelRequest>();
  const intl = useIntl();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleProviderChange = (provider: number) => {
    const preset = PROVIDER_PRESETS.find(p => p.value === provider);
    if (preset) {
      form.setFieldsValue({ baseUrl: preset.baseUrl });
    }
  };

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields(['provider', 'baseUrl', 'apiKey']);
      setTestingConnection(true);
      const response = await testConnection({
        provider: String(values.provider),
        baseUrl: values.baseUrl,
        apiKey: values.apiKey,
      });
      if (response.success) {
        message.success(intl.formatMessage({ id: 'pages.admin.model.testConnection.success', defaultMessage: '连接成功' }));
      } else {
        message.error(response.errorMessage || intl.formatMessage({ id: 'pages.admin.model.testConnection.failure', defaultMessage: '连接失败' }));
      }
    } catch (error) {
    } finally {
      setTestingConnection(false);
    }
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      if (!initialValues?.id) {
        throw new Error('Record ID not found during update operation');
      }
      const submitValues: API.ModelRequest = {
        ...values,
      };
      if (!submitValues.apiKey) {
        delete submitValues.apiKey;
      }
      await updateModel({ id: initialValues.id }, submitValues);
      message.success(intl.formatMessage({ id: 'pages.common.update.success', defaultMessage: '更新成功' }));
      form.resetFields();
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
    onCancel();
  };

  return (
    <Modal
      title={<FormattedMessage id="pages.admin.model.modal.updateForm.title" defaultMessage="编辑模型" />}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden={true}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        className="update-model-form"
      >
        <Form.Item name="id" label="ID" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="provider"
          label={<FormattedMessage id="pages.admin.model.key.provider" defaultMessage="模型提供者" />}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.admin.model.form.provider.required', defaultMessage: '请选择模型提供者' }) },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({ id: 'pages.admin.model.form.provider.placeholder', defaultMessage: '请选择模型提供者' })}
            onChange={handleProviderChange}
            options={PROVIDER_PRESETS.map(p => ({ value: p.value, label: p.label }))}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={<FormattedMessage id="pages.admin.model.key.name" defaultMessage="模型名称" />}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.admin.model.form.name.required', defaultMessage: '请输入模型名称' }) },
            { max: 100, message: intl.formatMessage({ id: 'pages.admin.model.form.name.maxlen', defaultMessage: '模型名称不能超过100个字符' }) },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'pages.admin.model.form.name.placeholder', defaultMessage: '请输入模型名称，如 GPT-4' })} />
        </Form.Item>

        <Form.Item
          name="baseUrl"
          label={<FormattedMessage id="pages.admin.model.key.baseUrl" defaultMessage="API 地址" />}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.admin.model.form.baseUrl.required', defaultMessage: '请输入 API 地址' }) },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'pages.admin.model.form.baseUrl.placeholder', defaultMessage: '请输入 API 地址' })} />
        </Form.Item>

        <Form.Item
          name="modelId"
          label={<FormattedMessage id="pages.admin.model.key.modelId" defaultMessage="模型 ID" />}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.admin.model.form.modelId.required', defaultMessage: '请输入模型 ID' }) },
            { max: 100, message: intl.formatMessage({ id: 'pages.admin.model.form.modelId.maxlen', defaultMessage: '模型 ID 不能超过100个字符' }) },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'pages.admin.model.form.modelId.placeholder', defaultMessage: '请输入模型 ID，如 gpt-4、claude-3-opus' })} />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label={<FormattedMessage id="pages.admin.model.key.apiKey" defaultMessage="API 密钥" />}
          tooltip={<FormattedMessage id="pages.admin.model.form.apiKey.tooltip" defaultMessage="留空则保持原密钥不变" />}
        >
          <Input.Password
            placeholder={intl.formatMessage({ id: 'pages.admin.model.form.apiKey.updatePlaceholder', defaultMessage: '输入以更新密钥' })}
            allowClear
          />
        </Form.Item>

        <Space style={{ marginBottom: 16 }}>
          <Button
            onClick={handleTestConnection}
            loading={testingConnection}
          >
            <FormattedMessage id="pages.admin.model.button.testConnection" defaultMessage="测试连接" />
          </Button>
        </Space>

        <Form.Item
          name="timeout"
          label={<FormattedMessage id="pages.admin.model.key.timeout" defaultMessage="超时时间(秒)" />}
        >
          <InputNumber min={1} max={300} style={{ width: '100%' }} placeholder="60" />
        </Form.Item>

        <Form.Item
          name="maxRetries"
          label={<FormattedMessage id="pages.admin.model.key.maxRetries" defaultMessage="最大重试次数" />}
        >
          <InputNumber min={0} max={10} style={{ width: '100%' }} placeholder="3" />
        </Form.Item>

        <Form.Item
          name="rateLimit"
          label={<FormattedMessage id="pages.admin.model.key.rateLimit" defaultMessage="速率限制(请求/分钟)" />}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="0 = 无限制" />
        </Form.Item>

        <Form.Item
          name="headers"
          label={<FormattedMessage id="pages.admin.model.key.headers" defaultMessage="自定义请求头" />}
          tooltip={intl.formatMessage({ id: 'pages.admin.model.form.headers.tooltip', defaultMessage: 'JSON 格式' })}
        >
          <Input.TextArea
            placeholder='{"X-Custom-Header": "value"}'
            rows={2}
          />
        </Form.Item>

        <Form.Item
          name="temperature"
          label={<FormattedMessage id="pages.admin.model.key.temperature" defaultMessage="温度参数" />}
        >
          <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} placeholder="0.7" />
        </Form.Item>

        <Form.Item
          name="topP"
          label={<FormattedMessage id="pages.admin.model.key.topP" defaultMessage="Top P 参数" />}
        >
          <InputNumber min={0} max={1} step={0.05} style={{ width: '100%' }} placeholder="1.0" />
        </Form.Item>

        <Form.Item
          name="maxTokens"
          label={<FormattedMessage id="pages.admin.model.key.maxTokens" defaultMessage="最大 Token 数" />}
        >
          <InputNumber min={1} max={100000} style={{ width: '100%' }} placeholder="4096" />
        </Form.Item>

        <Form.Item
          name="topK"
          label={<FormattedMessage id="pages.admin.model.key.topK" defaultMessage="Top K 参数" />}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="0 = 无限制" />
        </Form.Item>

        <Form.Item
          name="frequencyPenalty"
          label={<FormattedMessage id="pages.admin.model.key.frequencyPenalty" defaultMessage="频率惩罚" />}
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
        </Form.Item>

        <Form.Item
          name="presencePenalty"
          label={<FormattedMessage id="pages.admin.model.key.presencePenalty" defaultMessage="存在惩罚" />}
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
