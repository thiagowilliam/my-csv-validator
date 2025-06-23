import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  PercentageOutlined 
} from '@ant-design/icons';
import type { StatsCardsProps, StatCardData } from '../../types/components';
import { calculateStats } from '../../utils/csvParser';

export const StatsCards: React.FC<StatsCardsProps> = ({ csvData }) => {
  const stats = calculateStats(csvData);

  const cardData: StatCardData[] = [
    {
      title: 'Total de Registros',
      value: stats.total,
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'UUIDs Válidos',
      value: stats.valid,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'UUIDs Inválidos',
      value: stats.invalid,
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f'
    },
    {
      title: 'Taxa de Sucesso',
      value: stats.percentage,
      suffix: '%',
      icon: <PercentageOutlined style={{ color: '#faad14' }} />,
      color: '#faad14'
    }
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {cardData.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card>
            <Statistic
              title={card.title}
              value={card.value}
              suffix={card.suffix}
              prefix={card.icon}
              valueStyle={{ color: card.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
