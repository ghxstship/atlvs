import { type DataRecord } from '@ghxstship/ui';

export interface NetworkConnection extends DataRecord {
  id: string;
  person_id: string;
  connected_person_id: string;
  relationship_type: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend' | 'professional';
  strength: 'weak' | 'moderate' | 'strong';
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  connected_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

export interface NetworkFilters {
  person_id?: string;
  connected_person_id?: string;
  relationship_type?: NetworkConnection['relationship_type'];
  strength?: NetworkConnection['strength'];
}

export interface NetworkSort {
  field: keyof NetworkConnection;
  direction: 'asc' | 'desc';
}

export interface NetworkStats {
  total: number;
  by_relationship_type: Record<NetworkConnection['relationship_type'], number>;
  by_strength: Record<NetworkConnection['strength'], number>;
  most_connected: Array<{
    person_id: string;
    person_name: string;
    connection_count: number;
  }>;
}

export interface CreateNetworkConnectionData {
  person_id: string;
  connected_person_id: string;
  relationship_type: NetworkConnection['relationship_type'];
  strength: NetworkConnection['strength'];
  notes?: string;
}

export interface UpdateNetworkConnectionData extends Partial<CreateNetworkConnectionData> {}

export const RELATIONSHIP_TYPES = [
  { id: 'colleague', name: 'Colleague', color: 'bg-blue-500' },
  { id: 'mentor', name: 'Mentor', color: 'bg-green-500' },
  { id: 'mentee', name: 'Mentee', color: 'bg-yellow-500' },
  { id: 'collaborator', name: 'Collaborator', color: 'bg-purple-500' },
  { id: 'friend', name: 'Friend', color: 'bg-pink-500' },
  { id: 'professional', name: 'Professional', color: 'bg-gray-500' }
] as const;

export const CONNECTION_STRENGTHS = [
  { id: 'weak', name: 'Weak', order: 1 },
  { id: 'moderate', name: 'Moderate', order: 2 },
  { id: 'strong', name: 'Strong', order: 3 }
] as const;
