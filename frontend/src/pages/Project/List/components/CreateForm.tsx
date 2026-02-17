import { Form, Input, Modal, message, Select } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import { useState } from 'react';
import { createProject } from '@/services/backend/project';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateForm = ({ visible, onCancel, onSuccess }: CreateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<API.ProjectRequest>();
  const intl = useIntl();

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const params = {
        ...values,
        status: 1,
      };
      await createProject(params as API.ProjectRequest);
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
          id="pages.testing.project.modal.createForm.title"
          defaultMessage="新建项目"
        />
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="create-project-form">
        <Form.Item
          name="code"
          label={<FormattedMessage id="pages.testing.project.key.code" defaultMessage="项目代码" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.project.form.code.required',
                defaultMessage: '项目代码不能为空',
              }),
            },
            {
              max: 50,
              message: intl.formatMessage({
                id: 'pages.testing.project.form.code.maxlen',
                defaultMessage: '项目代码不能超过50个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.code.placeholder',
              defaultMessage: '请输入项目代码',
            })}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={<FormattedMessage id="pages.testing.project.key.name" defaultMessage="项目名称" />}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.testing.project.form.name.required',
                defaultMessage: '项目名称不能为空',
              }),
            },
            {
              max: 100,
              message: intl.formatMessage({
                id: 'pages.testing.project.form.name.maxlen',
                defaultMessage: '项目名称不能超过100个字符',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.name.placeholder',
              defaultMessage: '请输入项目名称',
            })}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <FormattedMessage id="pages.testing.project.key.description" defaultMessage="描述" />
          }
          rules={[
            {
              max: 500,
              message: intl.formatMessage({
                id: 'pages.testing.project.form.description.maxlen',
                defaultMessage: '描述不能超过500个字符',
              }),
            },
          ]}
        >
          <Input.TextArea
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.description.placeholder',
              defaultMessage: '请输入项目描述',
            })}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="icon"
          label={<FormattedMessage id="pages.testing.project.key.icon" defaultMessage="图标" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.icon.placeholder',
              defaultMessage: '请输入图标URL',
            })}
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label={<FormattedMessage id="pages.testing.project.key.tags" defaultMessage="标签" />}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.tags.placeholder',
              defaultMessage: '请输入标签，多个用逗号分隔',
            })}
          />
        </Form.Item>

        <Form.Item
          name="gitRepo"
          label={
            <FormattedMessage id="pages.testing.project.key.gitRepo" defaultMessage="Git仓库" />
          }
          rules={[
            {
              type: 'url',
              message: intl.formatMessage({
                id: 'pages.testing.project.form.gitRepo.pattern',
                defaultMessage: '请输入正确的URL地址',
              }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.gitRepo.placeholder',
              defaultMessage: '请输入Git仓库地址',
            })}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={<FormattedMessage id="pages.testing.project.key.status" defaultMessage="状态" />}
          initialValue={1}
        >
          <Select
            placeholder={intl.formatMessage({
              id: 'pages.testing.project.form.status.placeholder',
              defaultMessage: '请选择状态',
            })}
          >
            <Select.Option value={0}>
              <FormattedMessage
                id="pages.testing.project.status.inactive"
                defaultMessage="未激活"
              />
            </Select.Option>
            <Select.Option value={1}>
              <FormattedMessage id="pages.testing.project.status.active" defaultMessage="已激活" />
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
