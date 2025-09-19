export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

export abstract class AbstractRepository<T> implements BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, updates: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(filters?: Record<string, any>): Promise<number>;

  protected buildPaginatedResult<U>(
    data: U[],
    total: number,
    page: number,
    pageSize: number
  ): PaginatedResult<U> {
    return {
      data,
      total,
      page,
      pageSize,
      hasNext: (page * pageSize) < total,
      hasPrevious: page > 1
    };
  }
}
