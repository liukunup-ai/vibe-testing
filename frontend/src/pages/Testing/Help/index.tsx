import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Typography, List, Collapse, Tag, Space, Divider } from 'antd';
import { useIntl } from '@umijs/max';
import {
  QuestionCircleOutlined,
  BookOutlined,
  GithubOutlined,
  MailOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import React from 'react';

const { Text, Paragraph } = Typography;

const Help: React.FC = () => {
  const intl = useIntl();

  const faqs = [
    {
      key: '1',
      question: intl.formatMessage({
        id: 'pages.help.faq.q1',
        defaultMessage: '如何创建新的测试项目？',
      }),
      answer: intl.formatMessage({
        id: 'pages.help.faq.a1',
        defaultMessage:
          '进入"测试管理 > 项目管理"页面，点击右上角的"新建"按钮，填写项目名称、代码、描述等信息后保存即可。',
      }),
    },
    {
      key: '2',
      question: intl.formatMessage({
        id: 'pages.help.faq.q2',
        defaultMessage: '如何执行测试用例？',
      }),
      answer: intl.formatMessage({
        id: 'pages.help.faq.a2',
        defaultMessage:
          '可以通过两种方式执行：1) 在用例列表页面选择用例后点击"执行"；2) 创建测试计划，选择要执行的用例或套件，然后启动执行。',
      }),
    },
    {
      key: '3',
      question: intl.formatMessage({
        id: 'pages.help.faq.q3',
        defaultMessage: '如何查看测试报告？',
      }),
      answer: intl.formatMessage({
        id: 'pages.help.faq.a3',
        defaultMessage:
          '测试执行完成后，可以在"测试记录"页面查看执行记录，点击"查看报告"按钮查看详细的测试报告，包括通过率、失败原因分析等。',
      }),
    },
    {
      key: '4',
      question: intl.formatMessage({
        id: 'pages.help.faq.q4',
        defaultMessage: '如何添加测试设备？',
      }),
      answer: intl.formatMessage({
        id: 'pages.help.faq.a4',
        defaultMessage:
          '进入"设备管理"页面，点击"添加设备"按钮，填写设备信息（如设备编号、名称、类型、平台等）后保存。设备需要安装对应的Agent才能连接。',
      }),
    },
    {
      key: '5',
      question: intl.formatMessage({
        id: 'pages.help.faq.q5',
        defaultMessage: '支持哪些测试类型？',
      }),
      answer: intl.formatMessage({
        id: 'pages.help.faq.a5',
        defaultMessage:
          '目前支持功能测试、性能测试、安全测试、兼容性测试等多种类型。可以根据项目需求选择合适的测试类型。',
      }),
    },
  ];

  const guides = [
    {
      title: intl.formatMessage({ id: 'pages.help.guide.quickStart', defaultMessage: '快速入门' }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.quickStart.desc',
        defaultMessage: '5分钟快速上手测试平台',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.help.guide.caseManagement',
        defaultMessage: '用例管理',
      }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.caseManagement.desc',
        defaultMessage: '如何创建和管理测试用例',
      }),
    },
    {
      title: intl.formatMessage({
        id: 'pages.help.guide.taskExecution',
        defaultMessage: '任务执行',
      }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.taskExecution.desc',
        defaultMessage: '测试任务的创建和执行流程',
      }),
    },
    {
      title: intl.formatMessage({ id: 'pages.help.guide.report', defaultMessage: '报告分析' }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.report.desc',
        defaultMessage: '测试报告的查看和分析',
      }),
    },
    {
      title: intl.formatMessage({ id: 'pages.help.guide.device', defaultMessage: '设备管理' }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.device.desc',
        defaultMessage: '测试设备的接入和管理',
      }),
    },
    {
      title: intl.formatMessage({ id: 'pages.help.guide.api', defaultMessage: 'API文档' }),
      icon: <BookOutlined />,
      desc: intl.formatMessage({
        id: 'pages.help.guide.api.desc',
        defaultMessage: '平台API接口文档',
      }),
    },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.help.title', defaultMessage: '帮助中心' }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={intl.formatMessage({ id: 'pages.help.faq', defaultMessage: '常见问题' })}
            extra={<QuestionCircleOutlined />}
          >
            <Collapse
              accordion
              items={faqs.map((item) => ({
                key: item.key,
                label: item.question,
                children: <Paragraph>{item.answer}</Paragraph>,
              }))}
            />
          </Card>

          <Divider />

          <Card title={intl.formatMessage({ id: 'pages.help.guides', defaultMessage: '使用指南' })}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={guides}
              renderItem={(item) => (
                <List.Item>
                  <Card hoverable>
                    <Card.Meta avatar={item.icon} title={item.title} description={item.desc} />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={intl.formatMessage({ id: 'pages.help.contact', defaultMessage: '联系我们' })}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text>
                  {intl.formatMessage({ id: 'pages.help.email', defaultMessage: '技术支持邮箱' })}
                  :{' '}
                </Text>
                <a href="mailto:support@example.com">support@example.com</a>
              </div>
              <div>
                <MessageOutlined style={{ marginRight: 8 }} />
                <Text>
                  {intl.formatMessage({ id: 'pages.help.feedback', defaultMessage: '问题反馈' })}
                  :{' '}
                </Text>
                <a
                  href="https://github.com/example/vibe-testing/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Issues
                </a>
              </div>
              <div>
                <GithubOutlined style={{ marginRight: 8 }} />
                <Text>
                  {intl.formatMessage({ id: 'pages.help.source', defaultMessage: '源码仓库' })}
                  :{' '}
                </Text>
                <a
                  href="https://github.com/example/vibe-testing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </Space>
          </Card>

          <Divider />

          <Card
            title={intl.formatMessage({ id: 'pages.help.resources', defaultMessage: '相关资源' })}
          >
            <List
              dataSource={[
                {
                  name: intl.formatMessage({
                    id: 'pages.help.resource.doc',
                    defaultMessage: '官方文档',
                  }),
                  url: '#',
                },
                {
                  name: intl.formatMessage({
                    id: 'pages.help.resource.video',
                    defaultMessage: '视频教程',
                  }),
                  url: '#',
                },
                {
                  name: intl.formatMessage({
                    id: 'pages.help.resource.community',
                    defaultMessage: '社区论坛',
                  }),
                  url: '#',
                },
                {
                  name: intl.formatMessage({
                    id: 'pages.help.resource.changelog',
                    defaultMessage: '更新日志',
                  }),
                  url: '#',
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.name}
                  </a>
                </List.Item>
              )}
            />
          </Card>

          <Divider />

          <Card
            title={intl.formatMessage({ id: 'pages.help.version', defaultMessage: '版本信息' })}
          >
            <Space direction="vertical">
              <Text>
                {intl.formatMessage({
                  id: 'pages.help.version.current',
                  defaultMessage: '当前版本',
                })}
                : <Tag color="blue">v1.0.0</Tag>
              </Text>
              <Text>
                {intl.formatMessage({
                  id: 'pages.help.version.lastUpdate',
                  defaultMessage: '最后更新',
                })}
                : 2024-01-20
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Help;
