import { Select, Form, Input, Modal, message, InputNumber } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState } from 'react';
import { createTestCase } from '@/services/backend/testCase';

const { TextArea } = Input;

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  projectOptions: API.Project[];
  projectLoading: boolean;
}

const CreateForm = ({
  visible,
  onCancel,
  onSuccess,
  projectOptions,
  projectLoading,
}: CreateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<API.TestCaseRequest>();
  const intl = useIntl();

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await createTestCase(values as API.TestCaseRequest);
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
          id="pages.testing.testcase.modal.createForm.title"
          defaultMessage="新建测试用例"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" className="create-testcase-form">
        <Form.Item
          name="projectId"
          label={
            <FormattedMessage id="pages.testing.testcase.key.projectId" defaultMessage="项目" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testcase.form.projectId.required',
                defaultMessage: '请选择项目',
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.projectId.placeholder',
              defaultMessage: '请选择项目',
            })}
            loading={projectLoading}
            style={{ width: '100%' }}
          >
            {projectOptions.map((p) => (
              <Select.Option key={p.id} value={p.id as number}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label={<FormattedMessage id="pages.testing.testcase.key.title" defaultMessage="标题" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testcase.form.title.required',
                defaultMessage: '标题不能为空',
              }),
            },
            {
              max: 100,
              message: intl.formatMessage({
                id: 'pages.testing.testcase.form.title.maxlen',
                defaultMessage: '标题不能超过100个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.title.placeholder',
              defaultMessage: '请输入标题',
            })}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <FormattedMessage id="pages.testing.testcase.key.description" defaultMessage="描述" />
          }
        >
          <TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.description.placeholder',
              defaultMessage: '请输入描述',
            })}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label={
            <FormattedMessage id="pages.testing.testcase.key.priority" defaultMessage="优先级" />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.priority.placeholder',
              defaultMessage: '请选择优先级',
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value={0}>
              <FormattedMessage id="pages.testing.testcase.priority.low" defaultMessage="低" />
            </Select.Option>
            <Select.Option value={1}>
              <FormattedMessage id="pages.testing.testcase.priority.medium" defaultMessage="中" />
            </Select.Option>
            <Select.Option value={2}>
              <FormattedMessage id="pages.testing.testcase.priority.high" defaultMessage="高" />
            </Select.Option>
            <Select.Option value={3}>
              <FormattedMessage
                id="pages.testing.testcase.priority.critical"
                defaultMessage="紧急"
              />
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="caseType"
          label={
            <FormattedMessage id="pages.testing.testcase.key.caseType" defaultMessage="用例类型" />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.caseType.placeholder',
              defaultMessage: '请选择用例类型',
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value="functional">
              <FormattedMessage
                id="pages.testing.testcase.caseType.functional"
                defaultMessage="功能测试"
              />
            </Select.Option>
            <Select.Option value="performance">
              <FormattedMessage
                id="pages.testing.testcase.caseType.performance"
                defaultMessage="性能测试"
              />
            </Select.Option>
            <Select.Option value="security">
              <FormattedMessage
                id="pages.testing.testcase.caseType.security"
                defaultMessage="安全测试"
              />
            </Select.Option>
            <Select.Option value="compatibility">
              <FormattedMessage
                id="pages.testing.testcase.caseType.compatibility"
                defaultMessage="兼容性测试"
              />
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="module"
          label={<FormattedMessage id="pages.testing.testcase.key.module" defaultMessage="模块" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.module.placeholder',
              defaultMessage: '请输入模块',
            })}
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label={<FormattedMessage id="pages.testing.testcase.key.tags" defaultMessage="标签" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.tags.placeholder',
              defaultMessage: '请输入标签，多个用逗号分隔',
            })}
          />
        </Form.Item>

        <Form.Item
          name="requirementId"
          label={
            <FormattedMessage
              id="pages.testing.testcase.key.requirementId"
              defaultMessage="需求ID"
            />
          }
        >
          <InputNumber
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.requirementId.placeholder',
              defaultMessage: '请输入需求ID',
            })}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="stepsData"
          label={
            <FormattedMessage id="pages.testing.testcase.key.stepsData" defaultMessage="步骤数据" />
          }
        >
          <TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.stepsData.placeholder',
              defaultMessage: '请输入步骤数据',
            })}
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={<FormattedMessage id="pages.testing.testcase.key.status" defaultMessage="状态" />}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testcase.form.status.placeholder',
              defaultMessage: '请选择状态',
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value={0}>
              <FormattedMessage id="pages.testing.testcase.status.draft" defaultMessage="草稿" />
            </Select.Option>
            <Select.Option value={1}>
              <FormattedMessage
                id="pages.testing.testcase.status.reviewing"
                defaultMessage="审核中"
              />
            </Select.Option>
            <Select.Option value={2}>
              <FormattedMessage id="pages.testing.testcase.status.active" defaultMessage="启用" />
            </Select.Option>
            <Select.Option value={3}>
              <FormattedMessage
                id="pages.testing.testcase.status.deprecated"
                defaultMessage="废弃"
              />
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
