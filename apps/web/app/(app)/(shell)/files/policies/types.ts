// Policies - Type Definitions
// Specialized type definitions for organizational policies and governance

export interface Policy {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  content: string;
  policy_type: 'hr' | 'security' | 'compliance' | 'operational' | 'financial' | 'legal' | 'other';
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  effective_date?: string | null;
  expiry_date?: string | null;
  review_date?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  tags: string[];
  departments: string[];
  roles_affected: string[];
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  approval_required: boolean;
  approver_id?: string | null;
  approved_at?: string | null;
  view_count: number;
  download_count: number;
  acknowledgment_required: boolean;
  is_mandatory: boolean;
  language: string;
  related_policies: string[];
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CreatePolicyData {
  title: string;
  description?: string;
  content: string;
  policy_type: Policy['policy_type'];
  category: string;
  version?: string;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  tags?: string[];
  departments?: string[];
  roles_affected?: string[];
  access_level?: Policy['access_level'];
  approval_required?: boolean;
  acknowledgment_required?: boolean;
  is_mandatory?: boolean;
  language?: string;
  related_policies?: string[];
}

export interface UpdatePolicyData extends Partial<CreatePolicyData> {
  id: string;
  status?: Policy['status'];
  approver_id?: string;
  approved_at?: string;
}

export interface PolicyFilters {
  policy_type?: Policy['policy_type'];
  category?: string;
  status?: Policy['status'];
  access_level?: Policy['access_level'];
  departments?: string[];
  roles_affected?: string[];
  approval_required?: boolean;
  acknowledgment_required?: boolean;
  is_mandatory?: boolean;
  language?: string;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  effective_date_range?: {
    start: string;
    end: string;
  };
}

export interface PolicyStats {
  total_policies: number;
  published_policies: number;
  draft_policies: number;
  pending_review: number;
  expired_policies: number;
  total_views: number;
  total_downloads: number;
  by_type: Array<{
    type: Policy['policy_type'];
    count: number;
  }>;
  by_status: Array<{
    status: Policy['status'];
    count: number;
  }>;
  acknowledgment_stats: {
    required: number;
    completed: number;
    pending: number;
  };
}

export interface PolicyAcknowledgment {
  id: string;
  policy_id: string;
  user_id: string;
  acknowledged_at: string;
  version_acknowledged: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
