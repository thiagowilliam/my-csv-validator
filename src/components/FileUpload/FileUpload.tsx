import React from 'react';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { FileUploadProps } from '../../types/components';

const { Dragger } = Upload;

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    showUploadList: false,
    beforeUpload: (file: File) => {
      onFileSelect(file);
      return false;
    },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger 
      {...uploadProps} 
      style={{ marginBottom: 24 }}
      disabled={isProcessing}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#1890ff' }} />
      </p>
      <p className="ant-upload-text">
        {isProcessing ? 'Processando arquivo...' : 'Clique ou arraste um arquivo CSV para esta área'}
      </p>
      <p className="ant-upload-hint">
        O arquivo deve conter uma coluna com UUIDs (entre 5 e 1000 registros)
      </p>
    </Dragger>
  );
};
