import type { WebhookEventDelivery, WebhookSubscription } from './Webhook';

export interface WebhookRepository {
  listActiveSubscriptions(organizationId: string): Promise<WebhookSubscription[]>;
  recordDelivery(record: WebhookEventDelivery): Promise<void>;
  createSubscription(sub: WebhookSubscription): Promise<WebhookSubscription>;
  deactivateSubscription(id: string): Promise<void>;
  getSubscriptionById(id: string): Promise<WebhookSubscription | null>;
  listFailedDeliveries(limit: number): Promise<WebhookEventDelivery[]>;
  updateDeliveryStatus(id: string, patch: Partial<WebhookEventDelivery>): Promise<void>;
}
