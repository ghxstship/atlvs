import type { Report, ReportRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseReportsRepository implements ReportRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Report | null> {
    const { data, error } = await this.sb.from('reports').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
    if (error) throw error;
    return data ? this.map(data) : null;
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Report[]> {
    const { data, error } = await this.sb
      .from('reports')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(entity: Report): Promise<Report> {
    const row = {
      id: entity.id,
      organization_id: entity.organizationId,
      name: entity.name,
      definition: entity.definition,
      created_at: entity.createdAt ?? new Date().toISOString(),
      updated_at: entity.updatedAt ?? new Date().toISOString()
    };
    const { data, error } = await this.sb.from('reports').insert(row).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, partial: Partial<Report>): Promise<Report> {
    const patch: any = {};
    if (partial.name !== undefined) patch.name = partial.name;
    if (partial.definition !== undefined) patch.definition = partial.definition;
    const { data, error } = await this.sb.from('reports').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  private map = (d: any): Report => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    definition: d.definition,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
