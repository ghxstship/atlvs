import type { Project } from './Project';

export interface ProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  update(id: string, project: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
}
