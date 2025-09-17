import { 
  Dashboard, 
  DashboardWidget, 
  DashboardRepository, 
  DashboardWidgetRepository,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  DashboardFilters,
  WidgetFilters
} from '../domain/dashboard';
import { AuditLogger } from '../infrastructure/audit';
import { EventBus } from '../infrastructure/events';

export class DashboardService {
  constructor(
    private readonly dashboardRepo: DashboardRepository,
    private readonly widgetRepo: DashboardWidgetRepository,
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  // Dashboard CRUD operations
  async listDashboards(
    organizationId: string,
    filters?: DashboardFilters
  ): Promise<Dashboard[]> {
    try {
      const dashboards = await this.dashboardRepo.findByOrganization(organizationId, filters);
      
      await this.audit.log({
        action: 'dashboard.list',
        organizationId,
        details: { 
          count: dashboards.length,
          filters 
        }
      });

      return dashboards;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.list.error',
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getDashboard(
    organizationId: string,
    dashboardId: string,
    userId?: string
  ): Promise<Dashboard | null> {
    try {
      const dashboard = await this.dashboardRepo.findById(dashboardId, organizationId);
      
      if (dashboard && userId) {
        // Update user preferences for last accessed
        await this.dashboardRepo.updateUserPreferences(userId, dashboardId, {
          last_accessed_at: new Date()
        });
      }

      await this.audit.log({
        action: 'dashboard.get',
        organizationId,
        resourceId: dashboardId,
        userId,
        details: { found: !!dashboard }
      });

      return dashboard;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.get.error',
        organizationId,
        resourceId: dashboardId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async createDashboard(
    organizationId: string,
    userId: string,
    request: CreateDashboardRequest
  ): Promise<Dashboard> {
    try {
      // Check for duplicate names
      const existing = await this.dashboardRepo.findByName(organizationId, request.name);
      if (existing) {
        throw new Error('Dashboard name already exists');
      }

      const dashboard = await this.dashboardRepo.create({
        ...request,
        organization_id: organizationId,
        created_by: userId,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      });

      await this.audit.log({
        action: 'dashboard.create',
        organizationId,
        resourceId: dashboard.id,
        userId,
        details: {
          name: dashboard.name,
          type: dashboard.type
        }
      });

      await this.bus.publish('dashboard.created', {
        organizationId,
        dashboardId: dashboard.id,
        userId,
        dashboard
      });

      return dashboard;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.create.error',
        organizationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: request
      });
      throw error;
    }
  }

  async updateDashboard(
    organizationId: string,
    dashboardId: string,
    userId: string,
    request: UpdateDashboardRequest
  ): Promise<Dashboard> {
    try {
      // Check if dashboard exists and user has permission
      const existing = await this.dashboardRepo.findById(dashboardId, organizationId);
      if (!existing) {
        throw new Error('Dashboard not found');
      }

      // Check for duplicate names if name is being updated
      if (request.name && request.name !== existing.name) {
        const duplicate = await this.dashboardRepo.findByName(organizationId, request.name);
        if (duplicate && duplicate.id !== dashboardId) {
          throw new Error('Dashboard name already exists');
        }
      }

      const dashboard = await this.dashboardRepo.update(dashboardId, organizationId, {
        ...request,
        updated_at: new Date()
      });

      await this.audit.log({
        action: 'dashboard.update',
        organizationId,
        resourceId: dashboardId,
        userId,
        details: {
          updated_fields: Object.keys(request),
          name: dashboard?.name
        }
      });

      if (dashboard) {
        await this.bus.publish('dashboard.updated', {
          organizationId,
          dashboardId,
          userId,
          dashboard,
          changes: request
        });
      }

      return dashboard!;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.update.error',
        organizationId,
        resourceId: dashboardId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: request
      });
      throw error;
    }
  }

  async deleteDashboard(
    organizationId: string,
    dashboardId: string,
    userId: string
  ): Promise<void> {
    try {
      const existing = await this.dashboardRepo.findById(dashboardId, organizationId);
      if (!existing) {
        throw new Error('Dashboard not found');
      }

      // Prevent deletion of system dashboards
      if (existing.type === 'system') {
        throw new Error('Cannot delete system dashboards');
      }

      // Check if it's the only dashboard
      const allDashboards = await this.dashboardRepo.findByOrganization(organizationId);
      if (allDashboards.length === 1) {
        throw new Error('Cannot delete the only dashboard');
      }

      await this.dashboardRepo.delete(dashboardId, organizationId);

      await this.audit.log({
        action: 'dashboard.delete',
        organizationId,
        resourceId: dashboardId,
        userId,
        details: {
          name: existing.name,
          type: existing.type
        }
      });

      await this.bus.publish('dashboard.deleted', {
        organizationId,
        dashboardId,
        userId,
        dashboard: existing
      });
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.delete.error',
        organizationId,
        resourceId: dashboardId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async duplicateDashboard(
    organizationId: string,
    sourceDashboardId: string,
    userId: string,
    newName: string,
    newDescription?: string
  ): Promise<Dashboard> {
    try {
      const source = await this.dashboardRepo.findById(sourceDashboardId, organizationId);
      if (!source) {
        throw new Error('Source dashboard not found');
      }

      // Check for duplicate names
      const existing = await this.dashboardRepo.findByName(organizationId, newName);
      if (existing) {
        throw new Error('Dashboard name already exists');
      }

      const dashboard = await this.dashboardRepo.duplicate(
        sourceDashboardId,
        organizationId,
        newName,
        newDescription,
        userId
      );

      await this.audit.log({
        action: 'dashboard.duplicate',
        organizationId,
        resourceId: dashboard.id,
        userId,
        details: {
          source_dashboard_id: sourceDashboardId,
          source_name: source.name,
          new_name: newName
        }
      });

      await this.bus.publish('dashboard.duplicated', {
        organizationId,
        dashboardId: dashboard.id,
        sourceDashboardId,
        userId,
        dashboard
      });

      return dashboard;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.duplicate.error',
        organizationId,
        resourceId: sourceDashboardId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Widget CRUD operations
  async listWidgets(
    organizationId: string,
    filters?: WidgetFilters
  ): Promise<DashboardWidget[]> {
    try {
      const widgets = await this.widgetRepo.findByOrganization(organizationId, filters);
      
      await this.audit.log({
        action: 'widget.list',
        organizationId,
        details: { 
          count: widgets.length,
          filters 
        }
      });

      return widgets;
    } catch (error) {
      await this.audit.log({
        action: 'widget.list.error',
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getWidget(
    organizationId: string,
    widgetId: string
  ): Promise<DashboardWidget | null> {
    try {
      const widget = await this.widgetRepo.findById(widgetId, organizationId);

      await this.audit.log({
        action: 'widget.get',
        organizationId,
        resourceId: widgetId,
        details: { found: !!widget }
      });

      return widget;
    } catch (error) {
      await this.audit.log({
        action: 'widget.get.error',
        organizationId,
        resourceId: widgetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async createWidget(
    organizationId: string,
    userId: string,
    request: CreateWidgetRequest
  ): Promise<DashboardWidget> {
    try {
      // Verify dashboard exists
      const dashboard = await this.dashboardRepo.findById(request.dashboard_id, organizationId);
      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      const widget = await this.widgetRepo.create({
        ...request,
        organization_id: organizationId,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      });

      await this.audit.log({
        action: 'widget.create',
        organizationId,
        resourceId: widget.id,
        userId,
        details: {
          dashboard_id: request.dashboard_id,
          widget_type: widget.widget_type,
          title: widget.title
        }
      });

      await this.bus.publish('widget.created', {
        organizationId,
        widgetId: widget.id,
        dashboardId: request.dashboard_id,
        userId,
        widget
      });

      return widget;
    } catch (error) {
      await this.audit.log({
        action: 'widget.create.error',
        organizationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: request
      });
      throw error;
    }
  }

  async updateWidget(
    organizationId: string,
    widgetId: string,
    userId: string,
    request: UpdateWidgetRequest
  ): Promise<DashboardWidget> {
    try {
      const existing = await this.widgetRepo.findById(widgetId, organizationId);
      if (!existing) {
        throw new Error('Widget not found');
      }

      const widget = await this.widgetRepo.update(widgetId, organizationId, {
        ...request,
        updated_at: new Date()
      });

      await this.audit.log({
        action: 'widget.update',
        organizationId,
        resourceId: widgetId,
        userId,
        details: {
          updated_fields: Object.keys(request),
          title: widget?.title
        }
      });

      if (widget) {
        await this.bus.publish('widget.updated', {
          organizationId,
          widgetId,
          dashboardId: widget.dashboard_id,
          userId,
          widget,
          changes: request
        });
      }

      return widget!;
    } catch (error) {
      await this.audit.log({
        action: 'widget.update.error',
        organizationId,
        resourceId: widgetId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: request
      });
      throw error;
    }
  }

  async deleteWidget(
    organizationId: string,
    widgetId: string,
    userId: string
  ): Promise<void> {
    try {
      const existing = await this.widgetRepo.findById(widgetId, organizationId);
      if (!existing) {
        throw new Error('Widget not found');
      }

      await this.widgetRepo.delete(widgetId, organizationId);

      await this.audit.log({
        action: 'widget.delete',
        organizationId,
        resourceId: widgetId,
        userId,
        details: {
          dashboard_id: existing.dashboard_id,
          title: existing.title,
          widget_type: existing.widget_type
        }
      });

      await this.bus.publish('widget.deleted', {
        organizationId,
        widgetId,
        dashboardId: existing.dashboard_id,
        userId,
        widget: existing
      });
    } catch (error) {
      await this.audit.log({
        action: 'widget.delete.error',
        organizationId,
        resourceId: widgetId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Dashboard analytics and metrics
  async getDashboardMetrics(
    organizationId: string,
    dashboardId?: string
  ): Promise<{
    totalDashboards: number;
    totalWidgets: number;
    activeUsers: number;
    recentActivity: number;
  }> {
    try {
      const metrics = await this.dashboardRepo.getMetrics(organizationId, dashboardId);
      
      await this.audit.log({
        action: 'dashboard.metrics',
        organizationId,
        resourceId: dashboardId,
        details: metrics
      });

      return metrics;
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.metrics.error',
        organizationId,
        resourceId: dashboardId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // User preferences
  async updateUserPreferences(
    userId: string,
    organizationId: string,
    dashboardId: string,
    preferences: {
      layout?: Record<string, any>;
      settings?: Record<string, any>;
      is_favorite?: boolean;
    }
  ): Promise<void> {
    try {
      await this.dashboardRepo.updateUserPreferences(userId, dashboardId, preferences);

      await this.audit.log({
        action: 'dashboard.preferences.update',
        organizationId,
        resourceId: dashboardId,
        userId,
        details: {
          updated_fields: Object.keys(preferences)
        }
      });

      await this.bus.publish('dashboard.preferences.updated', {
        organizationId,
        dashboardId,
        userId,
        preferences
      });
    } catch (error) {
      await this.audit.log({
        action: 'dashboard.preferences.update.error',
        organizationId,
        resourceId: dashboardId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}
