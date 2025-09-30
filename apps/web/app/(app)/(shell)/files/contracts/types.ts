// Re-export contract-specific types from parent types file
export type {
  ContractAsset,
  ContractType,
  ContractStatus,
  ContractPriority,
  SignatureStatus,
  ApprovalStatus,
  ContractMetadata,
  ContractMilestone,
  ContractAmendment,
  SignatoryInfo,
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  ContractStats,
  ContractAnalytics,
  ContractTemplate,
  ContractWorkflow,
  ContractWorkflowStep,
  ContractFieldConfig
} from '../types';

// Contract-specific UI component props
export interface ContractCardProps {
  contract: ContractAsset;
  onEdit?: (contract: ContractAsset) => void;
  onView?: (contract: ContractAsset) => void;
  onDelete?: (contract: ContractAsset) => void;
  onActivate?: (contract: ContractAsset) => void;
  onTerminate?: (contract: ContractAsset) => void;
  onRenew?: (contract: ContractAsset) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface ContractListProps {
  contracts: ContractAsset[];
  loading?: boolean;
  onContractSelect?: (contract: ContractAsset) => void;
  onContractEdit?: (contract: ContractAsset) => void;
  onContractDelete?: (contract: ContractAsset) => void;
  selectedContracts?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface ContractFiltersProps {
  filters: ContractFilters;
  onFiltersChange: (filters: ContractFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export interface ContractStatsProps {
  stats: ContractStats;
  loading?: boolean;
  onStatClick?: (statType: string, value: unknown) => void;
}

// Contract form interfaces
export interface ContractFormData {
  title: string;
  description?: string;
  contract_type: ContractType;
  contract_priority?: ContractPriority;
  contract_value?: number;
  currency?: string;
  related_entity_type: ContractMetadata['related_entity_type'];
  related_entity_id: string;
  related_entity_name: string;
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  notice_period_days?: number;
  terms?: string;
  governing_law?: string;
  jurisdiction?: string;
  confidentiality_clause?: boolean;
  termination_clause?: string;
  liability_limit?: number;
  payment_terms?: string;
  tags?: string[];
  access_level?: 'public' | 'team' | 'restricted' | 'private';
  file_url?: string;
}

export interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

// Contract action interfaces
export interface ContractAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  onClick: (contract: ContractAsset) => void;
  disabled?: (contract: ContractAsset) => boolean;
  hidden?: (contract: ContractAsset) => boolean;
}

export interface ContractBulkAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  onClick: (contracts: ContractAsset[]) => void;
  disabled?: (contracts: ContractAsset[]) => boolean;
  confirmationMessage?: string;
}

// Contract workflow interfaces
export interface ContractWorkflowProps {
  contract: ContractAsset;
  onWorkflowUpdate?: (contract: ContractAsset) => void;
  readonly?: boolean;
}

export interface ContractApprovalProps {
  contract: ContractAsset;
  onApprove: (contract: ContractAsset, notes?: string) => Promise<void>;
  onReject: (contract: ContractAsset, reason: string) => Promise<void>;
  onRequestChanges: (contract: ContractAsset, changes: string) => Promise<void>;
  loading?: boolean;
}

export interface ContractSignatureProps {
  contract: ContractAsset;
  onSign: (contract: ContractAsset, signatureData: SignatoryInfo) => Promise<void>;
  onRequestSignature: (contract: ContractAsset, signatories: SignatoryInfo[]) => Promise<void>;
  loading?: boolean;
}

// Contract analytics interfaces
export interface ContractAnalyticsProps {
  analytics: ContractAnalytics;
  loading?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
}

// Contract template interfaces
export interface ContractTemplateProps {
  template: ContractTemplate;
  onUseTemplate: (template: ContractTemplate) => void;
  onEditTemplate?: (template: ContractTemplate) => void;
  onDeleteTemplate?: (template: ContractTemplate) => void;
  readonly?: boolean;
}

// Contract export/import interfaces
export interface ContractExportProps {
  contracts: ContractAsset[];
  onExport: (format: 'csv' | 'xlsx' | 'json' | 'pdf', contracts: ContractAsset[]) => Promise<void>;
  loading?: boolean;
}

export interface ContractImportProps {
  onImport: (file: File, options: unknown) => Promise<void>;
  onTemplateDownload: () => void;
  loading?: boolean;
}
