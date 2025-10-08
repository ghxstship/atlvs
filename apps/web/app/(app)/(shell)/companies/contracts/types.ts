// Contracts Subdirectory Types

export interface ContractFilters {
  search?: string;
  company_id?: string;
  type?: CompanyContract['type'][];
  status?: CompanyContract['status'][];
  value_min?: number;
  value_max?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  expiring_soon?: boolean;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  expiringContracts: number;
  totalValue: number;
  averageValue: number;
  renewalRate: number;
  contractsByType: Record<string, number>;
  contractsByStatus: Record<string, number>;
}

export interface ContractFormData {
  company_id: string;
  title: string;
  description?: string;
  type: CompanyContract['type'];
  value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  auto_renew?: boolean;
  renewal_notice_days?: number;
  document_url?: string;
  notes?: string;
}

// Re-export from parent types
export type {
  CompanyContract,
  CreateContractForm
} from '../types';
