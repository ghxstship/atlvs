import { BaseRepository, QueryOptions } from '../../repositories/BaseRepository';
import { UserProfile, Certification, JobHistory } from './Profile';

export interface ProfileRepository extends BaseRepository<UserProfile> {
  findByUserId(userId: string, organizationId: string): Promise<UserProfile | null>;
  findByOrganization(organizationId: string, options?: QueryOptions): Promise<UserProfile[]>;
  findByDepartment(organizationId: string, department: string): Promise<UserProfile[]>;
  findByManager(managerId: string, organizationId: string): Promise<UserProfile[]>;
  updateCompletionPercentage(profileId: string): Promise<void>;
}

export interface CertificationRepository extends BaseRepository<Certification> {
  findByUserId(userId: string, organizationId: string): Promise<Certification[]>;
  findExpiring(organizationId: string, daysAhead: number): Promise<Certification[]>;
  findExpired(organizationId: string): Promise<Certification[]>;
  findByStatus(organizationId: string, status: string): Promise<Certification[]>;
}

export interface JobHistoryRepository extends BaseRepository<JobHistory> {
  findByUserId(userId: string, organizationId: string): Promise<JobHistory[]>;
  findByCompany(organizationId: string, companyName: string): Promise<JobHistory[]>;
  findCurrentEmployment(userId: string, organizationId: string): Promise<JobHistory | null>;
}
