import { type DataRecord } from '@ghxstship/ui';

// Core RFP types
export type RfpStatus = 'open' | 'closed' | 'awarded' | 'cancelled';
export type RfpCategory = 'construction' | 'consulting' | 'technology' | 'services' | 'supplies' | 'other';
export type RfpPriority = 'low' | 'medium' | 'high' | 'critical';
export type RfpEvaluationCriteria = 'price' | 'quality' | 'experience' | 'timeline' | 'technical' | 'references';

// Main RFP interface
export interface JobRfp extends DataRecord {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: RfpStatus;
  due_at?: string;
  created_at: string;
  // Enhanced fields from joins
  project_title?: string;
  organization_name?: string;
  category?: RfpCategory;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  requirements?: string[];
  evaluation_criteria?: RfpEvaluationCriteria[];
  submission_guidelines?: string;
  contact_person?: string;
  contact_email?: string;
  location?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  award_date?: string;
  winner_id?: string;
  winner_name?: string;
  notes?: string;
}

// API response types
export interface RfpsResponse {
  rfps: JobRfp[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateRfpData {
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  category?: RfpCategory;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  requirements?: string[];
  evaluation_criteria?: RfpEvaluationCriteria[];
  submission_guidelines?: string;
  contact_person?: string;
  contact_email?: string;
  location?: string;
  duration?: string;
  due_at?: string;
  start_date?: string;
  end_date?: string;
  priority?: RfpPriority;
  notes?: string;
}

export interface UpdateRfpData extends Partial<CreateRfpData> {
  id: string;
  status?: RfpStatus;
  award_date?: string;
  winner_id?: string;
}

// Filter and search types
export interface RfpFilters {
  status?: RfpStatus;
  category?: RfpCategory;
  organization_id?: string;
  project_id?: string;
  priority?: RfpPriority;
  budget_min?: number;
  budget_max?: number;
  search?: string;
  location?: string;
  evaluation_criteria?: RfpEvaluationCriteria[];
  date_from?: string;
  date_to?: string;
  due_soon?: boolean;
  contact_person?: string;
}

// Statistics types
export interface RfpStats {
  total: number;
  byStatus: Record<RfpStatus, number>;
  byCategory: Record<RfpCategory, number>;
  totalValue: number;
  averageValue: number;
  activeRfps: number;
  dueSoonRfps: number;
  recentRfps: number;
  awardRate: number;
  averageResponseTime: number;
  totalSubmissions: number;
}

// View configuration types
export interface RfpViewConfig {
  showBudgets: boolean;
  groupByCategory: boolean;
  showProjectDetails: boolean;
  showDueAlerts: boolean;
  defaultSort: 'created_at' | 'due_at' | 'budget_max' | 'status' | 'title';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
  currencyDisplay: string;
  evaluationDisplay: boolean;
}

// Drawer types
export interface RfpDrawerProps {
  rfp?: JobRfp;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateRfpData | UpdateRfpData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface RfpService {
  getRfps: (filters?: RfpFilters) => Promise<RfpsResponse>;
  getRfp: (id: string) => Promise<JobRfp>;
  createRfp: (data: CreateRfpData) => Promise<JobRfp>;
  updateRfp: (data: UpdateRfpData) => Promise<JobRfp>;
  deleteRfp: (id: string) => Promise<void>;
  getRfpStats: () => Promise<RfpStats>;
  closeRfp: (id: string) => Promise<JobRfp>;
  awardRfp: (id: string, winnerId: string) => Promise<JobRfp>;
  cancelRfp: (id: string, reason?: string) => Promise<JobRfp>;
  publishRfp: (id: string) => Promise<JobRfp>;
}

// Project integration types
export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  status?: string;
  organization_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  client_name?: string;
}

// Organization integration types
export interface OrganizationInfo {
  id: string;
  name: string;
  type?: string;
  industry?: string;
  location?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
}

// RFP submission types
export interface RfpSubmission {
  id: string;
  rfp_id: string;
  vendor_id: string;
  vendor_name: string;
  submitted_at: string;
  proposal_document_url?: string;
  bid_amount?: number;
  currency?: string;
  timeline?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'selected' | 'rejected';
  evaluation_score?: number;
  evaluator_notes?: string;
  contact_person?: string;
  contact_email?: string;
}

// RFP evaluation types
export interface RfpEvaluation {
  id: string;
  rfp_id: string;
  submission_id: string;
  evaluator_id: string;
  evaluation_date: string;
  criteria_scores: Record<RfpEvaluationCriteria, number>;
  total_score: number;
  max_score: number;
  comments: string;
  recommendation: 'accept' | 'reject' | 'shortlist' | 'request_clarification';
  strengths?: string[];
  weaknesses?: string[];
}

// RFP template types
export interface RfpTemplate {
  id: string;
  name: string;
  category: RfpCategory;
  description?: string;
  template_content: string;
  requirements_template: string[];
  evaluation_criteria_template: RfpEvaluationCriteria[];
  submission_guidelines_template: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

// RFP activity types
export interface RfpActivity {
  id: string;
  rfp_id: string;
  activity_type: 'created' | 'updated' | 'published' | 'submission_received' | 'evaluated' | 'awarded' | 'closed' | 'cancelled';
  description: string;
  performed_by: string;
  performed_at: string;
  metadata?: Record<string, unknown>;
}

// RFP vendor types
export interface RfpVendor {
  id: string;
  rfp_id: string;
  vendor_id: string;
  vendor_name: string;
  invited_at?: string;
  invitation_status: 'invited' | 'viewed' | 'declined' | 'submitted';
  submission_id?: string;
  notes?: string;
}

// RFP document types
export interface RfpDocument {
  id: string;
  rfp_id: string;
  document_name: string;
  document_url: string;
  document_type: 'specification' | 'template' | 'reference' | 'legal' | 'other';
  uploaded_by: string;
  uploaded_at: string;
  is_public: boolean;
  description?: string;
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
