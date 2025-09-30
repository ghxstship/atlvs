import { type DataRecord } from '@ghxstship/ui';

export interface Assignment extends DataRecord {
  id: string;
  project_id: string;
  role: string;
  required_count: number;
  filled_count: number;
  department?: string;
  skills_required?: string[];
  hourly_rate?: number;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
    status: string;
  };
}

export interface AssignmentFilters {
  project_id?: string;
  department?: string;
  role?: string;
  status?: 'open' | 'filled' | 'closed';
}

export interface AssignmentSort {
  field: keyof Assignment;
  direction: 'asc' | 'desc';
}

export interface AssignmentStats {
  total: number;
  open: number;
  filled: number;
  closed: number;
  by_department: Record<string, number>;
  by_role: Record<string, number>;
}

export interface CreateAssignmentData {
  project_id: string;
  role: string;
  required_count: number;
  department?: string;
  skills_required?: string[];
  hourly_rate?: number;
  notes?: string;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  filled_count?: number;
}
