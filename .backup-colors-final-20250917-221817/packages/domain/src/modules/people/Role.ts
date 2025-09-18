export interface PeopleRole {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions?: string[];
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeopleRoleRequest {
  organizationId: string;
  name: string;
  description?: string;
  permissions?: string[];
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  createdBy?: string;
}

export interface UpdatePeopleRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
}

export interface PeopleRoleFilters {
  department?: string;
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  search?: string;
}

export interface PeopleRoleRepository {
  findById(id: string): Promise<PeopleRole | null>;
  findByOrganization(organizationId: string, filters?: PeopleRoleFilters): Promise<PeopleRole[]>;
  findByName(name: string, organizationId: string): Promise<PeopleRole | null>;
  create(role: CreatePeopleRoleRequest): Promise<PeopleRole>;
  update(id: string, updates: UpdatePeopleRoleRequest): Promise<PeopleRole>;
  delete(id: string): Promise<void>;
  bulkCreate(roles: CreatePeopleRoleRequest[]): Promise<PeopleRole[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePeopleRoleRequest }>): Promise<PeopleRole[]>;
  bulkDelete(ids: string[]): Promise<void>;
  count(organizationId: string, filters?: PeopleRoleFilters): Promise<number>;
  findByDepartment(organizationId: string, department: string): Promise<PeopleRole[]>;
  findByLevel(organizationId: string, level: string): Promise<PeopleRole[]>;
}
