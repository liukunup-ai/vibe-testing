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
      question: '如何创建新的测试项目？',
      answer:
        '进入"项目"菜单，点击"项目列表"，然后点击右上角的"新建"按钮，填写项目信息后保存即可。',
    },
    {
      key: '2',
      question: '如何执行测试用例？',
      answer: '进入"测试"菜单，选择"测试用例"，勾选要执行的用例后点击"执行"按钮。',
    },
    {
      key: '3',
      question: '如何查看测试报告？',
      answer: '进入"测试"菜单，选择"测试报告"查看所有报告，点击报告标题查看详情。',
    },
    {
      key: '4',
      question: '如何添加测试设备？',
      answer: '进入"设备"菜单，点击"设备列表"，然后点击"新建"按钮添加设备信息。',
    },
    {
      key: '5',
      question: '如何管理项目成员？',
      answer: '进入"项目"菜单，选择"成员管理"，可以添加、删除成员或修改成员角色。',
    },
  ];

  const guides = [
    { title: '快速入门', icon: <BookOutlined />, desc: '5分钟快速上手测试平台' },
    { title: '项目管理', icon: <BookOutlined />, desc: '如何创建和管理项目' },
    { title: '用例管理', icon: <BookOutlined />, desc: '如何创建和管理测试用例' },
    { title: '测试计划', icon: <BookOutlined />, desc: '测试计划的创建和执行' },
    { title: '缺陷管理', icon: <BookOutlined />, desc: '缺陷的提交和处理流程' },
    { title: '效能分析', icon: <BookOutlined />, desc: '查看项目和团队效能数据' },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.help.title', defaultMessage: '使用帮助' }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="常见问题" extra={<QuestionCircleOutlined />}>
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

          <Card title="使用指南">
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
          <Card title="联系我们">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text>技术支持邮箱: </Text>
                <a href="mailto:support@example.com">support@example.com</a>
              </div>
              <div>
                <MessageOutlined style={{ marginRight: 8 }} />
                <Text>问题反馈: </Text>
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
                <Text>源码仓库: </Text>
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

          <Card title="版本信息">
            <Space direction="vertical">
              <Text>
                当前版本: <Tag color="blue">v1.0.0</Tag>
              </Text>
              <Text>最后更新: 2024-01-20</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Help;
