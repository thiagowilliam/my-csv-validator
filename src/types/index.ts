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
