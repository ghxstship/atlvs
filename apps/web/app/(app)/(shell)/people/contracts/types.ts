import { type DataRecord } from '@ghxstship/ui';

export interface Contract extends DataRecord {
  id: string;
  person_id: string;
  project_id: string;
  type: 'employment' | 'freelance' | 'nda' | 'vendor' | 'service';
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated';
  start_date: string;
  end_date?: string;
  value?: number;
  currency: string;
  signed_date?: string;
  document_url?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  project?: {
    name: string;
    status: string;
  };
}

export interface ContractFilters {
  person_id?: string;
  project_id?: string;
  type?: Contract['type'];
  status?: Contract['status'];
  start_date_from?: string;
  start_date_to?: string;
}

export interface ContractSort {
  field: keyof Contract;
  direction: 'asc' | 'desc';
}

export interface ContractStats {
  total: number;
  by_status: Record<Contract['status'], number>;
  by_type: Record<Contract['type'], number>;
  total_value: number;
  expiring_soon: number;
}

export interface CreateContractData {
  person_id: string;
  project_id: string;
  type: Contract['type'];
  start_date: string;
  end_date?: string;
  value?: number;
  currency: string;
  notes?: string;
}

export interface UpdateContractData extends Partial<CreateContractData> {
  status?: Contract['status'];
  signed_date?: string;
  document_url?: string;
}

export const CONTRACT_TYPES = [
  { id: 'employment', name: 'Employment Contract', color: 'bg-accent' },
  { id: 'freelance', name: 'Freelance Agreement', color: 'bg-success' },
  { id: 'nda', name: 'Non-Disclosure Agreement', color: 'bg-secondary' },
  { id: 'vendor', name: 'Vendor Agreement', color: 'bg-warning' },
  { id: 'service', name: 'Service Contract', color: 'bg-destructive' }
] as const;
