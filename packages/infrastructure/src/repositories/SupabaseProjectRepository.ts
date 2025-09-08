import type { Project, ProjectRepository, QueryOptions } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, tenant: { organizationId: string }): Promise<Project | null> {
    const { data, error } = await this.sb
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('organization_id', tenant.organizationId)
      .maybeSingle();
    if (error) throw error;
    return (data as any) ?? null;
  }

  async findMany(options: QueryOptions, tenant: { organizationId: string }): Promise<Project[]> {
    let query = this.sb.from('projects').select('*').eq('organization_id', tenant.organizationId);
    if (options.orderBy && options.orderBy.length) {
      for (const o of options.orderBy) query = query.order(o.field, { ascending: o.direction === 'asc' });
    }
    if (typeof options.offset === 'number') query = query.range(options.offset, (options.offset + (options.limit ?? 50)) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return (data as any) ?? [];
  }

  async create(entity: Project, tenant: { organizationId: string }): Promise<Project> {
    const row = { ...entity, organization_id: tenant.organizationId } as any;
    const { data, error } = await this.sb.from('projects').insert(row).select('*').single();
    if (error) throw error;
    return data as any;
  }

  async update(id: string, partial: Partial<Project>, tenant: { organizationId: string }): Promise<Project> {
    const { data, error } = await this.sb
      .from('projects')
      .update(partial as any)
      .eq('id', id)
      .eq('organization_id', tenant.organizationId)
      .select('*')
      .single();
    if (error) throw error;
    return data as any;
  }

  async delete(id: string, tenant: { organizationId: string }): Promise<void> {
    const { error } = await this.sb.from('projects').delete().eq('id', id).eq('organization_id', tenant.organizationId);
    if (error) throw error;
  }
}
