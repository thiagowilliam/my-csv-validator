import React, { useState, useEffect } from 'react';
import { Upload, Progress, Space, Alert } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { FileUploadProps } from '../../types/components';

const { Dragger } = Upload;

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Função para validar se o arquivo é CSV
  const validateFileExtension = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.csv');
  };

  // Função para mostrar erro
  const showError = (message: string) => {
    setError(message);
    // Remove o erro após 5 segundos
    setTimeout(() => setError(null), 5000);
  };

  // Simular progresso durante o processamento
  useEffect(() => {
    if (isProcessing) {
      setProgressPercent(0);
      const interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95; // Para em 95% até o processamento real terminar
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Completar progresso quando terminar
      setProgressPercent(100);
      const timeout = setTimeout(() => setProgressPercent(0), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validar extensão do arquivo
      if (!validateFileExtension(file)) {
        showError('Apenas arquivos com extensão .csv são permitidos!');
        return false;
      }
      
      // Limpar erro se existir
      setError(null);
      onFileSelect(file);
      return false; // Prevent default upload
    },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log('Dropped files', e.dataTransfer.files);
      
      // Validar arquivos arrastados
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) {
        showError('Nenhum arquivo foi detectado!');
        return;
      }

      if (files.length > 1) {
        showError('Apenas um arquivo por vez é permitido!');
        return;
      }

      // Validar extensão do primeiro arquivo
      if (!validateFileExtension(files[0])) {
        showError('Apenas arquivos com extensão .csv são permitidos!');
        return;
      }

      // Limpar erro se existir
      setError(null);
    },
  };

  // Estilo da animação pulse usando CSS-in-JS
  const pulseAnimation: React.CSSProperties = {
    fontSize: 48,
    color: '#1890ff',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  // 🎯 ESTADO DE PROCESSAMENTO - Interface com Progress
  if (isProcessing) {
    return (
      <>
        {/* CSS para animação injetado no head */}
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}
        </style>

        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          border: '2px dashed #1890ff',
          borderRadius: 8,
          backgroundColor: '#f0f9ff',
          marginBottom: 24 
        }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Ícone Animado */}
            <FileTextOutlined style={pulseAnimation} />
            
            <div>
              {/* Título do Processamento */}
              <p style={{ 
                fontSize: 18, 
                color: '#1890ff', 
                margin: '0 0 16px 0',
                fontWeight: 500 
              }}>
                Processando arquivo CSV...
              </p>
              
              {/* Progress Bar Animado */}
              <Progress
                percent={Math.floor(progressPercent)}
                status="active"
                strokeColor={{
                  '0%': '#108ee9',   // Azul inicial
                  '100%': '#87d068', // Verde final
                }}
                style={{ marginBottom: 8 }}
              />
              
              {/* Subtexto */}
              <p style={{ 
                color: '#666', 
                fontSize: 14,
                margin: 0 
              }}>
                Validando UUIDs e criando estatísticas...
              </p>
            </div>
          </Space>
        </div>
      </>
    );
  }

  // 📤 ESTADO NORMAL - Interface de Upload
  return (
    <>
      {/* Alerta de Erro */}
      {error && (
        <Alert
          message="Erro no arquivo"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Dragger 
        {...uploadProps} 
        style={{ marginBottom: 24 }}
        disabled={isProcessing}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">
          Clique ou arraste um arquivo CSV para esta área
        </p>
        <p className="ant-upload-hint">
          O arquivo deve conter uma coluna com UUIDs (entre 5 e 1000 registros)
        </p>
      </Dragger>
    </>
  );
};