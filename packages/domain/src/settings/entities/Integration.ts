export interface Integration {
  id: string;
  organizationId: string;
  provider: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  credentials?: Record<string, any>;
  webhookUrl?: string;
  webhookSecret?: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSyncAt?: Date;
  syncFrequency?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface IntegrationCreate {
  organizationId: string;
  provider: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
  credentials?: Record<string, any>;
  webhookUrl?: string;
  webhookSecret?: string;
  syncFrequency?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
}

export interface IntegrationUpdate {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  credentials?: Record<string, any>;
  webhookUrl?: string;
  webhookSecret?: string;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  syncFrequency?: string;
  metadata?: Record<string, any>;
}

export interface IntegrationFilter {
  organizationId?: string;
  provider?: string;
  status?: string;
  search?: string;
}
