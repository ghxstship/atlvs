import { z } from 'zod';
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Activity,
  Target,
  Calendar,
  Download,
  Upload,
  Plus,
  Settings,
  Eye,
  Share,
  Filter,
  RefreshCw,
  Database,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const DashboardSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Dashboard name is required'),
  description: z.string().optional(),
  type: z.enum(['executive', 'operational', 'financial', 'project', 'custom']),
  layout: z.enum(['grid', 'masonry', 'flex']),
  columns: z.number().int().min(1).max(12).default(12),
  is_public: z.boolean().default(false),
  is_template: z.boolean().default(false),
  owner_id: z.string().uuid(),
  shared_with: z.array(z.string().uuid()).optional(),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    config: z.record(z.any()),
    position: z.object({
      x: z.number().int(),
      y: z.number().int(),
      width: z.number().int(),
      height: z.number().int(),
    }),
  })),
  refresh_interval: z.number().int().positive().optional(),
  filters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const ReportSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  type: z.enum(['tabular', 'chart', 'pivot', 'summary', 'custom']),
  category: z.enum(['financial', 'operational', 'project', 'people', 'assets', 'custom']),
  data_source: z.string().min(1, 'Data source is required'),
  query: z.string().optional(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean().default(false),
    default_value: z.any().optional(),
    options: z.array(z.any()).optional(),
  })).optional(),
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.string(),
    format: z.string().optional(),
    aggregation: z.string().optional(),
    visible: z.boolean().default(true),
  })),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    condition: z.enum(['and', 'or']).default('and'),
  })).optional(),
  sorting: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  grouping: z.array(z.string()).optional(),
  chart_config: z.object({
    type: z.string(),
    x_axis: z.string(),
    y_axis: z.string(),
    series: z.array(z.string()).optional(),
    options: z.record(z.any()).optional(),
  }).optional(),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    time: z.string(),
    recipients: z.array(z.string().email()),
    format: z.enum(['pdf', 'excel', 'csv']),
  }).optional(),
  owner_id: z.string().uuid(),
  shared_with: z.array(z.string().uuid()).optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const ExportSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Export name is required'),
  description: z.string().optional(),
  type: z.enum(['data_export', 'report_export', 'dashboard_export']),
  source_type: z.enum(['report', 'dashboard', 'raw_data', 'custom_query']),
  source_id: z.string().uuid().optional(),
  format: z.enum(['csv', 'excel', 'pdf', 'json', 'xml']),
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  file_url: z.string().url().optional(),
  file_size: z.number().int().positive().optional(),
  row_count: z.number().int().optional(),
  error_message: z.string().optional(),
  requested_by: z.string().uuid(),
  completed_at: z.date().optional(),
  expires_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const MetricSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Metric name is required'),
  description: z.string().optional(),
  category: z.enum(['financial', 'operational', 'project', 'people', 'assets', 'custom']),
  type: z.enum(['count', 'sum', 'average', 'percentage', 'ratio', 'custom']),
  unit: z.string().optional(),
  data_source: z.string().min(1, 'Data source is required'),
  calculation: z.string().min(1, 'Calculation is required'),
  target_value: z.number().optional(),
  warning_threshold: z.number().optional(),
  critical_threshold: z.number().optional(),
  trend_direction: z.enum(['higher_better', 'lower_better', 'neutral']).default('higher_better'),
  refresh_frequency: z.enum(['real_time', 'hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  is_active: z.boolean().default(true),
  owner_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const analyticsModuleConfig: ModuleConfig = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Business intelligence, reporting, and data visualization',
  icon: BarChart3,
  color: 'purple',
  path: '/analytics',
  
  entities: {
    dashboards: {
      table: 'analytics_dashboards',
      singular: 'Dashboard',
      plural: 'Dashboards',
      schema: DashboardSchema,
      includes: ['owner:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'updated_at.desc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Dashboard Name', 
          type: 'text', 
          required: true,
          placeholder: 'Enter dashboard name',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          placeholder: 'Describe the purpose of this dashboard...',
          group: 'basic'
        },
        { 
          key: 'type', 
          label: 'Dashboard Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'executive' },
            { label: 'Operational', value: 'operational' },
            { label: 'Financial', value: 'financial' },
            { label: 'Project', value: 'project' },
            { label: 'Custom', value: 'custom' },
          ],
          group: 'configuration'
        },
        { 
          key: 'layout', 
          label: 'Layout', 
          type: 'select',
          defaultValue: 'grid',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Masonry', value: 'masonry' },
            { label: 'Flex', value: 'flex' },
          ],
          group: 'configuration'
        },
        { 
          key: 'columns', 
          label: 'Columns', 
          type: 'number',
          min: 1,
          max: 12,
          defaultValue: 12,
          group: 'configuration'
        },
        { 
          key: 'refresh_interval', 
          label: 'Refresh Interval (seconds)', 
          type: 'number',
          min: 30,
          placeholder: 'Auto-refresh interval',
          group: 'configuration'
        },
        { 
          key: 'is_public', 
          label: 'Public Dashboard', 
          type: 'switch',
          defaultValue: false,
          group: 'sharing'
        },
        { 
          key: 'is_template', 
          label: 'Save as Template', 
          type: 'switch',
          defaultValue: false,
          group: 'sharing'
        },
        { 
          key: 'shared_with', 
          label: 'Share With Users', 
          type: 'multiselect',
          options: 'users',
          group: 'sharing'
        },
        { 
          key: 'tags', 
          label: 'Tags', 
          type: 'tags',
          placeholder: 'Add tags...',
          group: 'metadata'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      deleteConfirmation: true,
      
      defaultViews: ['grid', 'list'],
      
      filters: [
        {
          key: 'type',
          label: 'Dashboard Type',
          type: 'multiselect',
          options: ['executive', 'operational', 'financial', 'project', 'custom']
        },
        {
          key: 'owner_id',
          label: 'Owner',
          type: 'select',
          options: 'users'
        },
        {
          key: 'is_public',
          label: 'Visibility',
          type: 'select',
          options: [
            { label: 'Public', value: 'true' },
            { label: 'Private', value: 'false' }
          ]
        }
      ],
      
      emptyState: {
        title: 'No dashboards yet',
        description: 'Create your first dashboard to visualize data',
        icon: BarChart3,
        action: {
          label: 'Create Dashboard',
          onClick: () => console.log('Create dashboard')
        }
      },
      
      customActions: [
        {
          id: 'duplicate',
          label: 'Duplicate',
          onClick: async (dashboard) => {
            console.log('Duplicating dashboard:', dashboard);
          }
        },
        {
          id: 'export',
          label: 'Export',
          onClick: async (dashboard) => {
            console.log('Exporting dashboard:', dashboard);
          }
        },
        {
          id: 'share',
          label: 'Share',
          icon: Share,
          onClick: async (dashboard) => {
            console.log('Sharing dashboard:', dashboard);
          }
        }
      ]
    },
    
    reports: {
      table: 'analytics_reports',
      singular: 'Report',
      plural: 'Reports',
      schema: ReportSchema,
      includes: ['owner:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'updated_at.desc',
      
      fields: [
        { key: 'name', label: 'Report Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { 
          key: 'type', 
          label: 'Report Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Tabular', value: 'tabular' },
            { label: 'Chart', value: 'chart' },
            { label: 'Pivot Table', value: 'pivot' },
            { label: 'Summary', value: 'summary' },
            { label: 'Custom', value: 'custom' },
          ]
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Financial', value: 'financial' },
            { label: 'Operational', value: 'operational' },
            { label: 'Project', value: 'project' },
            { label: 'People', value: 'people' },
            { label: 'Assets', value: 'assets' },
            { label: 'Custom', value: 'custom' },
          ]
        },
        { key: 'data_source', label: 'Data Source', type: 'text', required: true },
        { key: 'query', label: 'Query', type: 'textarea', rows: 5 },
        { key: 'is_public', label: 'Public Report', type: 'switch', defaultValue: false },
        { key: 'shared_with', label: 'Share With Users', type: 'multiselect', options: 'users' },
        { key: 'tags', label: 'Tags', type: 'tags' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      
      defaultViews: ['list', 'grid'],
      
      customActions: [
        {
          id: 'run',
          label: 'Run Report',
          onClick: async (report) => {
            console.log('Running report:', report);
          }
        },
        {
          id: 'schedule',
          label: 'Schedule',
          onClick: async (report) => {
            console.log('Scheduling report:', report);
          }
        },
        {
          id: 'export',
          label: 'Export',
          onClick: async (report) => {
            console.log('Exporting report:', report);
          }
        }
      ]
    },
    
    exports: {
      table: 'analytics_exports',
      singular: 'Export',
      plural: 'Exports',
      schema: ExportSchema,
      includes: ['requested_by:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'name', label: 'Export Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { 
          key: 'type', 
          label: 'Export Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Data Export', value: 'data_export' },
            { label: 'Report Export', value: 'report_export' },
            { label: 'Dashboard Export', value: 'dashboard_export' },
          ]
        },
        { 
          key: 'source_type', 
          label: 'Source Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Report', value: 'report' },
            { label: 'Dashboard', value: 'dashboard' },
            { label: 'Raw Data', value: 'raw_data' },
            { label: 'Custom Query', value: 'custom_query' },
          ]
        },
        { 
          key: 'format', 
          label: 'Format', 
          type: 'select',
          required: true,
          options: [
            { label: 'CSV', value: 'csv' },
            { label: 'Excel', value: 'excel' },
            { label: 'PDF', value: 'pdf' },
            { label: 'JSON', value: 'json' },
            { label: 'XML', value: 'xml' },
          ]
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Completed', value: 'completed' },
            { label: 'Failed', value: 'failed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]
        },
        { key: 'file_size', label: 'File Size (bytes)', type: 'number' },
        { key: 'row_count', label: 'Row Count', type: 'number' },
        { key: 'error_message', label: 'Error Message', type: 'textarea', rows: 2 },
        { key: 'completed_at', label: 'Completed At', type: 'datetime' },
        { key: 'expires_at', label: 'Expires At', type: 'datetime' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list'],
      
      customActions: [
        {
          id: 'download',
          label: 'Download',
          icon: Download,
          onClick: async (exportItem) => {
            if (exportItem.file_url) {
              window.open(exportItem.file_url, '_blank');
            }
          },
          condition: (exportItem) => exportItem.status === 'completed' && exportItem.file_url
        },
        {
          id: 'cancel',
          label: 'Cancel',
          onClick: async (exportItem) => {
            console.log('Cancelling export:', exportItem);
          },
          condition: (exportItem) => ['pending', 'processing'].includes(exportItem.status)
        }
      ]
    },
    
    metrics: {
      table: 'analytics_metrics',
      singular: 'Metric',
      plural: 'Metrics',
      schema: MetricSchema,
      includes: ['owner:users(name,avatar)'],
      searchFields: ['name', 'description'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Metric Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Financial', value: 'financial' },
            { label: 'Operational', value: 'operational' },
            { label: 'Project', value: 'project' },
            { label: 'People', value: 'people' },
            { label: 'Assets', value: 'assets' },
            { label: 'Custom', value: 'custom' },
          ]
        },
        { 
          key: 'type', 
          label: 'Metric Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Count', value: 'count' },
            { label: 'Sum', value: 'sum' },
            { label: 'Average', value: 'average' },
            { label: 'Percentage', value: 'percentage' },
            { label: 'Ratio', value: 'ratio' },
            { label: 'Custom', value: 'custom' },
          ]
        },
        { key: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., $, %, count' },
        { key: 'data_source', label: 'Data Source', type: 'text', required: true },
        { key: 'calculation', label: 'Calculation', type: 'textarea', rows: 3, required: true },
        { key: 'target_value', label: 'Target Value', type: 'number' },
        { key: 'warning_threshold', label: 'Warning Threshold', type: 'number' },
        { key: 'critical_threshold', label: 'Critical Threshold', type: 'number' },
        { 
          key: 'trend_direction', 
          label: 'Trend Direction', 
          type: 'select',
          defaultValue: 'higher_better',
          options: [
            { label: 'Higher is Better', value: 'higher_better' },
            { label: 'Lower is Better', value: 'lower_better' },
            { label: 'Neutral', value: 'neutral' },
          ]
        },
        { 
          key: 'refresh_frequency', 
          label: 'Refresh Frequency', 
          type: 'select',
          defaultValue: 'daily',
          options: [
            { label: 'Real Time', value: 'real_time' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]
        },
        { key: 'is_active', label: 'Active', type: 'switch', defaultValue: true },
        { key: 'tags', label: 'Tags', type: 'tags' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'grid']
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: TrendingUp,
      type: 'overview',
      config: {
        widgets: [
          {
            id: 'total-dashboards',
            type: 'metric',
            title: 'Total Dashboards',
            metric: 'total_dashboards',
            icon: BarChart3,
            color: 'primary',
            span: 3
          },
          {
            id: 'active-reports',
            type: 'metric',
            title: 'Active Reports',
            metric: 'active_reports',
            icon: FileSpreadsheet,
            color: 'success',
            span: 3
          },
          {
            id: 'data-exports',
            type: 'metric',
            title: 'Data Exports',
            metric: 'data_exports',
            icon: Download,
            color: 'warning',
            span: 3
          },
          {
            id: 'metrics-tracked',
            type: 'metric',
            title: 'Metrics Tracked',
            metric: 'metrics_tracked',
            icon: Target,
            color: 'primary',
            span: 3
          },
          {
            id: 'dashboard-usage',
            type: 'chart',
            title: 'Dashboard Usage',
            chart: 'dashboard_usage',
            chartType: 'line',
            span: 6
          },
          {
            id: 'report-categories',
            type: 'chart',
            title: 'Report Categories',
            chart: 'report_categories',
            chartType: 'donut',
            span: 6
          },
          {
            id: 'recent-dashboards',
            type: 'list',
            title: 'Recent Dashboards',
            entity: 'dashboards',
            limit: 5,
            span: 6
          },
          {
            id: 'popular-reports',
            type: 'list',
            title: 'Popular Reports',
            entity: 'reports',
            limit: 5,
            span: 6
          }
        ],
        layout: 'grid',
        columns: 12,
        gap: 'md',
        refresh: true,
        refreshInterval: 300000
      }
    },
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: BarChart3,
      entity: 'dashboards',
      views: ['grid', 'list']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileSpreadsheet,
      entity: 'reports',
      views: ['list', 'grid']
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: Download,
      entity: 'exports',
      views: ['list']
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: Target,
      entity: 'metrics',
      views: ['list', 'grid']
    },
    {
      id: 'data_sources',
      label: 'Data Sources',
      icon: Database,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'automation',
      label: 'Automation',
      icon: Zap,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'create-dashboard',
      label: 'New Dashboard',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Create new dashboard')
    },
    {
      id: 'create-report',
      label: 'New Report',
      icon: FileSpreadsheet,
      variant: 'outline',
      onClick: () => console.log('Create new report')
    },
    {
      id: 'refresh-all',
      label: 'Refresh',
      icon: RefreshCw,
      variant: 'ghost',
      onClick: () => console.log('Refresh all data')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      variant: 'ghost',
      onClick: () => console.log('Analytics settings')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: false,
    bulkActions: true,
    realtime: true,
    audit: true,
    versioning: true,
    notifications: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager', 'member'],
    update: ['owner', 'admin', 'manager', 'member'],
    delete: ['owner', 'admin', 'manager']
  }
};

export default analyticsModuleConfig;
