import React from 'react';
import { Space, Typography, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { HeaderProps } from '../../types/components';

const { Title, Text } = Typography;

export const Header: React.FC<HeaderProps> = () => (
  <div style={{ textAlign: 'center', marginBottom: 40 }}>
    <Space direction="vertical" size="small">
      <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
      <Title level={1} style={{ margin: 0, color: '#262626' }}>
        Validador de UUIDs CSV
      </Title>
      <Text type="secondary" style={{ fontSize: 16 }}>
        POC TypeScript + Ant Design - Arquitetura Modular
      </Text>
      <Tag color="blue" style={{ marginTop: 8 }}>
        🚀 Estrutura Escalável + Type Safety
      </Tag>
    </Space>
  </div>
);
