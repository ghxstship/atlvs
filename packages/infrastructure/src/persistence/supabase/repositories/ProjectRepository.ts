/**
 * Project Repository Implementation
 * Supabase adapter for Project persistence
 */

import { IProjectRepository, ProjectFilters, Project } from '@ghxstship/domain';
import { SupabaseClient } from '../client';

export class ProjectRepository implements IProjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async findByOrganization(organizationId: string): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    if (error || !data) return [];

    return data.map(row => this.toDomain(row));
  }

  async save(project: Project): Promise<void> {
    const data = this.toPersistence(project);

    const { error } = await this.client
      .from('projects')
      .insert(data);

    if (error) throw new Error(`Failed to save project: ${error.message}`);
  }

  async update(project: Project): Promise<void> {
    const data = this.toPersistence(project);

    const { error } = await this.client
      .from('projects')
      .update(data)
      .eq('id', project.id.toString());

    if (error) throw new Error(`Failed to update project: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete project: ${error.message}`);
  }

  async list(filters?: ProjectFilters): Promise<Project[]> {
    let query = this.client.from('projects').select('*');

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.isArchived !== undefined) {
      query = query.eq('is_archived', filters.isArchived);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map(row => this.toDomain(row));
  }

  private toDomain(data: any): Project {
    return Project.create({
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      type: data.type,
      progress: data.progress,
      isArchived: data.is_archived,
      visibility: data.visibility,
      budget: data.budget,
      budgetCurrency: data.budget_currency,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }, data.id);
  }

  private toPersistence(project: Project): any {
    return {
      id: project.id.toString(),
      organization_id: project.organizationId,
      name: project.name,
      description: project.props.description,
      status: project.status,
      priority: project.props.priority,
      type: project.props.type,
      progress: project.progress,
      is_archived: project.props.isArchived,
      visibility: project.props.visibility,
      budget: project.props.budget,
      budget_currency: project.props.budgetCurrency,
      start_date: project.props.startDate,
      end_date: project.props.endDate,
      created_by: project.props.createdBy,
      created_at: project.props.createdAt,
      updated_at: project.props.updatedAt,
    };
  }
}
