// Base service and types
export * from './base-service';

// Core services
export * from './auth-service';
export * from './user-service';
export * from './organization-service';
export * from './project-service';
export * from './notification-service';
export * from './file-service';
export * from './audit-service';
export * from './database-monitoring-service';

// Service factory for creating service instances
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { ServiceContext } from './base-service';
import { AuthService } from './auth-service';
import { UserService } from './user-service';
import { OrganizationService } from './organization-service';
import { ProjectService } from './project-service';
import { NotificationService } from './notification-service';
import { FileService } from './file-service';
import { AuditService } from './audit-service';
import { DatabaseMonitoringService } from './database-monitoring-service';

export class ServiceFactory {
  private context: ServiceContext;

  constructor(
    supabase: SupabaseClient<Database>,
    organizationId: string,
    userId: string
  ) {
    this.context = {
      supabase,
      organizationId,
      userId
    };
  }

  // Core services
  auth(): AuthService {
    return new AuthService(this.context);
  }

  users(): UserService {
    return new UserService(this.context);
  }

  organizations(): OrganizationService {
    return new OrganizationService(this.context);
  }

  projects(): ProjectService {
    return new ProjectService(this.context);
  }

  notifications(): NotificationService {
    return new NotificationService(this.context);
  }

  files(): FileService {
    return new FileService(this.context);
  }

  audit(): AuditService {
    return new AuditService(this.context);
  }

  databaseMonitoring(): DatabaseMonitoringService {
    return new DatabaseMonitoringService(this.context);
  }

  // Update context (useful when user switches organizations)
  updateContext(organizationId: string, userId: string): void {
    this.context.organizationId = organizationId;
    this.context.userId = userId;
  }
}
