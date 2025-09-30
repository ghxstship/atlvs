import { Result } from '../../shared/Result';
import {
  NotificationPreference,
  NotificationPreferenceCreate,
  NotificationPreferenceUpdate,
  NotificationPreferenceFilter
} from '../entities/NotificationPreference';

export interface NotificationPreferenceRepository {
  findById(id: string): Promise<Result<NotificationPreference>>;
  findByUserAndChannel(userId: string, organizationId: string | null, channel: string, category: string): Promise<Result<NotificationPreference>>;
  findAll(filter?: NotificationPreferenceFilter): Promise<Result<NotificationPreference[]>>;
  create(data: NotificationPreferenceCreate): Promise<Result<NotificationPreference>>;
  update(id: string, data: NotificationPreferenceUpdate): Promise<Result<NotificationPreference>>;
  delete(id: string): Promise<Result<void>>;
  bulkUpdate(userId: string, preferences: Array<{ channel: string; category: string; enabled: boolean }>): Promise<Result<NotificationPreference[]>>;
  getUserPreferences(userId: string, organizationId?: string): Promise<Result<NotificationPreference[]>>;
}
