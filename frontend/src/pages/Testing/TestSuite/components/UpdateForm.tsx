import { Select, Form, Input, Modal, InputNumber, Switch, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect } from 'react';
import { updateTestSuite } from '@/services/backend/testsuite';
import { listProjects } from '@/services/backend/project';

interface UpdateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: Partial<API.TestSuite>;
}

const UpdateForm = ({ visible, onCancel, onSuccess, initialValues }: UpdateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<API.Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [form] = useForm<API.TestSuite>();
  const intl = useIntl();

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectLoading(true);
      try {
        const response = await listProjects({ page: 1, pageSize: 1000 });
        if (response.success) {
          setProjects(response.data?.list || []);
        }
      } catch (error) {
        const msg = intl.formatMessage({
          id: 'pages.testing.testsuite.fetchProjects.failure',
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

    if (visible) {
      fetchProjects();
    }
  }, [visible]);

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
      await updateTestSuite({ id: values.id }, values as API.TestSuiteRequest);
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
          id="pages.testing.testsuite.modal.updateForm.title"
          defaultMessage="更新测试套件"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" className="update-testsuite-form">
        <Form.Item name="id" label="ID" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="projectId"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.projectId"
              defaultMessage="所属项目"
            />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testsuite.form.projectId.required',
                defaultMessage: '请选择所属项目',
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.projectId.placeholder',
              defaultMessage: '请选择所属项目',
            })}
            loading={projectLoading}
            style={{ width: '100%' }}
          >
            {projects.map((p) => (
              <Select.Option key={p.id} value={p.id!}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <FormattedMessage id="pages.testing.testsuite.key.name" defaultMessage="套件名称" />
          }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.testsuite.form.name.required',
                defaultMessage: '套件名称不能为空',
              }),
            },
            {
              max: 100,
              message: intl.formatMessage({
                id: 'pages.testing.testsuite.form.name.maxlen',
                defaultMessage: '套件名称不能超过100个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.name.placeholder',
              defaultMessage: '请输入套件名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <FormattedMessage id="pages.testing.testsuite.key.description" defaultMessage="描述" />
          }
        >
          <Input.TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.description.placeholder',
              defaultMessage: '请输入描述',
            })}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="suiteType"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.suiteType"
              defaultMessage="套件类型"
            />
          }
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.suiteType.placeholder',
              defaultMessage: '请选择套件类型',
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value="static">
              <FormattedMessage
                id="pages.testing.testsuite.suiteType.static"
                defaultMessage="静态"
              />
            </Select.Option>
            <Select.Option value="dynamic">
              <FormattedMessage
                id="pages.testing.testsuite.suiteType.dynamic"
                defaultMessage="动态"
              />
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="caseIds"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.caseIds"
              defaultMessage="用例ID列表"
            />
          }
          tooltip={
            <FormattedMessage
              id="pages.testing.testsuite.key.caseIds.tooltip"
              defaultMessage="静态套件专用，JSON数组格式，如: [1,2,3]"
            />
          }
        >
          <Input.TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.caseIds.placeholder',
              defaultMessage: '请输入JSON数组，如: [1,2,3]',
            })}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="filterRule"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.filterRule"
              defaultMessage="过滤规则"
            />
          }
          tooltip={
            <FormattedMessage
              id="pages.testing.testsuite.key.filterRule.tooltip"
              defaultMessage="动态套件专用，JSON格式的过滤条件"
            />
          }
        >
          <Input.TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.filterRule.placeholder',
              defaultMessage: '请输入JSON格式的过滤规则',
            })}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="parallelism"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.parallelism"
              defaultMessage="并行数"
            />
          }
        >
          <InputNumber
            min={1}
            max={100}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.parallelism.placeholder',
              defaultMessage: '请输入并行数',
            })}
          />
        </Form.Item>

        <Form.Item
          name="timeout"
          label={
            <FormattedMessage id="pages.testing.testsuite.key.timeout" defaultMessage="超时时间" />
          }
          tooltip={
            <FormattedMessage
              id="pages.testing.testsuite.key.timeout.tooltip"
              defaultMessage="单位：秒"
            />
          }
        >
          <InputNumber
            min={1}
            max={3600}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.timeout.placeholder',
              defaultMessage: '请输入超时时间（秒）',
            })}
          />
        </Form.Item>

        <Form.Item
          name="retryCount"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.retryCount"
              defaultMessage="重试次数"
            />
          }
        >
          <InputNumber
            min={0}
            max={10}
            style={{ width: '100%' }}
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.retryCount.placeholder',
              defaultMessage: '请输入重试次数',
            })}
          />
        </Form.Item>

        <Form.Item
          name="continueOnFail"
          label={
            <FormattedMessage
              id="pages.testing.testsuite.key.continueOnFail"
              defaultMessage="失败后继续"
            />
          }
          valuePropName="checked"
        >
          <Switch
            checkedChildren={<FormattedMessage id="pages.common.yes" defaultMessage="是" />}
            unCheckedChildren={<FormattedMessage id="pages.common.no" defaultMessage="否" />}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={<FormattedMessage id="pages.testing.testsuite.key.status" defaultMessage="状态" />}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.testsuite.form.status.placeholder',
              defaultMessage: '请选择状态',
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value={0}>
              <FormattedMessage
                id="pages.testing.testsuite.status.inactive"
                defaultMessage="未激活"
              />
            </Select.Option>
            <Select.Option value={1}>
              <FormattedMessage
                id="pages.testing.testsuite.status.active"
                defaultMessage="已激活"
              />
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
