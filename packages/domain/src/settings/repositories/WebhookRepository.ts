import { Result } from '../../shared/Result';
import {
  Webhook,
  WebhookCreate,
  WebhookUpdate,
  WebhookFilter,
  WebhookDelivery
} from '../entities/Webhook';

export interface WebhookRepository {
  findById(id: string): Promise<Result<Webhook>>;
  findAll(filter?: WebhookFilter): Promise<Result<Webhook[]>>;
  create(data: WebhookCreate): Promise<Result<Webhook>>;
  update(id: string, data: WebhookUpdate): Promise<Result<Webhook>>;
  delete(id: string): Promise<Result<void>>;
  activate(id: string): Promise<Result<void>>;
  deactivate(id: string): Promise<Result<void>>;
  updateLastTriggered(id: string, timestamp: Date): Promise<Result<void>>;
  incrementFailureCount(id: string): Promise<Result<void>>;
  resetFailureCount(id: string): Promise<Result<void>>;
  getDeliveries(webhookId: string, limit?: number): Promise<Result<WebhookDelivery[]>>;
  createDelivery(delivery: Omit<WebhookDelivery, 'id' | 'createdAt'>): Promise<Result<WebhookDelivery>>;
  testWebhook(id: string, payload?: any): Promise<Result<{ success: boolean; response?: any; error?: string }>>;
}
