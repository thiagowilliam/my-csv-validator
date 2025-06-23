import type { UUIDRecord, ValidationStats } from '../types';
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
  const count = data.length;
  
  if (count < VALIDATION_RULES.MIN_RECORDS) {
    const message = ERROR_MESSAGES.MIN_RECORDS_ERROR.replace('{count}', count.toString());
    throw new Error(message);
  }
  
  if (count > VALIDATION_RULES.MAX_RECORDS) {
    const message = ERROR_MESSAGES.MAX_RECORDS_ERROR.replace('{count}', count.toString());
    throw new Error(message);
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