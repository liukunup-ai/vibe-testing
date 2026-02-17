import { PageContainer, ProCard, Descriptions } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Paragraph } = Typography;

const RequirementDetail: React.FC = () => {
  const intl = useIntl();

  const requirement = {
    id: 1,
    code: 'REQ-001',
    title: '用户登录功能',
    priority: 'P0',
    status: 'implemented',
    assignee: '张三',
    plannedDate: '2024-01-15',
    description: '实现用户登录功能，支持用户名密码登录、短信验证码登录、第三方登录等方式。',
    acceptanceCriteria:
      '1. 支持手机号+密码登录\n2. 支持短信验证码登录\n3. 支持微信/QQ第三方登录\n4. 登录失败3次后需要验证码',
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      pending: { color: 'processing', text: '待评审' },
      approved: { color: 'success', text: '已批准' },
      rejected: { color: 'error', text: '已拒绝' },
      implemented: { color: 'success', text: '已实现' },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.requirement.detail.title',
          defaultMessage: '需求详情',
        }),
        breadcrumb: {},
      }}
    >
      <ProCard>
        <Descriptions title="基本信息" bordered>
          <Descriptions.Item label="需求编号">{requirement.code}</Descriptions.Item>
          <Descriptions.Item label="需求标题">{requirement.title}</Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag
              color={
                requirement.priority === 'P0'
                  ? 'red'
                  : requirement.priority === 'P1'
                    ? 'orange'
                    : 'blue'
              }
            >
              {requirement.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(requirement.status)}</Descriptions.Item>
          <Descriptions.Item label="负责人">{requirement.assignee}</Descriptions.Item>
          <Descriptions.Item label="计划日期">{requirement.plannedDate}</Descriptions.Item>
        </Descriptions>
      </ProCard>

      <ProCard title="需求描述" style={{ marginTop: 16 }}>
        <Paragraph>{requirement.description}</Paragraph>
      </ProCard>

      <ProCard title="验收标准" style={{ marginTop: 16 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{requirement.acceptanceCriteria}</Paragraph>
      </ProCard>
    </PageContainer>
  );
};

export default RequirementDetail;
