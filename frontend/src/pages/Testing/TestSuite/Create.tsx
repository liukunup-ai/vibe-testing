import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Steps,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Table,
  Tag,
} from 'antd';
import { useIntl, useRequest, history } from '@umijs/max';
import { createTestSuite, getTestSuite, updateTestSuite } from '@/services/backend/testsuite';
import { listProjects } from '@/services/backend/project';
import { listTestCases } from '@/services/backend/testcase';
import { useParams } from '@umijs/max';
import React, { useState, useEffect } from 'react';

const { TextArea } = Input;

const SuiteCreate: React.FC = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const suiteId = parseInt(id || '0', 10);

  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [selectedCaseIds, setSelectedCaseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: projectData } = useRequest(() => listProjects({ page: 1, pageSize: 100 }));
  const projects = projectData?.data?.list || [];

  const { data: caseData } = useRequest(
    () => listTestCases({ page: 1, pageSize: 1000, projectId: selectedProjectId || 0 }),
    { ready: !!selectedProjectId },
  );
  const allCases = caseData?.data?.list || [];

  useEffect(() => {
    if (isEdit && suiteId) {
      getTestSuite({ id: suiteId }).then((res) => {
        if (res.data) {
          form.setFieldsValue(res.data);
          setSelectedProjectId(res.data.projectId);
          const caseIds = res.data.caseIds?.split(',').map(Number).filter(Boolean) || [];
          setSelectedCaseIds(caseIds);
        }
      });
    }
  }, [isEdit, suiteId, form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        caseIds: selectedCaseIds.join(','),
      };

      if (isEdit) {
        await updateTestSuite({ id: suiteId }, data);
        message.success(
          intl.formatMessage({ id: 'pages.common.edit.success', defaultMessage: '编辑成功' }),
        );
      } else {
        await createTestSuite(data);
        message.success(
          intl.formatMessage({ id: 'pages.common.new.success', defaultMessage: '创建成功' }),
        );
      }
      history.push('/testing/testsuite');
    } catch (err) {
      message.error(
        intl.formatMessage({ id: 'pages.common.save.failure', defaultMessage: '保存失败' }),
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.suite.create.step1',
        defaultMessage: '基本信息',
      }),
      content: (
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              name="projectId"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.projectId',
                defaultMessage: '所属项目',
              })}
              rules={[{ required: true }]}
            >
              <Select onChange={(v) => setSelectedProjectId(v)} disabled={isEdit}>
                {projects.map((p) => (
                  <Select.Option key={p.id} value={p.id as number}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="name"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.name',
                defaultMessage: '套件名称',
              })}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.description',
                defaultMessage: '描述',
              })}
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="suiteType"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.suiteType',
                defaultMessage: '套件类型',
              })}
            >
              <Select>
                <Select.Option value="manual">
                  {intl.formatMessage({
                    id: 'pages.testing.suite.type.manual',
                    defaultMessage: '手动选择',
                  })}
                </Select.Option>
                <Select.Option value="filter">
                  {intl.formatMessage({
                    id: 'pages.testing.suite.type.filter',
                    defaultMessage: '动态筛选',
                  })}
                </Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.suite.create.step2',
        defaultMessage: '选择用例',
      }),
      content: (
        <Card>
          <Table
            rowSelection={{
              selectedRowKeys: selectedCaseIds,
              onChange: (keys) => setSelectedCaseIds(keys as number[]),
            }}
            columns={[
              {
                title: intl.formatMessage({
                  id: 'pages.testing.testcase.key.caseNo',
                  defaultMessage: '用例编号',
                }),
                dataIndex: 'caseNo',
                width: 120,
              },
              {
                title: intl.formatMessage({
                  id: 'pages.testing.testcase.key.title',
                  defaultMessage: '标题',
                }),
                dataIndex: 'title',
              },
              {
                title: intl.formatMessage({
                  id: 'pages.testing.testcase.key.priority',
                  defaultMessage: '优先级',
                }),
                dataIndex: 'priority',
                width: 80,
                render: (v: number) => (
                  <Tag color={['default', 'blue', 'orange', 'red'][v] || 'default'}>
                    {['低', '中', '高', '紧急'][v] || '低'}
                  </Tag>
                ),
              },
              {
                title: intl.formatMessage({
                  id: 'pages.testing.testcase.key.module',
                  defaultMessage: '模块',
                }),
                dataIndex: 'module',
                width: 100,
              },
            ]}
            dataSource={allCases}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.suite.create.step3',
        defaultMessage: '执行配置',
      }),
      content: (
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              name="parallelism"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.parallelism',
                defaultMessage: '并行度',
              })}
              initialValue={1}
            >
              <InputNumber min={1} max={10} />
            </Form.Item>
            <Form.Item
              name="timeout"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.timeout',
                defaultMessage: '超时时间(秒)',
              })}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              name="retryCount"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.retryCount',
                defaultMessage: '失败重试次数',
              })}
              initialValue={0}
            >
              <InputNumber min={0} max={5} />
            </Form.Item>
            <Form.Item
              name="continueOnFail"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.continueOnFail',
                defaultMessage: '失败后继续执行',
              })}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="status"
              label={intl.formatMessage({
                id: 'pages.testing.testsuite.key.status',
                defaultMessage: '状态',
              })}
              initialValue={1}
            >
              <Select>
                <Select.Option value={0}>
                  {intl.formatMessage({
                    id: 'pages.testing.suite.status.disabled',
                    defaultMessage: '禁用',
                  })}
                </Select.Option>
                <Select.Option value={1}>
                  {intl.formatMessage({
                    id: 'pages.testing.suite.status.enabled',
                    defaultMessage: '启用',
                  })}
                </Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: isEdit
          ? intl.formatMessage({
              id: 'pages.testing.suite.create.editTitle',
              defaultMessage: '编辑套件',
            })
          : intl.formatMessage({
              id: 'pages.testing.suite.create.title',
              defaultMessage: '创建套件',
            }),
        breadcrumb: {},
      }}
    >
      <Card>
        <Steps
          current={currentStep}
          items={steps.map((s) => ({ title: s.title }))}
          style={{ marginBottom: 24 }}
        />
        {steps[currentStep].content}
        <div style={{ marginTop: 24 }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                {intl.formatMessage({ id: 'pages.common.previous', defaultMessage: '上一步' })}
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                {intl.formatMessage({ id: 'pages.common.next', defaultMessage: '下一步' })}
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" loading={loading} onClick={handleSave}>
                {intl.formatMessage({ id: 'pages.common.save', defaultMessage: '保存' })}
              </Button>
            )}
            <Button onClick={() => history.push('/testing/testsuite')}>
              {intl.formatMessage({ id: 'pages.common.cancel', defaultMessage: '取消' })}
            </Button>
          </Space>
        </div>
      </Card>
    </PageContainer>
  );
};

export default SuiteCreate;
