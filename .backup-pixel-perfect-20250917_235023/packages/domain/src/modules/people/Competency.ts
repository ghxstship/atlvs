export interface PeopleCompetency {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category?: string;
  levelDefinitions?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    expert?: string;
  };
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonCompetency {
  id: string;
  personId: string;
  competencyId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assessedBy?: string;
  assessedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeopleCompetencyRequest {
  organizationId: string;
  name: string;
  description?: string;
  category?: string;
  levelDefinitions?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    expert?: string;
  };
  createdBy?: string;
}

export interface UpdatePeopleCompetencyRequest {
  name?: string;
  description?: string;
  category?: string;
  levelDefinitions?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    expert?: string;
  };
}

export interface CreatePersonCompetencyRequest {
  personId: string;
  competencyId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assessedBy?: string;
  assessedAt?: Date;
  notes?: string;
}

export interface UpdatePersonCompetencyRequest {
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assessedBy?: string;
  assessedAt?: Date;
  notes?: string;
}

export interface CompetencyFilters {
  category?: string;
  search?: string;
}

export interface PersonCompetencyFilters {
  personId?: string;
  competencyId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface PeopleCompetencyRepository {
  findById(id: string): Promise<PeopleCompetency | null>;
  findByOrganization(organizationId: string, filters?: CompetencyFilters): Promise<PeopleCompetency[]>;
  findByName(name: string, organizationId: string): Promise<PeopleCompetency | null>;
  create(competency: CreatePeopleCompetencyRequest): Promise<PeopleCompetency>;
  update(id: string, updates: UpdatePeopleCompetencyRequest): Promise<PeopleCompetency>;
  delete(id: string): Promise<void>;
  bulkCreate(competencies: CreatePeopleCompetencyRequest[]): Promise<PeopleCompetency[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePeopleCompetencyRequest }>): Promise<PeopleCompetency[]>;
  bulkDelete(ids: string[]): Promise<void>;
  count(organizationId: string, filters?: CompetencyFilters): Promise<number>;
  findByCategory(organizationId: string, category: string): Promise<PeopleCompetency[]>;
}

export interface PersonCompetencyRepository {
  findById(id: string): Promise<PersonCompetency | null>;
  findByPerson(personId: string): Promise<PersonCompetency[]>;
  findByCompetency(competencyId: string): Promise<PersonCompetency[]>;
  findByPersonAndCompetency(personId: string, competencyId: string): Promise<PersonCompetency | null>;
  create(personCompetency: CreatePersonCompetencyRequest): Promise<PersonCompetency>;
  update(id: string, updates: UpdatePersonCompetencyRequest): Promise<PersonCompetency>;
  delete(id: string): Promise<void>;
  bulkCreate(personCompetencies: CreatePersonCompetencyRequest[]): Promise<PersonCompetency[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePersonCompetencyRequest }>): Promise<PersonCompetency[]>;
  bulkDelete(ids: string[]): Promise<void>;
  findByLevel(level: string): Promise<PersonCompetency[]>;
}
