import { BaseService, ServiceContext, ServiceResult } from './base-service';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  timezone: string | null;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  timezone?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  timezone?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  monthlyActiveUsers: number;
}

export class OrganizationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getOrganization(): Promise<ServiceResult<Organization | null>> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select('*')
        .eq('id', this.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.createSuccessResult(null);
        }
        return this.createErrorResult(error.message);
      }

      const organization: Organization = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logo_url,
        website: data.website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        timezone: data.timezone,
        settings: data.settings || {},
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(organization);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateOrganization(updates: UpdateOrganizationRequest): Promise<ServiceResult<Organization>> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
          logo_url: updates.logoUrl,
          website: updates.website,
          industry: updates.industry,
          size: updates.size,
          location: updates.location,
          timezone: updates.timezone,
          settings: updates.settings,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const organization: Organization = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logo_url,
        website: data.website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        timezone: data.timezone,
        settings: data.settings || {},
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(organization);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateOrganizationSettings(settings: Record<string, any>): Promise<ServiceResult<Organization>> {
    return this.updateOrganization({ settings });
  }

  async getOrganizationStats(): Promise<ServiceResult<OrganizationStats>> {
    try {
      // Get user stats
      const { data: userStats, error: userError } = await this.supabase
        .from('profiles')
        .select('id, is_active, last_login_at')
        .eq('organization_id', this.organizationId);

      if (userError) {
        return this.createErrorResult(userError.message);
      }

      // Get project stats
      const { data: projectStats, error: projectError } = await this.supabase
        .from('projects')
        .select('id, status')
        .eq('organization_id', this.organizationId);

      if (projectError) {
        return this.createErrorResult(projectError.message);
      }

      // Calculate stats
      const totalUsers = userStats.length;
      const activeUsers = userStats.filter(user => user.is_active).length;
      const totalProjects = projectStats?.length || 0;
      const activeProjects = projectStats?.filter(project => 
        project.status === 'active' || project.status === 'in_progress'
      ).length || 0;

      // Calculate monthly active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyActiveUsers = userStats.filter(user => 
        user.last_login_at && new Date(user.last_login_at) > thirtyDaysAgo
      ).length;

      // TODO: Calculate total revenue from finance module
      const totalRevenue = 0;

      const stats: OrganizationStats = {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalRevenue,
        monthlyActiveUsers
      };

      return this.createSuccessResult(stats);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deactivateOrganization(): Promise<ServiceResult<Organization>> {
    return this.updateOrganization({ isActive: false });
  }

  async activateOrganization(): Promise<ServiceResult<Organization>> {
    return this.updateOrganization({ isActive: true });
  }

  async validateSlug(slug: string): Promise<ServiceResult<{ isAvailable: boolean }>> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .neq('id', this.organizationId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No organization found with this slug, so it's available
        return this.createSuccessResult({ isAvailable: true });
      }

      if (error) {
        return this.createErrorResult(error.message);
      }

      // Organization found with this slug, so it's not available
      return this.createSuccessResult({ isAvailable: false });
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
