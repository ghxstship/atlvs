import { BaseService, ServiceContext, ServiceResult, PaginationParams, SortParams } from './base-service';

export interface UserProfile {
  id: string;
  organizationId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  department: string | null;
  phoneNumber: string | null;
  timezone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role: string;
  department?: string;
  phoneNumber?: string;
  timezone?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: string;
  department?: string;
  phoneNumber?: string;
  timezone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  department?: string;
  isActive?: boolean;
  search?: string;
}

export class UserService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationParams = {},
    sorting: SortParams = {}
  ): Promise<ServiceResult<UserProfile[]>> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', this.organizationId);

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply sorting and pagination
      query = this.buildSortQuery(query, sorting);
      query = this.buildPaginationQuery(query, pagination);

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const users: UserProfile[] = data.map(profile => ({
        id: profile.id,
        organizationId: profile.organization_id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        department: profile.department,
        phoneNumber: profile.phone_number,
        timezone: profile.timezone,
        isActive: profile.is_active ?? true,
        lastLoginAt: profile.last_login_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }));

      return this.createSuccessResult(users);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getUserById(userId: string): Promise<ServiceResult<UserProfile | null>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('organization_id', this.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.createSuccessResult(null);
        }
        return this.createErrorResult(error.message);
      }

      const user: UserProfile = {
        id: data.id,
        organizationId: data.organization_id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        role: data.role,
        department: data.department,
        phoneNumber: data.phone_number,
        timezone: data.timezone,
        isActive: data.is_active ?? true,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(user);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<ServiceResult<UserProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          role: updates.role,
          department: updates.department,
          phone_number: updates.phoneNumber,
          timezone: updates.timezone,
          avatar_url: updates.avatarUrl,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const user: UserProfile = {
        id: data.id,
        organizationId: data.organization_id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        role: data.role,
        department: data.department,
        phoneNumber: data.phone_number,
        timezone: data.timezone,
        isActive: data.is_active ?? true,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(user);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateUserRole(userId: string, newRole: string): Promise<ServiceResult<UserProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const user: UserProfile = {
        id: data.id,
        organizationId: data.organization_id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        role: data.role,
        department: data.department,
        phoneNumber: data.phone_number,
        timezone: data.timezone,
        isActive: data.is_active ?? true,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(user);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deactivateUser(userId: string): Promise<ServiceResult<UserProfile>> {
    return this.updateUser(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<ServiceResult<UserProfile>> {
    return this.updateUser(userId, { isActive: true });
  }

  async getUsersByRole(role: string): Promise<ServiceResult<UserProfile[]>> {
    return this.getUsers({ role });
  }

  async getUsersByDepartment(department: string): Promise<ServiceResult<UserProfile[]>> {
    return this.getUsers({ department });
  }

  async searchUsers(searchTerm: string): Promise<ServiceResult<UserProfile[]>> {
    return this.getUsers({ search: searchTerm });
  }

  async updateLastLogin(userId: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('organization_id', this.organizationId);

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
