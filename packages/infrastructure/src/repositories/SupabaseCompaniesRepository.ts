import type { Company, CompanyRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseCompaniesRepository implements CompanyRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Company | null> {
    const { data, error } = await this.sb.from('companies').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
    if (error) throw error;
    return data ? this.map(data) : null;
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Company[]> {
    const { data, error } = await this.sb
      .from('companies')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(entity: Company): Promise<Company> {
    const row = {
      id: entity.id,
      organization_id: entity.organizationId,
      name: entity.name,
      website: entity.website ?? null,
      created_at: entity.createdAt ?? new Date().toISOString(),
      updated_at: entity.updatedAt ?? new Date().toISOString()
    };
    const { data, error } = await this.sb.from('companies').insert(row).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, patch: Partial<Company>): Promise<Company> {
    const upd: any = {};
    if (patch.name !== undefined) upd.name = patch.name;
    if (patch.website !== undefined) upd.website = patch.website;
    const { data, error } = await this.sb.from('companies').update(upd).eq('id', id).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('companies').delete().eq('id', id);
    if (error) throw error;
  }

  private map = (d: any): Company => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    website: d.website ?? undefined,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
