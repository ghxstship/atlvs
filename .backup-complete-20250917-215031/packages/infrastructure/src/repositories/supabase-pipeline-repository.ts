import type { PipelineRepository, PipelineStage } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabasePipelineRepository implements PipelineRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async listStages(orgId: string): Promise<PipelineStage[]> {
    return Sentry.startSpan({ name: 'repo.pipeline.listStages' }, async () => {
      const { data, error } = await this.sb
        .from('pipeline_stages')
        .select('*')
        .eq('organization_id', orgId)
        .order('order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async createStage(stage: PipelineStage): Promise<PipelineStage> {
    return Sentry.startSpan({ name: 'repo.pipeline.createStage' }, async () => {
      const { data, error } = await this.sb
        .from('pipeline_stages')
        .insert({
          id: stage.id,
          organization_id: stage.organizationId,
          name: stage.name,
          order: stage.order,
          created_at: stage.createdAt ?? new Date().toISOString(),
          updated_at: stage.updatedAt ?? new Date().toISOString()
        })
        .select('*')
        .single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async updateStage(id: string, partial: Partial<PipelineStage>): Promise<PipelineStage> {
    return Sentry.startSpan({ name: 'repo.pipeline.updateStage' }, async () => {
      const patch: any = {};
      if (partial.name !== undefined) patch.name = partial.name;
      if (partial.order !== undefined) patch.order = partial.order;
      const { data, error } = await this.sb.from('pipeline_stages').update(patch).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async deleteStage(id: string): Promise<void> {
    return Sentry.startSpan({ name: 'repo.pipeline.deleteStage' }, async () => {
      const { error } = await this.sb.from('pipeline_stages').delete().eq('id', id);
      if (error) throw error;
    });
  }

  private map = (d: any): PipelineStage => ({
    id: d.id,
    organizationId: d.organization_id,
    name: d.name,
    order: d.order,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
