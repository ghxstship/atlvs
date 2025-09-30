import { Result } from '../../shared/Result';
import {
  ApiKey,
  ApiKeyCreate,
  ApiKeyUpdate,
  ApiKeyFilter,
  ApiKeyWithSecret
} from '../entities/ApiKey';

export interface ApiKeyRepository {
  findById(id: string): Promise<Result<ApiKey>>;
  findByKeyHash(keyHash: string): Promise<Result<ApiKey>>;
  findAll(filter?: ApiKeyFilter): Promise<Result<ApiKey[]>>;
  create(data: ApiKeyCreate): Promise<Result<ApiKeyWithSecret>>;
  update(id: string, data: ApiKeyUpdate): Promise<Result<ApiKey>>;
  delete(id: string): Promise<Result<void>>;
  revoke(id: string): Promise<Result<void>>;
  rotate(id: string): Promise<Result<ApiKeyWithSecret>>;
  updateLastUsed(id: string): Promise<Result<void>>;
  validateKey(key: string): Promise<Result<ApiKey>>;
}
