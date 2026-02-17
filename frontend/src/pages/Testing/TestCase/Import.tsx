import { PageContainer } from '@ant-design/pro-components';
import { Card, Steps, Button, Space, Upload, Table, Select, message, Divider, Alert } from 'antd';
import { useIntl, useRequest, history } from '@umijs/max';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { listProjects } from '@/services/backend/project';
import { createTestCase } from '@/services/backend/testcase';
import React, { useState } from 'react';

const CaseImport: React.FC = () => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<number>();
  const [importData, setImportData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const { data: projectData } = useRequest(() => listProjects({ page: 1, pageSize: 100 }));
  const projects = projectData?.data?.list || [];

  const templateColumns = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.caseNo',
        defaultMessage: '用例编号',
      }),
      dataIndex: 'caseNo',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.title',
        defaultMessage: '标题',
      }),
      dataIndex: 'title',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.description',
        defaultMessage: '描述',
      }),
      dataIndex: 'description',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.priority',
        defaultMessage: '优先级',
      }),
      dataIndex: 'priority',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.module',
        defaultMessage: '模块',
      }),
      dataIndex: 'module',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.tags',
        defaultMessage: '标签',
      }),
      dataIndex: 'tags',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.template.steps',
        defaultMessage: '测试步骤',
      }),
      dataIndex: 'steps',
    },
  ];

  const previewColumns = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.row',
        defaultMessage: '行号',
      }),
      dataIndex: 'row',
      width: 60,
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.caseNo',
        defaultMessage: '用例编号',
      }),
      dataIndex: 'caseNo',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.title',
        defaultMessage: '标题',
      }),
      dataIndex: 'title',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.priority',
        defaultMessage: '优先级',
      }),
      dataIndex: 'priority',
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.valid',
        defaultMessage: '校验',
      }),
      dataIndex: 'valid',
      render: (v: boolean) =>
        v ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.preview.error',
        defaultMessage: '错误信息',
      }),
      dataIndex: 'error',
    },
  ];

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map((h) => h.trim());
        const data = lines.slice(1).map((line, idx) => {
          const values = line.split(',');
          const row: any = { row: idx + 2, valid: true, error: '' };
          headers.forEach((header, i) => {
            row[header.toLowerCase()] = values[i]?.trim() || '';
          });
          if (!row.title) {
            row.valid = false;
            row.error = intl.formatMessage({
              id: 'pages.testing.caseimport.error.noTitle',
              defaultMessage: '标题不能为空',
            });
          }
          return row;
        });
        setImportData(data);
        setCurrentStep(2);
      } catch (err) {
        message.error(
          intl.formatMessage({
            id: 'pages.testing.caseimport.error.parseFailed',
            defaultMessage: '文件解析失败',
          }),
        );
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleImport = async () => {
    if (!selectedProject) {
      message.error(
        intl.formatMessage({
          id: 'pages.testing.caseimport.error.noProject',
          defaultMessage: '请先选择项目',
        }),
      );
      return;
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of importData) {
      if (!row.valid) continue;
      try {
        await createTestCase({
          projectId: selectedProject,
          title: row.title,
          description: row.description,
          priority:
            row.priority === '紧急' ? 3 : row.priority === '高' ? 2 : row.priority === '中' ? 1 : 0,
          module: row.module,
          tags: row.tags,
          stepsData: row.steps,
          status: 2,
        });
        success++;
      } catch (err) {
        failed++;
        errors.push(`Row ${row.row}: ${err}`);
      }
    }

    setImportResults({ success, failed, errors });
    setCurrentStep(3);
  };

  const handleDownloadTemplate = () => {
    const template =
      'caseNo,title,description,priority,module,tags,steps\nTC001,登录测试,测试用户登录功能,高,登录模块,登录|P0,"1. 打开登录页面\n2. 输入用户名密码\n3. 点击登录"';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'testcase_template.csv';
    link.click();
  };

  const steps = [
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.step1',
        defaultMessage: '选择项目',
      }),
      content: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={intl.formatMessage({
                id: 'pages.testing.caseimport.step1.desc',
                defaultMessage: '请选择要导入用例的目标项目',
              })}
              type="info"
            />
            <Select
              placeholder={intl.formatMessage({
                id: 'pages.testing.caseimport.selectProject',
                defaultMessage: '选择项目',
              })}
              style={{ width: '100%' }}
              onChange={(v) => setSelectedProject(v)}
              value={selectedProject}
            >
              {projects.map((p) => (
                <Select.Option key={p.id} value={p.id as number}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Card>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.step2',
        defaultMessage: '上传文件',
      }),
      content: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={intl.formatMessage({
                id: 'pages.testing.caseimport.step2.desc',
                defaultMessage: '下载模板文件，按照格式填写用例数据后上传',
              })}
              type="info"
            />
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              {intl.formatMessage({
                id: 'pages.testing.caseimport.downloadTemplate',
                defaultMessage: '下载模板',
              })}
            </Button>
            <Divider />
            <Table
              columns={templateColumns}
              dataSource={[
                {
                  caseNo: 'TC001',
                  title: '登录测试',
                  description: '测试用户登录功能',
                  priority: '高',
                  module: '登录模块',
                  tags: '登录,P0',
                  steps: '1. 打开页面\n2. 输入信息',
                },
              ]}
              rowKey="caseNo"
              pagination={false}
              size="small"
            />
            <Divider />
            <Upload accept=".csv,.xlsx,.xls" beforeUpload={handleFileUpload} maxCount={1}>
              <Button icon={<UploadOutlined />} type="primary">
                {intl.formatMessage({
                  id: 'pages.testing.caseimport.uploadFile',
                  defaultMessage: '上传文件',
                })}
              </Button>
            </Upload>
          </Space>
        </Card>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.step3',
        defaultMessage: '数据预览',
      }),
      content: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={intl.formatMessage({
                id: 'pages.testing.caseimport.step3.desc',
                defaultMessage: '预览导入数据，确认无误后点击导入',
              })}
              type="info"
            />
            <Table
              columns={previewColumns}
              dataSource={importData}
              rowKey="row"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Space>
        </Card>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.testing.caseimport.step4',
        defaultMessage: '导入完成',
      }),
      content: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={intl.formatMessage({
                id: 'pages.testing.caseimport.step4.success',
                defaultMessage: '导入完成',
              })}
              description={`${intl.formatMessage({ id: 'pages.testing.caseimport.step4.successCount', defaultMessage: '成功' })}: ${importResults.success}, ${intl.formatMessage({ id: 'pages.testing.caseimport.step4.failedCount', defaultMessage: '失败' })}: ${importResults.failed}`}
              type={importResults.failed > 0 ? 'warning' : 'success'}
            />
            {importResults.errors.length > 0 && (
              <Card
                title={intl.formatMessage({
                  id: 'pages.testing.caseimport.step4.errors',
                  defaultMessage: '错误详情',
                })}
                size="small"
              >
                {importResults.errors.map((err, idx) => (
                  <div key={idx} style={{ color: '#ff4d4f' }}>
                    {err}
                  </div>
                ))}
              </Card>
            )}
            <Space>
              <Button type="primary" onClick={() => history.push('/testing/project')}>
                {intl.formatMessage({
                  id: 'pages.testing.caseimport.viewProjects',
                  defaultMessage: '返回项目列表',
                })}
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setImportData([]);
                  setImportResults({ success: 0, failed: 0, errors: [] });
                }}
              >
                {intl.formatMessage({
                  id: 'pages.testing.caseimport.importMore',
                  defaultMessage: '继续导入',
                })}
              </Button>
            </Space>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.testing.caseimport.title',
          defaultMessage: '用例导入',
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
        <Divider />
        <Space>
          {currentStep > 0 && currentStep < 3 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              {intl.formatMessage({ id: 'pages.common.previous', defaultMessage: '上一步' })}
            </Button>
          )}
          {currentStep === 1 && selectedProject && (
            <Button type="primary" onClick={() => setCurrentStep(1)}>
              {intl.formatMessage({ id: 'pages.common.next', defaultMessage: '下一步' })}
            </Button>
          )}
          {currentStep === 2 && importData.length > 0 && (
            <Button type="primary" onClick={handleImport}>
              {intl.formatMessage({
                id: 'pages.testing.caseimport.startImport',
                defaultMessage: '开始导入',
              })}
            </Button>
          )}
        </Space>
      </Card>
    </PageContainer>
  );
};

export default CaseImport;
