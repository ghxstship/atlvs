// Jobs Module Type Definitions
// Comprehensive TypeScript interfaces for the Jobs module and all submodules

import type { DataRecord } from '@ghxstship/ui';

// ============================================================================
// MAIN JOB ENTITY
// ============================================================================

export interface Job extends DataRecord {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  status: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  due_at?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields from joins
  project_title?: string;
  project_name?: string;
  created_by_name?: string;
  created_by_email?: string;
}

export interface CreateJobRequest {
  title: string;
  status?: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  project_id?: string;
  due_at?: string;
}

export interface UpdateJobRequest {
  title?: string;
  status?: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  project_id?: string;
  due_at?: string;
}

// ============================================================================
// JOB ASSIGNMENTS
// ============================================================================

export interface JobAssignment extends DataRecord {
  id: string;
  job_id: string;
  assignee_user_id: string;
  note?: string;
  assigned_at: string;
  
  // Enhanced fields from joins
  job_title?: string;
  job_status?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
  project_title?: string;
}

export interface CreateAssignmentRequest {
  job_id: string;
  assignee_user_id: string;
  note?: string;
}

export interface UpdateAssignmentRequest {
  job_id?: string;
  assignee_user_id?: string;
  note?: string;
}

// ============================================================================
// OPPORTUNITIES
// ============================================================================

export interface Opportunity extends DataRecord {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  opens_at?: string;
  closes_at?: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields from joins
  project_title?: string;
  project_name?: string;
  bids_count?: number;
  highest_bid?: number;
  lowest_bid?: number;
}

export interface CreateOpportunityRequest {
  title: string;
  description?: string;
  project_id?: string;
  status?: 'open' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  opens_at?: string;
  closes_at?: string;
}

export interface UpdateOpportunityRequest {
  title?: string;
  description?: string;
  project_id?: string;
  status?: 'open' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  opens_at?: string;
  closes_at?: string;
}

// ============================================================================
// BIDS
// ============================================================================

export interface Bid extends DataRecord {
  id: string;
  opportunity_id: string;
  company_id: string;
  amount: number;
  currency?: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  
  // Enhanced fields from joins
  opportunity_title?: string;
  company_name?: string;
  company_logo?: string;
  project_title?: string;
  project_id?: string;
}

export interface CreateBidRequest {
  opportunity_id: string;
  company_id: string;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface UpdateBidRequest {
  amount?: number;
  currency?: string;
  status?: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  notes?: string;
}

// ============================================================================
// CONTRACTS
// ============================================================================

export interface JobContract extends DataRecord {
  id: string;
  job_id: string;
  company_id: string;
  title?: string;
  contract_type?: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  start_date?: string;
  end_date?: string;
  value?: number;
  currency?: string;
  document_url?: string;
  terms?: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields from joins
  job_title?: string;
  company_name?: string;
  company_logo?: string;
  project_title?: string;
  project_id?: string;
}

export interface CreateContractRequest {
  job_id: string;
  company_id: string;
  title?: string;
  contract_type?: string;
  status?: 'draft' | 'active' | 'completed' | 'terminated';
  start_date?: string;
  end_date?: string;
  value?: number;
  currency?: string;
  document_url?: string;
  terms?: string;
}

export interface UpdateContractRequest {
  title?: string;
  contract_type?: string;
  status?: 'draft' | 'active' | 'completed' | 'terminated';
  start_date?: string;
  end_date?: string;
  value?: number;
  currency?: string;
  document_url?: string;
  terms?: string;
}

// ============================================================================
// COMPLIANCE
// ============================================================================

export interface JobCompliance extends DataRecord {
  id: string;
  job_id: string;
  kind: 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
  title?: string;
  description?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_at?: string;
  completed_at?: string;
  assigned_to?: string;
  reviewer?: string;
  evidence_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields from joins
  job_title?: string;
  project_title?: string;
  assigned_to_name?: string;
  reviewer_name?: string;
}

export interface CreateComplianceRequest {
  job_id: string;
  kind: 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
  title?: string;
  description?: string;
  status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_at?: string;
  assigned_to?: string;
  reviewer?: string;
  evidence_url?: string;
  notes?: string;
}

export interface UpdateComplianceRequest {
  kind?: 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
  title?: string;
  description?: string;
  status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_at?: string;
  completed_at?: string;
  assigned_to?: string;
  reviewer?: string;
  evidence_url?: string;
  notes?: string;
}

// ============================================================================
// RFPS (REQUEST FOR PROPOSALS)
// ============================================================================

export interface RFP extends DataRecord {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  submission_deadline?: string;
  evaluation_criteria?: string;
  requirements?: string;
  contact_email?: string;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields from joins
  project_title?: string;
  project_name?: string;
  submissions_count?: number;
  average_bid?: number;
}

export interface CreateRfpRequest {
  title: string;
  description?: string;
  project_id?: string;
  status?: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  submission_deadline?: string;
  evaluation_criteria?: string;
  requirements?: string;
  contact_email?: string;
}

export interface UpdateRfpRequest {
  title?: string;
  description?: string;
  project_id?: string;
  status?: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  submission_deadline?: string;
  evaluation_criteria?: string;
  requirements?: string;
  contact_email?: string;
}

// ============================================================================
// STATISTICS AND ANALYTICS
// ============================================================================

export interface JobsStats {
  total: number;
  open: number;
  in_progress: number;
  blocked: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completion_rate: number;
  average_completion_time: number;
}

export interface AssignmentsStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  by_assignee: Array<{
    assignee_id: string;
    assignee_name: string;
    count: number;
  }>;
}

export interface OpportunitiesStats {
  total: number;
  open: number;
  closed: number;
  awarded: number;
  cancelled: number;
  total_value: number;
  average_value: number;
  win_rate: number;
}

export interface BidsStats {
  total: number;
  submitted: number;
  under_review: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  total_value: number;
  average_value: number;
  win_rate: number;
}

export interface ContractsStats {
  total: number;
  draft: number;
  active: number;
  completed: number;
  terminated: number;
  total_value: number;
  average_value: number;
  expiring_soon: number;
}

export interface ComplianceStats {
  total: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
  overdue: number;
  by_kind: Array<{
    kind: string;
    count: number;
  }>;
}

export interface RfpStats {
  total: number;
  draft: number;
  published: number;
  closed: number;
  awarded: number;
  cancelled: number;
  total_submissions: number;
  average_submissions: number;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

export interface JobFormData {
  title: string;
  status: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  project_id?: string;
  due_at?: string;
}

export interface AssignmentFormData {
  job_id: string;
  assignee_user_id: string;
  note?: string;
}

export interface OpportunityFormData {
  title: string;
  description?: string;
  project_id?: string;
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  opens_at?: string;
  closes_at?: string;
}

export interface BidFormData {
  opportunity_id: string;
  company_id: string;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface ContractFormData {
  job_id: string;
  company_id: string;
  title?: string;
  contract_type?: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  start_date?: string;
  end_date?: string;
  value?: number;
  currency?: string;
  document_url?: string;
  terms?: string;
}

export interface ComplianceFormData {
  job_id: string;
  kind: 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
  title?: string;
  description?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_at?: string;
  assigned_to?: string;
  reviewer?: string;
  evidence_url?: string;
  notes?: string;
}

export interface RfpFormData {
  title: string;
  description?: string;
  project_id?: string;
  status: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  budget?: number;
  currency?: string;
  submission_deadline?: string;
  evaluation_criteria?: string;
  requirements?: string;
  contact_email?: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignmentsResponse {
  assignments: JobAssignment[];
  total: number;
  page: number;
  limit: number;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total: number;
  page: number;
  limit: number;
}

export interface BidsResponse {
  bids: Bid[];
  total: number;
  page: number;
  limit: number;
}

export interface ContractsResponse {
  contracts: JobContract[];
  total: number;
  page: number;
  limit: number;
}

export interface ComplianceResponse {
  compliance: JobCompliance[];
  total: number;
  page: number;
  limit: number;
}

export interface RfpsResponse {
  rfps: RFP[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// FILTER AND SEARCH INTERFACES
// ============================================================================

export interface JobsFilters {
  status?: string;
  project_id?: string;
  created_by?: string;
  due_before?: string;
  due_after?: string;
  search?: string;
}

export interface AssignmentsFilters {
  job_id?: string;
  assignee_user_id?: string;
  status?: string;
  assigned_after?: string;
  assigned_before?: string;
  search?: string;
}

export interface OpportunitiesFilters {
  status?: string;
  project_id?: string;
  stage?: string;
  budget_min?: number;
  budget_max?: number;
  closes_after?: string;
  closes_before?: string;
  search?: string;
}

export interface BidsFilters {
  opportunity_id?: string;
  company_id?: string;
  status?: string;
  amount_min?: number;
  amount_max?: number;
  submitted_after?: string;
  submitted_before?: string;
  search?: string;
}

export interface ContractsFilters {
  job_id?: string;
  company_id?: string;
  status?: string;
  contract_type?: string;
  value_min?: number;
  value_max?: number;
  start_after?: string;
  start_before?: string;
  end_after?: string;
  end_before?: string;
  search?: string;
}

export interface ComplianceFilters {
  job_id?: string;
  kind?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  reviewer?: string;
  due_after?: string;
  due_before?: string;
  search?: string;
}

export interface RfpsFilters {
  status?: string;
  project_id?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_after?: string;
  deadline_before?: string;
  search?: string;
}
