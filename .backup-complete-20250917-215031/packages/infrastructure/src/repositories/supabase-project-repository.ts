// Placeholder Supabase project repository - will be implemented in future release
import type { Project, ProjectRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string): Promise<Project | null> {
    // Placeholder implementation
    return null;
  }

  async findAll(): Promise<Project[]> {
    // Placeholder implementation
    return [];
  }

  async create(project: Project): Promise<Project> {
    // Placeholder implementation
    return project;
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    // Placeholder implementation
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    // Placeholder implementation
  }
}
