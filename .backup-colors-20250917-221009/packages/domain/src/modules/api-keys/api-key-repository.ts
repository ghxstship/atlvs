import type { ApiKey } from './api-key';

export interface ApiKeyRepository {
  create(key: ApiKey): Promise<ApiKey>;
  findById(id: string): Promise<ApiKey | null>;
  findByHash(hash: string): Promise<ApiKey | null>;
  listByOrg(organizationId: string): Promise<ApiKey[]>;
  deactivate(id: string): Promise<void>;
}
