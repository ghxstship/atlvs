import type { BaseRepository } from '../../repositories/BaseRepository';
import type { Project } from './Project';

export interface ProjectRepository extends BaseRepository<Project> {}

// Re-export the interface to ensure it's available
export type { ProjectRepository as ProjectRepositoryInterface };

// Default implementation for compatibility
export class ProjectRepositoryImpl implements ProjectRepository {
  async findById(id: string, tenant: { organizationId: string }): Promise<Project | null> {
    throw new Error('Method not implemented.');
  }
  
  async findMany(options: import('../../repositories/BaseRepository').QueryOptions, tenant: { organizationId: string }): Promise<Project[]> {
    throw new Error('Method not implemented.');
  }
  
  async create(entity: Project, tenant: { organizationId: string }): Promise<Project> {
    throw new Error('Method not implemented.');
  }
  
  async update(id: string, partial: Partial<Project>, tenant: { organizationId: string }): Promise<Project> {
    throw new Error('Method not implemented.');
  }
  
  async delete(id: string, tenant: { organizationId: string }): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
