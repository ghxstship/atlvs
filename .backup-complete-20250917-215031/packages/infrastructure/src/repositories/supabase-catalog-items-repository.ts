import type { CatalogItem, CatalogItemRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabaseCatalogItemsRepository implements CatalogItemRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<CatalogItem | null> {
    return Sentry.startSpan({ name: 'repo.catalogItems.findById' }, async () => {
      const { data, error } = await this.sb
        .from('marketplace_catalog_items')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async list(orgId: string, vendorId?: string, limit = 20, offset = 0): Promise<CatalogItem[]> {
    return Sentry.startSpan({ name: 'repo.catalogItems.list' }, async () => {
      let query = this.sb
        .from('marketplace_catalog_items')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(entity: CatalogItem): Promise<CatalogItem> {
    return Sentry.startSpan({ name: 'repo.catalogItems.create' }, async () => {
      const row = {
        id: entity.id,
        organization_id: entity.organizationId,
        vendor_id: entity.vendorId,
        sku: entity.sku ?? null,
        title: entity.title,
        description: entity.description ?? null,
        unit_price: entity.unitPrice,
        currency: entity.currency,
        status: entity.status,
        created_at: entity.createdAt ?? new Date().toISOString(),
        updated_at: entity.updatedAt ?? new Date().toISOString()
      } as any;
      const { data, error } = await this.sb.from('marketplace_catalog_items').insert(row).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async update(id: string, patch: Partial<CatalogItem>): Promise<CatalogItem> {
    return Sentry.startSpan({ name: 'repo.catalogItems.update' }, async () => {
      const upd: any = {};
      if (patch.vendorId !== undefined) upd.vendor_id = patch.vendorId;
      if (patch.sku !== undefined) upd.sku = patch.sku;
      if (patch.title !== undefined) upd.title = patch.title;
      if (patch.description !== undefined) upd.description = patch.description;
      if (patch.unitPrice !== undefined) upd.unit_price = patch.unitPrice;
      if (patch.currency !== undefined) upd.currency = patch.currency;
      if (patch.status !== undefined) upd.status = patch.status;
      const { data, error } = await this.sb.from('marketplace_catalog_items').update(upd).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  private map = (d: any): CatalogItem => ({
    id: d.id,
    organizationId: d.organization_id,
    vendorId: d.vendor_id,
    sku: d.sku ?? undefined,
    title: d.title,
    description: d.description ?? undefined,
    unitPrice: Number(d.unit_price),
    currency: d.currency,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
