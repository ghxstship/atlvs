import { type DataRecord } from '@ghxstship/ui';

export interface OnboardingWorkflow extends DataRecord {
  id: string;
  person_id: string;
  project_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  progress_percentage: number;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    department?: string;
  };
  project?: {
    name: string;
    status: string;
  };
  tasks_completed?: number;
  tasks_total?: number;
}

export interface OnboardingTask extends DataRecord {
  id: string;
  workflow_id: string;
  name: string;
  description?: string;
  category: 'documentation' | 'training' | 'equipment' | 'access' | 'compliance';
  required: boolean;
  completed: boolean;
  due_date?: string;
  assigned_to?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingFilters {
  person_id?: string;
  project_id?: string;
  status?: OnboardingWorkflow['status'];
  start_date_from?: string;
  start_date_to?: string;
  overdue?: boolean;
}

export interface OnboardingSort {
  field: keyof OnboardingWorkflow;
  direction: 'asc' | 'desc';
}

export interface OnboardingStats {
  total: number;
  by_status: Record<OnboardingWorkflow['status'], number>;
  average_completion_time: number;
  overdue: number;
  completion_rate: number;
  tasks_completion_rate: number;
}

export interface CreateOnboardingWorkflowData {
  person_id: string;
  project_id?: string;
  start_date: string;
  target_completion_date?: string;
  notes?: string;
}

export interface UpdateOnboardingWorkflowData extends Partial<CreateOnboardingWorkflowData> {
  status?: OnboardingWorkflow['status'];
  actual_completion_date?: string;
  progress_percentage?: number;
}

export interface CreateOnboardingTaskData {
  workflow_id: string;
  name: string;
  description?: string;
  category: OnboardingTask['category'];
  required: boolean;
  due_date?: string;
  assigned_to?: string;
  notes?: string;
}

export const ONBOARDING_STATUSES = [
  { id: 'pending', name: 'Pending', color: 'bg-gray-500' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', name: 'Completed', color: 'bg-green-500' },
  { id: 'on_hold', name: 'On Hold', color: 'bg-yellow-500' }
] as const;

export const TASK_CATEGORIES = [
  { id: 'documentation', name: 'Documentation', color: 'bg-blue-500' },
  { id: 'training', name: 'Training', color: 'bg-green-500' },
  { id: 'equipment', name: 'Equipment', color: 'bg-purple-500' },
  { id: 'access', name: 'Access', color: 'bg-yellow-500' },
  { id: 'compliance', name: 'Compliance', color: 'bg-red-500' }
] as const;
