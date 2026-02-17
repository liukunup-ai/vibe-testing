import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, List, Tag, Typography, Space } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Text } = Typography;

const ProductEfficiency: React.FC = () => {
  const intl = useIntl();

  const productList = [
    { name: '产品A', version: 'v2.1.0', quality: 95, coverage: 88, bugs: 12 },
    { name: '产品B', version: 'v1.5.2', quality: 82, coverage: 75, bugs: 28 },
    { name: '产品C', version: 'v3.0.0', quality: 90, coverage: 92, bugs: 8 },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.efficiency.product.title',
          defaultMessage: '产品效能',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '产品总数', value: 8, suffix: '个' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '平均质量分', value: 89.2, suffix: '分' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '平均覆盖率', value: 85.0, suffix: '%' }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard statistic={{ title: '待修复缺陷', value: 48, suffix: '个' }} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="产品质量概览">
            <List
              dataSource={productList}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag>{item.version}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">质量分: {item.quality}</Text>
                        <Text type="secondary">覆盖率: {item.coverage}%</Text>
                        <Text type="secondary">缺陷: {item.bugs}个</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProductEfficiency;
