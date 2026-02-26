import { useState, useEffect } from 'react';
import {
  PageContainer,
  Steps,
  Card,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Table,
  Space,
  Tag,
  message,
  InputNumber,
  Checkbox,
  Divider,
  Row,
  Col,
  Empty,
} from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { history } from '@umijs/max';
import { listProjects } from '@/services/backend/project';
import { listTestCases } from '@/services/backend/testCase';
import { listTestSuites } from '@/services/backend/testSuite';
import { listDevices } from '@/services/backend/device';
import { createTestPlan } from '@/services/backend/testPlan';

const { TextArea } = Input;

interface TaskFormData {
  name?: string;
  projectId?: number;
  planType?: string;
  triggerType?: string;
  description?: string;
  caseIds?: number[];
  suiteIds?: number[];
  envVars?: { key: string; value: string }[];
  deviceIds?: number[];
  retryCount?: number;
  timeout?: number;
  notifyOnStart?: boolean;
  notifyOnSuccess?: boolean;
  notifyOnFailure?: boolean;
  notifyEmails?: string;
  cronExpr?: string;
}

interface Step1BasicProps {
  formData: TaskFormData;
  updateFormData: (data: Partial<TaskFormData>) => void;
  projects: API.Project[];
  projectLoading: boolean;
}

const Step1Basic: React.FC<Step1BasicProps> = ({
  formData,
  updateFormData,
  projects,
  projectLoading,
}) => {
  const intl = useIntl();
  return (
    <Card>
      <Form layout="vertical">
        <Form.Item
          label={<FormattedMessage id="pages.testing.task.key.name" defaultMessage="任务名称" />}
          required
        >
          <Input
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder={intl.formatMessage({
              id: 'pages.testing.task.form.name.placeholder',
              defaultMessage: '请输入任务名称',
            })}
          />
        </Form.Item>
        <Form.Item
          label={
            <FormattedMessage id="pages.testing.task.key.projectId" defaultMessage="所属项目" />
          }
          required
        >
          <Select
            value={formData.projectId}
            onChange={(value) => updateFormData({ projectId: value })}
            placeholder={intl.formatMessage({
              id: 'pages.testing.task.form.projectId.placeholder',
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
          label={
            <FormattedMessage id="pages.testing.task.key.planType" defaultMessage="任务类型" />
          }
        >
          <Radio.Group
            value={formData.planType}
            onChange={(e) => updateFormData({ planType: e.target.value })}
          >
            <Radio value="manual">
              <FormattedMessage id="pages.testing.task.planType.manual" defaultMessage="手动" />
            </Radio>
            <Radio value="automated">
              <FormattedMessage id="pages.testing.task.planType.automated" defaultMessage="自动" />
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={
            <FormattedMessage id="pages.testing.task.key.triggerType" defaultMessage="触发方式" />
          }
        >
          <Radio.Group
            value={formData.triggerType}
            onChange={(e) => updateFormData({ triggerType: e.target.value })}
          >
            <Radio value="immediate">
              <FormattedMessage
                id="pages.testing.task.triggerType.immediate"
                defaultMessage="立即执行"
              />
            </Radio>
            <Radio value="scheduled">
              <FormattedMessage
                id="pages.testing.task.triggerType.scheduled"
                defaultMessage="定时执行"
              />
            </Radio>
            <Radio value="api">
              <FormattedMessage id="pages.testing.task.triggerType.api" defaultMessage="API触发" />
            </Radio>
          </Radio.Group>
        </Form.Item>
        {formData.triggerType === 'scheduled' && (
          <Form.Item
            label={
              <FormattedMessage id="pages.testing.task.key.cronExpr" defaultMessage="Cron表达式" />
            }
          >
            <Input
              value={formData.cronExpr}
              onChange={(e) => updateFormData({ cronExpr: e.target.value })}
              placeholder={intl.formatMessage({
                id: 'pages.testing.task.form.cronExpr.placeholder',
                defaultMessage: '如: 0 0 * * *',
              })}
            />
          </Form.Item>
        )}
        <Form.Item
          label={
            <FormattedMessage id="pages.testing.task.key.description" defaultMessage="任务描述" />
          }
        >
          <TextArea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={3}
            placeholder={intl.formatMessage({
              id: 'pages.testing.task.form.description.placeholder',
              defaultMessage: '请输入任务描述',
            })}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

interface Step2ScopeProps {
  formData: TaskFormData;
  updateFormData: (data: Partial<TaskFormData>) => void;
  cases: API.TestCase[];
  casesLoading: boolean;
  suites: API.TestSuite[];
  suitesLoading: boolean;
}

const Step2Scope: React.FC<Step2ScopeProps> = ({
  formData,
  updateFormData,
  cases,
  casesLoading,
  suites,
  suitesLoading,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<'cases' | 'suites'>('cases');

  const suiteColumns = [
    {
      title: '',
      dataIndex: 'checked',
      key: 'checked',
      width: 50,
      render: (_: any, record: API.TestSuite) => (
        <Checkbox
          checked={formData.suiteIds?.includes(record.id!)}
          onChange={(e) => {
            const currentIds = formData.suiteIds || [];
            if (e.target.checked) {
              updateFormData({ suiteIds: [...currentIds, record.id!] });
            } else {
              updateFormData({ suiteIds: currentIds.filter((id) => id !== record.id) });
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.suiteNo',
        defaultMessage: '套件编号',
      }),
      dataIndex: 'suiteNo',
      key: 'suiteNo',
      width: 120,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.suiteName',
        defaultMessage: '套件名称',
      }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.suiteType',
        defaultMessage: '套件类型',
      }),
      dataIndex: 'suiteType',
      key: 'suiteType',
      width: 100,
      render: (type: string) => <Tag>{type || '-'}</Tag>,
    },
  ];

  return (
    <Card>
      <Radio.Group
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
        buttonStyle="solid"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="cases">
          <FormattedMessage id="pages.testing.task.tab.cases" defaultMessage="测试用例" />
        </Radio.Button>
        <Radio.Button value="suites">
          <FormattedMessage id="pages.testing.task.tab.suites" defaultMessage="测试套件" />
        </Radio.Button>
      </Radio.Group>
      {activeTab === 'cases' ? (
        <Table
          dataSource={cases}
          columns={caseColumns}
          loading={casesLoading}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      ) : (
        <Table
          dataSource={suites}
          columns={suiteColumns}
          loading={suitesLoading}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      )}
      <Divider />
      <Space>
        <FormattedMessage id="pages.testing.task.selected" defaultMessage="已选择:" />
        <Tag color="blue">
          {formData.caseIds?.length || 0}{' '}
          <FormattedMessage id="pages.testing.task.cases" defaultMessage="用例" />
        </Tag>
        <Tag color="green">
          {formData.suiteIds?.length || 0}{' '}
          <FormattedMessage id="pages.testing.task.suites" defaultMessage="套件" />
        </Tag>
      </Space>
    </Card>
  );
};

interface Step3EnvironmentProps {
  formData: TaskFormData;
  updateFormData: (data: Partial<TaskFormData>) => void;
}

const Step3Environment: React.FC<Step3EnvironmentProps> = ({ formData, updateFormData }) => {
  const intl = useIntl();
  const envVars = formData.envVars || [];

  const addEnvVar = () => {
    updateFormData({ envVars: [...envVars, { key: '', value: '' }] });
  };

  const removeEnvVar = (index: number) => {
    const newVars = envVars.filter((_, i) => i !== index);
    updateFormData({ envVars: newVars });
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', val: string) => {
    const newVars = [...envVars];
    newVars[index][field] = val;
    updateFormData({ envVars: newVars });
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Button onClick={addEnvVar} type="dashed">
            <FormattedMessage id="pages.testing.task.env.add" defaultMessage="添加变量" />
          </Button>
        </Space>
        {envVars.length === 0 ? (
          <Empty
            description={intl.formatMessage({
              id: 'pages.testing.task.env.empty',
              defaultMessage: '暂无环境变量',
            })}
          />
        ) : (
          envVars.map((item, index) => (
            <Row key={index} gutter={16} align="middle">
              <Col span={8}>
                <Input
                  value={item.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'pages.testing.task.env.key',
                    defaultMessage: '变量名',
                  })}
                />
              </Col>
              <Col span={12}>
                <Input
                  value={item.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'pages.testing.task.env.value',
                    defaultMessage: '变量值',
                  })}
                />
              </Col>
              <Col span={4}>
                <Button onClick={() => removeEnvVar(index)} danger>
                  <FormattedMessage id="pages.common.remove" defaultMessage="删除" />
                </Button>
              </Col>
            </Row>
          ))
        )}
      </Space>
    </Card>
  );
};

interface Step4DeviceProps {
  formData: TaskFormData;
  updateFormData: (data: Partial<TaskFormData>) => void;
  devices: API.Device[];
  devicesLoading: boolean;
}

const Step4Device: React.FC<Step4DeviceProps> = ({
  formData,
  updateFormData,
  devices,
  devicesLoading,
}) => {
  const intl = useIntl();

  const getStatusTag = (status?: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: {
        color: 'default',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.offline',
          defaultMessage: '离线',
        }),
      },
      1: {
        color: 'success',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.idle',
          defaultMessage: '空闲',
        }),
      },
      2: {
        color: 'processing',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.busy',
          defaultMessage: '使用中',
        }),
      },
      3: {
        color: 'warning',
        text: intl.formatMessage({
          id: 'pages.testing.device.status.maintenance',
          defaultMessage: '维护中',
        }),
      },
    };
    const config = statusMap[status || 0] || statusMap[0];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const isSelected = (deviceId: number) => formData.deviceIds?.includes(deviceId);

  const toggleDevice = (deviceId: number) => {
    const currentIds = formData.deviceIds || [];
    if (isSelected(deviceId)) {
      updateFormData({ deviceIds: currentIds.filter((id) => id !== deviceId) });
    } else {
      updateFormData({ deviceIds: [...currentIds, deviceId] });
    }
  };

  const selectAll = () => {
    const idleDevices = devices.filter((d) => d.status === 1).map((d) => d.id!);
    updateFormData({ deviceIds: idleDevices });
  };

  const clearSelection = () => {
    updateFormData({ deviceIds: [] });
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={selectAll}>
          <FormattedMessage
            id="pages.testing.task.device.selectIdle"
            defaultMessage="选择全部空闲"
          />
        </Button>
        <Button onClick={clearSelection}>
          <FormattedMessage
            id="pages.testing.task.device.clearSelection"
            defaultMessage="清空选择"
          />
        </Button>
      </Space>
      <Row gutter={[16, 16]}>
        {devicesLoading ? (
          <Col span={24}>
            <Empty />
          </Col>
        ) : (
          devices.map((device) => (
            <Col xs={24} sm={12} md={8} lg={6} key={device.id}>
              <Card
                hoverable
                onClick={() => toggleDevice(device.id!)}
                style={{
                  borderColor: isSelected(device.id!) ? '#1677ff' : undefined,
                  backgroundColor: isSelected(device.id!) ? '#e6f4ff' : undefined,
                }}
                size="small"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Checkbox checked={isSelected(device.id!)} />
                    <strong>{device.name}</strong>
                  </Space>
                  <div>
                    <Tag>{device.deviceType}</Tag>
                    <Tag>{device.platform}</Tag>
                  </div>
                  <div>
                    <small>{device.deviceModel}</small>
                  </div>
                  <div>{getStatusTag(device.status)}</div>
                </Space>
              </Card>
            </Col>
          ))
        )}
      </Row>
      <Divider />
      <Space>
        <FormattedMessage id="pages.testing.task.selected" defaultMessage="已选择:" />
        <Tag color="blue">
          {formData.deviceIds?.length || 0}{' '}
          <FormattedMessage id="pages.testing.task.devices" defaultMessage="台设备" />
        </Tag>
      </Space>
    </Card>
  );
};

interface Step5AdvancedProps {
  formData: TaskFormData;
  updateFormData: (data: Partial<TaskFormData>) => void;
}

const Step5Advanced: React.FC<Step5AdvancedProps> = ({ formData, updateFormData }) => {
  const intl = useIntl();
  return (
    <Card>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <FormattedMessage
                  id="pages.testing.task.key.retryCount"
                  defaultMessage="重试次数"
                />
              }
            >
              <InputNumber
                min={0}
                max={10}
                value={formData.retryCount}
                onChange={(value) => updateFormData({ retryCount: value })}
                style={{ width: '100%' }}
                placeholder={intl.formatMessage({
                  id: 'pages.testing.task.form.retryCount.placeholder',
                  defaultMessage: '请输入重试次数',
                })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <FormattedMessage
                  id="pages.testing.task.key.timeout"
                  defaultMessage="超时时间(秒)"
                />
              }
            >
              <InputNumber
                min={0}
                value={formData.timeout}
                onChange={(value) => updateFormData({ timeout: value })}
                style={{ width: '100%' }}
                placeholder={intl.formatMessage({
                  id: 'pages.testing.task.form.timeout.placeholder',
                  defaultMessage: '请输入超时时间',
                })}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">
          <FormattedMessage id="pages.testing.task.key.notifyConfig" defaultMessage="通知设置" />
        </Divider>
        <Form.Item>
          <Checkbox
            checked={formData.notifyOnStart}
            onChange={(e) => updateFormData({ notifyOnStart: e.target.checked })}
          >
            <FormattedMessage
              id="pages.testing.task.notify.onStart"
              defaultMessage="执行开始时通知"
            />
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={formData.notifyOnSuccess}
            onChange={(e) => updateFormData({ notifyOnSuccess: e.target.checked })}
          >
            <FormattedMessage
              id="pages.testing.task.notify.onSuccess"
              defaultMessage="执行成功时通知"
            />
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={formData.notifyOnFailure}
            onChange={(e) => updateFormData({ notifyOnFailure: e.target.checked })}
          >
            <FormattedMessage
              id="pages.testing.task.notify.onFailure"
              defaultMessage="执行失败时通知"
            />
          </Checkbox>
        </Form.Item>
        <Form.Item
          label={
            <FormattedMessage id="pages.testing.task.key.notifyEmails" defaultMessage="通知邮箱" />
          }
        >
          <Input
            value={formData.notifyEmails}
            onChange={(e) => updateFormData({ notifyEmails: e.target.value })}
            placeholder={intl.formatMessage({
              id: 'pages.testing.task.form.notifyEmails.placeholder',
              defaultMessage: '多个邮箱用逗号分隔',
            })}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

const TaskCreate: React.FC = () => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({});

  const [projects, setProjects] = useState<API.Project[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [cases, setCases] = useState<API.TestCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [suites, setSuites] = useState<API.TestSuite[]>([]);
  const [suitesLoading, setSuitesLoading] = useState(false);
  const [devices, setDevices] = useState<API.Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const fetchProjects = async () => {
    setProjectLoading(true);
    try {
      const response = await listProjects({ page: 1, pageSize: 1000 });
      if (response.success) {
        setProjects(response.data?.list || []);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.task.fetchProjects.failure',
          defaultMessage: '获取项目列表失败',
        }),
      );
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchCases = async (projectId: number) => {
    if (!projectId) return;
    setCasesLoading(true);
    try {
      const response = await listTestCases({ page: 1, pageSize: 1000, projectId });
      if (response.success) {
        setCases(response.data?.list || []);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.task.fetchCases.failure',
          defaultMessage: '获取用例列表失败',
        }),
      );
    } finally {
      setCasesLoading(false);
    }
  };

  const fetchSuites = async (projectId: number) => {
    if (!projectId) return;
    setSuitesLoading(true);
    try {
      const response = await listTestSuites({ page: 1, pageSize: 100, projectId });
      if (response.success) {
        setSuites(response.data?.list || []);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.task.fetchSuites.failure',
          defaultMessage: '获取套件列表失败',
        }),
      );
    } finally {
      setSuitesLoading(false);
    }
  };

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      const response = await listDevices({ page: 1, pageSize: 100 });
      if (response.success) {
        setDevices(response.data?.list || []);
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.task.fetchDevices.failure',
          defaultMessage: '获取设备列表失败',
        }),
      );
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDevices();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchCases(formData.projectId);
      fetchSuites(formData.projectId);
    }
  }, [formData.projectId]);

  const updateFormData = (data: Partial<TaskFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.name) {
          message.warning(
            intl.formatMessage({
              id: 'pages.testing.task.validation.nameRequired',
              defaultMessage: '请输入任务名称',
            }),
          );
          return false;
        }
        if (!formData.projectId) {
          message.warning(
            intl.formatMessage({
              id: 'pages.testing.task.validation.projectRequired',
              defaultMessage: '请选择所属项目',
            }),
          );
          return false;
        }
        return true;
      case 1:
        if ((formData.caseIds?.length || 0) === 0 && (formData.suiteIds?.length || 0) === 0) {
          message.warning(
            intl.formatMessage({
              id: 'pages.testing.task.validation.scopeRequired',
              defaultMessage: '请选择测试用例或测试套件',
            }),
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (executeNow: boolean) => {
    if (!validateStep(currentStep)) {
      return;
    }
    setLoading(true);
    try {
      const envVarsObj: Record<string, string> = {};
      formData.envVars?.forEach((item) => {
        if (item.key) {
          envVarsObj[item.key] = item.value;
        }
      });

      const notifyConfig = {
        onStart: formData.notifyOnStart,
        onSuccess: formData.notifyOnSuccess,
        onFailure: formData.notifyOnFailure,
        emails: formData.notifyEmails,
      };

      const contentData = {
        caseIds: formData.caseIds,
        suiteIds: formData.suiteIds,
        envVars: envVarsObj,
        deviceIds: formData.deviceIds,
      };

      const params: API.TestPlanRequest = {
        projectId: formData.projectId!,
        name: formData.name!,
        description: formData.description,
        planType: formData.planType || 'manual',
        triggerType: formData.triggerType || 'immediate',
        cronExpr: formData.cronExpr,
        retryCount: formData.retryCount,
        timeout: formData.timeout,
        notifyConfig: JSON.stringify(notifyConfig),
        contentData: JSON.stringify(contentData),
      };

      await createTestPlan(params);
      message.success(
        intl.formatMessage({
          id: executeNow ? 'pages.testing.task.execute.success' : 'pages.testing.task.save.success',
          defaultMessage: executeNow ? '任务已创建并开始执行' : '任务保存成功',
        }),
      );
      history.push('/testing/task');
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.task.submit.failure',
          defaultMessage: '操作失败',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    await handleSubmit(false);
  };

  const handleExecuteNow = async () => {
    await handleSubmit(true);
  };

  const steps = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.step.basic',
        defaultMessage: '基本信息',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.step.scope',
        defaultMessage: '测试范围',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.step.environment',
        defaultMessage: '环境配置',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.step.device',
        defaultMessage: '设备选择',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.task.step.advanced',
        defaultMessage: '高级设置',
      }),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Basic
            formData={formData}
            updateFormData={updateFormData}
            projects={projects}
            projectLoading={projectLoading}
          />
        );
      case 1:
        return (
          <Step2Scope
            formData={formData}
            updateFormData={updateFormData}
            cases={cases}
            casesLoading={casesLoading}
            suites={suites}
            suitesLoading={suitesLoading}
          />
        );
      case 2:
        return <Step3Environment formData={formData} updateFormData={updateFormData} />;
      case 3:
        return (
          <Step4Device
            formData={formData}
            updateFormData={updateFormData}
            devices={devices}
            devicesLoading={devicesLoading}
          />
        );
      case 4:
        return <Step5Advanced formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
        <div style={{ minHeight: 400 }}>{renderStepContent()}</div>
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button disabled={currentStep === 0} onClick={handlePrev}>
            <FormattedMessage id="pages.testing.task.button.prev" defaultMessage="上一步" />
          </Button>
          <Space>
            <Button onClick={() => history.push('/testing/task')}>
              <FormattedMessage id="pages.common.cancel" defaultMessage="取消" />
            </Button>
            <Button onClick={handleSaveDraft} loading={loading}>
              <FormattedMessage
                id="pages.testing.task.button.saveDraft"
                defaultMessage="保存草稿"
              />
            </Button>
            <Button type="primary" onClick={handleExecuteNow} loading={loading}>
              <FormattedMessage
                id="pages.testing.task.button.executeNow"
                defaultMessage="立即执行"
              />
            </Button>
            {currentStep < 4 && (
              <Button type="primary" onClick={handleNext}>
                <FormattedMessage id="pages.testing.task.button.next" defaultMessage="下一步" />
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default TaskCreate;
