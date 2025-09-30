import type { DataRecord } from '@ghxstship/ui';

export interface ContractFormData {
  title: string;
  description?: string;
  project_id?: string;
  proposal_id?: string;
  client_id: string;
  vendor_id: string;
  contract_type: 'fixed' | 'hourly' | 'retainer' | 'milestone';
  scope_of_work: string;
  deliverables: Array<{
    title: string;
    description: string;
    due_date?: string;
    amount?: number;
  }>;
  terms_conditions?: string;
  total_amount: number;
  currency: string;
  payment_schedule?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue';
  }>;
  start_date: string;
  end_date: string;
  escrow_enabled: boolean;
  escrow_amount?: number;
  auto_renewal?: boolean;
  renewal_terms?: string;
  cancellation_terms?: string;
  dispute_resolution?: string;
}

export interface ContractData extends DataRecord {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  project_title?: string;
  proposal_id?: string;
  client_id: string;
  client_name?: string;
  vendor_id: string;
  vendor_name?: string;
  organization_id: string;
  contract_type: 'fixed' | 'hourly' | 'retainer' | 'milestone';
  scope_of_work: string;
  deliverables: Array<{
    title: string;
    description: string;
    due_date?: string;
    amount?: number;
    status?: 'pending' | 'completed' | 'overdue';
  }>;
  terms_conditions?: string;
  total_amount: number;
  currency: string;
  payment_schedule?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue';
  }>;
  start_date: string;
  end_date: string;
  escrow_enabled: boolean;
  escrow_amount?: number;
  escrow_released?: number;
  client_signed: boolean;
  client_signed_at?: string;
  vendor_signed: boolean;
  vendor_signed_at?: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'terminated' | 'disputed';
  document_url?: string;
  signature_urls?: {
    client?: string;
    vendor?: string;
  };
  auto_renewal?: boolean;
  renewal_terms?: string;
  cancellation_terms?: string;
  dispute_resolution?: string;
  created_at: string;
  updated_at: string;
  role: 'client' | 'vendor';
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  pendingSignatures: number;
  totalValue: number;
  escrowBalance: number;
  averageContractValue: number;
  contractTypeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  monthlySignings: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

export interface ContractActivity extends DataRecord {
  id: string;
  contract_id: string;
  type: 'created' | 'signed' | 'milestone_completed' | 'payment_made' | 'terminated' | 'disputed';
  user_id: string;
  user_name?: string;
  description: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ContractTemplate extends DataRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  contract_type: 'fixed' | 'hourly' | 'retainer' | 'milestone';
  template_content: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'currency';
    required: boolean;
    default_value?: string;
  }>;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    required: boolean;
    editable: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ContractDispute extends DataRecord {
  id: string;
  contract_id: string;
  raised_by: string;
  raised_by_name?: string;
  dispute_type: 'payment' | 'scope' | 'quality' | 'timeline' | 'other';
  description: string;
  amount_disputed?: number;
  currency?: string;
  evidence?: Array<{
    type: 'document' | 'image' | 'message';
    url: string;
    description?: string;
  }>;
  status: 'open' | 'mediation' | 'arbitration' | 'resolved' | 'closed';
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractSearchFilters {
  query?: string;
  contract_type?: 'fixed' | 'hourly' | 'retainer' | 'milestone';
  status?: 'draft' | 'pending' | 'active' | 'completed' | 'terminated' | 'disputed';
  role?: 'client' | 'vendor';
  amount_range?: {
    min?: number;
    max?: number;
  };
  date_range?: {
    start?: string;
    end?: string;
  };
  escrow_enabled?: boolean;
  signatures_pending?: boolean;
  project_id?: string;
  sortBy?: 'created_at' | 'start_date' | 'end_date' | 'total_amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface SignatureRequest {
  contract_id: string;
  signer_id: string;
  signer_email: string;
  signer_name: string;
  signer_role: 'client' | 'vendor';
  signature_fields: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'signature' | 'initial' | 'date';
  }>;
  redirect_url?: string;
  message?: string;
}
