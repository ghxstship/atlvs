// Dashboard Domain Entities

export interface Dashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'system' | 'custom' | 'template';
  layout: LayoutItem[];
  settings: Record<string, any>;
  is_default: boolean;
  is_public: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardWidget {
  id: string;
  organization_id: string;
  dashboard_id: string;
  widget_type: string;
  title: string;
  description?: string;
  position: WidgetPosition;
  config: Record<string, any>;
  data_source?: string;
  query_config: Record<string, any>;
  refresh_interval: number;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LayoutItem {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UserDashboardPreferences {
  id: string;
  user_id: string;
  organization_id: string;
  dashboard_id: string;
  layout?: Record<string, any>;
  settings?: Record<string, any>;
  is_favorite: boolean;
  last_accessed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardShare {
  id: string;
  dashboard_id: string;
  shared_with_user_id?: string;
  shared_with_role?: string;
  permission_level: 'view' | 'edit' | 'admin';
  created_by: string;
  created_at: Date;
}

export interface DashboardActivity {
  id: string;
  organization_id: string;
  dashboard_id?: string;
  widget_id?: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface WidgetTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  widget_type: string;
  config: Record<string, any>;
  is_system: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardAlert {
  id: string;
  organization_id: string;
  dashboard_id?: string;
  widget_id?: string;
  name: string;
  description?: string;
  condition_config: Record<string, any>;
  notification_config: Record<string, any>;
  is_active: boolean;
  last_triggered_at?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Widget Types
export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'activity'
  | 'calendar'
  | 'kanban'
  | 'list'
  | 'image'
  | 'text'
  | 'iframe'
  | 'map'
  | 'gauge'
  | 'progress'
  | 'timeline';

// Chart Types
export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'polar'
  | 'bubble'
  | 'funnel'
  | 'treemap'
  | 'heatmap';

// Data Sources
export type DataSource = 
  | 'projects'
  | 'people'
  | 'finance'
  | 'analytics'
  | 'companies'
  | 'jobs'
  | 'assets'
  | 'pipeline'
  | 'procurement'
  | 'custom';

// Request/Response Types
export interface CreateDashboardRequest {
  name: string;
  description?: string;
  type?: 'system' | 'custom' | 'template';
  layout?: LayoutItem[];
  settings?: Record<string, any>;
  is_default?: boolean;
  is_public?: boolean;
}

export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  type?: 'system' | 'custom' | 'template';
  layout?: LayoutItem[];
  settings?: Record<string, any>;
  is_default?: boolean;
  is_public?: boolean;
}

export interface CreateWidgetRequest {
  dashboard_id: string;
  widget_type: string;
  title: string;
  description?: string;
  position: WidgetPosition;
  config?: Record<string, any>;
  data_source?: string;
  query_config?: Record<string, any>;
  refresh_interval?: number;
  is_visible?: boolean;
}

export interface UpdateWidgetRequest {
  widget_type?: string;
  title?: string;
  description?: string;
  position?: WidgetPosition;
  config?: Record<string, any>;
  data_source?: string;
  query_config?: Record<string, any>;
  refresh_interval?: number;
  is_visible?: boolean;
}

export interface DashboardFilters {
  search?: string;
  type?: 'system' | 'custom' | 'template';
  is_default?: boolean;
  is_public?: boolean;
  created_by?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface WidgetFilters {
  dashboard_id?: string;
  widget_type?: string;
  data_source?: string;
  is_visible?: boolean;
}

// Widget Configuration Interfaces
export interface MetricWidgetConfig {
  metrics: Array<{
    key: string;
    label: string;
    format: 'number' | 'currency' | 'percentage';
    color?: string;
    icon?: string;
  }>;
  dataSource: DataSource;
  timeframe?: string;
  showTrend?: boolean;
  showComparison?: boolean;
}

export interface ChartWidgetConfig {
  chartType: ChartType;
  dataSource: DataSource;
  xAxis: string;
  yAxis: string | string[];
  groupBy?: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  timeframe?: string;
}

export interface TableWidgetConfig {
  dataSource: DataSource;
  columns: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'status';
    sortable?: boolean;
    filterable?: boolean;
  }>;
  pagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export interface ActivityWidgetConfig {
  dataSources: DataSource[];
  maxItems: number;
  showAvatars: boolean;
  groupByDate: boolean;
  includeModules: string[];
  refreshInterval: number;
}

export interface CalendarWidgetConfig {
  dataSource: DataSource;
  dateField: string;
  titleField: string;
  colorField?: string;
  views: ('month' | 'week' | 'day' | 'list')[];
  defaultView: 'month' | 'week' | 'day' | 'list';
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalDashboards: number;
  totalWidgets: number;
  activeUsers: number;
  recentActivity: number;
  popularWidgets: Array<{
    widget_type: string;
    count: number;
  }>;
  usageStats: Array<{
    dashboard_id: string;
    dashboard_name: string;
    view_count: number;
    last_accessed: Date;
  }>;
}

// Widget Data Response
export interface WidgetDataResponse {
  data: any[];
  metadata: {
    total: number;
    lastUpdated: Date;
    source: DataSource;
    queryTime: number;
  };
  error?: string;
}
