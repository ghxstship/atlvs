/**
 * Project Repository Interface
 * Defines contract for project data access
 */

import { Project } from '../domain/entities/Project';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOrganization(organizationId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  list(filters?: ProjectFilters): Promise<Project[]>;
}

export interface ProjectFilters {
  organizationId?: string;
  status?: string;
  priority?: string;
  type?: string;
  managerId?: string;
  clientId?: string;
  isArchived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
