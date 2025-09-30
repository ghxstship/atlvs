// import { z } from 'zod';

// Approval Status Enum
export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SKIPPED: 'skipped'
} as const;

export type ApprovalStatusType = typeof ApprovalStatus[keyof typeof ApprovalStatus];

// Approval Action Types
export const ApprovalAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
  DELEGATE: 'delegate',
  SKIP: 'skip',
  REQUEST_INFO: 'request_info'
} as const;

export type ApprovalActionType = typeof ApprovalAction[keyof typeof ApprovalAction];

// Policy Condition Types
export const PolicyConditionType = {
  AMOUNT_THRESHOLD: 'amount_threshold',
  CATEGORY: 'category',
  DEPARTMENT: 'department',
  REQUESTER_ROLE: 'requester_role',
  PROJECT_TYPE: 'project_type'
} as const;

// Approval Step Schema
export const ApprovalStepSchema = z.object({
  id: z.string().uuid().optional(),
  request_id: z.string().uuid(),
  approver_id: z.string().uuid(),
  step_order: z.number().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'skipped']).default('pending'),
  approved_at: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Relations
  approver: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email()
  }).optional(),
  request: z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: z.string(),
    estimated_total: z.number()
  }).optional()
});

// Approval Policy Schema
export const ApprovalPolicySchema = z.object({
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  conditions: z.record(z.any()).default({}),
  approval_steps: z.array(z.object({
    step: z.number(),
    role: z.string(),
    description: z.string(),
    conditions: z.record(z.any()).optional()
  })).default([]),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Approval Workflow Schema
export const ApprovalWorkflowSchema = z.object({
  id: z.string().uuid().optional(),
  request_id: z.string().uuid(),
  policy_id: z.string().uuid().optional(),
  current_step: z.number().default(1),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Relations
  steps: z.array(ApprovalStepSchema).optional(),
  policy: ApprovalPolicySchema.optional(),
  request: z.object({
    id: z.string().uuid(),
    title: z.string(),
    requester_id: z.string().uuid(),
    estimated_total: z.number(),
    status: z.string()
  }).optional()
});

// Type exports
export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;
export type ApprovalPolicy = z.infer<typeof ApprovalPolicySchema>;
export type ApprovalWorkflow = z.infer<typeof ApprovalWorkflowSchema>;

// Create Policy Schema
export const CreateApprovalPolicySchema = ApprovalPolicySchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export type CreateApprovalPolicy = z.infer<typeof CreateApprovalPolicySchema>;

// Update Policy Schema
export const UpdateApprovalPolicySchema = ApprovalPolicySchema.partial().extend({
  id: z.string().uuid()
});

export type UpdateApprovalPolicy = z.infer<typeof UpdateApprovalPolicySchema>;

// Approval Decision Schema
export const ApprovalDecisionSchema = z.object({
  step_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'delegate', 'skip', 'request_info']),
  notes: z.string().optional(),
  delegate_to: z.string().uuid().optional()
});

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

// Approval Filters
export interface ApprovalFilters {
  status?: ApprovalStatusType[];
  approver_id?: string;
  request_status?: string[];
  amount_range?: {
    min: number;
    max: number;
  };
  date_range?: {
    start: string;
    end: string;
  };
  policy_id?: string;
}

// Approval Sort Options
export interface ApprovalSortOptions {
  field: 'created_at' | 'updated_at' | 'step_order' | 'approved_at' | 'request_title' | 'estimated_total';
  direction: 'asc' | 'desc';
}

// Approval Statistics
export interface ApprovalStatistics {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  average_approval_time: number; // in hours
  approval_rate: number; // percentage
  by_approver: Record<string, {
    name: string;
    pending: number;
    approved: number;
    rejected: number;
    avg_time: number;
  }>;
  by_amount_range: Record<string, number>;
}

// Policy Condition Interfaces
export interface AmountThresholdCondition {
  type: 'amount_threshold';
  min_amount?: number;
  max_amount?: number;
  currency?: string;
}

export interface CategoryCondition {
  type: 'category';
  categories: string[];
}

export interface DepartmentCondition {
  type: 'department';
  departments: string[];
}

export interface RequesterRoleCondition {
  type: 'requester_role';
  roles: string[];
}

export type PolicyCondition = 
  | AmountThresholdCondition 
  | CategoryCondition 
  | DepartmentCondition 
  | RequesterRoleCondition;

// Approval Step Configuration
export interface ApprovalStepConfig {
  step: number;
  role: string;
  description: string;
  conditions?: Record<string, unknown>;
  required?: boolean;
  parallel?: boolean; // Can be approved in parallel with other steps
  timeout_hours?: number; // Auto-approve after timeout
}

// Approval Notification
export interface ApprovalNotification {
  id: string;
  step_id: string;
  approver_id: string;
  type: 'approval_required' | 'approval_reminder' | 'approval_escalation';
  sent_at: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
}

// Approval Escalation Rule
export interface ApprovalEscalationRule {
  id: string;
  policy_id: string;
  step_order: number;
  escalate_after_hours: number;
  escalate_to: string; // user_id or role
  escalation_type: 'user' | 'role' | 'skip';
  is_active: boolean;
}

// Approval Delegation
export interface ApprovalDelegation {
  id: string;
  delegator_id: string;
  delegate_id: string;
  start_date: string;
  end_date?: string;
  conditions?: Record<string, unknown>; // Optional conditions for when delegation applies
  is_active: boolean;
  created_at: string;
}

// Bulk Approval Request
export interface BulkApprovalRequest {
  step_ids: string[];
  action: ApprovalActionType;
  notes?: string;
}

// Approval Dashboard Data
export interface ApprovalDashboardData {
  pending_approvals: ApprovalStep[];
  recent_decisions: ApprovalStep[];
  statistics: ApprovalStatistics;
  overdue_approvals: ApprovalStep[];
  delegations: ApprovalDelegation[];
}
