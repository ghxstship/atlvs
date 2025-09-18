import { BaseService, ServiceContext, ServiceResult, PaginationParams, SortParams } from './base-service';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  currency: string | null;
  managerId: string | null;
  clientId: string | null;
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  managerId?: string;
  clientId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  managerId?: string;
  clientId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  managerId?: string;
  clientId?: string;
  tags?: string[];
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalBudget: number;
  averageBudget: number;
  overdueTasks: number;
  completionRate: number;
}

export class ProjectService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getProjects(
    filters: ProjectFilters = {},
    pagination: PaginationParams = {},
    sorting: SortParams = { sortBy: 'created_at', sortOrder: 'desc' }
  ): Promise<ServiceResult<Project[]>> {
    try {
      let query = this.supabase
        .from('projects')
        .select('*')
        .eq('organization_id', this.organizationId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.managerId) {
        query = query.eq('manager_id', filters.managerId);
      }
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.startDateFrom) {
        query = query.gte('start_date', filters.startDateFrom);
      }
      if (filters.startDateTo) {
        query = query.lte('start_date', filters.startDateTo);
      }
      if (filters.endDateFrom) {
        query = query.gte('end_date', filters.endDateFrom);
      }
      if (filters.endDateTo) {
        query = query.lte('end_date', filters.endDateTo);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Apply sorting and pagination
      query = this.buildSortQuery(query, sorting);
      query = this.buildPaginationQuery(query, pagination);

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const projects: Project[] = data.map(project => ({
        id: project.id,
        organizationId: project.organization_id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        currency: project.currency,
        managerId: project.manager_id,
        clientId: project.client_id,
        tags: project.tags || [],
        metadata: project.metadata || {},
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }));

      return this.createSuccessResult(projects);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getProjectById(projectId: string): Promise<ServiceResult<Project | null>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('organization_id', this.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.createSuccessResult(null);
        }
        return this.createErrorResult(error.message);
      }

      const project: Project = {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        budget: data.budget,
        currency: data.currency,
        managerId: data.manager_id,
        clientId: data.client_id,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(project);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async createProject(request: CreateProjectRequest): Promise<ServiceResult<Project>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          organization_id: this.organizationId,
          name: request.name,
          description: request.description,
          status: request.status || 'draft',
          priority: request.priority || 'medium',
          start_date: request.startDate,
          end_date: request.endDate,
          budget: request.budget,
          currency: request.currency || 'USD',
          manager_id: request.managerId,
          client_id: request.clientId,
          tags: request.tags || [],
          metadata: request.metadata || {},
          created_by: this.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const project: Project = {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        budget: data.budget,
        currency: data.currency,
        managerId: data.manager_id,
        clientId: data.client_id,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(project);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<ServiceResult<Project>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          start_date: updates.startDate,
          end_date: updates.endDate,
          budget: updates.budget,
          currency: updates.currency,
          manager_id: updates.managerId,
          client_id: updates.clientId,
          tags: updates.tags,
          metadata: updates.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('organization_id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const project: Project = {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        budget: data.budget,
        currency: data.currency,
        managerId: data.manager_id,
        clientId: data.client_id,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(project);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteProject(projectId: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('organization_id', this.organizationId);

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getProjectStats(): Promise<ServiceResult<ProjectStats>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('status, priority, budget')
        .eq('organization_id', this.organizationId);

      if (error) {
        return this.createErrorResult(error.message);
      }

      const total = data.length;
      const byStatus = data.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byPriority = data.reduce((acc, project) => {
        acc[project.priority] = (acc[project.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const budgets = data.filter(p => p.budget).map(p => p.budget);
      const totalBudget = budgets.reduce((sum, budget) => sum + budget, 0);
      const averageBudget = budgets.length > 0 ? totalBudget / budgets.length : 0;

      const completedProjects = byStatus.completed || 0;
      const completionRate = total > 0 ? (completedProjects / total) * 100 : 0;

      const stats: ProjectStats = {
        total,
        byStatus,
        byPriority,
        totalBudget,
        averageBudget,
        overdueTasks: 0, // TODO: Calculate from tasks
        completionRate
      };

      return this.createSuccessResult(stats);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getProjectsByManager(managerId: string): Promise<ServiceResult<Project[]>> {
    return this.getProjects({ managerId });
  }

  async getProjectsByClient(clientId: string): Promise<ServiceResult<Project[]>> {
    return this.getProjects({ clientId });
  }

  async getActiveProjects(): Promise<ServiceResult<Project[]>> {
    return this.getProjects({ status: 'active' });
  }

  async archiveProject(projectId: string): Promise<ServiceResult<Project>> {
    return this.updateProject(projectId, { status: 'completed' });
  }

  async duplicateProject(projectId: string, newName: string): Promise<ServiceResult<Project>> {
    try {
      const originalResult = await this.getProjectById(projectId);
      if (!originalResult.success || !originalResult.data) {
        return this.createErrorResult('Project not found');
      }

      const original = originalResult.data;
      const duplicateRequest: CreateProjectRequest = {
        name: newName,
        description: original.description || undefined,
        priority: original.priority,
        budget: original.budget || undefined,
        currency: original.currency || undefined,
        managerId: original.managerId || undefined,
        clientId: original.clientId || undefined,
        tags: [...original.tags],
        metadata: { ...original.metadata }
      };

      return this.createProject(duplicateRequest);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
