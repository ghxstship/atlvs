import type { Program, ProgramRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProgramsRepository implements ProgramRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Program | null> {
    const { data, error } = await this.sb.from('programs').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
    if (error) throw error;
    return data ? this.map(data) : null;
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Program[]> {
    const { data, error } = await this.sb
      .from('programs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(entity: Program): Promise<Program> {
    const row = {
      id: entity.id,
      organization_id: entity.organizationId,
      name: entity.name,
      start_date: entity.startDate ?? null,
      end_date: entity.endDate ?? null,
      created_at: entity.createdAt ?? new Date().toISOString(),
      updated_at: entity.updatedAt ?? new Date().toISOString()
    };
    const { data, error } = await this.sb.from('programs').insert(row).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, partial: Partial<Program>): Promise<Program> {
    const patch: any = {};
    if (partial.name !== undefined) patch.name = partial.name;
    if (partial.startDate !== undefined) patch.start_date = partial.startDate;
    if (partial.endDate !== undefined) patch.end_date = partial.endDate;
    const { data, error } = await this.sb.from('programs').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('programs').delete().eq('id', id);
    if (error) throw error;
  }

  private map = (d: any): Program => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    startDate: d.start_date ?? undefined,
    endDate: d.end_date ?? undefined,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
