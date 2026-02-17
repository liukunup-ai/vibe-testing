import { PageContainer, ProCard, Descriptions, Timeline } from '@ant-design/pro-components';
import { Tag, Typography, Button, Input } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Paragraph } = Typography;
const { TextArea } = Input;

const BugDetail: React.FC = () => {
  const intl = useIntl();

  const bug = {
    id: 1,
    code: 'BUG-001',
    title: '登录页面加载缓慢',
    severity: 'major',
    status: 'assigned',
    priority: 'P1',
    reporter: '张三',
    assignee: '李四',
    createdAt: '2024-01-20 10:30:00',
    description: '在Chrome浏览器下，登录页面加载时间超过5秒，影响用户体验。',
    steps: '1. 打开登录页面\n2. 观察页面加载时间\n3. 页面加载完成需要5秒以上',
    expected: '页面应在2秒内加载完成',
    actual: '页面加载需要5-8秒',
  };

  const timeline = [
    { time: '2024-01-20 10:30:00', content: '张三 创建了缺陷' },
    { time: '2024-01-20 11:00:00', content: '管理员 分配给 李四' },
    { time: '2024-01-20 14:00:00', content: '李四 确认缺陷' },
  ];

  const getSeverityTag = (severity: string) => {
    const colorMap: Record<string, string> = {
      critical: 'red',
      major: 'orange',
      minor: 'blue',
      trivial: 'default',
    };
    const textMap: Record<string, string> = {
      critical: '致命',
      major: '严重',
      minor: '一般',
      trivial: '轻微',
    };
    return <Tag color={colorMap[severity] || 'default'}>{textMap[severity] || severity}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      new: { color: 'default', text: '新建' },
      assigned: { color: 'processing', text: '已分配' },
      fixed: { color: 'success', text: '已修复' },
      reopened: { color: 'error', text: '重开' },
      closed: { color: 'success', text: '已关闭' },
    };
    const config = statusMap[status] || statusMap.new;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({ id: 'pages.bug.detail.title', defaultMessage: '缺陷详情' }),
        breadcrumb: {},
      }}
    >
      <ProCard>
        <Descriptions title="基本信息" bordered>
          <Descriptions.Item label="缺陷编号">{bug.code}</Descriptions.Item>
          <Descriptions.Item label="缺陷标题">{bug.title}</Descriptions.Item>
          <Descriptions.Item label="严重程度">{getSeverityTag(bug.severity)}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(bug.status)}</Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={bug.priority === 'P0' ? 'red' : bug.priority === 'P1' ? 'orange' : 'blue'}>
              {bug.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="报告人">{bug.reporter}</Descriptions.Item>
          <Descriptions.Item label="指派给">{bug.assignee}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{bug.createdAt}</Descriptions.Item>
        </Descriptions>
      </ProCard>

      <ProCard title="缺陷描述" style={{ marginTop: 16 }}>
        <Paragraph>{bug.description}</Paragraph>
      </ProCard>

      <ProCard title="重现步骤" style={{ marginTop: 16 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{bug.steps}</Paragraph>
      </ProCard>

      <ProCard title="预期结果" style={{ marginTop: 16 }}>
        <Paragraph>{bug.expected}</Paragraph>
      </ProCard>

      <ProCard title="实际结果" style={{ marginTop: 16 }}>
        <Paragraph>{bug.actual}</Paragraph>
      </ProCard>

      <ProCard title="处理记录" style={{ marginTop: 16 }}>
        <Timeline>
          {timeline.map((item, index) => (
            <Timeline.Item key={index}>
              <p>{item.time}</p>
              <p>{item.content}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </ProCard>

      <ProCard title="添加评论" style={{ marginTop: 16 }}>
        <TextArea rows={4} placeholder="请输入评论内容..." />
        <Button type="primary" style={{ marginTop: 8 }}>
          提交评论
        </Button>
      </ProCard>
    </PageContainer>
  );
};

export default BugDetail;
