import { type DataRecord } from '@ghxstship/ui';

export interface Person extends DataRecord {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar_url?: string;
  hire_date?: string;
  birth_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  skills?: string[];
  bio?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PersonFilters {
  department?: string;
  role?: string;
  status?: Person['status'];
  location?: string;
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface PersonSort {
  field: keyof Person;
  direction: 'asc' | 'desc';
}

export interface PersonStats {
  total: number;
  active: number;
  inactive: number;
  terminated: number;
  by_department: Record<string, number>;
  by_role: Record<string, number>;
  by_location: Record<string, number>;
}

export interface CreatePersonData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  hire_date?: string;
  birth_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  skills?: string[];
  notes?: string;
  status?: Person['status'];
}

export interface UpdatePersonData extends Partial<CreatePersonData> {
  status?: Person['status'];
  avatar_url?: string;
}
