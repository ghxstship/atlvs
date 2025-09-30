import { type DataRecord } from '@ghxstship/ui';

export interface Role extends DataRecord {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  salary_range_min?: number;
  salary_range_max?: number;
  requirements?: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
  people_count?: number;
}

export interface RoleFilters {
  level?: Role['level'];
  department?: string;
  salary_range_min?: number;
  salary_range_max?: number;
}

export interface RoleSort {
  field: keyof Role;
  direction: 'asc' | 'desc';
}

export interface RoleStats {
  total: number;
  by_level: Record<Role['level'], number>;
  by_department: Record<string, number>;
  with_people: number;
  average_salary_min: number;
  average_salary_max: number;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: string[];
  level: Role['level'];
  department?: string;
  salary_range_min?: number;
  salary_range_max?: number;
  requirements?: string[];
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

export const ROLE_LEVELS = [
  { id: 'entry', name: 'Entry Level', order: 1, color: 'bg-green-500' },
  { id: 'mid', name: 'Mid Level', order: 2, color: 'bg-blue-500' },
  { id: 'senior', name: 'Senior Level', order: 3, color: 'bg-purple-500' },
  { id: 'lead', name: 'Lead Level', order: 4, color: 'bg-orange-500' },
  { id: 'executive', name: 'Executive', order: 5, color: 'bg-red-500' }
] as const;
