import React, { useState } from 'react';
import { Layout, Alert, Spin, Card, Tag, notification } from 'antd';
import { useFileUpload } from '../hooks/useFileUpload';
import { apiService } from '../services/apiService';
import { calculateStats, getValidUUIDs } from '../utils/csvParser';
import { SUCCESS_MESSAGES, VALIDATION_RULES } from '../constants/validation';
import type { APIPayload } from '../types';

import { Header } from '../components/Header/Header';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { StatsCards } from '../components/StatsCards/StatsCards';
import { DataTable } from '../components/DataTable/DataTable';
import { ActionButtons } from '../components/ActionButtons/ActionButtons';
import { ValidationAlert } from '../components/ValidationAlert/ValidationAlert';

const { Content } = Layout;

export const CSVUploadPage: React.FC = () => {
  const [isBackendLoading, setIsBackendLoading] = useState<boolean>(false);

  const {
    csvData,
    fileName,
    error,
    success,
    isProcessing,
    processFile,
    setError,
    setSuccess,
    validationError,
    clearValidationError
  } = useFileUpload();

  const handleSendToBackend = async (): Promise<void> => {
    setIsBackendLoading(true);
    
    try {
      const validUUIDs = getValidUUIDs(csvData);
      const stats = calculateStats(csvData);
      
      const payload: APIPayload = {
        fileName,
        totalRecords: stats.total,
        validUUIDs,
        timestamp: new Date().toISOString()
      };

      await apiService.simulateProcessUUIDs(payload);
      
      const successMessage = SUCCESS_MESSAGES.BACKEND_SUCCESS(validUUIDs.length);
      setSuccess(successMessage);
      
      notification.success({
        message: 'Sucesso!',
        description: successMessage,
        placement: 'topRight',
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      notification.error({
        message: 'Erro',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setIsBackendLoading(false);
    }
  };

  const handleSuccess = (message: string): void => {
    setSuccess(message);
    notification.success({
      message: 'Sucesso!',
      description: message,
      placement: 'topRight',
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Header />
        
        <Card style={{ marginBottom: 24 }}>
          <Spin spinning={isProcessing} tip="Processando arquivo...">
            <FileUpload 
              onFileSelect={processFile} 
              isProcessing={isProcessing} 
            />
          </Spin>
        </Card>

        {/* Alertas de Validação Específicos */}
        {validationError && (
          <ValidationAlert
            type={validationError.type || 'general'}
            count={validationError.count}
            minRecords={VALIDATION_RULES.MIN_RECORDS}
            maxRecords={VALIDATION_RULES.MAX_RECORDS}
            onClose={clearValidationError}
          />
        )}

        {/* Alertas Gerais */}
        {error && !validationError && (
          <Alert
            message="Erro no processamento"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 24 }}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            message="Sucesso!"
            description={success}
            type="success"
            showIcon
            closable
            style={{ marginBottom: 24 }}
            onClose={() => setSuccess('')}
          />
        )}

        {csvData.length > 0 && (
          <div>
            <StatsCards csvData={csvData} />
            
            <Card 
              title={`📋 Dados do arquivo: ${fileName}`}
              style={{ marginBottom: 24 }}
              extra={
                <Tag color="green">
                  ✅ {csvData.length} registros carregados
                </Tag>
              }
            >
              <DataTable csvData={csvData} />
            </Card>

            <ActionButtons 
              csvData={csvData}
              onSendToBackend={handleSendToBackend}
              onSuccess={handleSuccess}
              loading={isBackendLoading}
            />
          </div>
        )}
      </Content>
    </Layout>
  );
};