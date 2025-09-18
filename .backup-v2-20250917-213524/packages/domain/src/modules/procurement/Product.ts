export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency: string;
  sku?: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  sku?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  sku?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface ProductRepository {
  findById(id: string, organizationId: string): Promise<Product | null>;
  findByOrganization(organizationId: string): Promise<Product[]>;
  findBySku(sku: string, organizationId: string): Promise<Product | null>;
  findByCategory(category: string, organizationId: string): Promise<Product[]>;
  create(organizationId: string, data: CreateProductRequest): Promise<Product>;
  update(id: string, organizationId: string, data: UpdateProductRequest): Promise<Product>;
  delete(id: string, organizationId: string): Promise<void>;
  search(query: string, organizationId: string): Promise<Product[]>;
}
