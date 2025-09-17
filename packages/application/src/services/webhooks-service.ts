import type { WebhookDispatcher, WebhookRepository, WebhookSubscription } from '@ghxstship/domain';

export class WebhooksService {
  constructor(private readonly repo: WebhookRepository, private readonly dispatcher: WebhookDispatcher) {}

  async dispatch(organizationId: string, event: { name: string; payload: any; occurredAt: string }) {
    const subs = await this.repo.listActiveSubscriptions(organizationId);
    for (const sub of subs) {
      if (!sub.active) continue;
      if (sub.eventNames.length && !sub.eventNames.includes(event.name)) continue;
      const result = await this.dispatcher.dispatch(sub, event);
      await this.repo.recordDelivery({
        id: crypto.randomUUID(),
        subscriptionId: sub.id,
        eventName: event.name,
        payload: event.payload,
        status: result.ok ? 'success' : 'failed',
        attempt: 1,
        lastError: result.error,
        deliveredAt: result.ok ? new Date().toISOString() : undefined
      });
    }
  }

  async createSubscription(sub: WebhookSubscription) {
    return this.repo.createSubscription(sub);
  }

  async listActive(organizationId: string) {
    return this.repo.listActiveSubscriptions(organizationId);
  }

  async deactivate(id: string) {
    await this.repo.deactivateSubscription(id);
  }

  async redrive(limit = 20) {
    const failed = await this.repo.listFailedDeliveries(limit);
    const maxAttempts = Number(process.env.WEBHOOK_MAX_ATTEMPTS ?? 5);
    const now = Date.now();
    for (const d of failed) {
      if (d.attempt >= maxAttempts) {
        await this.repo.updateDeliveryStatus(d.id, { lastError: 'max attempts reached' });
        continue;
      }

      // Exponential backoff: 2^attempt minutes (cap at 60 min)
      const delayMs = Math.min(60, Math.pow(2, d.attempt)) * 60 * 1000;
      const lastTs = d.deliveredAt ? Date.parse(d.deliveredAt) : 0;
      if (lastTs && now - lastTs < delayMs) {
        // Not ready yet; skip this delivery for now
        continue;
      }

      const sub = await this.repo.getSubscriptionById(d.subscriptionId);
      if (!sub || !sub.active) {
        await this.repo.updateDeliveryStatus(d.id, { attempt: d.attempt + 1, lastError: 'subscription inactive', deliveredAt: new Date().toISOString() });
        continue;
      }
      const result = await this.dispatcher.dispatch(sub, { name: d.eventName, payload: d.payload, occurredAt: new Date().toISOString() });
      await this.repo.updateDeliveryStatus(d.id, {
        status: result.ok ? 'success' : 'failed',
        attempt: d.attempt + 1,
        lastError: result.error,
        deliveredAt: result.ok ? new Date().toISOString() : undefined
      });
    }
  }
}
