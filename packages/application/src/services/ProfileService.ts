import { Result } from '@ghxstship/domain/core/Result';
import { UserProfile, Certification, JobHistory } from '@ghxstship/domain/modules/profile/Profile';
import { ProfileRepository, CertificationRepository, JobHistoryRepository } from '@ghxstship/domain/modules/profile/ProfileRepository';
import { AuditLogger, AuditRecord } from '@ghxstship/domain/audit/AuditLog';
import { QueryOptions } from '@ghxstship/domain/repositories/BaseRepository';

export interface CreateProfileRequest {
  userId: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  nationality?: string;
  languages?: string[];
  phonePrimary?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateProfileRequest {
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  nationality?: string;
  languages?: string[];
  phonePrimary?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateCertificationRequest {
  profileId: string;
  name: string;
  issuingOrganization: string;
  certificationNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  verificationUrl?: string;
  attachmentUrl?: string;
  notes?: string;
}

export interface CreateJobHistoryRequest {
  profileId: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  location?: string;
  isCurrentRole: boolean;
}

export interface ProfileFilters {
  userId?: string;
  completionPercentage?: { min?: number; max?: number };
  lastUpdated?: { from?: Date; to?: Date };
}

export interface TenantContext {
  organizationId: string;
  projectId?: string;
}

export class ProfileService {
  constructor(
    private profileRepository: ProfileRepository,
    private certificationRepository: CertificationRepository,
    private jobHistoryRepository: JobHistoryRepository,
    private auditLogger: AuditLogger
  ) {}

  async createProfile(
    request: CreateProfileRequest,
    tenant: TenantContext
  ): Promise<Result<UserProfile>> {
    try {
      // Validate required fields
      if (!request.userId) {
        return Result.fail('User ID is required');
      }

      // Check if profile already exists
      const existingProfile = await this.profileRepository.findById(request.userId, tenant);
      if (existingProfile) {
        return Result.fail('Profile already exists for this user');
      }

      // Create profile entity
      const profile = new UserProfile(
        request.userId,
        request.userId,
        request.avatarUrl,
        request.dateOfBirth,
        request.gender,
        request.nationality,
        request.languages || [],
        request.phonePrimary,
        request.phoneSecondary,
        request.addressLine1,
        request.addressLine2,
        request.city,
        request.state,
        request.postalCode,
        request.country
      );

      const savedProfile = await this.profileRepository.create(profile, tenant);

      // Log audit event
      await this.auditLogger.log({
        entityType: 'UserProfile',
        entityId: savedProfile.id.toString(),
        action: 'CREATE',
        userId: request.userId,
        organizationId: tenant.organizationId,
        metadata: { profileData: request }
      });

      return Result.ok(savedProfile);
    } catch (error) {
      return Result.fail(`Failed to create profile: ${error}`);
    }
  }

  async updateProfile(
    profileId: string,
    request: UpdateProfileRequest,
    tenant: TenantContext
  ): Promise<Result<UserProfile>> {
    try {
      if (!profileId) {
        return Result.fail('Profile ID is required');
      }

      const profile = await this.profileRepository.findById(profileId, tenant);
      if (!profile) {
        return Result.fail('Profile not found');
      }

      // Update profile fields
      const updatedProfile = await this.profileRepository.update(profileId, request, tenant);

      // Log audit event
      await this.auditLogger.log({
        entityType: 'UserProfile',
        entityId: profileId,
        action: 'UPDATE',
        userId: profile.userId,
        organizationId: tenant.organizationId,
        metadata: { changes: request }
      });

      return Result.ok(updatedProfile);
    } catch (error) {
      return Result.fail(`Failed to update profile: ${error}`);
    }
  }

  async getProfile(
    profileId: string,
    tenant: TenantContext
  ): Promise<Result<UserProfile | null>> {
    try {
      if (!profileId) {
        return Result.fail('Profile ID is required');
      }

      return Result.ok(await this.profileRepository.findById(profileId, tenant));
    } catch (error) {
      return Result.fail(`Failed to get profile: ${error}`);
    }
  }

  async getProfiles(
    filters: ProfileFilters = {},
    options: QueryOptions = {},
    tenant: TenantContext
  ): Promise<Result<UserProfile[]>> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        filter: {
          ...options.filter,
          ...filters
        }
      };

      return Result.ok(await this.profileRepository.findMany(queryOptions, tenant));
    } catch (error) {
      return Result.fail(`Failed to get profiles: ${error}`);
    }
  }

  async addCertification(request: CreateCertificationRequest, context: TenantContext): Promise<Result<Certification>> {
    try {
      const certificationResult = Certification.create({
        userId: request.userId,
        organizationId: context.organizationId,
        name: request.name,
        issuingOrganization: request.issuingOrganization,
        certificationNumber: request.certificationNumber,
        issueDate: request.issueDate,
        expiryDate: request.expiryDate,
        status: 'active',
        verificationUrl: request.verificationUrl,
        attachmentUrl: request.attachmentUrl,
        notes: request.notes
      });

      if (certificationResult.isFailure) {
        return Result.fail(certificationResult.getErrorValue());
      }

      const certification = certificationResult.getValue()!;
      await this.certificationRepository.save(certification, context);

      // Log audit event
      await this.auditLogger.log({
        entityType: 'Certification',
        entityId: certification.id.toString(),
        action: 'CREATE',
        userId: context.userId,
        organizationId: context.organizationId,
        metadata: { 
          certificationName: request.name,
          userId: request.userId 
        }
      });

      return Result.ok(certification);
    } catch (error) {
      return Result.fail(`Failed to add certification: ${error}`);
    }
  }

  async getCertifications(userId: string, context: TenantContext): Promise<Result<Certification[]>> {
    try {
      const certifications = await this.certificationRepository.findByUserId(userId, context.organizationId);
      return Result.ok(certifications);
    } catch (error) {
      return Result.fail(`Failed to get certifications: ${error}`);
    }
  }

  async getExpiringCertifications(context: TenantContext, daysAhead: number = 30): Promise<Result<Certification[]>> {
    try {
      const certifications = await this.certificationRepository.findExpiring(context.organizationId, daysAhead);
      return Result.ok(certifications);
    } catch (error) {
      return Result.fail(`Failed to get expiring certifications: ${error}`);
    }
  }

  async addJobHistory(request: CreateJobHistoryRequest, context: TenantContext): Promise<Result<JobHistory>> {
    try {
      const jobHistoryResult = JobHistory.create({
        userId: request.userId,
        organizationId: context.organizationId,
        companyName: request.companyName,
        jobTitle: request.jobTitle,
        department: request.department,
        employmentType: request.employmentType,
        startDate: request.startDate,
        endDate: request.endDate,
        isCurrent: request.isCurrent || false,
        location: request.location,
        description: request.description,
        achievements: request.achievements || [],
        skillsUsed: request.skillsUsed || []
      });

      if (jobHistoryResult.isFailure) {
        return Result.fail(jobHistoryResult.getErrorValue());
      }

      const jobHistory = jobHistoryResult.getValue()!;
      await this.jobHistoryRepository.save(jobHistory, context);

      // Log audit event
      await this.auditLogger.log({
        entityType: 'JobHistory',
        entityId: jobHistory.id.toString(),
        action: 'CREATE',
        userId: context.userId,
        organizationId: context.organizationId,
        metadata: { 
          companyName: request.companyName,
          jobTitle: request.jobTitle,
          userId: request.userId 
        }
      });

      return Result.ok(jobHistory);
    } catch (error) {
      return Result.fail(`Failed to add job history: ${error}`);
    }
  }

  async getJobHistory(userId: string, context: TenantContext): Promise<Result<JobHistory[]>> {
    try {
      const jobHistory = await this.jobHistoryRepository.findByUserId(userId, context.organizationId);
      return Result.ok(jobHistory);
    } catch (error) {
      return Result.fail(`Failed to get job history: ${error}`);
    }
  }

  async deleteProfile(profileId: string, context: TenantContext): Promise<Result<void>> {
    try {
      const profile = await this.profileRepository.findById(profileId, context);
      if (!profile) {
        return Result.fail('Profile not found');
      }

      await this.profileRepository.delete(profileId, context);

      // Log audit event
      await this.auditLogger.log({
        entityType: 'UserProfile',
        entityId: profileId,
        action: 'DELETE',
        userId: context.userId,
        organizationId: context.organizationId,
        metadata: { profileId }
      });

      return Result.ok<void>();
    } catch (error) {
      return Result.fail(`Failed to delete profile: ${error}`);
    }
  }
}
