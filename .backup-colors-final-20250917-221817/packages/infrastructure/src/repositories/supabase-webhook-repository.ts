import type { WebhookEventDelivery, WebhookRepository, WebhookSubscription } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseWebhookRepository implements WebhookRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async listActiveSubscriptions(organizationId: string): Promise<WebhookSubscription[]> {
    const { data, error } = await this.sb
      .from('webhook_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('active', true);
    if (error) throw error;
    return (data ?? []).map((d: any) => ({
      id: d.id,
      organizationId: d.organization_id,
      url: d.url,
      secret: d.secret,
      eventNames: d.event_names ?? [],
      active: d.active,
      createdAt: d.created_at
    }));
  }

  async recordDelivery(record: WebhookEventDelivery): Promise<void> {
    const { error } = await this.sb.from('webhook_deliveries').insert({
      id: record.id,
      subscription_id: record.subscriptionId,
      event_name: record.eventName,
      payload: record.payload,
      status: record.status,
      attempt: record.attempt,
      last_error: record.lastError ?? null,
      delivered_at: record.deliveredAt ?? null
    });
    if (error) throw error;
  }

  async createSubscription(sub: WebhookSubscription): Promise<WebhookSubscription> {
    const { data, error } = await this.sb
      .from('webhook_subscriptions')
      .insert({
        id: sub.id,
        organization_id: sub.organizationId,
        url: sub.url,
        secret: sub.secret,
        event_names: sub.eventNames,
        active: sub.active,
        created_at: sub.createdAt
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      organizationId: data.organization_id,
      url: data.url,
      secret: data.secret,
      eventNames: data.event_names ?? [],
      active: data.active,
      createdAt: data.created_at
    } as WebhookSubscription;
  }

  async deactivateSubscription(id: string): Promise<void> {
    const { error } = await this.sb
      .from('webhook_subscriptions')
      .update({ active: false })
      .eq('id', id);
    if (error) throw error;
  }

  async getSubscriptionById(id: string): Promise<WebhookSubscription | null> {
    const { data, error } = await this.sb
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      url: data.url,
      secret: data.secret,
      eventNames: data.event_names ?? [],
      active: data.active,
      createdAt: data.created_at
    } as WebhookSubscription;
  }

  async listFailedDeliveries(limit: number): Promise<WebhookEventDelivery[]> {
    const { data, error } = await this.sb
      .from('webhook_deliveries')
      .select('*')
      .eq('status', 'failed')
      .order('delivered_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((d: any) => ({
      id: d.id,
      subscriptionId: d.subscription_id,
      eventName: d.event_name,
      payload: d.payload,
      status: d.status,
      attempt: d.attempt,
      lastError: d.last_error ?? undefined,
      deliveredAt: d.delivered_at ?? undefined
    }));
  }

  async updateDeliveryStatus(id: string, patch: Partial<WebhookEventDelivery>): Promise<void> {
    const update: any = {};
    if (patch.status) update.status = patch.status;
    if (typeof patch.attempt === 'number') update.attempt = patch.attempt;
    if (patch.lastError !== undefined) update.last_error = patch.lastError;
    if (patch.deliveredAt !== undefined) update.delivered_at = patch.deliveredAt;
    const { error } = await this.sb.from('webhook_deliveries').update(update).eq('id', id);
    if (error) throw error;
  }
}
