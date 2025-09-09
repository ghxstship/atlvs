import type { BaseRepository } from '../../repositories/BaseRepository';
import type { Project } from './Project';

export interface ProjectRepository extends BaseRepository<Project> {}

// Default implementation for compatibility
export class ProjectRepositoryImpl implements ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    throw new Error('Method not implemented.');
  }
  
  async findAll(): Promise<Project[]> {
    throw new Error('Method not implemented.');
  }
  
  async save(entity: Project): Promise<Project> {
    throw new Error('Method not implemented.');
  }
  
  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
