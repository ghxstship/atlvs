export type ListingStatus = 'draft' | 'active' | 'archived';

export interface Listing {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  status: ListingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingRepository {
  findById(id: string, orgId: string): Promise<Listing | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Listing[]>;
  create(entity: Listing): Promise<Listing>;
  update(id: string, patch: Partial<Listing>): Promise<Listing>;
}
