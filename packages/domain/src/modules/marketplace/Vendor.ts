export type VendorStatus = 'draft' | 'active' | 'suspended';

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  website?: string;
  contactEmail?: string;
  status: VendorStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorRepository {
  findById(id: string, orgId: string): Promise<Vendor | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Vendor[]>;
  create(entity: Vendor): Promise<Vendor>;
  update(id: string, patch: Partial<Vendor>): Promise<Vendor>;
}
