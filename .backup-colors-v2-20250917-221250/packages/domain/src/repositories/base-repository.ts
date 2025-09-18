export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  filter?: Record<string, any>;
}

export interface BaseRepository<T, ID = string> {
  findById(id: ID, tenant: { organizationId: string }): Promise<T | null>;
  findMany(options: QueryOptions, tenant: { organizationId: string }): Promise<T[]>;
  create(entity: T, tenant: { organizationId: string }): Promise<T>;
  update(id: ID, partial: Partial<T>, tenant: { organizationId: string }): Promise<T>;
  delete(id: ID, tenant: { organizationId: string }): Promise<void>;
}
