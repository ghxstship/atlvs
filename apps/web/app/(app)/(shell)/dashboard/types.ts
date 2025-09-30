/* eslint-disable max-lines */
/**
 * GHXSTSHIP Dashboard Types
 * Comprehensive type definitions for enterprise dashboard system
 * Based on analysis of SmartSuite, Airtable, ClickUp, Monday.com, and Asana
 */

export type WidgetType = 
  // Metrics & KPIs
  | 'metric'
  | 'comparison_metric'
  | 'progress_metric'
  | 'kpi_card'
  | 'gauge'
  
  // Charts & Visualizations
  | 'bar_chart'
  | 'column_chart'
  | 'line_chart'
  | 'area_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'funnel_chart'
  | 'waterfall_chart'
  
  // Tables & Lists
  | 'data_table'
  | 'pivot_table'
  | 'activity_feed'
  | 'task_list'
  | 'leaderboard'
  
  // Content & Communication
  | 'text_block'
  | 'rich_text'
  | 'announcement'
  | 'notes'
  | 'image'
  | 'video'
  | 'iframe'
  
  // Integration & External
  | 'calendar'
  | 'weather'
  | 'clock'
  | 'countdown'
  | 'social_feed'
  | 'custom_html'
  | 'api_widget'
  
  // Navigation & Layout
  | 'quick_actions'
  | 'navigation_menu'
  | 'breadcrumb'
  | 'filter_bar'
  | 'search_box'
  | 'spacer'
  | 'divider';

export type ChartType = 
  | 'bar'
  | 'column'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'polar'
  | 'treemap'
  | 'sunburst'
  | 'sankey'
  | 'gauge'
  | 'funnel'
  | 'waterfall'
  | 'heatmap'
  | 'candlestick';

export type DataSource = 
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'people'
  | 'companies'
  | 'finance'
  | 'jobs'
  | 'procurement'
  | 'programming'
  | 'assets'
  | 'analytics'
  | 'files'
  | 'settings'
  | 'profile'
  | 'custom_query'
  | 'external_api';

export type RefreshInterval = 
  | 'real_time'
  | '30_seconds'
  | '1_minute'
  | '5_minutes'
  | '15_minutes'
  | '30_minutes'
  | '1_hour'
  | '6_hours'
  | '12_hours'
  | '24_hours'
  | 'manual';

export type DashboardLayout = 
  | 'grid'
  | 'masonry'
  | 'flex'
  | 'tabs'
  | 'accordion'
  | 'sidebar'
  | 'fullscreen';

export type AccessLevel = 
  | 'private'
  | 'team'
  | 'organization'
  | 'public';

export interface WidgetPosition {
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

export interface DashboardQuickInsight {
  id: string;
  title: string;
  description: string;
  value: number | string;
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'text';
  trend?: 'up' | 'down' | 'flat';
  change?: number;
  link?: string;
}

export interface WidgetConfig {
  // Data Configuration
  dataSource?: DataSource;
  query?: string;
  filters?: Record<string, unknown>;
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  
  // Chart Configuration
  chartType?: ChartType;
  xAxis?: string;
  yAxis?: string | string[];
  series?: string[];
  colors?: string[];
  
  // Display Configuration
  title?: string;
  subtitle?: string;
  description?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
  
  // Formatting
  numberFormat?: string;
  dateFormat?: string;
  currencyFormat?: string;
  
  // Interaction
  clickAction?: 'none' | 'drill_down' | 'navigate' | 'modal' | 'custom';
  clickTarget?: string;
  
  // Styling
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  
  // Content (for text/rich content widgets)
  content?: string;
  html?: string;
  markdown?: string;
  
  // External Integration
  url?: string;
  apiEndpoint?: string;
  embedCode?: string;
  
  // Metric-specific properties
  value?: number | string;
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'text';
  change?: number;
  change_type?: 'increase' | 'decrease' | 'neutral';
  target?: number;
  status?: 'good' | 'warning' | 'critical';
  previous_value?: number | string;
  
  // Conditional Formatting
  conditionalFormatting?: {
    field: string;
    condition: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with';
    value: unknown;
    style: Record<string, unknown>;
  }[];
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: WidgetType;
  title: string;
  description?: string;
  config: WidgetConfig;
  position: WidgetPosition;
  refresh_interval: RefreshInterval;
  is_visible: boolean;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  layout: DashboardLayout;
  layout_config: Record<string, unknown>;
  is_default: boolean;
  is_template: boolean;
  access_level: AccessLevel;
  allowed_users?: string[];
  allowed_roles?: string[];
  tags?: string[];
  organization_id: string;
  created_by: string;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export interface DashboardListItem extends Dashboard {
  widget_count?: number;
  share_count?: number;
  is_public: boolean;
  is_default: boolean;
  type: 'system' | 'custom' | 'template';
  created_by_user?: {
    id: string;
    email: string;
    full_name?: string | null;
  } | null;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'departmental' | 'project' | 'personal' | 'custom';
  preview_image?: string;
  widgets: Omit<DashboardWidget, 'id' | 'dashboard_id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>[];
  is_public: boolean;
  usage_count: number;
  rating: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetData {
  widget_id: string;
  data: unknown[];
  metadata: {
    total_count?: number;
    last_updated: string;
    query_time_ms?: number;
    cache_hit?: boolean;
    error?: string;
  };
}

export interface DashboardMetrics {
  total_widgets: number;
  active_widgets: number;
  last_updated: string;
  performance_score: number;
  error_count: number;
  cache_hit_rate: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multi_select' | 'text' | 'number' | 'boolean';
  field: string;
  value: unknown;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
  is_global: boolean;
  widget_ids?: string[];
}

export interface DashboardExport {
  format: 'pdf' | 'png' | 'jpeg' | 'excel' | 'csv' | 'json';
  options: {
    include_data?: boolean;
    include_images?: boolean;
    page_size?: 'A4' | 'A3' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    quality?: 'low' | 'medium' | 'high';
  };
}

// Module Overview Types
export interface ModuleOverviewConfig {
  module_name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  primary_metrics: string[];
  chart_types: ChartType[];
  default_widgets: Omit<DashboardWidget, 'id' | 'dashboard_id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>[];
  quick_actions: {
    label: string;
    action: string;
    icon: string;
    href?: string;
  }[];
}

export interface OverviewMetric {
  id: string;
  label: string;
  value: number | string;
  previous_value?: number | string;
  change?: number;
  change_type?: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'text';
  icon?: string;
  color?: string;
  target?: number;
  status?: 'good' | 'warning' | 'critical';
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  user_name?: string;
  user_avatar?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  action_url?: string;
}

// Widget Component Props
export interface BaseWidgetProps {
  widget: DashboardWidget;
  data?: WidgetData;
  isLoading?: boolean;
  isEditing?: boolean;
  onUpdate?: (config: Partial<WidgetConfig>) => void;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export interface DashboardContextType {
  dashboard: Dashboard | null;
  widgets: DashboardWidget[];
  isLoading: boolean;
  isEditing: boolean;
  filters: DashboardFilter[];
  
  // Actions
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  updateWidgetPosition: (id: string, position: WidgetPosition) => Promise<void>;
  
  // Dashboard Actions
  saveDashboard: () => Promise<void>;
  resetDashboard: () => void;
  exportDashboard: (options: DashboardExport) => Promise<void>;
  
  // Filter Actions
  addFilter: (filter: Omit<DashboardFilter, 'id'>) => void;
  updateFilter: (id: string, updates: Partial<DashboardFilter>) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  
  // UI Actions
  setEditMode: (editing: boolean) => void;
  refreshAllWidgets: () => Promise<void>;
}
