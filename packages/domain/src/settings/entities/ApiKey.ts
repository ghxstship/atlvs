export interface ApiKey {
  id: string;
  organizationId: string;
  userId?: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  description?: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string;
}

export interface ApiKeyCreate {
  organizationId: string;
  userId?: string;
  name: string;
  description?: string;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: Date;
  createdBy?: string;
}

export interface ApiKeyUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface ApiKeyFilter {
  organizationId?: string;
  userId?: string;
  isActive?: boolean;
  search?: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  secret: string;
}
