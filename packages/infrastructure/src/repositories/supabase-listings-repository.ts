import type { Listing, ListingRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabaseListingsRepository implements ListingRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Listing | null> {
    return Sentry.startSpan({ name: 'repo.listings.findById' }, async () => {
      const { data, error } = await this.sb
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Listing[]> {
    return Sentry.startSpan({ name: 'repo.listings.list' }, async () => {
      const { data, error } = await this.sb
        .from('marketplace_listings')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(entity: Listing): Promise<Listing> {
    return Sentry.startSpan({ name: 'repo.listings.create' }, async () => {
      const row = {
        id: entity.id,
        organization_id: entity.organizationId,
        title: entity.title,
        description: entity.description ?? null,
        price: entity.price,
        currency: entity.currency,
        status: entity.status,
        created_at: entity.createdAt ?? new Date().toISOString(),
        updated_at: entity.updatedAt ?? new Date().toISOString()
      } as any;
      const { data, error } = await this.sb.from('marketplace_listings').insert(row).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async update(id: string, patch: Partial<Listing>): Promise<Listing> {
    return Sentry.startSpan({ name: 'repo.listings.update' }, async () => {
      const upd: any = {};
      if (patch.title !== undefined) upd.title = patch.title;
      if (patch.description !== undefined) upd.description = patch.description;
      if (patch.price !== undefined) upd.price = patch.price;
      if (patch.currency !== undefined) upd.currency = patch.currency;
      if (patch.status !== undefined) upd.status = patch.status;
      const { data, error } = await this.sb.from('marketplace_listings').update(upd).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  private map = (d: any): Listing => ({
    id: d.id,
    organizationId: d.organization_id,
    title: d.title,
    description: d.description ?? undefined,
    price: Number(d.price),
    currency: d.currency,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
