import { createBrowserClient } from "@ghxstship/auth";

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// API Client class
export class ProjectsApiClient {
  private supabase = createBrowserClient();
  private baseUrl = '/api/v1/projects';

  // Generic request handler with error handling
  private async handleRequest<T>(
    operation: () => Promise<{ data: T | null; error: unknown }>
  ): Promise<ApiResponse<T>>> {
    try {
      const { data, error } = await operation();

      if (error) {
        console.error('API Error:', error);
        return {
          error: error.message || 'An error occurred',
          success: false,
        };
      }

      return {
        data: data || undefined,
        success: true,
      };
    } catch (error: unknown) {
      console.error('Request failed:', error);
      return {
        error: error.message || 'Request failed',
        success: false,
      };
    }
  }

  // PROJECTS API METHODS

  /**
   * Get all projects for an organization
   */
  async getProjects(
    orgId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string[];
      priority?: string[];
      client_id?: string;
      manager_id?: string;
      tags?: string[];
      search?: string;
      sort?: { field: string; direction: 'asc' | 'desc' };
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      // Apply filters
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.priority?.length) {
        query = query.in('priority', params.priority);
      }
      if (params.client_id) {
        query = query.eq('client_id', params.client_id);
      }
      if (params.manager_id) {
        query = query.eq('manager_id', params.manager_id);
      }
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      // Apply sorting
      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<ApiResponse<unknown>>> {
    return this.handleRequest(async () => {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return { data };
    });
  }

  /**
   * Create a new project
   */
  async createProject(orgId: string, projectData: unknown): Promise<ApiResponse<unknown>>> {
    return this.handleRequest(async () => {
      const now = new Date().toISOString();
      const projectPayload = {
        ...projectData,
        organization_id: orgId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('projects')
        .insert([projectPayload])
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return { data };
    });
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, updates: unknown): Promise<ApiResponse<unknown>>> {
    return this.handleRequest(async () => {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return { data };
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>>> {
    return this.handleRequest(async () => {
      const { error } = await this.supabase
        .from('projects')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
      return { data: undefined };
    });
  }

  // TASKS API METHODS

  /**
   * Get all tasks for an organization
   */
  async getTasks(
    orgId: string,
    params: {
      projectId?: string;
      page?: number;
      limit?: number;
      status?: string[];
      priority?: string[];
      assignee_id?: string;
      search?: string;
      sort?: { field: string; direction: 'asc' | 'desc' };
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_tasks')
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!project_tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          reporter:users!project_tasks_reporter_id_fkey(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.projectId) {
        query = query.eq('project_id', params.projectId);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.priority?.length) {
        query = query.in('priority', params.priority);
      }
      if (params.assignee_id) {
        query = query.eq('assignee_id', params.assignee_id);
      }
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
      } else {
        query = query.order('position', { ascending: true });
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  /**
   * Create a new task
   */
  async createTask(orgId: string, taskData: unknown): Promise<ApiResponse<unknown>>> {
    return this.handleRequest(async () => {
      // Get next position
      const { data: existingTasks } = await this.supabase
        .from('project_tasks')
        .select('position')
        .eq('project_id', taskData.project_id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (existingTasks?.[0]?.position || 0) + 1;

      const now = new Date().toISOString();
      const taskPayload = {
        ...taskData,
        organization_id: orgId,
        position: nextPosition,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_tasks')
        .insert([taskPayload])
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!project_tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          reporter:users!project_tasks_reporter_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return { data };
    });
  }

  /**
   * Update task positions (for drag and drop)
   */
  async updateTaskPositions(updates: Array<{ id: string; position: number }>): Promise<ApiResponse<void>>> {
    return this.handleRequest(async () => {
      const updatePromises = updates.map(({ id, position }) =>
        this.supabase
          .from('project_tasks')
          .update({
            position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error('Failed to update task positions');
      }

      return { data: undefined };
    });
  }

  // FILES API METHODS

  /**
   * Upload a file
   */
  async uploadFile(orgId: string, fileData: unknown): Promise<ApiResponse<unknown>>> {
    return this.handleRequest(async () => {
      const now = new Date().toISOString();
      const filePayload = {
        ...fileData,
        organization_id: orgId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_files')
        .insert([filePayload])
        .select(`
          *,
          project:projects(id, name),
          uploader:users!project_files_uploaded_by_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return { data };
    });
  }

  // RISKS API METHODS

  /**
   * Get all risks for an organization
   */
  async getRisks(
    orgId: string,
    params: {
      projectId?: string;
      page?: number;
      limit?: number;
      status?: string[];
      category?: string[];
      search?: string;
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_risks')
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_risks_owner_id_fkey(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.projectId) {
        query = query.eq('project_id', params.projectId);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.category?.length) {
        query = query.in('category', params.category);
      }
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  // INSPECTIONS API METHODS

  /**
   * Get all inspections for an organization
   */
  async getInspections(
    orgId: string,
    params: {
      projectId?: string;
      page?: number;
      limit?: number;
      status?: string[];
      type?: string[];
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_inspections')
        .select(`
          *,
          project:projects(id, name),
          inspector:users!project_inspections_inspector_id_fkey(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.projectId) {
        query = query.eq('project_id', params.projectId);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.type?.length) {
        query = query.in('type', params.type);
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  // ACTIVATIONS API METHODS

  /**
   * Get all activations for an organization
   */
  async getActivations(
    orgId: string,
    params: {
      projectId?: string;
      page?: number;
      limit?: number;
      status?: string[];
      activation_type?: string[];
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_activations')
        .select(`
          *,
          project:projects(id, name)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.projectId) {
        query = query.eq('project_id', params.projectId);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.activation_type?.length) {
        query = query.in('activation_type', params.activation_type);
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  // LOCATIONS API METHODS

  /**
   * Get all locations for an organization
   */
  async getLocations(
    orgId: string,
    params: {
      page?: number;
      limit?: number;
      type?: string[];
      is_active?: boolean;
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_locations')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.type?.length) {
        query = query.in('type', params.type);
      }
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active);
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  // MILESTONES API METHODS

  /**
   * Get all milestones for an organization
   */
  async getMilestones(
    orgId: string,
    params: {
      projectId?: string;
      page?: number;
      limit?: number;
      status?: string[];
      priority?: string[];
    } = {}
  ): Promise<PaginatedApiResponse<unknown>> {
    return this.handleRequest(async () => {
      let query = this.supabase
        .from('project_milestones')
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_milestones_owner_id_fkey(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (params.projectId) {
        query = query.eq('project_id', params.projectId);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.priority?.length) {
        query = query.in('priority', params.priority);
      }

      const limit = params.limit || 50;
      const offset = ((params.page || 1) - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        count,
        pagination: {
          page: params.page || 1,
          per_page: limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    });
  }

  // BULK OPERATIONS

  /**
   * Bulk update projects
   */
  async bulkUpdateProjects(
    projectIds: string[],
    updates: unknown
  ): Promise<ApiResponse<{ updated: number; errors: unknown[] }>> {
    return this.handleRequest(async () => {
      const results = await Promise.allSettled(
        projectIds.map(id =>
          this.supabase
            .from('projects')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
        )
      );

      const updated = results.filter(result => result.status === 'fulfilled').length;
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      return {
        data: { updated, errors },
      };
    });
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(
    taskIds: string[],
    updates: unknown
  ): Promise<ApiResponse<{ updated: number; errors: unknown[] }>> {
    return this.handleRequest(async () => {
      const results = await Promise.allSettled(
        taskIds.map(id =>
          this.supabase
            .from('project_tasks')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
        )
      );

      const updated = results.filter(result => result.status === 'fulfilled').length;
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      return {
        data: { updated, errors },
      };
    });
  }

  /**
   * Bulk delete projects
   */
  async bulkDeleteProjects(projectIds: string[]): Promise<ApiResponse<{ deleted: number; errors: unknown[] }>> {
    return this.handleRequest(async () => {
      const results = await Promise.allSettled(
        projectIds.map(id =>
          this.supabase
            .from('projects')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
        )
      );

      const deleted = results.filter(result => result.status === 'fulfilled').length;
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      return {
        data: { deleted, errors },
      };
    });
  }
}

// Export singleton instance
export const projectsApi = new ProjectsApiClient();
