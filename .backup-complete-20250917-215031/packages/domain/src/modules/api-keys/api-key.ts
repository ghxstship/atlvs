export type ApiKeyId = string;
export type ApiKeyScope =
  | 'projects:read'
  | 'projects:write'
  | 'finance:read'
  | 'finance:write'
  | 'marketplace:read'
  | 'marketplace:write'
  | 'settings:manage';

export interface ApiKey {
  id: ApiKeyId;
  organizationId: string;
  name: string;
  hash: string; // hashed secret
  prefix: 'sk_live' | 'sk_test';
  scopes: ApiKeyScope[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  active: boolean;
}
