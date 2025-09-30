import { Result } from '../../shared/Result';
import {
  Integration,
  IntegrationCreate,
  IntegrationUpdate,
  IntegrationFilter
} from '../entities/Integration';

export interface IntegrationRepository {
  findById(id: string): Promise<Result<Integration>>;
  findByProvider(organizationId: string, provider: string): Promise<Result<Integration[]>>;
  findAll(filter?: IntegrationFilter): Promise<Result<Integration[]>>;
  create(data: IntegrationCreate): Promise<Result<Integration>>;
  update(id: string, data: IntegrationUpdate): Promise<Result<Integration>>;
  delete(id: string): Promise<Result<void>>;
  updateStatus(id: string, status: Integration['status'], error?: string): Promise<Result<void>>;
  updateLastSync(id: string, timestamp: Date): Promise<Result<void>>;
  testConnection(id: string): Promise<Result<{ success: boolean; message?: string }>>;
  sync(id: string): Promise<Result<{ recordsSynced: number; errors: string[] }>>;
}
