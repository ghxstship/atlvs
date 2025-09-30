import { type DataRecord } from '@ghxstship/ui';

export interface Endorsement extends DataRecord {
  id: string;
  endorsed_person_id: string;
  endorser_person_id: string;
  competency_id?: string;
  rating: number;
  message?: string;
  context?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  endorsed_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  endorser_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  competency?: {
    name: string;
    category: string;
  };
}

export interface EndorsementFilters {
  endorsed_person_id?: string;
  endorser_person_id?: string;
  competency_id?: string;
  rating?: number;
  rating_min?: number;
  rating_max?: number;
}

export interface EndorsementSort {
  field: keyof Endorsement;
  direction: 'asc' | 'desc';
}

export interface EndorsementStats {
  total: number;
  average_rating: number;
  by_rating: Record<number, number>;
  by_competency: Record<string, number>;
  top_endorsed: Array<{
    person_id: string;
    person_name: string;
    endorsement_count: number;
    average_rating: number;
  }>;
}

export interface CreateEndorsementData {
  endorsed_person_id: string;
  competency_id?: string;
  rating: number;
  message?: string;
  context?: string;
}

export interface UpdateEndorsementData extends Partial<CreateEndorsementData> {}
