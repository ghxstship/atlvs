import { Result } from '../../shared/Result';
import {
  UserSetting,
  UserSettingCreate,
  UserSettingUpdate,
  UserSettingFilter
} from '../entities/UserSetting';

export interface UserSettingRepository {
  findById(id: string): Promise<Result<UserSetting>>;
  findByKey(userId: string, key: string): Promise<Result<UserSetting>>;
  findAll(filter?: UserSettingFilter): Promise<Result<UserSetting[]>>;
  create(data: UserSettingCreate): Promise<Result<UserSetting>>;
  update(id: string, data: UserSettingUpdate): Promise<Result<UserSetting>>;
  delete(id: string): Promise<Result<void>>;
  bulkUpsert(userId: string, settings: Array<{ key: string; value: any }>): Promise<Result<UserSetting[]>>;
  getByCategory(userId: string, category: string): Promise<Result<UserSetting[]>>;
}
