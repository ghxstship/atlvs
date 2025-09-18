export interface PeopleEndorsement {
  id: string;
  personId: string;
  endorserId: string;
  competencyId?: string;
  message: string;
  rating?: number; // 1-5 scale
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeopleEndorsementRequest {
  personId: string;
  endorserId: string;
  competencyId?: string;
  message: string;
  rating?: number;
}

export interface UpdatePeopleEndorsementRequest {
  message?: string;
  rating?: number;
}

export interface EndorsementFilters {
  personId?: string;
  endorserId?: string;
  competencyId?: string;
  rating?: number;
}

export interface PeopleEndorsementRepository {
  findById(id: string): Promise<PeopleEndorsement | null>;
  findByPerson(personId: string): Promise<PeopleEndorsement[]>;
  findByEndorser(endorserId: string): Promise<PeopleEndorsement[]>;
  findByCompetency(competencyId: string): Promise<PeopleEndorsement[]>;
  findByPersonAndEndorser(personId: string, endorserId: string, competencyId?: string): Promise<PeopleEndorsement | null>;
  create(endorsement: CreatePeopleEndorsementRequest): Promise<PeopleEndorsement>;
  update(id: string, updates: UpdatePeopleEndorsementRequest): Promise<PeopleEndorsement>;
  delete(id: string): Promise<void>;
  bulkCreate(endorsements: CreatePeopleEndorsementRequest[]): Promise<PeopleEndorsement[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePeopleEndorsementRequest }>): Promise<PeopleEndorsement[]>;
  bulkDelete(ids: string[]): Promise<void>;
  findByRating(rating: number): Promise<PeopleEndorsement[]>;
  getAverageRating(personId: string, competencyId?: string): Promise<number>;
}
