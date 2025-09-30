import { createClient } from '@/lib/supabase/client';
import type {
  PipelineOpportunity,
  PipelineStage,
  PipelineActivity,
  CreatePipelineOpportunity,
  UpdatePipelineOpportunity,
  CreatePipelineStage,
  UpdatePipelineStage,
  CreatePipelineActivity,
  PipelineMetrics,
  PipelineFilters,
} from '../types';

class PipelineService {
  private supabase = createClient();

  // ============================================================================
  // OPPORTUNITIES
  // ============================================================================

  async listOpportunities(filters?: PipelineFilters): Promise<PipelineOpportunity[]> {
    let query = this.supabase
      .from('pipeline_opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.stage_id) query = query.eq('stage_id', filters.stage_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
    if (filters?.company_id) query = query.eq('company_id', filters.company_id);
    if (filters?.min_value) query = query.gte('value', filters.min_value);
    if (filters?.max_value) query = query.lte('value', filters.max_value);
    if (filters?.deal_size) query = query.eq('deal_size', filters.deal_size);
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getOpportunity(id: string): Promise<PipelineOpportunity | null> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createOpportunity(opportunity: CreatePipelineOpportunity): Promise<PipelineOpportunity> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOpportunity(id: string, updates: UpdatePipelineOpportunity): Promise<PipelineOpportunity> {
    const { data, error } = await this.supabase
      .from('pipeline_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOpportunity(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pipeline_opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async moveToStage(id: string, stageId: string): Promise<PipelineOpportunity> {
    return this.updateOpportunity(id, { stage_id: stageId });
  }

  async bulkDeleteOpportunities(ids: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('pipeline_opportunities')
      .delete()
      .in('id', ids);

    if (error) throw error;
  }

  async bulkUpdateOpportunities(ids: string[], updates: UpdatePipelineOpportunity): Promise<void> {
    const { error } = await this.supabase
      .from('pipeline_opportunities')
      .update(updates)
      .in('id', ids);

    if (error) throw error;
  }

  // ============================================================================
  // STAGES
  // ============================================================================

  async listStages(): Promise<PipelineStage[]> {
    const { data, error } = await this.supabase
      .from('pipeline_stages')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createStage(stage: CreatePipelineStage): Promise<PipelineStage> {
    const { data, error } = await this.supabase
      .from('pipeline_stages')
      .insert(stage)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStage(id: string, updates: UpdatePipelineStage): Promise<PipelineStage> {
    const { data, error } = await this.supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // ACTIVITIES
  // ============================================================================

  async listActivities(opportunityId: string): Promise<PipelineActivity[]> {
    const { data, error } = await this.supabase
      .from('pipeline_activities')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createActivity(activity: CreatePipelineActivity): Promise<PipelineActivity> {
    const { data, error } = await this.supabase
      .from('pipeline_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // METRICS & ANALYTICS
  // ============================================================================

  async getMetrics(): Promise<PipelineMetrics> {
    const opportunities = await this.listOpportunities();

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    const wonOpps = opportunities.filter(o => o.status === 'won');
    const lostOpps = opportunities.filter(o => o.status === 'lost');
    
    const stageDistribution: Record<string, number> = {};
    opportunities.forEach(opp => {
      stageDistribution[opp.stage_id] = (stageDistribution[opp.stage_id] || 0) + 1;
    });

    return {
      total_value: totalValue,
      weighted_value: weightedValue,
      total_opportunities: opportunities.length,
      won_opportunities: wonOpps.length,
      lost_opportunities: lostOpps.length,
      win_rate: opportunities.length > 0 ? (wonOpps.length / opportunities.length) * 100 : 0,
      average_deal_size: opportunities.length > 0 ? totalValue / opportunities.length : 0,
      average_sales_cycle: 0, // TODO: Calculate from date data
      conversion_rate: opportunities.length > 0 ? (wonOpps.length / opportunities.length) * 100 : 0,
      stage_distribution: stageDistribution,
    };
  }

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  async exportOpportunities(format: 'csv' | 'json'): Promise<string> {
    const opportunities = await this.listOpportunities();
    
    if (format === 'json') {
      return JSON.stringify(opportunities, null, 2);
    }
    
    // CSV format
    const headers = ['Title', 'Value', 'Probability', 'Status', 'Expected Close', 'Created'];
    const rows = opportunities.map(opp => [
      opp.title,
      opp.value,
      opp.probability,
      opp.status,
      opp.expected_close_date,
      opp.created_at,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const pipelineService = new PipelineService();
