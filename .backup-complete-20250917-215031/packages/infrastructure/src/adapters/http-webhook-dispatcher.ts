import type { WebhookDispatcher, WebhookSubscription } from '@ghxstship/domain';
import { createHmac } from 'node:crypto';

export class HttpWebhookDispatcher implements WebhookDispatcher {
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  async dispatch(
    sub: WebhookSubscription,
    event: { name: string; payload: any; occurredAt: string }
  ): Promise<{ ok: boolean; status: number; error?: string }> {
    const body = JSON.stringify({
      id: crypto.randomUUID(),
      name: event.name,
      occurredAt: event.occurredAt,
      payload: event.payload
    });

    const signature = createHmac('sha256', sub.secret).update(body).digest('hex');

    try {
      const res = await this.fetchImpl(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.name
        },
        body
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, status: res.status, error: text || res.statusText };
      }
      return { ok: true, status: res.status };
    } catch (e: any) {
      return { ok: false, status: 0, error: e?.message ?? 'network error' };
    }
  }
}
