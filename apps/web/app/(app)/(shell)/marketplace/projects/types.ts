import type { DataRecord } from '@ghxstship/ui';

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  scope: string;
  budget_type: 'fixed' | 'hourly' | 'not_specified';
  budget_min?: number;
  budget_max?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  experience_level: 'entry' | 'intermediate' | 'expert';
  skills_required: string[];
  deliverables: Array<{
    title: string;
    description: string;
    due_date?: string;
  }>;
  visibility: 'public' | 'private' | 'invite_only';
  is_urgent: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  openProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalProposals: number;
  averageProjectValue: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface ProjectActivity extends DataRecord {
  id: string;
  project_id: string;
  type: 'created' | 'updated' | 'proposal_received' | 'status_changed';
  user_id?: string;
  user_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ProjectProposal extends DataRecord {
  id: string;
  project_id: string;
  vendor_id: string;
  vendor_name?: string;
  cover_letter: string;
  bid_amount: number;
  currency: string;
  proposed_timeline: string;
  status: 'draft' | 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface ProjectSearchFilters {
  query?: string;
  category?: string;
  budget_type?: 'fixed' | 'hourly' | 'not_specified';
  budget_range?: {
    min?: number;
    max?: number;
  };
  location_type?: 'remote' | 'onsite' | 'hybrid';
  experience_level?: 'entry' | 'intermediate' | 'expert';
  status?: string;
  sortBy?: 'created_at' | 'updated_at' | 'budget_min' | 'start_date';
  sortOrder?: 'asc' | 'desc';
}
