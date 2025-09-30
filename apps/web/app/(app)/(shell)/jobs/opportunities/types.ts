import { type DataRecord } from '@ghxstship/ui';

// Core opportunity types
export type OpportunityStatus = 'open' | 'closed' | 'awarded' | 'cancelled';
export type OpportunityType = 'construction' | 'technical' | 'creative' | 'logistics' | 'consulting' | 'other';
export type OpportunityPriority = 'low' | 'medium' | 'high' | 'critical';
export type OpportunityStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

// Main opportunity interface
export interface JobOpportunity extends DataRecord {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  status: OpportunityStatus;
  opens_at?: string;
  closes_at?: string;
  created_at: string;
  // Enhanced fields from joins
  project_title?: string;
  organization_name?: string;
  description?: string;
  requirements?: string[];
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  client_name?: string;
  client_contact?: string;
  location?: string;
  duration?: string;
  skills_required?: string[];
  experience_level?: string;
  stage?: OpportunityStage;
  probability?: number;
  estimated_value?: number;
  notes?: string;
}

// API response types
export interface OpportunitiesResponse {
  opportunities: JobOpportunity[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateOpportunityData {
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  type?: OpportunityType;
  requirements?: string[];
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  opens_at?: string;
  closes_at?: string;
  client_name?: string;
  client_contact?: string;
  location?: string;
  duration?: string;
  skills_required?: string[];
  experience_level?: string;
  priority?: OpportunityPriority;
  notes?: string;
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  id: string;
  status?: OpportunityStatus;
  stage?: OpportunityStage;
  probability?: number;
  estimated_value?: number;
}

// Filter and search types
export interface OpportunityFilters {
  status?: OpportunityStatus;
  type?: OpportunityType;
  stage?: OpportunityStage;
  organization_id?: string;
  project_id?: string;
  priority?: OpportunityPriority;
  budget_min?: number;
  budget_max?: number;
  value_min?: number;
  value_max?: number;
  search?: string;
  location?: string;
  skills?: string[];
  date_from?: string;
  date_to?: string;
  closing_soon?: boolean;
}

// Statistics types
export interface OpportunityStats {
  total: number;
  byStatus: Record<OpportunityStatus, number>;
  byStage: Record<OpportunityStage, number>;
  byType: Record<OpportunityType, number>;
  totalValue: number;
  averageValue: number;
  winRate: number;
  pipelineValue: number;
  activeOpportunities: number;
  closingOpportunities: number;
  recentOpportunities: number;
  conversionRate: number;
}

// View configuration types
export interface OpportunityViewConfig {
  showBudgets: boolean;
  groupByStage: boolean;
  showProjectDetails: boolean;
  showClosingAlerts: boolean;
  defaultSort: 'created_at' | 'closes_at' | 'estimated_value' | 'probability' | 'status';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
  currencyDisplay: string;
  probabilityDisplay: boolean;
}

// Drawer types
export interface OpportunityDrawerProps {
  opportunity?: JobOpportunity;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateOpportunityData | UpdateOpportunityData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface OpportunityService {
  getOpportunities: (filters?: OpportunityFilters) => Promise<OpportunitiesResponse>;
  getOpportunity: (id: string) => Promise<JobOpportunity>;
  createOpportunity: (data: CreateOpportunityData) => Promise<JobOpportunity>;
  updateOpportunity: (data: UpdateOpportunityData) => Promise<JobOpportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  getOpportunityStats: () => Promise<OpportunityStats>;
  closeOpportunity: (id: string) => Promise<JobOpportunity>;
  awardOpportunity: (id: string, winnerId: string) => Promise<JobOpportunity>;
  cancelOpportunity: (id: string, reason?: string) => Promise<JobOpportunity>;
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

// Opportunity pipeline types
export interface OpportunityPipeline {
  stage: OpportunityStage;
  opportunities: JobOpportunity[];
  totalValue: number;
  averageProbability: number;
  count: number;
}

// Opportunity activity types
export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  activity_type: 'created' | 'updated' | 'stage_changed' | 'note_added' | 'contact_made' | 'proposal_sent' | 'meeting_scheduled';
  description: string;
  performed_by: string;
  performed_at: string;
  metadata?: Record<string, unknown>;
}

// Opportunity contact types
export interface OpportunityContact {
  id: string;
  opportunity_id: string;
  contact_type: 'email' | 'phone' | 'meeting' | 'proposal' | 'follow_up';
  contact_date: string;
  contact_person?: string;
  subject?: string;
  notes?: string;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
}

// Opportunity proposal types
export interface OpportunityProposal {
  id: string;
  opportunity_id: string;
  proposal_title: string;
  proposal_document_url?: string;
  submitted_at: string;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  feedback?: string;
  value: number;
  currency: string;
  validity_period?: string;
}

// Opportunity competitor types
export interface OpportunityCompetitor {
  id: string;
  opportunity_id: string;
  competitor_name: string;
  competitor_type?: string;
  strengths?: string[];
  weaknesses?: string[];
  estimated_bid?: number;
  win_probability?: number;
  notes?: string;
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
