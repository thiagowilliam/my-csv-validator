import React from 'react';
import { Alert, Space, Typography, Button } from 'antd';
import { ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ValidationAlertProps {
  type: 'min' | 'max' | 'general';
  count: number;
  minRecords: number;
  maxRecords: number;
  onClose: () => void;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ 
  type, 
  count, 
  minRecords, 
  maxRecords, 
  onClose 
}) => {
  if (type === 'min') {
    return (
      <Alert
        type="error"
        showIcon
        closable
        onClose={onClose}
        icon={<ExclamationCircleOutlined />}
        message={
          <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
            📁 Arquivo Muito Pequeno
          </Title>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>
              O arquivo contém apenas <Text strong>{count}</Text> registros, 
              mas é necessário um mínimo de <Text strong>{minRecords}</Text> UUIDs.
            </Text>
            
            <div style={{ 
              backgroundColor: '#fff2f0', 
              padding: 12, 
              borderRadius: 6,
              border: '1px solid #ffccc7'
            }}>
              <Text type="secondary">
                <FileTextOutlined /> <strong>Sugestões:</strong>
              </Text>
              <ul style={{ margin: '8px 0 0 16px', paddingLeft: 0 }}>
                <li>Adicione mais UUIDs ao arquivo</li>
                <li>Verifique se o arquivo não foi truncado</li>
                <li>Confirme se todas as linhas foram incluídas</li>
              </ul>
            </div>
          </Space>
        }
        style={{ marginBottom: 24 }}
      />
    );
  }

  if (type === 'max') {
    return (
      <Alert
        type="warning"
        showIcon
        closable
        onClose={onClose}
        icon={<ExclamationCircleOutlined />}
        message={
          <Title level={5} style={{ color: '#faad14', margin: 0 }}>
            📁 Arquivo Muito Grande
          </Title>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>
              O arquivo contém <Text strong>{count}</Text> registros, 
              mas o limite máximo é <Text strong>{maxRecords}</Text> UUIDs.
            </Text>
            
            <div style={{ 
              backgroundColor: '#fffbe6', 
              padding: 12, 
              borderRadius: 6,
              border: '1px solid #ffe58f'
            }}>
              <Text type="secondary">
                <FileTextOutlined /> <strong>Sugestões:</strong>
              </Text>
              <ul style={{ margin: '8px 0 0 16px', paddingLeft: 0 }}>
                <li>Divida o arquivo em partes menores</li>
                <li>Processe os primeiros {maxRecords} registros</li>
                <li>Use processamento em lote para arquivos grandes</li>
              </ul>
            </div>
            
            <div style={{ marginTop: 8 }}>
              <Button type="link" size="small" style={{ padding: 0 }}>
                💡 Dica: Considere usar nossa API de processamento em lote
              </Button>
            </div>
          </Space>
        }
        style={{ marginBottom: 24 }}
      />
    );
  }

  return (
    <Alert
      type="error"
      showIcon
      closable
      onClose={onClose}
      message="Erro na validação do arquivo"
      description={`Problema detectado com ${count} registros.`}
      style={{ marginBottom: 24 }}
    />
  );
};