export interface PeopleShortlist {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  projectId?: string;
  roleId?: string;
  status: 'active' | 'closed' | 'archived';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShortlistMember {
  id: string;
  shortlistId: string;
  personId: string;
  status: 'candidate' | 'interviewed' | 'selected' | 'rejected';
  notes?: string;
  addedBy?: string;
  addedAt: Date;
}

export interface CreatePeopleShortlistRequest {
  organizationId: string;
  name: string;
  description?: string;
  projectId?: string;
  roleId?: string;
  status?: 'active' | 'closed' | 'archived';
  createdBy?: string;
}

export interface UpdatePeopleShortlistRequest {
  name?: string;
  description?: string;
  projectId?: string;
  roleId?: string;
  status?: 'active' | 'closed' | 'archived';
}

export interface CreateShortlistMemberRequest {
  shortlistId: string;
  personId: string;
  status?: 'candidate' | 'interviewed' | 'selected' | 'rejected';
  notes?: string;
  addedBy?: string;
}

export interface UpdateShortlistMemberRequest {
  status?: 'candidate' | 'interviewed' | 'selected' | 'rejected';
  notes?: string;
}

export interface ShortlistFilters {
  status?: 'active' | 'closed' | 'archived';
  projectId?: string;
  roleId?: string;
  search?: string;
}

export interface ShortlistMemberFilters {
  shortlistId?: string;
  personId?: string;
  status?: 'candidate' | 'interviewed' | 'selected' | 'rejected';
}

export interface PeopleShortlistRepository {
  findById(id: string): Promise<PeopleShortlist | null>;
  findByOrganization(organizationId: string, filters?: ShortlistFilters): Promise<PeopleShortlist[]>;
  findByProject(projectId: string): Promise<PeopleShortlist[]>;
  findByRole(roleId: string): Promise<PeopleShortlist[]>;
  create(shortlist: CreatePeopleShortlistRequest): Promise<PeopleShortlist>;
  update(id: string, updates: UpdatePeopleShortlistRequest): Promise<PeopleShortlist>;
  delete(id: string): Promise<void>;
  bulkCreate(shortlists: CreatePeopleShortlistRequest[]): Promise<PeopleShortlist[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePeopleShortlistRequest }>): Promise<PeopleShortlist[]>;
  bulkDelete(ids: string[]): Promise<void>;
  count(organizationId: string, filters?: ShortlistFilters): Promise<number>;
}

export interface ShortlistMemberRepository {
  findById(id: string): Promise<ShortlistMember | null>;
  findByShortlist(shortlistId: string, filters?: ShortlistMemberFilters): Promise<ShortlistMember[]>;
  findByPerson(personId: string): Promise<ShortlistMember[]>;
  findByShortlistAndPerson(shortlistId: string, personId: string): Promise<ShortlistMember | null>;
  create(member: CreateShortlistMemberRequest): Promise<ShortlistMember>;
  update(id: string, updates: UpdateShortlistMemberRequest): Promise<ShortlistMember>;
  delete(id: string): Promise<void>;
  bulkCreate(members: CreateShortlistMemberRequest[]): Promise<ShortlistMember[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdateShortlistMemberRequest }>): Promise<ShortlistMember[]>;
  bulkDelete(ids: string[]): Promise<void>;
  count(shortlistId: string, filters?: ShortlistMemberFilters): Promise<number>;
}
