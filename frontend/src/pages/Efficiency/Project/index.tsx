import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Row, Col, Progress, Typography } from 'antd';
import { useIntl } from '@umijs/max';
import React from 'react';

const { Text } = Typography;

const ProjectEfficiency: React.FC = () => {
  const intl = useIntl();

  const projectStats = [
    { name: '项目A', progress: 85, tasks: 120, completed: 102 },
    { name: '项目B', progress: 60, tasks: 80, completed: 48 },
    { name: '项目C', progress: 90, tasks: 200, completed: 180 },
    { name: '项目D', progress: 30, tasks: 50, completed: 15 },
  ];

  return (
    <PageContainer
      header={{
        title: intl.formatMessage({
          id: 'pages.efficiency.project.title',
          defaultMessage: '项目效能',
        }),
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '活跃项目',
              value: 12,
              suffix: '个',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '平均完成率',
              value: 78.5,
              suffix: '%',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '延期项目',
              value: 2,
              suffix: '个',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: '本周新增',
              value: 3,
              suffix: '个',
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="项目进度">
            {projectStats.map((project) => (
              <div key={project.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{project.name}</Text>
                  <Text type="secondary">
                    {project.completed}/{project.tasks} 任务
                  </Text>
                </div>
                <Progress
                  percent={project.progress}
                  strokeColor={
                    project.progress >= 80
                      ? '#52c41a'
                      : project.progress >= 50
                        ? '#1890ff'
                        : '#faad14'
                  }
                />
              </div>
            ))}
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProjectEfficiency;
