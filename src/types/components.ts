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
