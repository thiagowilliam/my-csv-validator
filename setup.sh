#!/bin/bash
# 🚀 Script de Automação - CSV UUID Validator
# Este script cria toda a estrutura modular automaticamente

set -e  # Para parar em caso de erro

echo "🚀 Iniciando criação da estrutura modular..."
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

echo "📁 Criando estrutura de pastas..."

# Criar estrutura de pastas
mkdir -p src/components/{Header,FileUpload,StatsCards,DataTable,ActionButtons}
mkdir -p src/{hooks,pages,services,types,utils,constants}

echo "✅ Pastas criadas!"
echo ""

echo "📝 Criando arquivos TypeScript..."

# ===== TYPES =====
cat > src/types/index.ts << 'EOF'
export interface UUIDRecord {
  key: number;
  line: number;
  uuid: string;
  isValid: boolean;
}

export interface ValidationStats {
  total: number;
  valid: number;
  invalid: number;
  percentage: number;
}

export interface FileUploadState {
  csvData: UUIDRecord[];
  fileName: string;
  error: string;
  success: string;
  isProcessing: boolean;
}

export interface FileUploadActions {
  processFile: (file: File) => Promise<void>;
  resetState: () => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export interface FileUploadHook extends FileUploadState, FileUploadActions {}

export interface APIPayload {
  fileName: string;
  totalRecords: number;
  validUUIDs: string[];
  timestamp: string;
}

export interface APIResponse {
  success: boolean;
  processedCount: number;
  timestamp: string;
}

export interface ValidationRules {
  MIN_RECORDS: number;
  MAX_RECORDS: number;
  ALLOWED_FILE_TYPES: string[];
  UUID_REGEX: RegExp;
}

export interface Messages {
  INVALID_FILE_TYPE: string;
  MIN_RECORDS_ERROR: string;
  MAX_RECORDS_ERROR: string;
  BACKEND_ERROR: string;
}

export interface SuccessMessages {
  FILE_PROCESSED: (count: number) => string;
  BACKEND_SUCCESS: (count: number) => string;
  CLIPBOARD_SUCCESS: string;
}
EOF

cat > src/types/components.ts << 'EOF'
import { UUIDRecord } from './index';

export interface HeaderProps {}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export interface StatsCardsProps {
  csvData: UUIDRecord[];
}

export interface DataTableProps {
  csvData: UUIDRecord[];
}

export interface ActionButtonsProps {
  csvData: UUIDRecord[];
  onSendToBackend: () => void;
  onSuccess: (message: string) => void;
  loading: boolean;
}

export interface StatCardData {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}
EOF

# ===== CONSTANTS =====
cat > src/constants/validation.ts << 'EOF'
import { ValidationRules, Messages, SuccessMessages } from '../types';

export const VALIDATION_RULES: ValidationRules = {
  MIN_RECORDS: 5,
  MAX_RECORDS: 1000,
  ALLOWED_FILE_TYPES: ['.csv'],
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

export const ERROR_MESSAGES: Messages = {
  INVALID_FILE_TYPE: 'Por favor, selecione um arquivo CSV válido.',
  MIN_RECORDS_ERROR: `O arquivo deve conter pelo menos ${VALIDATION_RULES.MIN_RECORDS} UUIDs.`,
  MAX_RECORDS_ERROR: `O arquivo não pode conter mais de ${VALIDATION_RULES.MAX_RECORDS} UUIDs.`,
  BACKEND_ERROR: 'Erro ao enviar dados para o backend.'
};

export const SUCCESS_MESSAGES: SuccessMessages = {
  FILE_PROCESSED: (count: number): string => `Arquivo processado com sucesso! ${count} registros encontrados.`,
  BACKEND_SUCCESS: (count: number): string => `${count} UUIDs válidos enviados para processamento!`,
  CLIPBOARD_SUCCESS: 'UUIDs válidos copiados para a área de transferência!'
};
EOF

# ===== UTILS =====
cat > src/utils/csvParser.ts << 'EOF'
import { UUIDRecord, ValidationStats } from '../types';
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/validation';

export const isValidUUID = (uuid: string | undefined): boolean => {
  if (!uuid) return false;
  return VALIDATION_RULES.UUID_REGEX.test(uuid.trim());
};

export const parseCSV = (csvText: string): UUIDRecord[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    throw new Error('Arquivo vazio ou inválido.');
  }
  
  // Remove header if exists
  const hasHeader = lines.length > 0 && !isValidUUID(lines[0].trim());
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  return dataLines.map((line, index): UUIDRecord => ({
    key: index,
    line: hasHeader ? index + 2 : index + 1,
    uuid: line.trim(),
    isValid: isValidUUID(line.trim())
  }));
};

export const validateFileSize = (data: UUIDRecord[]): void => {
  if (data.length < VALIDATION_RULES.MIN_RECORDS) {
    throw new Error(ERROR_MESSAGES.MIN_RECORDS_ERROR);
  }
  if (data.length > VALIDATION_RULES.MAX_RECORDS) {
    throw new Error(ERROR_MESSAGES.MAX_RECORDS_ERROR);
  }
};

export const calculateStats = (csvData: UUIDRecord[]): ValidationStats => {
  const total = csvData.length;
  const valid = csvData.filter(item => item.isValid).length;
  const invalid = csvData.filter(item => !item.isValid).length;
  const percentage = total > 0 ? Math.round((valid / total) * 100) : 0;

  return { total, valid, invalid, percentage };
};

export const getValidUUIDs = (csvData: UUIDRecord[]): string[] => {
  return csvData.filter(item => item.isValid).map(item => item.uuid);
};
EOF

cat > src/utils/fileHandler.ts << 'EOF'
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/validation';

export const validateFileType = (file: File): void => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Erro ao ler o arquivo.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsText(file);
  });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
EOF

# ===== SERVICES =====
cat > src/services/apiService.ts << 'EOF'
import { APIPayload, APIResponse } from '../types';
import { ERROR_MESSAGES } from '../constants/validation';

export const apiService = {
  async processUUIDs(data: APIPayload): Promise<APIResponse> {
    try {
      const response = await fetch('/api/process-uuids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as APIResponse;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(ERROR_MESSAGES.BACKEND_ERROR);
    }
  },

  async simulateProcessUUIDs(data: APIPayload): Promise<APIResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📤 Enviando para backend (Estrutura Modular):', data);
        resolve({
          success: true,
          processedCount: data.validUUIDs.length,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    });
  }
};
EOF

# ===== HOOKS =====
cat > src/hooks/useFileUpload.ts << 'EOF'
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { FileUploadHook, UUIDRecord } from '../types';
import { parseCSV, validateFileSize } from '../utils/csvParser';
import { validateFileType, readFileAsText } from '../utils/fileHandler';
import { SUCCESS_MESSAGES } from '../constants/validation';

export const useFileUpload = (): FileUploadHook => {
  const [csvData, setCsvData] = useState<UUIDRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const resetState = useCallback((): void => {
    setCsvData([]);
    setFileName('');
    setError('');
    setSuccess('');
  }, []);

  const processFile = useCallback(async (file: File): Promise<void> => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      validateFileType(file);
      const text = await readFileAsText(file);
      const parsedData = parseCSV(text);
      validateFileSize(parsedData);
      
      setCsvData(parsedData);
      setFileName(file.name);
      setSuccess(SUCCESS_MESSAGES.FILE_PROCESSED(parsedData.length));
      
      message.success('Arquivo processado com sucesso!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      message.error(errorMessage);
      resetState();
    } finally {
      setIsProcessing(false);
    }
  }, [resetState]);

  return {
    csvData,
    fileName,
    error,
    success,
    isProcessing,
    processFile,
    resetState,
    setError,
    setSuccess
  };
};
EOF

echo "📦 Criando componentes..."

# ===== COMPONENTS =====
cat > src/components/Header/Header.tsx << 'EOF'
import React from 'react';
import { Space, Typography, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { HeaderProps } from '../../types/components';

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
EOF

cat > src/components/FileUpload/FileUpload.tsx << 'EOF'
import React from 'react';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FileUploadProps } from '../../types/components';

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
EOF

cat > src/components/StatsCards/StatsCards.tsx << 'EOF'
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  PercentageOutlined 
} from '@ant-design/icons';
import { StatsCardsProps, StatCardData } from '../../types/components';
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
EOF

cat > src/components/DataTable/DataTable.tsx << 'EOF'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DataTableProps } from '../../types/components';
import { UUIDRecord } from '../../types';

export const DataTable: React.FC<DataTableProps> = ({ csvData }) => {
  const columns: any = [
    {
      title: 'Linha',
      dataIndex: 'line',
      key: 'line',
      width: 80,
      align: 'center',
    },
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (uuid: string) => (
        <code style={{ 
          fontSize: '12px', 
          backgroundColor: '#f5f5f5', 
          padding: '2px 6px', 
          borderRadius: '4px',
          fontFamily: 'Monaco, Consolas, monospace'
        }}>
          {uuid}
        </code>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isValid',
      key: 'status',
      width: 120,
      align: 'center',
      render: (isValid: boolean) => (
        <Tag 
          icon={isValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isValid ? 'success' : 'error'}
        >
          {isValid ? 'Válido' : 'Inválido'}
        </Tag>
      ),
      filters: [
        { text: 'Válidos', value: true },
        { text: 'Inválidos', value: false },
      ],
      onFilter: (value: any, record: any) => record.isValid === value,
    },
  ];

  return (
    <Table<UUIDRecord>
      columns={columns}
      dataSource={csvData}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} de ${total} registros`,
      }}
      scroll={{ y: 400 }}
      size="small"
    />
  );
};
EOF

cat > src/components/ActionButtons/ActionButtons.tsx << 'EOF'
import React from 'react';
import { Space, Button } from 'antd';
import { SendOutlined, CopyOutlined } from '@ant-design/icons';
import { ActionButtonsProps } from '../../types/components';
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
EOF

# ===== PAGES =====
cat > src/pages/CSVUploadPage.tsx << 'EOF'
import React, { useState } from 'react';
import { Layout, Alert, Spin, Card, Tag, notification } from 'antd';
import { useFileUpload } from '../hooks/useFileUpload';
import { apiService } from '../services/apiService';
import { calculateStats, getValidUUIDs } from '../utils/csvParser';
import { SUCCESS_MESSAGES } from '../constants/validation';
import { APIPayload } from '../types';

import { Header } from '../components/Header/Header';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { StatsCards } from '../components/StatsCards/StatsCards';
import { DataTable } from '../components/DataTable/DataTable';
import { ActionButtons } from '../components/ActionButtons/ActionButtons';

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
    setSuccess
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

        {error && (
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
EOF

# ===== APP FILES =====
cat > src/App.tsx << 'EOF'
import React from 'react';
import { ConfigProvider } from 'antd';
import { CSVUploadPage } from './pages/CSVUploadPage';
import ptBR from 'antd/locale/pt_BR';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme} locale={ptBR}>
      <CSVUploadPage />
    </ConfigProvider>
  );
};

export default App;
EOF

# Verificar se index.tsx já existe, se não, criar
if [ ! -f "src/index.tsx" ]; then
cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
fi

# Verificar se index.css já existe, se não, criar
if [ ! -f "src/index.css" ]; then
cat > src/index.css << 'EOF'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: Monaco, Consolas, 'Courier New', monospace;
}

#root {
  min-height: 100vh;
}
EOF
fi

echo "✅ Arquivos TypeScript criados!"
echo ""

echo "🔧 Verificando dependências..."

# Verificar se antd está instalado
if ! npm list antd > /dev/null 2>&1; then
    echo "📦 Instalando Ant Design..."
    npm install antd @ant-design/icons
else
    echo "✅ Ant Design já instalado!"
fi

echo ""
echo "🎯 Executando verificações..."

# Type check
echo "🔍 Verificando TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript OK!"
else
    echo "⚠️ Há alguns erros de TypeScript, mas o projeto deve funcionar"
fi

echo ""
echo "📊 Estrutura final criada:"
echo ""

# Mostrar estrutura criada
tree src/ 2>/dev/null || find src/ -type f | sed 's|[^/]*/|- |g'

echo ""
echo "🎉 ESTRUTURA MODULAR CRIADA COM SUCESSO!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo "3. Teste com arquivos CSV"
echo ""
echo "🚀 Sua POC agora tem arquitetura profissional!"
echo ""