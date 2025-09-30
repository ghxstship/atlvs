export interface Webhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  headers: Record<string, string>;
  isActive: boolean;
  retryCount: number;
  timeoutSeconds: number;
  lastTriggeredAt?: Date;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface WebhookCreate {
  organizationId: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  headers?: Record<string, string>;
  isActive?: boolean;
  retryCount?: number;
  timeoutSeconds?: number;
  createdBy?: string;
}

export interface WebhookUpdate {
  name?: string;
  url?: string;
  secret?: string;
  events?: string[];
  headers?: Record<string, string>;
  isActive?: boolean;
  retryCount?: number;
  timeoutSeconds?: number;
}

export interface WebhookFilter {
  organizationId?: string;
  isActive?: boolean;
  search?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  response?: {
    status: number;
    body: any;
    headers: Record<string, string>;
  };
  attempts: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  createdAt: Date;
  deliveredAt?: Date;
}
