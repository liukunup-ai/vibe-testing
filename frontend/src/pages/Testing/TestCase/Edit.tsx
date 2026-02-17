import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-components';
import { useIntl, history } from '@umijs/max';
import { Tabs, Form, Input, Button, Space, message, Tag, Table, Upload, Tooltip } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getTestCase, createTestCase, updateTestCase } from '@/services/backend/testcase';
import { listProjects } from '@/services/backend/project';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

interface TestStep {
  key: string;
  stepNum: number;
  operation: string;
  inputData: string;
  expectedResult: string;
}

const TestCaseEdit: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [projectOptions, setProjectOptions] = useState<API.Project[]>([]);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [attachments, setAttachments] = useState<UploadFile[]>([]);
  const [caseId, setCaseId] = useState<number | undefined>();
  const stepsRef = useRef<TestStep[]>([]);

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await listProjects({ page: 1, pageSize: 100 });
        if (response.success) {
          setProjectOptions(response.data?.list || []);
        }
      } catch (error) {
        message.error(
          intl.formatMessage({
            id: 'pages.common.fetchData.failure',
            defaultMessage: '获取数据失败',
          }),
        );
      }
    };
    fetchProjects();
  }, [intl]);

  useEffect(() => {
    if (editId) {
      const fetchTestCase = async () => {
        setFetching(true);
        try {
          const id = parseInt(editId, 10);
          setCaseId(id);
          const response = await getTestCase({ id });
          if (response.success && response.data) {
            const data = response.data;
            form.setFieldsValue({
              projectId: data.projectId,
              title: data.title,
              description: data.description,
              priority: data.priority,
              caseType: data.caseType,
              module: data.module,
              tags: data.tags,
              requirementId: data.requirementId,
              status: data.status,
            });

            if (data.stepsData) {
              try {
                const parsedSteps = JSON.parse(data.stepsData);
                if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                  const formattedSteps: TestStep[] = parsedSteps.map(
                    (step: any, index: number) => ({
                      key: `step-${index}`,
                      stepNum: index + 1,
                      operation: step.operation || '',
                      inputData: step.inputData || '',
                      expectedResult: step.expectedResult || '',
                    }),
                  );
                  setTestSteps(formattedSteps);
                  stepsRef.current = formattedSteps;
                }
              } catch {
                setTestSteps([
                  { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
                ]);
                stepsRef.current = [
                  { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
                ];
              }
            } else {
              setTestSteps([
                { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
              ]);
              stepsRef.current = [
                { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
              ];
            }
          }
        } catch (error) {
          message.error(
            intl.formatMessage({
              id: 'pages.common.fetchData.failure',
              defaultMessage: '获取数据失败',
            }),
          );
        } finally {
          setFetching(false);
        }
      };
      fetchTestCase();
    } else {
      setTestSteps([
        { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
      ]);
      stepsRef.current = [
        { key: 'step-1', stepNum: 1, operation: '', inputData: '', expectedResult: '' },
      ];
    }
  }, [editId, form, intl]);

  const handleAddStep = () => {
    const newStep: TestStep = {
      key: `step-${Date.now()}`,
      stepNum: testSteps.length + 1,
      operation: '',
      inputData: '',
      expectedResult: '',
    };
    const updatedSteps = [...testSteps, newStep];
    setTestSteps(updatedSteps);
    stepsRef.current = updatedSteps;
  };

  const handleDeleteStep = (key: string) => {
    const updatedSteps = testSteps
      .filter((step) => step.key !== key)
      .map((step, index) => ({ ...step, stepNum: index + 1 }));
    setTestSteps(updatedSteps);
    stepsRef.current = updatedSteps;
  };

  const handleMoveStep = (key: string, direction: 'up' | 'down') => {
    const index = testSteps.findIndex((step) => step.key === key);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === testSteps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...testSteps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    const renumberedSteps = updatedSteps.map((step, idx) => ({ ...step, stepNum: idx + 1 }));
    setTestSteps(renumberedSteps);
    stepsRef.current = renumberedSteps;
  };

  const handleStepChange = (key: string, field: keyof TestStep, value: string) => {
    const updatedSteps = testSteps.map((step) =>
      step.key === key ? { ...step, [field]: value } : step,
    );
    setTestSteps(updatedSteps);
    stepsRef.current = updatedSteps;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const stepsData = JSON.stringify(
        stepsRef.current.map((step) => ({
          operation: step.operation,
          inputData: step.inputData,
          expectedResult: step.expectedResult,
        })),
      );

      const requestData: API.TestCaseRequest = {
        projectId: values.projectId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        caseType: values.caseType,
        module: values.module,
        tags: values.tags,
        requirementId: values.requirementId,
        status: values.status,
        stepsData,
      };

      if (caseId) {
        await updateTestCase({ id: caseId }, requestData);
        message.success(
          intl.formatMessage({ id: 'pages.common.update.success', defaultMessage: '更新成功' }),
        );
      } else {
        await createTestCase(requestData);
        message.success(
          intl.formatMessage({ id: 'pages.common.create.success', defaultMessage: '创建成功' }),
        );
      }
      history.push('/testing/testcase');
    } catch (error) {
      const msg = caseId
        ? intl.formatMessage({ id: 'pages.common.update.failure', defaultMessage: '更新失败' })
        : intl.formatMessage({ id: 'pages.common.create.failure', defaultMessage: '创建失败' });
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
    history.push('/testing/testcase');
  };

  const handlePreview = () => {
    setActiveTab('steps');
  };

  const priorityOptions = [
    {
      value: 0,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.priority.low',
        defaultMessage: '低',
      }),
    },
    {
      value: 1,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.priority.medium',
        defaultMessage: '中',
      }),
    },
    {
      value: 2,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.priority.high',
        defaultMessage: '高',
      }),
    },
    {
      value: 3,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.priority.critical',
        defaultMessage: '紧急',
      }),
    },
  ];

  const caseTypeOptions = [
    {
      value: 'functional',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.caseType.functional',
        defaultMessage: '功能测试',
      }),
    },
    {
      value: 'performance',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.caseType.performance',
        defaultMessage: '性能测试',
      }),
    },
    {
      value: 'security',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.caseType.security',
        defaultMessage: '安全测试',
      }),
    },
    {
      value: 'compatibility',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.caseType.compatibility',
        defaultMessage: '兼容性测试',
      }),
    },
  ];

  const statusOptions = [
    {
      value: 0,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.status.draft',
        defaultMessage: '草稿',
      }),
    },
    {
      value: 1,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.status.reviewing',
        defaultMessage: '审核中',
      }),
    },
    {
      value: 2,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.status.active',
        defaultMessage: '启用',
      }),
    },
    {
      value: 3,
      label: intl.formatMessage({
        id: 'pages.testing.testcase.status.deprecated',
        defaultMessage: '废弃',
      }),
    },
  ];

  const getPriorityTag = (priority?: number) => {
    switch (priority) {
      case 0:
        return (
          <Tag color="default">
            {intl.formatMessage({
              id: 'pages.testing.testcase.priority.low',
              defaultMessage: '低',
            })}
          </Tag>
        );
      case 1:
        return (
          <Tag color="blue">
            {intl.formatMessage({
              id: 'pages.testing.testcase.priority.medium',
              defaultMessage: '中',
            })}
          </Tag>
        );
      case 2:
        return (
          <Tag color="orange">
            {intl.formatMessage({
              id: 'pages.testing.testcase.priority.high',
              defaultMessage: '高',
            })}
          </Tag>
        );
      case 3:
        return (
          <Tag color="red">
            {intl.formatMessage({
              id: 'pages.testing.testcase.priority.critical',
              defaultMessage: '紧急',
            })}
          </Tag>
        );
      default:
        return null;
    }
  };

  const getStatusTag = (status?: number) => {
    switch (status) {
      case 0:
        return (
          <Tag color="default">
            {intl.formatMessage({
              id: 'pages.testing.testcase.status.draft',
              defaultMessage: '草稿',
            })}
          </Tag>
        );
      case 1:
        return (
          <Tag color="processing">
            {intl.formatMessage({
              id: 'pages.testing.testcase.status.reviewing',
              defaultMessage: '审核中',
            })}
          </Tag>
        );
      case 2:
        return (
          <Tag color="success">
            {intl.formatMessage({
              id: 'pages.testing.testcase.status.active',
              defaultMessage: '启用',
            })}
          </Tag>
        );
      case 3:
        return (
          <Tag color="error">
            {intl.formatMessage({
              id: 'pages.testing.testcase.status.deprecated',
              defaultMessage: '废弃',
            })}
          </Tag>
        );
      default:
        return null;
    }
  };

  const stepColumns = [
    {
      title: '#',
      dataIndex: 'stepNum',
      width: 60,
      render: (stepNum: number, record: TestStep) => (
        <Space>
          <span>{stepNum}</span>
          <Space direction="vertical" size={0}>
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.testing.testcase.steps.moveUp',
                defaultMessage: '上移',
              })}
            >
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={() => handleMoveStep(record.key, 'up')}
                disabled={stepNum === 1}
              />
            </Tooltip>
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.testing.testcase.steps.moveDown',
                defaultMessage: '下移',
              })}
            >
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                onClick={() => handleMoveStep(record.key, 'down')}
                disabled={stepNum === testSteps.length}
              />
            </Tooltip>
          </Space>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.steps.operation',
        defaultMessage: '操作',
      }),
      dataIndex: 'operation',
      render: (_: any, record: TestStep) => (
        <Input
          value={record.operation}
          onChange={(e) => handleStepChange(record.key, 'operation', e.target.value)}
          placeholder={intl.formatMessage({
            id: 'pages.testing.testcase.steps.operation.placeholder',
            defaultMessage: '请输入操作描述',
          })}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.steps.inputData',
        defaultMessage: '输入数据',
      }),
      dataIndex: 'inputData',
      render: (_: any, record: TestStep) => (
        <Input
          value={record.inputData}
          onChange={(e) => handleStepChange(record.key, 'inputData', e.target.value)}
          placeholder={intl.formatMessage({
            id: 'pages.testing.testcase.steps.inputData.placeholder',
            defaultMessage: '请输入输入数据',
          })}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.testcase.steps.expectedResult',
        defaultMessage: '预期结果',
      }),
      dataIndex: 'expectedResult',
      render: (_: any, record: TestStep) => (
        <Input
          value={record.expectedResult}
          onChange={(e) => handleStepChange(record.key, 'expectedResult', e.target.value)}
          placeholder={intl.formatMessage({
            id: 'pages.testing.testcase.steps.expectedResult.placeholder',
            defaultMessage: '请输入预期结果',
          })}
        />
      ),
    },
    {
      title: '',
      width: 60,
      render: (_: any, record: TestStep) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteStep(record.key)}
          disabled={testSteps.length <= 1}
        />
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'basic',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.tabs.basic',
        defaultMessage: '基本信息',
      }),
      children: (
        <ProCard>
          <ProForm
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            grid
            rowProps={{ gutter: 16 }}
          >
            <ProFormSelect
              name="projectId"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.projectId',
                defaultMessage: '所属项目',
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.testing.testcase.form.projectId.required',
                    defaultMessage: '请选择项目',
                  }),
                },
              ]}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.projectId.placeholder',
                defaultMessage: '请选择项目',
              })}
              options={projectOptions.map((p) => ({ value: p.id, label: p.name }))}
            />
            <ProFormDigit
              name="requirementId"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.requirementId',
                defaultMessage: '需求ID',
              })}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.requirementId.placeholder',
                defaultMessage: '请输入需求ID',
              })}
              fieldProps={{ precision: 0 }}
            />
            <ProFormText
              name="title"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.title',
                defaultMessage: '标题',
              })}
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
              colProps={{ span: 24 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.title.placeholder',
                defaultMessage: '请输入标题',
              })}
            />
            <ProFormTextArea
              name="description"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.description',
                defaultMessage: '描述',
              })}
              colProps={{ span: 24 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.description.placeholder',
                defaultMessage: '请输入描述',
              })}
              fieldProps={{ rows: 3 }}
            />
            <ProFormSelect
              name="priority"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.priority',
                defaultMessage: '优先级',
              })}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.priority.placeholder',
                defaultMessage: '请选择优先级',
              })}
              options={priorityOptions}
            />
            <ProFormSelect
              name="caseType"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.caseType',
                defaultMessage: '用例类型',
              })}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.caseType.placeholder',
                defaultMessage: '请选择用例类型',
              })}
              options={caseTypeOptions}
            />
            <ProFormText
              name="module"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.module',
                defaultMessage: '模块',
              })}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.module.placeholder',
                defaultMessage: '请输入模块',
              })}
            />
            <ProFormSelect
              name="status"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.status',
                defaultMessage: '状态',
              })}
              colProps={{ span: 12 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.status.placeholder',
                defaultMessage: '请选择状态',
              })}
              options={statusOptions}
            />
            <ProFormText
              name="tags"
              label={intl.formatMessage({
                id: 'pages.testing.testcase.key.tags',
                defaultMessage: '标签',
              })}
              colProps={{ span: 24 }}
              placeholder={intl.formatMessage({
                id: 'pages.testing.testcase.form.tags.placeholder',
                defaultMessage: '请输入标签，多个用逗号分隔',
              })}
            />
          </ProForm>
        </ProCard>
      ),
    },
    {
      key: 'steps',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.tabs.steps',
        defaultMessage: '测试步骤',
      }),
      children: (
        <ProCard>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStep}>
              {intl.formatMessage({
                id: 'pages.testing.testcase.steps.add',
                defaultMessage: '添加步骤',
              })}
            </Button>
          </div>
          <Table
            dataSource={testSteps}
            columns={stepColumns}
            pagination={false}
            rowKey="key"
            bordered
          />
        </ProCard>
      ),
    },
    {
      key: 'attachments',
      label: intl.formatMessage({
        id: 'pages.testing.testcase.tabs.attachments',
        defaultMessage: '附件',
      }),
      children: (
        <ProCard>
          <Upload.Dragger
            name="file"
            multiple
            fileList={attachments}
            onChange={({ fileList }) => setAttachments(fileList)}
            beforeUpload={() => false}
            maxCount={10}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              {intl.formatMessage({
                id: 'pages.testing.testcase.attachments.uploadTip',
                defaultMessage: '点击或拖拽文件到此区域上传',
              })}
            </p>
            <p className="ant-upload-hint">
              {intl.formatMessage({
                id: 'pages.testing.testcase.attachments.uploadHint',
                defaultMessage: '支持单个或批量上传，最多10个文件',
              })}
            </p>
          </Upload.Dragger>
        </ProCard>
      ),
    },
  ];

  return (
    <PageContainer
      loading={fetching}
      header={{
        title: caseId
          ? intl.formatMessage({
              id: 'pages.testing.testcase.edit.title',
              defaultMessage: '编辑测试用例',
            })
          : intl.formatMessage({
              id: 'pages.testing.testcase.create.title',
              defaultMessage: '创建测试用例',
            }),
        extra: [
          <Space key="actions">
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              {intl.formatMessage({
                id: 'pages.testing.testcase.action.preview',
                defaultMessage: '预览',
              })}
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              {intl.formatMessage({ id: 'pages.common.cancel', defaultMessage: '取消' })}
            </Button>
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
              {intl.formatMessage({ id: 'pages.common.save', defaultMessage: '保存' })}
            </Button>
          </Space>,
        ],
        tags: caseId ? (
          <>
            {getPriorityTag(form.getFieldValue('priority'))}
            {getStatusTag(form.getFieldValue('status'))}
          </>
        ) : undefined,
      }}
    >
      <Form form={form} layout="vertical" style={{ display: 'none' }} />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />
    </PageContainer>
  );
};

export default TestCaseEdit;
