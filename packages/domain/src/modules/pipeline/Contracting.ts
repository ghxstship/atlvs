export interface Contract {
  id: string;
  organizationId: string;
  projectId?: string;
  title: string;
  description?: string;
  type: 'service' | 'employment' | 'vendor' | 'nda' | 'licensing' | 'other';
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'signed' | 'active' | 'completed' | 'terminated' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  contractorId?: string;
  contractorName?: string;
  contractorEmail?: string;
  value?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  signedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  renewalDate?: string;
  autoRenewal: boolean;
  terms?: string;
  attachments?: string[];
  createdBy: string;
  approvedBy?: string;
  signedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: Contract['type'];
  template: string; // HTML or markdown template
  variables: string[]; // list of variable names that can be substituted
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractApproval {
  id: string;
  contractId: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments?: string;
  approvedAt?: string;
  rejectedAt?: string;
  delegatedTo?: string;
  createdAt?: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  deliverables?: string[];
  paymentAmount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractingRepository {
  // Contracts
  listContracts(organizationId: string, projectId?: string): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | null>;
  createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract>;
  updateContract(id: string, updates: Partial<Contract>): Promise<Contract>;
  deleteContract(id: string): Promise<void>;

  // Contract Templates
  listTemplates(organizationId: string): Promise<ContractTemplate[]>;
  getTemplate(id: string): Promise<ContractTemplate | null>;
  createTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate>;
  updateTemplate(id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate>;
  deleteTemplate(id: string): Promise<void>;

  // Contract Approvals
  listApprovals(contractId: string): Promise<ContractApproval[]>;
  getApproval(id: string): Promise<ContractApproval | null>;
  createApproval(approval: Omit<ContractApproval, 'id' | 'createdAt'>): Promise<ContractApproval>;
  updateApproval(id: string, updates: Partial<ContractApproval>): Promise<ContractApproval>;
  deleteApproval(id: string): Promise<void>;

  // Contract Milestones
  listMilestones(contractId: string): Promise<ContractMilestone[]>;
  getMilestone(id: string): Promise<ContractMilestone | null>;
  createMilestone(milestone: Omit<ContractMilestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractMilestone>;
  updateMilestone(id: string, updates: Partial<ContractMilestone>): Promise<ContractMilestone>;
  deleteMilestone(id: string): Promise<void>;

  // Bulk operations
  getContractDetails(contractId: string): Promise<{
    contract: Contract;
    approvals: ContractApproval[];
    milestones: ContractMilestone[];
  }>;
  generateContractFromTemplate(templateId: string, variables: Record<string, string>): Promise<string>;
  updateContractStatus(contractId: string, status: Contract['status'], notes?: string): Promise<Contract>;
  getExpiringContracts(organizationId: string, days: number): Promise<Contract[]>;
  getContractsByContractor(contractorId: string): Promise<Contract[]>;
}
