import { Select, Form, Input, Modal, message, DatePicker, InputNumber } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { createTestPlan } from '@/services/backend/testplan';
import { listProjects } from '@/services/backend/project';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateForm = ({ visible, onCancel, onSuccess }: CreateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<API.Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [form] = useForm<API.TestPlanRequest>();
  const intl = useIntl();

  const fetchProjects = async () => {
    setProjectLoading(true);
    try {
      const response = await listProjects({ page: 1, pageSize: 1000 });
      if (response.success) {
        setProjects(response.data?.list || []);
      }
    } catch (error) {
      const msg = intl.formatMessage({
        id: 'pages.testing.testplan.fetchProjects.failure',
        defaultMessage: '获取项目列表失败',
      });
      if (error instanceof Error) {
        message.error(error.message || msg);
      } else {
        message.error(msg);
      }
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchProjects();
    }
  }, [visible]);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const params: API.TestPlanRequest = {
        ...values,
        expectedStartTime: values.expectedStartTime
          ? new Date(values.expectedStartTime).toISOString()
          : undefined,
        expectedEndTime: values.expectedEndTime
          ? new Date(values.expectedEndTime).toISOString()
          : undefined,
      };
      await createTestPlan(params);
      message.success(
        intl.formatMessage({ id: 'pages.common.new.success', defaultMessage: '新建成功' }),
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
          id="pages.testing.testplan.modal.createForm.title"
          defaultMessage="新建测试计划"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
    >
      <Form form={form} layout="vertical" className="create-testplan-form">
        <Form.Item
          name="projectId"
          label={
            <FormattedMessage id="pages.testing.testplan.key.projectId" defaultMessage="所属项目" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testplan.form.projectId.required',
                defaultMessage: '请选择所属项目',
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.projectId.placeholder',
              defaultMessage: '请选择所属项目',
            })}
            loading={projectLoading}
            showSearch
            optionFilterProp="label"
          >
            {projects.map((p) => (
              <Select.Option key={p.id} value={p.id!} label={p.name}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <FormattedMessage id="pages.testing.testplan.key.name" defaultMessage="计划名称" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testplan.form.name.required',
                defaultMessage: '计划名称不能为空',
              }),
            },
            {
              max: 100,
              message: intl.formatMessage({
                id: 'pages.testing.testplan.form.name.maxlen',
                defaultMessage: '计划名称不能超过100个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.name.placeholder',
              defaultMessage: '请输入计划名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <FormattedMessage id="pages.testing.testplan.key.description" defaultMessage="描述" />
          }
        >
          <TextArea
            rows={3}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.description.placeholder',
              defaultMessage: '请输入描述',
            })}
          />
        </Form.Item>

        <Form.Item
          name="planType"
          label={
            <FormattedMessage id="pages.testing.testplan.key.planType" defaultMessage="计划类型" />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.planType.placeholder',
              defaultMessage: '请选择计划类型',
            })}
          >
            <Select.Option value="manual">
              <FormattedMessage id="pages.testing.testplan.planType.manual" defaultMessage="手动" />
            </Select.Option>
            <Select.Option value="automated">
              <FormattedMessage
                id="pages.testing.testplan.planType.automated"
                defaultMessage="自动"
              />
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="contentData"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.contentData"
              defaultMessage="测试内容(JSON)"
            />
          }
        >
          <TextArea
            rows={4}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.contentData.placeholder',
              defaultMessage: '请输入测试内容(JSON格式)',
            })}
          />
        </Form.Item>

        <Form.Item
          name="triggerType"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.triggerType"
              defaultMessage="触发类型"
            />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.triggerType.placeholder',
              defaultMessage: '请选择触发类型',
            })}
          >
            <Select.Option value="manual">
              <FormattedMessage
                id="pages.testing.testplan.triggerType.manual"
                defaultMessage="手动触发"
              />
            </Select.Option>
            <Select.Option value="scheduled">
              <FormattedMessage
                id="pages.testing.testplan.triggerType.scheduled"
                defaultMessage="定时触发"
              />
            </Select.Option>
            <Select.Option value="api">
              <FormattedMessage
                id="pages.testing.testplan.triggerType.api"
                defaultMessage="API触发"
              />
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="cronExpr"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.cronExpr"
              defaultMessage="Cron表达式"
            />
          }
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.cronExpr.placeholder',
              defaultMessage: '如: 0 0 * * *',
            })}
          />
        </Form.Item>

        <Form.Item
          name="parallelism"
          label={
            <FormattedMessage id="pages.testing.testplan.key.parallelism" defaultMessage="并发数" />
          }
        >
          <InputNumber
            min={1}
            max={100}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.parallelism.placeholder',
              defaultMessage: '请输入并发数',
            })}
          />
        </Form.Item>

        <Form.Item
          name="timeout"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.timeout"
              defaultMessage="超时时间(秒)"
            />
          }
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.timeout.placeholder',
              defaultMessage: '请输入超时时间(秒)',
            })}
          />
        </Form.Item>

        <Form.Item
          name="retryCount"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.retryCount"
              defaultMessage="重试次数"
            />
          }
        >
          <InputNumber
            min={0}
            max={10}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.retryCount.placeholder',
              defaultMessage: '请输入重试次数',
            })}
          />
        </Form.Item>

        <Form.Item
          name="notifyConfig"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.notifyConfig"
              defaultMessage="通知配置(JSON)"
            />
          }
        >
          <TextArea
            rows={3}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testplan.form.notifyConfig.placeholder',
              defaultMessage: '请输入通知配置(JSON格式)',
            })}
          />
        </Form.Item>

        <Form.Item
          name="expectedTime"
          label={
            <FormattedMessage
              id="pages.testing.testplan.key.expectedTime"
              defaultMessage="期望执行时间"
            />
          }
        >
          <RangePicker
            showTime
            style={{ width: '100%' }}
            placeholder={[
              intl.formatMessage({
                id: 'pages.testing.testplan.form.expectedStartTime.placeholder',
                defaultMessage: '期望开始时间',
              }),
              intl.formatMessage({
                id: 'pages.testing.testplan.form.expectedEndTime.placeholder',
                defaultMessage: '期望结束时间',
              }),
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
