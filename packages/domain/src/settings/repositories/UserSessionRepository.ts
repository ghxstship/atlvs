import { Result } from '../../shared/Result';
import {
  UserSession,
  UserSessionCreate,
  UserSessionUpdate,
  UserSessionFilter
} from '../entities/UserSession';

export interface UserSessionRepository {
  findById(id: string): Promise<Result<UserSession>>;
  findByToken(tokenHash: string): Promise<Result<UserSession>>;
  findAll(filter?: UserSessionFilter): Promise<Result<UserSession[]>>;
  create(data: UserSessionCreate): Promise<Result<UserSession>>;
  update(id: string, data: UserSessionUpdate): Promise<Result<UserSession>>;
  delete(id: string): Promise<Result<void>>;
  deleteExpired(): Promise<Result<number>>;
  deleteByUser(userId: string): Promise<Result<number>>;
  deleteByOrganization(organizationId: string): Promise<Result<number>>;
  extendSession(id: string, expiresAt: Date): Promise<Result<void>>;
  updateActivity(id: string): Promise<Result<void>>;
  getActiveSessions(userId: string): Promise<Result<UserSession[]>>;
  revokeSession(id: string): Promise<Result<void>>;
  revokeAllSessions(userId: string, exceptSessionId?: string): Promise<Result<number>>;
}
