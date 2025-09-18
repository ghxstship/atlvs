import type { Job, JobRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseJobsRepository implements JobRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Job | null> {
    const { data, error } = await this.sb.from('jobs').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
    if (error) throw error;
    return data ? this.map(data) : null;
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Job[]> {
    const { data, error } = await this.sb
      .from('jobs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(entity: Job): Promise<Job> {
    const row = {
      id: entity.id,
      organization_id: entity.organizationId,
      title: entity.title,
      status: entity.status,
      rfp_id: entity.rfpId ?? null,
      created_at: entity.createdAt ?? new Date().toISOString(),
      updated_at: entity.updatedAt ?? new Date().toISOString()
    };
    const { data, error } = await this.sb.from('jobs').insert(row).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, partial: Partial<Job>): Promise<Job> {
    const patch: any = {};
    if (partial.title !== undefined) patch.title = partial.title;
    if (partial.status !== undefined) patch.status = partial.status;
    if (partial.rfpId !== undefined) patch.rfp_id = partial.rfpId;
    const { data, error } = await this.sb.from('jobs').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  private map = (d: any): Job => ({
    id: d.id,
    organizationId: d.organization_id,
    title: d.title,
    status: d.status,
    rfpId: d.rfp_id ?? undefined,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
