import { BaseService, ServiceContext, ServiceResult, PaginationParams, SortParams } from './base-service';

export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  readAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  userId?: string;
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export class NotificationService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getNotifications(
    filters: NotificationFilters = {},
    pagination: PaginationParams = {},
    sorting: SortParams = { sortBy: 'created_at', sortOrder: 'desc' }
  ): Promise<ServiceResult<Notification[]>> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', this.organizationId);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      // Filter out expired notifications
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      // Apply sorting and pagination
      query = this.buildSortQuery(query, sorting);
      query = this.buildPaginationQuery(query, pagination);

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const notifications: Notification[] = data.map(notification => ({
        id: notification.id,
        organizationId: notification.organization_id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.is_read,
        readAt: notification.read_at,
        expiresAt: notification.expires_at,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at
      }));

      return this.createSuccessResult(notifications);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getUserNotifications(
    userId: string,
    pagination: PaginationParams = {},
    sorting: SortParams = { sortBy: 'created_at', sortOrder: 'desc' }
  ): Promise<ServiceResult<Notification[]>> {
    return this.getNotifications({ userId }, pagination, sorting);
  }

  async getUnreadNotifications(userId: string): Promise<ServiceResult<Notification[]>> {
    return this.getNotifications({ userId, isRead: false });
  }

  async createNotification(request: CreateNotificationRequest): Promise<ServiceResult<Notification>> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          organization_id: this.organizationId,
          user_id: request.userId,
          type: request.type,
          title: request.title,
          message: request.message,
          data: request.data,
          expires_at: request.expiresAt,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const notification: Notification = {
        id: data.id,
        organizationId: data.organization_id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        isRead: data.is_read,
        readAt: data.read_at,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(notification);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async markAsRead(notificationId: string): Promise<ServiceResult<Notification>> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('organization_id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const notification: Notification = {
        id: data.id,
        organizationId: data.organization_id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        isRead: data.is_read,
        readAt: data.read_at,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(notification);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async markAllAsRead(userId: string): Promise<ServiceResult<number>> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('organization_id', this.organizationId)
        .eq('is_read', false)
        .select('id');

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(data.length);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteNotification(notificationId: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('organization_id', this.organizationId);

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteExpiredNotifications(): Promise<ServiceResult<number>> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('organization_id', this.organizationId)
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(data.length);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getNotificationStats(userId?: string): Promise<ServiceResult<NotificationStats>> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('type, is_read')
        .eq('organization_id', this.organizationId)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const total = data.length;
      const unread = data.filter(n => !n.is_read).length;
      const byType = data.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats: NotificationStats = {
        total,
        unread,
        byType
      };

      return this.createSuccessResult(stats);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async broadcastNotification(
    userIds: string[],
    type: 'info' | 'success' | 'warning' | 'error' | 'system',
    title: string,
    message: string,
    data?: Record<string, any>,
    expiresAt?: string
  ): Promise<ServiceResult<Notification[]>> {
    try {
      const notifications = userIds.map(userId => ({
        organization_id: this.organizationId,
        user_id: userId,
        type,
        title,
        message,
        data,
        expires_at: expiresAt,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const createdNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        organizationId: notification.organization_id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.is_read,
        readAt: notification.read_at,
        expiresAt: notification.expires_at,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at
      }));

      return this.createSuccessResult(createdNotifications);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
