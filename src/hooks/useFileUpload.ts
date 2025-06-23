import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { FileUploadHook, UUIDRecord } from '../types';
import { parseCSV } from '../utils/csvParser';
import { validateFileType, readFileAsText } from '../utils/fileHandler';
import { SUCCESS_MESSAGES, VALIDATION_RULES } from '../constants/validation';

export const useFileUpload = (): FileUploadHook & {
  validationError: {
    type: 'min' | 'max' | 'general' | null;
    count: number;
  } | null;
  clearValidationError: () => void;
} => {
  const [csvData, setCsvData] = useState<UUIDRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<{
    type: 'min' | 'max' | 'general' | null;
    count: number;
  } | null>(null);

  const resetState = useCallback((): void => {
    setCsvData([]);
    setFileName('');
    setError('');
    setSuccess('');
    setValidationError(null);
  }, []);

  const clearValidationError = useCallback((): void => {
    setValidationError(null);
  }, []);

  const processFile = useCallback(async (file: File): Promise<void> => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    setValidationError(null);

    try {
      validateFileType(file);
      const text = await readFileAsText(file);
      const parsedData = parseCSV(text);
      
      // Validação customizada com alertas específicos
      const count = parsedData.length;
      
      if (count < VALIDATION_RULES.MIN_RECORDS) {
        setValidationError({ type: 'min', count });
        throw new Error(`Arquivo com apenas ${count} registros (mínimo: ${VALIDATION_RULES.MIN_RECORDS})`);
      }
      
      if (count > VALIDATION_RULES.MAX_RECORDS) {
        setValidationError({ type: 'max', count });
        throw new Error(`Arquivo com ${count} registros (máximo: ${VALIDATION_RULES.MAX_RECORDS})`);
      }
      
      setCsvData(parsedData);
      setFileName(file.name);
      setSuccess(SUCCESS_MESSAGES.FILE_PROCESSED(parsedData.length));
      
      message.success('Arquivo processado com sucesso!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      message.error(errorMessage);
      
      // Se não é erro de validação de tamanho, limpa o estado
      if (!errorMessage.includes('registros')) {
        resetState();
      }
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
    setSuccess,
    validationError,
    clearValidationError
  };
};