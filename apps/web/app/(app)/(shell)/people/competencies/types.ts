import { type DataRecord } from '@ghxstship/ui';

export interface Competency extends DataRecord {
  id: string;
  name: string;
  description?: string;
  category: 'technical' | 'creative' | 'management' | 'soft_skills' | 'industry_specific';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certification_required: boolean;
  certification_body?: string;
  expiry_period?: number;
  tags?: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
  assignments_count?: number;
}

export interface CompetencyFilters {
  category?: Competency['category'];
  level?: Competency['level'];
  certification_required?: boolean;
  certification_body?: string;
}

export interface CompetencySort {
  field: keyof Competency;
  direction: 'asc' | 'desc';
}

export interface CompetencyStats {
  total: number;
  by_category: Record<Competency['category'], number>;
  by_level: Record<Competency['level'], number>;
  certification_required: number;
  with_assignments: number;
}

export interface CreateCompetencyData {
  name: string;
  description?: string;
  category: Competency['category'];
  level: Competency['level'];
  certification_required: boolean;
  certification_body?: string;
  expiry_period?: number;
  tags?: string[];
}

export interface UpdateCompetencyData extends Partial<CreateCompetencyData> {}

export const COMPETENCY_CATEGORIES = [
  { id: 'technical', name: 'Technical', color: 'bg-blue-500' },
  { id: 'creative', name: 'Creative', color: 'bg-purple-500' },
  { id: 'management', name: 'Management', color: 'bg-green-500' },
  { id: 'soft_skills', name: 'Soft Skills', color: 'bg-yellow-500' },
  { id: 'industry_specific', name: 'Industry Specific', color: 'bg-red-500' }
] as const;

export const COMPETENCY_LEVELS = [
  { id: 'beginner', name: 'Beginner', order: 1 },
  { id: 'intermediate', name: 'Intermediate', order: 2 },
  { id: 'advanced', name: 'Advanced', order: 3 },
  { id: 'expert', name: 'Expert', order: 4 }
] as const;
