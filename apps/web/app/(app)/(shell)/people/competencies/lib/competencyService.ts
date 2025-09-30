import { createBrowserClient } from '@ghxstship/auth';
import type { Competency, CompetencyFilters, CompetencySort, CreateCompetencyData, UpdateCompetencyData } from '../types';

export class CompetencyService {
  private supabase = createBrowserClient();

  async getCompetencies(orgId: string, filters?: CompetencyFilters, sorts?: CompetencySort[]): Promise<Competency[]> {
    let query = this.supabase
      .from('people_competencies')
      .select(`
        *,
        assignments_count:person_competencies(count)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.certification_required !== undefined) {
      query = query.eq('certification_required', filters.certification_required);
    }
    if (filters?.certification_body) {
      query = query.eq('certification_body', filters.certification_body);
    }

    // Apply sorting
    if (sorts && sorts.length > 0) {
      const sort = sorts[0];
      query = query.order(sort.field as string, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getCompetency(id: string, orgId: string): Promise<Competency | null> {
    const { data, error } = await this.supabase
      .from('people_competencies')
      .select(`
        *,
        assignments_count:person_competencies(count)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createCompetency(orgId: string, data: CreateCompetencyData): Promise<Competency> {
    const { data: competency, error } = await this.supabase
      .from('people_competencies')
      .insert({
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        assignments_count:person_competencies(count)
      `)
      .single();

    if (error) throw error;
    return competency;
  }

  async updateCompetency(id: string, orgId: string, data: UpdateCompetencyData): Promise<Competency> {
    const { data: competency, error } = await this.supabase
      .from('people_competencies')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select(`
        *,
        assignments_count:person_competencies(count)
      `)
      .single();

    if (error) throw error;
    return competency;
  }

  async deleteCompetency(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('people_competencies')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async searchCompetencies(orgId: string, query: string): Promise<Competency[]> {
    const { data, error } = await this.supabase
      .from('people_competencies')
      .select(`
        *,
        assignments_count:person_competencies(count)
      `)
      .eq('organization_id', orgId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCompetencyStats(orgId: string): Promise<unknown> {
    const { data, error } = await this.supabase
      .from('people_competencies')
      .select('category, level_definitions')
      .eq('organization_id', orgId);

    if (error) throw error;

    const stats = {
      total: data.length,
      by_category: {} as Record<string, number>,
      with_level_definitions: data.filter(c => c.level_definitions).length,
      with_assignments: 0
    };

    data.forEach(competency => {
      stats.by_category[competency.category] = (stats.by_category[competency.category] || 0) + 1;
    });

    return stats;
  }
}
