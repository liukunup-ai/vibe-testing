import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, List, Tag, Typography, Space } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Text } = Typography;

const DevelopmentEfficiency: React.FC = () => {
  const intl = useIntl();

  const developerList = [
    { name: '张三', commits: 156, prs: 23, bugs: 5, efficiency: 95 },
    { name: '李四', commits: 128, prs: 18, bugs: 8, efficiency: 88 },
    { name: '王五', commits: 142, prs: 21, bugs: 3, efficiency: 92 },
    { name: '赵六', commits: 98, prs: 15, bugs: 12, efficiency: 75 },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.efficiency.development.title',
          defaultMessage: '开发效能',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '活跃开发者', value: 24, suffix: '人' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '本周提交', value: 386, suffix: '次' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '平均效能', value: 87.5, suffix: '分' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: 'PR合并率', value: 92.3, suffix: '%' }} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="开发者效能排行">
            <List
              dataSource={developerList}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.name}</Text>}
                    description={
                      <Space>
                        <Text type="secondary">提交: {item.commits}</Text>
                        <Text type="secondary">PR: {item.prs}</Text>
                        <Text type="secondary">缺陷: {item.bugs}</Text>
                      </Space>
                    }
                  />
                  <Tag
                    color={
                      item.efficiency >= 90
                        ? 'success'
                        : item.efficiency >= 80
                          ? 'processing'
                          : 'warning'
                    }
                  >
                    效能: {item.efficiency}
                  </Tag>
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DevelopmentEfficiency;
