import type { ValidationRules, Messages, SuccessMessages } from '../types';

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
