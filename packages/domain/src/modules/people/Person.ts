export interface Person {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  skills?: string[];
  bio?: string;
  status: 'active' | 'inactive' | 'terminated';
  avatarUrl?: string;
  createdBy?: string;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonRequest {
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  startDate?: Date;
  skills?: string[];
  bio?: string;
  status?: 'active' | 'inactive' | 'terminated';
  avatarUrl?: string;
  createdBy?: string;
  isDemo?: boolean;
}

export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  skills?: string[];
  bio?: string;
  status?: 'active' | 'inactive' | 'terminated';
  avatarUrl?: string;
}

export interface PersonFilters {
  status?: 'active' | 'inactive' | 'terminated';
  department?: string;
  role?: string;
  location?: string;
  skills?: string[];
  search?: string;
}

export interface PersonRepository {
  findById(id: string): Promise<Person | null>;
  findByOrganization(organizationId: string, filters?: PersonFilters): Promise<Person[]>;
  findByEmail(email: string, organizationId: string): Promise<Person | null>;
  create(person: CreatePersonRequest): Promise<Person>;
  update(id: string, updates: UpdatePersonRequest): Promise<Person>;
  delete(id: string): Promise<void>;
  bulkCreate(people: CreatePersonRequest[]): Promise<Person[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePersonRequest }>): Promise<Person[]>;
  bulkDelete(ids: string[]): Promise<void>;
  count(organizationId: string, filters?: PersonFilters): Promise<number>;
  searchBySkills(organizationId: string, skills: string[]): Promise<Person[]>;
  findByDepartment(organizationId: string, department: string): Promise<Person[]>;
  findByRole(organizationId: string, role: string): Promise<Person[]>;
}
