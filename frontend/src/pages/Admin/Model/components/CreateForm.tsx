import {
  Select,
  Form,
  Input,
  Modal,
  message,
  InputNumber,
  Slider,
  Divider,
  Button,
} from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { createModel, testConnection } from '@/services/backend/model';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Provider base URL presets
const PROVIDER_BASE_URLS: Record<string, string> = {
  OpenAI: 'https://api.openai.com/v1',
  Azure: 'https://{resource}.openai.azure.com/',
  Ollama: 'http://localhost:11434/v1',
  LMStudio: 'http://localhost:1234/v1',
  vLLM: 'http://localhost:8000/v1',
  Groq: 'https://api.groq.com/openai/v1',
  Anthropic: 'https://api.anthropic.com',
};

const PROVIDERS = [
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'Azure', label: 'Azure' },
  { value: 'Ollama', label: 'Ollama' },
  { value: 'LMStudio', label: 'LMStudio' },
  { value: 'vLLM', label: 'vLLM' },
  { value: 'Groq', label: 'Groq' },
  { value: 'Anthropic', label: 'Anthropic' },
];

const CreateForm = ({ visible, onCancel, onSuccess }: CreateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form] = useForm();
  const intl = useIntl();

  // Auto-fill base URL when provider changes
  const handleProviderChange = (value: string) => {
    const preset = PROVIDER_BASE_URLS[value];
    if (preset) {
      form.setFieldValue('baseUrl', preset);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields([
        'provider',
        'baseUrl',
        'apiKey',
        'modelId',
      ]);
      setTesting(true);
      const response = await testConnection({
        provider: values.provider,
        baseUrl: values.baseUrl,
        apiKey: values.apiKey,
      });
      if (response.success) {
        message.success(
          intl.formatMessage({
            id: 'pages.admin.model.testConnection.success',
            defaultMessage: '连接测试成功',
          }),
        );
      } else {
        message.error(
          response.errorMessage ||
            intl.formatMessage({
              id: 'pages.admin.model.testConnection.failure',
              defaultMessage: '连接测试失败',
            }),
        );
      }
    } catch (error) {
      const msg = intl.formatMessage({
        id: 'pages.admin.model.testConnection.failure',
        defaultMessage: '连接测试失败',
      });
      if (error instanceof Error) {
        message.error(error.message || msg);
      } else {
        message.error(msg);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      // Prepare request payload, excluding undefined/empty optional fields
      const payload: Record<string, any> = {
        provider: values.provider,
        name: values.name,
        baseUrl: values.baseUrl,
        modelId: values.modelId,
        apiKey: values.apiKey,
        timeout: values.timeout ?? 30,
        maxRetries: values.maxRetries ?? 3,
        rateLimit: values.rateLimit ?? 0,
        temperature: values.temperature ?? 0.7,
        topP: values.topP ?? 1.0,
        maxTokens: values.maxTokens ?? 4096,
        topK: values.topK ?? 0,
        frequencyPenalty: values.frequencyPenalty ?? 0,
        presencePenalty: values.presencePenalty ?? 0,
      };
      // Optional fields
      if (values.headers) {
        try {
          payload.headers = JSON.parse(values.headers);
        } catch {
          message.warning(
            intl.formatMessage({
              id: 'pages.admin.model.form.headers.invalid',
              defaultMessage: 'Headers 必须是有效的 JSON 格式',
            }),
          );
          setLoading(false);
          return;
        }
      }
      await createModel(payload as API.ModelRequest);
      message.success(
        intl.formatMessage({
          id: 'pages.common.new.success',
          defaultMessage: '新建成功',
        }),
      );
      form.resetFields();
      onSuccess();
    } catch (error) {
      const msg = intl.formatMessage({
        id: 'pages.common.new.failure',
        defaultMessage: '新建失败',
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
          id="pages.admin.model.modal.createForm.title"
          defaultMessage="新建模型"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="create-model-form">
        {/* Basic Info */}
        <Form.Item
          name="provider"
          label={
            <FormattedMessage
              id="pages.admin.model.key.provider"
              defaultMessage="提供商"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.model.form.provider.required',
                defaultMessage: '请选择提供商',
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.admin.model.form.provider.placeholder',
              defaultMessage: '请选择提供商',
            })}
            options={PROVIDERS}
            onChange={handleProviderChange}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <FormattedMessage
              id="pages.admin.model.key.name"
              defaultMessage="名称"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.model.form.name.required',
                defaultMessage: '名称不能为空',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.model.form.name.placeholder',
              defaultMessage: '请输入模型名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="baseUrl"
          label={
            <FormattedMessage
              id="pages.admin.model.key.baseUrl"
              defaultMessage="基础 URL"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.model.form.baseUrl.required',
                defaultMessage: '基础 URL 不能为空',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.model.form.baseURL.placeholder',
              defaultMessage: '请输入 API 基础 URL',
            })}
          />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label={
            <FormattedMessage
              id="pages.admin.model.key.apiKey"
              defaultMessage="API Key"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.model.form.apiKey.required',
                defaultMessage: 'API Key 不能为空',
              }),
            },
          ]}
        >
          <Input.Password
            placeholder={intl.formatMessage({
              id: 'pages.admin.model.form.apiKey.placeholder',
              defaultMessage: '请输入 API Key',
            })}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="modelId"
          label={
            <FormattedMessage
              id="pages.admin.model.key.modelId"
              defaultMessage="模型 ID"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.admin.model.form.modelId.required',
                defaultMessage: '模型 ID 不能为空',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.admin.model.form.modelId.placeholder',
              defaultMessage: '例如: gpt-4o, claude-3-opus',
            })}
          />
        </Form.Item>

        <Divider>
          <FormattedMessage
            id="pages.admin.model.form.section.connection"
            defaultMessage="连接配置"
          />
        </Divider>

        <Form.Item
          name="timeout"
          label={
            <FormattedMessage
              id="pages.admin.model.key.timeout"
              defaultMessage="超时 (秒)"
            />
          }
          initialValue={30}
        >
          <InputNumber min={1} max={300} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maxRetries"
          label={
            <FormattedMessage
              id="pages.admin.model.key.maxRetries"
              defaultMessage="最大重试次数"
            />
          }
          initialValue={3}
        >
          <InputNumber min={0} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="rateLimit"
          label={
            <FormattedMessage
              id="pages.admin.model.key.rateLimit"
              defaultMessage="速率限制 (请求/分钟)"
            />
          }
          initialValue={0}
          extra={
            <FormattedMessage
              id="pages.admin.model.form.rateLimit.extra"
              defaultMessage="0 表示不限制"
            />
          }
        >
          <InputNumber min={0} max={10000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="headers"
          label={
            <FormattedMessage
              id="pages.admin.model.key.headers"
              defaultMessage="自定义请求头 (JSON)"
            />
          }
        >
          <Input.TextArea
            placeholder='{"X-Custom-Header": "value"}'
            rows={3}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Divider>
          <FormattedMessage
            id="pages.admin.model.form.section.generation"
            defaultMessage="生成参数"
          />
        </Divider>

        <Form.Item
          name="temperature"
          label={
            <FormattedMessage
              id="pages.admin.model.key.temperature"
              defaultMessage="Temperature"
            />
          }
          initialValue={0.7}
        >
          <Slider min={0} max={2} step={0.1} marks={{ 0: '0', 1: '1', 2: '2' }} />
        </Form.Item>

        <Form.Item
          name="topP"
          label={
            <FormattedMessage id="pages.admin.model.key.topP" defaultMessage="Top P" />
          }
          initialValue={1.0}
        >
          <Slider min={0} max={1} step={0.05} marks={{ 0: '0', 0.5: '0.5', 1: '1' }} />
        </Form.Item>

        <Form.Item
          name="maxTokens"
          label={
            <FormattedMessage
              id="pages.admin.model.key.maxTokens"
              defaultMessage="最大 Tokens"
            />
          }
          initialValue={4096}
        >
          <InputNumber min={1} max={100000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="topK"
          label={
            <FormattedMessage id="pages.admin.model.key.topK" defaultMessage="Top K" />
          }
          initialValue={0}
          extra={
            <FormattedMessage
              id="pages.admin.model.form.topK.extra"
              defaultMessage="0 表示使用默认值"
            />
          }
        >
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="frequencyPenalty"
          label={
            <FormattedMessage
              id="pages.admin.model.key.frequencyPenalty"
              defaultMessage="频率惩罚"
            />
          }
          initialValue={0}
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="presencePenalty"
          label={
            <FormattedMessage
              id="pages.admin.model.key.presencePenalty"
              defaultMessage="存在惩罚"
            />
          }
          initialValue={0}
        >
          <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} />
        </Form.Item>

        <Divider />

        <Button
          onClick={handleTestConnection}
          loading={testing}
          disabled={testing}
          block
        >
          <FormattedMessage
            id="pages.admin.model.form.testConnection"
            defaultMessage="测试连接"
          />
        </Button>
      </Form>
    </Modal>
  );
};

export default CreateForm;
