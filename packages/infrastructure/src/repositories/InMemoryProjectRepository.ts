import type { Project, ProjectRepository } from '@ghxstship/domain';
import type { QueryOptions } from '@ghxstship/domain';

export class InMemoryProjectRepository implements ProjectRepository {
  private store = new Map<string, Project>();

  async findById(id: string, tenant: { organizationId: string }): Promise<Project | null> {
    const p = this.store.get(id);
    if (!p) return null;
    return p.organizationId === tenant.organizationId ? p : null;
  }

  async findMany(options: QueryOptions, tenant: { organizationId: string }): Promise<Project[]> {
    const all = [...this.store.values()].filter((p) => p.organizationId === tenant.organizationId);
    const { limit = 50, offset = 0 } = options;
    return all.slice(offset, offset + limit);
  }

  async create(entity: Project, tenant: { organizationId: string }): Promise<Project> {
    if (entity.organizationId !== tenant.organizationId) throw new Error('Cross-tenant create denied');
    this.store.set(entity.id, entity);
    return entity;
  }

  async update(id: string, partial: Partial<Project>, tenant: { organizationId: string }): Promise<Project> {
    const current = await this.findById(id, tenant);
    if (!current) throw new Error('Not found');
    const updated = { ...current, ...partial, updatedAt: new Date().toISOString() } as Project;
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string, tenant: { organizationId: string }): Promise<void> {
    const p = await this.findById(id, tenant);
    if (!p) return;
    this.store.delete(id);
  }
}
