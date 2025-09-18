export type CatalogItemStatus = 'draft' | 'active' | 'archived';

export interface CatalogItem {
  id: string;
  organizationId: string;
  vendorId: string;
  sku?: string;
  title: string;
  description?: string;
  unitPrice: number;
  currency: string;
  status: CatalogItemStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItemRepository {
  findById(id: string, orgId: string): Promise<CatalogItem | null>;
  list(orgId: string, vendorId?: string, limit?: number, offset?: number): Promise<CatalogItem[]>;
  create(entity: CatalogItem): Promise<CatalogItem>;
  update(id: string, patch: Partial<CatalogItem>): Promise<CatalogItem>;
}
