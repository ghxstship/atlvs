import { Result } from '../../shared/Result';
import {
  SecuritySetting,
  SecuritySettingCreate,
  SecuritySettingUpdate,
  SecuritySettingFilter
} from '../entities/SecuritySetting';

export interface SecuritySettingRepository {
  findById(id: string): Promise<Result<SecuritySetting>>;
  findByOrganization(organizationId: string): Promise<Result<SecuritySetting>>;
  findAll(filter?: SecuritySettingFilter): Promise<Result<SecuritySetting[]>>;
  create(data: SecuritySettingCreate): Promise<Result<SecuritySetting>>;
  update(id: string, data: SecuritySettingUpdate): Promise<Result<SecuritySetting>>;
  upsert(organizationId: string, data: SecuritySettingCreate | SecuritySettingUpdate): Promise<Result<SecuritySetting>>;
  delete(id: string): Promise<Result<void>>;
  validatePassword(organizationId: string, password: string): Promise<Result<{ valid: boolean; errors: string[] }>>;
}
