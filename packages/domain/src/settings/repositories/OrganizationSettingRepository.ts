import { Result } from '../../shared/Result';
import {
  OrganizationSetting,
  OrganizationSettingCreate,
  OrganizationSettingUpdate,
  OrganizationSettingFilter
} from '../entities/OrganizationSetting';

export interface OrganizationSettingRepository {
  findById(id: string): Promise<Result<OrganizationSetting>>;
  findByKey(organizationId: string, key: string): Promise<Result<OrganizationSetting>>;
  findAll(filter?: OrganizationSettingFilter): Promise<Result<OrganizationSetting[]>>;
  create(data: OrganizationSettingCreate): Promise<Result<OrganizationSetting>>;
  update(id: string, data: OrganizationSettingUpdate): Promise<Result<OrganizationSetting>>;
  delete(id: string): Promise<Result<void>>;
  bulkUpsert(organizationId: string, settings: Array<{ key: string; value: any }>): Promise<Result<OrganizationSetting[]>>;
  getByCategory(organizationId: string, category: string): Promise<Result<OrganizationSetting[]>>;
}
