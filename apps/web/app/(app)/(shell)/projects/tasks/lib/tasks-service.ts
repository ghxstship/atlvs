// Tasks Service Layer
// Business logic and data access for Project Tasks

import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Task, 
  CreateTaskData, 
  UpdateTaskData,
  TaskStats,
  TaskFilters,
  TaskDragResult
} from '../types';
import type { ApiResponse, PaginatedResponse } from '../../types';

export class TasksService {
  private supabase = createBrowserClient();

  // Get all tasks for an organization
  async getTasks(
    orgId: string,
    options?: {
      page?: number;
      perPage?: number;
      filters?: TaskFilters;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    try {
      let query = this.supabase
        .from('project_tasks')
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url),
          reporter:users!reporter_id(id, email, full_name, avatar_url),
          parent_task:project_tasks!parent_task_id(id, title)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      // Apply search
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply filters
      if (options?.filters) {
        const { status, priority, assignee_id, project_id, parent_task_id, tags, due_date_range, overdue_only } = options.filters;
        
        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (assignee_id) query = query.eq('assignee_id', assignee_id);
        if (project_id) query = query.eq('project_id', project_id);
        if (parent_task_id) query = query.eq('parent_task_id', parent_task_id);
        if (tags && tags.length > 0) query = query.overlaps('tags', tags);
        if (due_date_range) {
          query = query.gte('due_date', due_date_range.start);
          query = query.lte('due_date', due_date_range.end);
        }
        if (overdue_only) {
          query = query.lt('due_date', new Date().toISOString());
          query = query.neq('status', 'done');
        }
      }

      // Apply sorting
      const sortField = options?.sortField || 'position';
      const sortDirection = options?.sortDirection || 'asc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const page = options?.page || 1;
      const perPage = options?.perPage || 50;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          data: data || [],
          total: count || 0,
          page,
          per_page: perPage,
          total_pages: Math.ceil((count || 0) / perPage)
        }
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get a single task by ID
  async getTask(id: string, orgId: string): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await this.supabase
        .from('project_tasks')
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url),
          reporter:users!reporter_id(id, email, full_name, avatar_url),
          parent_task:project_tasks!parent_task_id(id, title),
          subtasks:project_tasks!parent_task_id(id, title, status, priority, assignee_id)
        `)
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a new task
  async createTask(
    taskData: CreateTaskData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Task>> {
    try {
      // Get next position for the task
      const { data: lastTask } = await this.supabase
        .from('project_tasks')
        .select('position')
        .eq('project_id', taskData.project_id)
        .eq('status', taskData.status || 'todo')
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = (lastTask?.position || 0) + 1;

      const { data, error } = await this.supabase
        .from('project_tasks')
        .insert({
          ...taskData,
          organization_id: orgId,
          created_by: userId,
          position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url),
          reporter:users!reporter_id(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'tasks.create', 'task', data.id, {
        title: data.title,
        status: data.status,
        priority: data.priority,
        project_id: data.project_id
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update an existing task
  async updateTask(
    taskData: UpdateTaskData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Task>> {
    try {
      const { id, ...updateData } = taskData;

      // Auto-set completion date when task is marked as done
      const updates: unknown = {
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      if (updateData.status === 'done' && !updateData.completed_at) {
        updates.completed_at = new Date().toISOString();
      } else if (updateData.status !== 'done') {
        updates.completed_at = null;
      }

      const { data, error } = await this.supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url),
          reporter:users!reporter_id(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'tasks.update', 'task', id, {
        updated_fields: Object.keys(updateData)
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a task
  async deleteTask(
    id: string,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Get task info for audit log
      const { data: task } = await this.supabase
        .from('project_tasks')
        .select('title, project_id')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      const { error } = await this.supabase
        .from('project_tasks')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'tasks.delete', 'task', id, {
        title: task?.title || 'Unknown',
        project_id: task?.project_id
      });

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Handle drag and drop reordering
  async reorderTask(
    dragResult: TaskDragResult,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const { taskId, sourceStatus, destinationStatus, destinationIndex } = dragResult;

      // Update task status and position
      const updates: unknown = {
        status: destinationStatus,
        position: destinationIndex,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Auto-set completion date when moving to done
      if (destinationStatus === 'done' && sourceStatus !== 'done') {
        updates.completed_at = new Date().toISOString();
      } else if (destinationStatus !== 'done') {
        updates.completed_at = null;
      }

      const { error } = await this.supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'tasks.reorder', 'task', taskId, {
        source_status: sourceStatus,
        destination_status: destinationStatus,
        destination_index: destinationIndex
      });

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get task statistics
  async getTaskStats(orgId: string, projectId?: string): Promise<ApiResponse<TaskStats>> {
    try {
      let query = this.supabase
        .from('project_tasks')
        .select('status, estimated_hours, actual_hours, due_date')
        .eq('organization_id', orgId);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      const now = new Date();
      const stats = data.reduce((acc, task) => {
        acc.total++;
        acc[task.status as keyof TaskStats]++;
        acc.totalEstimatedHours += task.estimated_hours || 0;
        acc.totalActualHours += task.actual_hours || 0;

        // Check if task is overdue
        if (task.due_date && new Date(task.due_date) < now && task.status !== 'done') {
          acc.overdue++;
        }

        return acc;
      }, {
        total: 0,
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 0,
        blocked: 0,
        overdue: 0,
        totalEstimatedHours: 0,
        totalActualHours: 0,
        completionRate: 0
      } as TaskStats);

      // Calculate completion rate
      stats.completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

      return { data: stats };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Subscribe to real-time task changes
  subscribeToTasks(
    orgId: string,
    callback: (payload: unknown) => void
  ) {
    return this.supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `organization_id=eq.${orgId}`
        },
        callback
      )
      .subscribe();
  }

  // Bulk update task status
  async bulkUpdateStatus(
    taskIds: string[],
    status: Task['status'],
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Task[]>> {
    try {
      const updates: unknown = {
        status,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Auto-set completion date when marking as done
      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { data, error } = await this.supabase
        .from('project_tasks')
        .update(updates)
        .in('id', taskIds)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url)
        `);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail for bulk operation
      await this.logActivity(orgId, userId, 'tasks.bulk_status_update', 'task', null, {
        task_ids: taskIds,
        new_status: status,
        count: taskIds.length
      });

      return { data: data || [] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Bulk assign tasks
  async bulkAssignTasks(
    taskIds: string[],
    assigneeId: string,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Task[]>> {
    try {
      const { data, error } = await this.supabase
        .from('project_tasks')
        .update({
          assignee_id: assigneeId,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!assignee_id(id, email, full_name, avatar_url)
        `);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail for bulk operation
      await this.logActivity(orgId, userId, 'tasks.bulk_assign', 'task', null, {
        task_ids: taskIds,
        assignee_id: assigneeId,
        count: taskIds.length
      });

      return { data: data || [] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Private helper method for audit logging
  private async logActivity(
    orgId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown>
  ) {
    try {
      await this.supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        occurred_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log activity:', error);
    }
  }
}

// Export singleton instance
export const tasksService = new TasksService();
