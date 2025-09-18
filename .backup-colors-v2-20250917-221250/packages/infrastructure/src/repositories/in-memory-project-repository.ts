// Placeholder project repository - will be implemented in future release
import type { Project, ProjectRepository } from '@ghxstship/domain';

export class InMemoryProjectRepository implements ProjectRepository {
  private store = new Map<string, Project>();

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) || null;
  }

  async findAll(): Promise<Project[]> {
    return Array.from(this.store.values());
  }

  async create(project: Project): Promise<Project> {
    this.store.set(project.id, project);
    return project;
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updated = { ...existing, ...project };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
