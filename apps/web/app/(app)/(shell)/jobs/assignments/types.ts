import { type DataRecord } from '@ghxstship/ui';

// Core assignment types
export type AssignmentStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'critical';
export type AssignmentAssigneeType = 'internal' | 'contractor' | 'vendor';

// Main assignment interface
export interface JobAssignment extends DataRecord {
  id: string;
  job_id: string;
  assignee_user_id: string;
  note?: string;
  assigned_at: string;
  // Enhanced fields from joins
  job_title?: string;
  job_status?: string;
  job_due_at?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
  project_title?: string;
  organization_name?: string;
}

// API response types
export interface AssignmentsResponse {
  assignments: JobAssignment[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateAssignmentData {
  job_id: string;
  assignee_user_id: string;
  note?: string;
  priority?: AssignmentPriority;
  due_date?: string;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  id: string;
  status?: AssignmentStatus;
}

// Filter and search types
export interface AssignmentFilters {
  status?: AssignmentStatus;
  assignee_user_id?: string;
  job_id?: string;
  priority?: AssignmentPriority;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// Statistics types
export interface AssignmentStats {
  total: number;
  byStatus: Record<AssignmentStatus, number>;
  byPriority: Record<AssignmentPriority, number>;
  recentAssignments: number;
  completionRate: number;
  averageCompletionTime: number;
  overdue: number;
}

// View configuration types
export interface AssignmentViewConfig {
  showCompletedTasks: boolean;
  groupByAssignee: boolean;
  showJobDetails: boolean;
  defaultSort: 'assigned_at' | 'due_date' | 'priority' | 'status';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
}

// Drawer types
export interface AssignmentDrawerProps {
  assignment?: JobAssignment;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateAssignmentData | UpdateAssignmentData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface AssignmentService {
  getAssignments: (filters?: AssignmentFilters) => Promise<AssignmentsResponse>;
  getAssignment: (id: string) => Promise<JobAssignment>;
  createAssignment: (data: CreateAssignmentData) => Promise<JobAssignment>;
  updateAssignment: (data: UpdateAssignmentData) => Promise<JobAssignment>;
  deleteAssignment: (id: string) => Promise<void>;
  getAssignmentStats: () => Promise<AssignmentStats>;
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
