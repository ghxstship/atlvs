export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated' | 'expired';
export type ContractType = 'msa' | 'sow' | 'service_agreement' | 'consulting' | 'construction';

export interface JobContract {
  id: string;
  organizationId: string;
  jobId: string;
  companyId?: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  documentUrl?: string;
  terms?: string;
  paymentTerms?: string;
  deliverables?: string[];
  milestones?: JobContractMilestone[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobContractMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  amount?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
}

export interface CreateContractRequest {
  organizationId: string;
  jobId: string;
  companyId?: string;
  title: string;
  type: ContractType;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  terms?: string;
  paymentTerms?: string;
  deliverables?: string[];
  notes?: string;
}

export interface UpdateContractRequest {
  title?: string;
  type?: ContractType;
  status?: ContractStatus;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  documentUrl?: string;
  terms?: string;
  paymentTerms?: string;
  deliverables?: string[];
  notes?: string;
}

export interface ContractFilters {
  status?: ContractStatus[];
  type?: ContractType[];
  companyId?: string;
  minValue?: number;
  maxValue?: number;
  startDate?: {
    from?: string;
    to?: string;
  };
  endDate?: {
    from?: string;
    to?: string;
  };
}

export interface ContractRepository {
  findById(id: string, orgId: string): Promise<JobContract | null>;
  list(orgId: string, filters?: ContractFilters, limit?: number, offset?: number): Promise<JobContract[]>;
  create(entity: JobContract): Promise<JobContract>;
  update(id: string, orgId: string, partial: Partial<JobContract>): Promise<JobContract>;
  delete(id: string, orgId: string): Promise<void>;
  activate(id: string, orgId: string): Promise<JobContract>;
  terminate(id: string, orgId: string, reason?: string): Promise<JobContract>;
  addMilestone(contractId: string, orgId: string, milestone: Omit<JobContractMilestone, 'id'>): Promise<JobContractMilestone>;
  updateMilestone(contractId: string, milestoneId: string, orgId: string, updates: Partial<JobContractMilestone>): Promise<JobContractMilestone>;
  getStats(orgId: string): Promise<{
    totalContracts: number;
    activeContracts: number;
    totalValue: number;
    completedValue: number;
    countByStatus: Record<ContractStatus, number>;
    countByType: Record<ContractType, number>;
  }>;
}
