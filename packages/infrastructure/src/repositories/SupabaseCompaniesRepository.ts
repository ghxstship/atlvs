import type { Company, CompanyRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabaseCompaniesRepository implements CompanyRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Company | null> {
    return Sentry.startSpan({ name: 'repo.companies.findById' }, async () => {
      const { data, error } = await this.sb.from('companies').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async list(
    orgId: string,
    filters?: { industry?: string; status?: string; size?: string },
    pagination?: { limit?: number; offset?: number }
  ): Promise<Company[]> {
    return Sentry.startSpan({ name: 'repo.companies.list' }, async () => {
      let q = this.sb
        .from('companies')
        .select('*')
        .eq('organization_id', orgId);

      if (filters?.industry) q = q.eq('industry', filters.industry);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.size) q = q.eq('size', filters.size);

      const limit = pagination?.limit ?? 20;
      const offset = pagination?.offset ?? 0;

      const { data, error } = await q
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(entity: Company): Promise<Company> {
    return Sentry.startSpan({ name: 'repo.companies.create' }, async () => {
      const row = {
        id: entity.id,
        organization_id: entity.organizationId,
        name: entity.name,
        industry: (entity as any).industry,
        status: (entity as any).status,
        website: entity.website ?? null,
        description: (entity as any).description ?? null,
        email: (entity as any).email ?? null,
        phone: (entity as any).phone ?? null,
        address: (entity as any).address ?? null,
        city: (entity as any).city ?? null,
        state: (entity as any).state ?? null,
        country: (entity as any).country ?? null,
        postal_code: (entity as any).postalCode ?? null,
        tax_id: (entity as any).taxId ?? null,
        size: (entity as any).size ?? null,
        founded_year: (entity as any).foundedYear ?? null,
        logo_url: (entity as any).logoUrl ?? null,
        notes: (entity as any).notes ?? null,
        created_by: (entity as any).createdBy ?? null,
        created_at: entity.createdAt ?? new Date().toISOString(),
        updated_at: entity.updatedAt ?? new Date().toISOString()
      };
      const { data, error } = await this.sb.from('companies').insert(row).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async update(id: string, patch: Partial<Company>): Promise<Company> {
    return Sentry.startSpan({ name: 'repo.companies.update' }, async () => {
      const upd: any = {};
      if (patch.name !== undefined) upd.name = patch.name;
      if ((patch as any).industry !== undefined) (upd as any).industry = (patch as any).industry;
      if ((patch as any).status !== undefined) (upd as any).status = (patch as any).status;
      if (patch.website !== undefined) upd.website = patch.website;
      if ((patch as any).description !== undefined) upd.description = (patch as any).description;
      if ((patch as any).email !== undefined) upd.email = (patch as any).email;
      if ((patch as any).phone !== undefined) upd.phone = (patch as any).phone;
      if ((patch as any).address !== undefined) upd.address = (patch as any).address;
      if ((patch as any).city !== undefined) upd.city = (patch as any).city;
      if ((patch as any).state !== undefined) upd.state = (patch as any).state;
      if ((patch as any).country !== undefined) upd.country = (patch as any).country;
      if ((patch as any).postalCode !== undefined) upd.postal_code = (patch as any).postalCode;
      if ((patch as any).taxId !== undefined) upd.tax_id = (patch as any).taxId;
      if ((patch as any).size !== undefined) upd.size = (patch as any).size;
      if ((patch as any).foundedYear !== undefined) upd.founded_year = (patch as any).foundedYear;
      if ((patch as any).logoUrl !== undefined) upd.logo_url = (patch as any).logoUrl;
      if ((patch as any).notes !== undefined) upd.notes = (patch as any).notes;
      const { data, error } = await this.sb.from('companies').update(upd).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async delete(id: string): Promise<void> {
    return Sentry.startSpan({ name: 'repo.companies.delete' }, async () => {
      const { error } = await this.sb.from('companies').delete().eq('id', id);
      if (error) throw error;
    });
  }

  async search(orgId: string, query: string, filters?: any): Promise<Company[]> {
    return Sentry.startSpan({ name: 'repo.companies.search' }, async () => {
      let q = this.sb
        .from('companies')
        .select('*')
        .eq('organization_id', orgId)
        .or(`name.ilike.%${query}%,website.ilike.%${query}%,email.ilike.%${query}%`);

      if (filters?.industry) q = q.eq('industry', filters.industry);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.size) q = q.eq('size', filters.size);

      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  private map = (d: any): Company => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    description: d.description ?? undefined,
    industry: d.industry,
    website: d.website ?? undefined,
    email: d.email ?? undefined,
    phone: d.phone ?? undefined,
    address: d.address ?? undefined,
    city: d.city ?? undefined,
    state: d.state ?? undefined,
    country: d.country ?? undefined,
    postalCode: d.postal_code ?? undefined,
    taxId: d.tax_id ?? undefined,
    status: d.status,
    size: d.size ?? undefined,
    foundedYear: d.founded_year ?? undefined,
    logoUrl: d.logo_url ?? undefined,
    notes: d.notes ?? undefined,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    createdBy: d.created_by ?? undefined
  });
}
