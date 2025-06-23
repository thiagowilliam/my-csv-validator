import React from 'react';
import { Space, Button } from 'antd';
import { SendOutlined, CopyOutlined } from '@ant-design/icons';
import type { ActionButtonsProps } from '../../types/components';
import { copyToClipboard } from '../../utils/fileHandler';
import { getValidUUIDs } from '../../utils/csvParser';
import { SUCCESS_MESSAGES } from '../../constants/validation';

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  csvData, 
  onSendToBackend, 
  onSuccess, 
  loading 
}) => {
  const validUUIDs = getValidUUIDs(csvData);

  const handleCopyToClipboard = async (): Promise<void> => {
    const uuidsText = validUUIDs.join('\n');
    const success = await copyToClipboard(uuidsText);
    
    if (success) {
      onSuccess(SUCCESS_MESSAGES.CLIPBOARD_SUCCESS);
    }
  };

  if (validUUIDs.length === 0) return null;

  return (
    <div style={{ marginTop: 24, textAlign: 'center' }}>
      <Space size="middle">
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSendToBackend}
          loading={loading}
          size="large"
        >
          Enviar {validUUIDs.length} UUIDs para Backend
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopyToClipboard}
          size="large"
        >
          Copiar UUIDs Válidos
        </Button>
      </Space>
    </div>
  );
};
