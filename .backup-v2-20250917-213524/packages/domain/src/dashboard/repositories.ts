// Dashboard Domain Repository Interfaces

import { 
  Dashboard, 
  DashboardWidget, 
  UserDashboardPreferences,
  DashboardShare,
  DashboardActivity,
  WidgetTemplate,
  DashboardAlert,
  DashboardFilters,
  WidgetFilters,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  DashboardMetrics
} from './entities';

export interface DashboardRepository {
  // Dashboard CRUD
  findById(id: string, organizationId: string): Promise<Dashboard | null>;
  findByOrganization(organizationId: string, filters?: DashboardFilters): Promise<Dashboard[]>;
  findByName(organizationId: string, name: string): Promise<Dashboard | null>;
  create(dashboard: Omit<Dashboard, 'updated_at'> & { updated_at?: Date }): Promise<Dashboard>;
  update(id: string, organizationId: string, updates: Partial<Dashboard>): Promise<Dashboard | null>;
  delete(id: string, organizationId: string): Promise<void>;
  
  // Dashboard operations
  duplicate(
    sourceDashboardId: string, 
    organizationId: string, 
    newName: string, 
    newDescription?: string,
    userId?: string
  ): Promise<Dashboard>;
  
  // User preferences
  getUserPreferences(userId: string, dashboardId: string): Promise<UserDashboardPreferences | null>;
  updateUserPreferences(
    userId: string, 
    dashboardId: string, 
    preferences: Partial<UserDashboardPreferences>
  ): Promise<void>;
  
  // Dashboard sharing
  getShares(dashboardId: string): Promise<DashboardShare[]>;
  createShare(share: Omit<DashboardShare, 'id' | 'created_at'>): Promise<DashboardShare>;
  deleteShare(id: string): Promise<void>;
  
  // Analytics
  getMetrics(organizationId: string, dashboardId?: string): Promise<DashboardMetrics>;
  getActivity(organizationId: string, dashboardId?: string, limit?: number): Promise<DashboardActivity[]>;
}

export interface DashboardWidgetRepository {
  // Widget CRUD
  findById(id: string, organizationId: string): Promise<DashboardWidget | null>;
  findByDashboard(dashboardId: string, organizationId: string): Promise<DashboardWidget[]>;
  findByOrganization(organizationId: string, filters?: WidgetFilters): Promise<DashboardWidget[]>;
  create(widget: Omit<DashboardWidget, 'updated_at'> & { updated_at?: Date }): Promise<DashboardWidget>;
  update(id: string, organizationId: string, updates: Partial<DashboardWidget>): Promise<DashboardWidget | null>;
  delete(id: string, organizationId: string): Promise<void>;
  
  // Batch operations
  updatePositions(widgets: Array<{ id: string; position: { x: number; y: number; w: number; h: number } }>): Promise<void>;
  duplicateWidgets(sourceDashboardId: string, targetDashboardId: string): Promise<DashboardWidget[]>;
}

export interface WidgetTemplateRepository {
  // Template CRUD
  findById(id: string, organizationId: string): Promise<WidgetTemplate | null>;
  findByOrganization(organizationId: string): Promise<WidgetTemplate[]>;
  findByType(organizationId: string, widgetType: string): Promise<WidgetTemplate[]>;
  findSystemTemplates(): Promise<WidgetTemplate[]>;
  create(template: Omit<WidgetTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WidgetTemplate>;
  update(id: string, organizationId: string, updates: Partial<WidgetTemplate>): Promise<WidgetTemplate | null>;
  delete(id: string, organizationId: string): Promise<void>;
}

export interface DashboardAlertRepository {
  // Alert CRUD
  findById(id: string, organizationId: string): Promise<DashboardAlert | null>;
  findByDashboard(dashboardId: string, organizationId: string): Promise<DashboardAlert[]>;
  findByOrganization(organizationId: string): Promise<DashboardAlert[]>;
  findActive(organizationId: string): Promise<DashboardAlert[]>;
  create(alert: Omit<DashboardAlert, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardAlert>;
  update(id: string, organizationId: string, updates: Partial<DashboardAlert>): Promise<DashboardAlert | null>;
  delete(id: string, organizationId: string): Promise<void>;
  
  // Alert operations
  markTriggered(id: string, triggeredAt: Date): Promise<void>;
  getTriggeredAlerts(organizationId: string, since?: Date): Promise<DashboardAlert[]>;
}

export interface DashboardActivityRepository {
  // Activity logging
  log(activity: Omit<DashboardActivity, 'id' | 'created_at'>): Promise<DashboardActivity>;
  findByOrganization(organizationId: string, limit?: number): Promise<DashboardActivity[]>;
  findByDashboard(dashboardId: string, limit?: number): Promise<DashboardActivity[]>;
  findByUser(userId: string, organizationId: string, limit?: number): Promise<DashboardActivity[]>;
  
  // Activity analytics
  getActivityStats(organizationId: string, timeframe?: string): Promise<{
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByUser: Record<string, number>;
    activitiesByDashboard: Record<string, number>;
  }>;
}

// Widget Data Provider Interface
export interface WidgetDataProvider {
  // Data fetching
  fetchData(
    dataSource: string,
    queryConfig: Record<string, any>,
    organizationId: string
  ): Promise<{
    data: any[];
    metadata: {
      total: number;
      lastUpdated: Date;
      queryTime: number;
    };
  }>;
  
  // Real-time subscriptions
  subscribe(
    dataSource: string,
    queryConfig: Record<string, any>,
    organizationId: string,
    callback: (data: any[]) => void
  ): () => void;
  
  // Data validation
  validateQuery(dataSource: string, queryConfig: Record<string, any>): Promise<boolean>;
  getAvailableFields(dataSource: string, organizationId: string): Promise<Array<{
    key: string;
    label: string;
    type: string;
  }>>;
}

// Dashboard Layout Manager Interface
export interface DashboardLayoutManager {
  // Layout operations
  validateLayout(layout: any[]): boolean;
  optimizeLayout(layout: any[]): any[];
  generateLayout(widgets: DashboardWidget[]): any[];
  
  // Responsive layouts
  generateResponsiveLayouts(widgets: DashboardWidget[]): {
    lg: any[];
    md: any[];
    sm: any[];
    xs: any[];
  };
  
  // Layout persistence
  saveLayout(dashboardId: string, userId: string, layout: any[]): Promise<void>;
  loadLayout(dashboardId: string, userId?: string): Promise<any[]>;
}

// Dashboard Export/Import Interface
export interface DashboardExportImport {
  // Export operations
  exportDashboard(dashboardId: string, organizationId: string): Promise<{
    dashboard: Dashboard;
    widgets: DashboardWidget[];
    templates: WidgetTemplate[];
  }>;
  
  exportDashboards(organizationId: string): Promise<{
    dashboards: Dashboard[];
    widgets: DashboardWidget[];
    templates: WidgetTemplate[];
  }>;
  
  // Import operations
  importDashboard(
    data: {
      dashboard: Omit<Dashboard, 'id' | 'organization_id' | 'created_by'>;
      widgets: Omit<DashboardWidget, 'id' | 'organization_id' | 'dashboard_id'>[];
    },
    organizationId: string,
    userId: string
  ): Promise<Dashboard>;
  
  importDashboards(
    data: {
      dashboards: Omit<Dashboard, 'id' | 'organization_id' | 'created_by'>[];
      widgets: Omit<DashboardWidget, 'id' | 'organization_id' | 'dashboard_id'>[];
    },
    organizationId: string,
    userId: string
  ): Promise<Dashboard[]>;
  
  // Validation
  validateImportData(data: any): Promise<{
    valid: boolean;
    errors: string[];
  }>;
}
