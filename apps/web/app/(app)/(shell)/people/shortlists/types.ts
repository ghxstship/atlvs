import { type DataRecord } from '@ghxstship/ui';

export interface Shortlist extends DataRecord {
  id: string;
  name: string;
  description?: string;
  purpose: 'hiring' | 'project' | 'event' | 'general';
  status: 'active' | 'archived';
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  creator?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export interface ShortlistMember extends DataRecord {
  id: string;
  shortlist_id: string;
  person_id: string;
  added_at: string;
  added_by: string;
  notes?: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

export interface ShortlistFilters {
  purpose?: Shortlist['purpose'];
  status?: Shortlist['status'];
  created_by?: string;
}

export interface ShortlistSort {
  field: keyof Shortlist;
  direction: 'asc' | 'desc';
}

export interface ShortlistStats {
  total: number;
  active: number;
  archived: number;
  by_purpose: Record<Shortlist['purpose'], number>;
  total_members: number;
  average_members_per_list: number;
}

export interface CreateShortlistData {
  name: string;
  description?: string;
  purpose: Shortlist['purpose'];
}

export interface UpdateShortlistData extends Partial<CreateShortlistData> {
  status?: Shortlist['status'];
}

export interface AddMemberData {
  person_id: string;
  notes?: string;
}

export const SHORTLIST_PURPOSES = [
  { id: 'hiring', name: 'Hiring', color: 'bg-green-500' },
  { id: 'project', name: 'Project', color: 'bg-blue-500' },
  { id: 'event', name: 'Event', color: 'bg-purple-500' },
  { id: 'general', name: 'General', color: 'bg-gray-500' }
] as const;
