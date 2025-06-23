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
