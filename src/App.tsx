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
