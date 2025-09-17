import { BaseService, ServiceContext, ServiceResult, PaginationParams, SortParams } from './base-service';

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface CreateAuditLogRequest {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Record<string, number>;
  recentActivity: number;
}

export class AuditService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getAuditLogs(
    filters: AuditFilters = {},
    pagination: PaginationParams = {},
    sorting: SortParams = { sortBy: 'timestamp', sortOrder: 'desc' }
  ): Promise<ServiceResult<AuditLog[]>> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', this.organizationId);

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
      }
      if (filters.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,resource.ilike.%${filters.search}%`);
      }

      // Apply sorting and pagination
      query = this.buildSortQuery(query, sorting);
      query = this.buildPaginationQuery(query, pagination);

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const auditLogs: AuditLog[] = data.map(log => ({
        id: log.id,
        organizationId: log.organization_id,
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        details: log.details || {},
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: log.timestamp
      }));

      return this.createSuccessResult(auditLogs);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async createAuditLog(request: CreateAuditLogRequest): Promise<ServiceResult<AuditLog>> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert({
          organization_id: this.organizationId,
          user_id: this.userId,
          action: request.action,
          resource: request.resource,
          resource_id: request.resourceId,
          details: request.details || {},
          ip_address: request.ipAddress,
          user_agent: request.userAgent,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const auditLog: AuditLog = {
        id: data.id,
        organizationId: data.organization_id,
        userId: data.user_id,
        action: data.action,
        resource: data.resource,
        resourceId: data.resource_id,
        details: data.details || {},
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        timestamp: data.timestamp
      };

      return this.createSuccessResult(auditLog);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async logCreate(resource: string, resourceId: string, details?: Record<string, any>): Promise<ServiceResult<AuditLog>> {
    return this.createAuditLog({
      action: 'create',
      resource,
      resourceId,
      details
    });
  }

  async logUpdate(resource: string, resourceId: string, details?: Record<string, any>): Promise<ServiceResult<AuditLog>> {
    return this.createAuditLog({
      action: 'update',
      resource,
      resourceId,
      details
    });
  }

  async logDelete(resource: string, resourceId: string, details?: Record<string, any>): Promise<ServiceResult<AuditLog>> {
    return this.createAuditLog({
      action: 'delete',
      resource,
      resourceId,
      details
    });
  }

  async logAccess(resource: string, resourceId?: string, details?: Record<string, any>): Promise<ServiceResult<AuditLog>> {
    return this.createAuditLog({
      action: 'access',
      resource,
      resourceId,
      details
    });
  }
}
