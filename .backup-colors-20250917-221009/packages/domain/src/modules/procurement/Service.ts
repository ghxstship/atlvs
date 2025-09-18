export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  rate: number;
  currency: string;
  unit: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category?: string;
  rate: number;
  currency?: string;
  unit?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  rate?: number;
  currency?: string;
  unit?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface ServiceRepository {
  findById(id: string, organizationId: string): Promise<Service | null>;
  findByOrganization(organizationId: string): Promise<Service[]>;
  findByCategory(category: string, organizationId: string): Promise<Service[]>;
  findBySupplier(supplier: string, organizationId: string): Promise<Service[]>;
  create(organizationId: string, data: CreateServiceRequest): Promise<Service>;
  update(id: string, organizationId: string, data: UpdateServiceRequest): Promise<Service>;
  delete(id: string, organizationId: string): Promise<void>;
  search(query: string, organizationId: string): Promise<Service[]>;
}
