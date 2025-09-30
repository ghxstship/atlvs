// Procedures - Type Definitions
// Specialized type definitions for standard operating procedures

export interface Procedure {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  content: string;
  procedure_type: 'sop' | 'workflow' | 'checklist' | 'guideline' | 'protocol' | 'other';
  category: string;
  version: string;
  steps: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
    estimated_time?: number; // in minutes
    required_tools?: string[];
    warnings?: string[];
    checkpoints?: string[];
  }>;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  tags: string[];
  departments: string[];
  roles: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // in minutes
  prerequisites: string[];
  required_tools: string[];
  safety_notes: string[];
  access_level: 'public' | 'team' | 'restricted' | 'private';
  project_id?: string | null;
  folder_id?: string | null;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  approval_required: boolean;
  approver_id?: string | null;
  approved_at?: string | null;
  effective_date?: string | null;
  review_date?: string | null;
  view_count: number;
  usage_count: number;
  is_featured: boolean;
  language: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CreateProcedureData {
  title: string;
  description?: string;
  content: string;
  procedure_type: Procedure['procedure_type'];
  category: string;
  version?: string;
  steps?: Procedure['steps'];
  file_url?: string;
  file_size?: number;
  file_type?: string;
  tags?: string[];
  departments?: string[];
  roles?: string[];
  difficulty_level?: Procedure['difficulty_level'];
  estimated_duration?: number;
  prerequisites?: string[];
  required_tools?: string[];
  safety_notes?: string[];
  access_level?: Procedure['access_level'];
  project_id?: string;
  folder_id?: string;
  approval_required?: boolean;
  effective_date?: string;
  review_date?: string;
  is_featured?: boolean;
  language?: string;
}

export interface UpdateProcedureData extends Partial<CreateProcedureData> {
  id: string;
  status?: Procedure['status'];
  approver_id?: string;
  approved_at?: string;
}

export interface ProcedureFilters {
  procedure_type?: Procedure['procedure_type'];
  category?: string;
  status?: Procedure['status'];
  access_level?: Procedure['access_level'];
  departments?: string[];
  roles?: string[];
  difficulty_level?: Procedure['difficulty_level'];
  approval_required?: boolean;
  is_featured?: boolean;
  language?: string;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  duration_range?: {
    min: number;
    max: number;
  };
}

export interface ProcedureStats {
  total_procedures: number;
  published_procedures: number;
  draft_procedures: number;
  pending_approval: number;
  total_views: number;
  total_usage: number;
  by_type: Array<{
    type: Procedure['procedure_type'];
    count: number;
  }>;
  by_difficulty: Array<{
    difficulty: Procedure['difficulty_level'];
    count: number;
  }>;
  by_department: Array<{
    department: string;
    count: number;
  }>;
  popular_procedures: Array<{
    id: string;
    title: string;
    usage_count: number;
  }>;
}

export interface ProcedureExecution {
  id: string;
  procedure_id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'paused' | 'failed';
  current_step: number;
  completed_steps: number[];
  start_time: string;
  end_time?: string;
  duration?: number; // in minutes
  notes?: string;
  issues_encountered?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProcedureStep {
  id: string;
  procedure_id: string;
  order: number;
  title: string;
  description: string;
  estimated_time?: number;
  required_tools?: string[];
  warnings?: string[];
  checkpoints?: string[];
  created_at: string;
  updated_at: string;
}
