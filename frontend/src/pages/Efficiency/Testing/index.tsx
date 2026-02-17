import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, List, Tag, Typography, Space } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Text } = Typography;

const TestingEfficiency: React.FC = () => {
  const intl = useIntl();

  const testerList = [
    { name: '测试员A', cases: 156, executions: 320, passRate: 96, efficiency: 94 },
    { name: '测试员B', cases: 142, executions: 280, passRate: 94, efficiency: 90 },
    { name: '测试员C', cases: 128, executions: 250, passRate: 98, efficiency: 92 },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.efficiency.testing.title',
          defaultMessage: '测试效能',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '活跃测试人员', value: 12, suffix: '人' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '本周执行', value: 850, suffix: '次' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '平均通过率', value: 94.5, suffix: '%' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '平均效能', value: 92.0, suffix: '分' }} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="测试人员效能">
            <List
              dataSource={testerList}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.name}</Text>}
                    description={
                      <Space>
                        <Text type="secondary">用例: {item.cases}</Text>
                        <Text type="secondary">执行: {item.executions}</Text>
                        <Text type="secondary">通过率: {item.passRate}%</Text>
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

export default TestingEfficiency;
