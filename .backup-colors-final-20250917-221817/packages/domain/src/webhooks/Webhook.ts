export interface WebhookSubscription {
  id: string;
  organizationId: string;
  url: string;
  secret: string; // used for signing
  eventNames: string[]; // subscribed events
  active: boolean;
  createdAt: string;
}

export interface WebhookEventDelivery {
  id: string;
  subscriptionId: string;
  eventName: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempt: number;
  lastError?: string;
  deliveredAt?: string;
}

export interface WebhookDispatcher {
  dispatch(
    sub: WebhookSubscription,
    event: { name: string; payload: any; occurredAt: string }
  ): Promise<{ ok: boolean; status: number; error?: string }>;
}
