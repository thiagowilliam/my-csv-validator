import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { FileUploadHook, UUIDRecord } from '../types';
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
