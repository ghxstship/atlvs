import type { Vendor, VendorRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabaseVendorsRepository implements VendorRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Vendor | null> {
    return Sentry.startSpan({ name: 'repo.vendors.findById' }, async () => {
      const { data, error } = await this.sb
        .from('marketplace_vendors')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Vendor[]> {
    return Sentry.startSpan({ name: 'repo.vendors.list' }, async () => {
      const { data, error } = await this.sb
        .from('marketplace_vendors')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(entity: Vendor): Promise<Vendor> {
    return Sentry.startSpan({ name: 'repo.vendors.create' }, async () => {
      const row = {
        id: entity.id,
        organization_id: entity.organizationId,
        name: entity.name,
        website: entity.website ?? null,
        contact_email: entity.contactEmail ?? null,
        status: entity.status,
        created_at: entity.createdAt ?? new Date().toISOString(),
        updated_at: entity.updatedAt ?? new Date().toISOString()
      } as any;
      const { data, error } = await this.sb.from('marketplace_vendors').insert(row).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async update(id: string, patch: Partial<Vendor>): Promise<Vendor> {
    return Sentry.startSpan({ name: 'repo.vendors.update' }, async () => {
      const upd: any = {};
      if (patch.name !== undefined) upd.name = patch.name;
      if (patch.website !== undefined) upd.website = patch.website;
      if (patch.contactEmail !== undefined) upd.contact_email = patch.contactEmail;
      if (patch.status !== undefined) upd.status = patch.status;
      const { data, error } = await this.sb.from('marketplace_vendors').update(upd).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  private map = (d: any): Vendor => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    website: d.website ?? undefined,
    contactEmail: d.contact_email ?? undefined,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
