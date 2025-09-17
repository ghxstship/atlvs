export type WorkflowStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalLevel = 'manager' | 'director' | 'executive';

export interface ProcurementApproval {
  id: string;
  purchase_order_id: string;
  approver_id: string;
  approver_role: string;
  approval_level: ApprovalLevel;
  status: WorkflowStatus;
  comments?: string;
  approved_at?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRule {
  id: string;
  organization_id: string;
  min_amount: number;
  max_amount?: number;
  currency: string;
  required_approval_level: ApprovalLevel;
  requires_multiple_approvers: boolean;
  approver_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: 'approval' | 'notification' | 'validation';
  required_role: string;
  is_parallel: boolean;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcurementWorkflow {
  id: string;
  purchase_order_id: string;
  workflow_type: 'purchase_approval' | 'budget_validation' | 'compliance_check';
  status: WorkflowStatus;
  current_step: number;
  total_steps: number;
  initiated_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalRequest {
  purchase_order_id: string;
  approver_id: string;
  approval_level: ApprovalLevel;
  comments?: string;
}

export interface WorkflowRepository {
  findById(id: string, organizationId: string): Promise<ProcurementWorkflow | null>;
  findByPurchaseOrder(purchaseOrderId: string, organizationId: string): Promise<ProcurementWorkflow[]>;
  findPendingApprovals(organizationId: string, userId?: string): Promise<ProcurementWorkflow[]>;
  create(organizationId: string, data: Omit<ProcurementWorkflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<ProcurementWorkflow>;
  updateStatus(id: string, organizationId: string, status: WorkflowStatus): Promise<ProcurementWorkflow>;
  advanceStep(id: string, organizationId: string, completedBy: string): Promise<ProcurementWorkflow>;
}

export interface ApprovalRepository {
  findById(id: string, organizationId: string): Promise<ProcurementApproval | null>;
  findByPurchaseOrder(purchaseOrderId: string, organizationId: string): Promise<ProcurementApproval[]>;
  findPendingForUser(userId: string, organizationId: string): Promise<ProcurementApproval[]>;
  create(organizationId: string, data: CreateApprovalRequest): Promise<ProcurementApproval>;
  updateStatus(id: string, organizationId: string, status: WorkflowStatus, comments?: string): Promise<ProcurementApproval>;
}

export interface ApprovalRuleRepository {
  findByOrganization(organizationId: string): Promise<ApprovalRule[]>;
  findApplicableRules(amount: number, currency: string, organizationId: string): Promise<ApprovalRule[]>;
  create(organizationId: string, data: Omit<ApprovalRule, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<ApprovalRule>;
  update(id: string, organizationId: string, data: Partial<ApprovalRule>): Promise<ApprovalRule>;
  delete(id: string, organizationId: string): Promise<void>;
}
