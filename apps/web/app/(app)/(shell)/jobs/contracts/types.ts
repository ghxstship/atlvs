import { type DataRecord } from '@ghxstship/ui';

// Core contract types
export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated';
export type ContractType = 'employment' | 'freelance' | 'nda' | 'vendor' | 'service';
export type ContractPriority = 'low' | 'medium' | 'high' | 'critical';

// Main contract interface
export interface JobContract extends DataRecord {
  id: string;
  job_id: string;
  company_id: string;
  document_url?: string;
  status: ContractStatus;
  created_at: string;
  // Enhanced fields from joins
  job_title?: string;
  company_name?: string;
  project_title?: string;
  project_id?: string;
  organization_name?: string;
  contract_value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  terms?: string;
  notes?: string;
}

// API response types
export interface ContractsResponse {
  contracts: JobContract[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateContractData {
  job_id: string;
  company_id: string;
  type?: ContractType;
  contract_value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  document_url?: string;
  terms?: string;
  notes?: string;
  priority?: ContractPriority;
}

export interface UpdateContractData extends Partial<CreateContractData> {
  id: string;
  status?: ContractStatus;
  renewal_date?: string;
}

// Filter and search types
export interface ContractFilters {
  status?: ContractStatus;
  job_id?: string;
  company_id?: string;
  type?: ContractType;
  priority?: ContractPriority;
  value_min?: number;
  value_max?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  expiring_soon?: boolean;
}

// Statistics types
export interface ContractStats {
  total: number;
  byStatus: Record<ContractStatus, number>;
  byType: Record<ContractType, number>;
  totalValue: number;
  averageContractValue: number;
  activeContracts: number;
  expiringContracts: number;
  recentContracts: number;
  completionRate: number;
  renewalRate: number;
}

// View configuration types
export interface ContractViewConfig {
  showValues: boolean;
  groupByStatus: boolean;
  showJobDetails: boolean;
  showExpirationAlerts: boolean;
  defaultSort: 'created_at' | 'start_date' | 'end_date' | 'contract_value' | 'status';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
  currencyDisplay: string;
}

// Drawer types
export interface ContractDrawerProps {
  contract?: JobContract;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateContractData | UpdateContractData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface ContractService {
  getContracts: (filters?: ContractFilters) => Promise<ContractsResponse>;
  getContract: (id: string) => Promise<JobContract>;
  createContract: (data: CreateContractData) => Promise<JobContract>;
  updateContract: (data: UpdateContractData) => Promise<JobContract>;
  deleteContract: (id: string) => Promise<void>;
  getContractStats: () => Promise<ContractStats>;
  activateContract: (id: string) => Promise<JobContract>;
  terminateContract: (id: string, reason?: string) => Promise<JobContract>;
  renewContract: (id: string, newEndDate: string) => Promise<JobContract>;
}

// Job integration types
export interface JobInfo {
  id: string;
  title: string;
  description?: string;
  status?: string;
  project_id?: string;
  project_title?: string;
  organization_id?: string;
  due_at?: string;
  created_by?: string;
}

// Company integration types
export interface CompanyInfo {
  id: string;
  name: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  tax_id?: string;
}

// Contract milestone types
export interface ContractMilestone {
  id: string;
  contract_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  value?: number;
  deliverables?: string[];
}

// Contract amendment types
export interface ContractAmendment {
  id: string;
  contract_id: string;
  amendment_type: 'extension' | 'value_change' | 'scope_change' | 'termination';
  description: string;
  effective_date: string;
  old_value?: unknown;
  new_value?: unknown;
  approved_by?: string;
  approved_at?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

// Contract template types
export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  template_content: string;
  variables: string[];
  created_by: string;
  created_at: string;
  is_active: boolean;
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
