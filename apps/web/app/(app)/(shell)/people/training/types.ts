import { type DataRecord } from '@ghxstship/ui';

export interface TrainingRecord extends DataRecord {
  id: string;
  person_id: string;
  program_id: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'failed';
  completion_date?: string;
  expiry_date?: string;
  score?: number;
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
  program?: {
    name: string;
    category: string;
    duration: number;
    required: boolean;
  };
}

export interface TrainingProgram extends DataRecord {
  id: string;
  name: string;
  description?: string;
  category: 'safety' | 'technical' | 'compliance' | 'leadership' | 'certification';
  duration: number;
  required: boolean;
  expiry_months?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingFilters {
  person_id?: string;
  program_id?: string;
  status?: TrainingRecord['status'];
  category?: TrainingProgram['category'];
  required?: boolean;
  expiring_soon?: boolean;
}

export interface TrainingSort {
  field: keyof TrainingRecord;
  direction: 'asc' | 'desc';
}

export interface TrainingStats {
  total: number;
  by_status: Record<TrainingRecord['status'], number>;
  by_category: Record<TrainingProgram['category'], number>;
  completion_rate: number;
  expiring_soon: number;
  overdue: number;
}

export interface CreateTrainingRecordData {
  person_id: string;
  program_id: string;
  notes?: string;
}

export interface UpdateTrainingRecordData extends Partial<CreateTrainingRecordData> {
  status?: TrainingRecord['status'];
  completion_date?: string;
  expiry_date?: string;
  score?: number;
}

export const TRAINING_CATEGORIES = [
  { id: 'safety', name: 'Safety', color: 'bg-red-500' },
  { id: 'technical', name: 'Technical', color: 'bg-blue-500' },
  { id: 'compliance', name: 'Compliance', color: 'bg-yellow-500' },
  { id: 'leadership', name: 'Leadership', color: 'bg-green-500' },
  { id: 'certification', name: 'Certification', color: 'bg-purple-500' }
] as const;

export const TRAINING_STATUSES = [
  { id: 'enrolled', name: 'Enrolled', color: 'bg-blue-500' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-500' },
  { id: 'completed', name: 'Completed', color: 'bg-green-500' },
  { id: 'expired', name: 'Expired', color: 'bg-red-500' },
  { id: 'failed', name: 'Failed', color: 'bg-gray-500' }
] as const;
