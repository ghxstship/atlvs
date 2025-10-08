/**
 * View System Types — Complete Type Definitions
 * Modern data view system with security and performance
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * View Types
 */
export type ViewType =
  | 'grid'           // Spreadsheet-style with inline editing
  | 'kanban'         // Drag-and-drop board
  | 'gantt'          // Timeline with dependencies
  | 'calendar'       // Day/week/month calendar
  | 'card'           // Gallery/card layout
  | 'form'           // Form builder
  | 'list'           // Simple list
  | 'detail'         // Record detail view
  | 'dashboard'      // Widgets and KPIs
  | 'asset'          // Media/asset management
  | 'map'            // Geospatial data
  | 'workload';      // Resource scheduling

/**
 * Field Types
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'currency'
  | 'percentage'
  | 'url'
  | 'email'
  | 'phone'
  | 'color'
  | 'file'
  | 'image'
  | 'json'
  | 'markdown'
  | 'relation'
  | 'user';

/**
 * Field Configuration
 */
export interface FieldConfig {
  /** Field key (maps to data property) */
  key: string;
  
  /** Display label */
  label: string;
  
  /** Field type */
  type: FieldType;
  
  /** Is required */
  required?: boolean;
  
  /** Is readonly */
  readonly?: boolean;
  
  /** Is visible */
  visible?: boolean;
  
  /** Is sortable */
  sortable?: boolean;
  
  /** Is filterable */
  filterable?: boolean;
  
  /** Is groupable */
  groupable?: boolean;
  
  /** Column width (for grid view) */
  width?: number;
  
  /** Min width */
  minWidth?: number;
  
  /** Max width */
  maxWidth?: number;
  
  /** Default value */
  defaultValue?: any;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Help text */
  helpText?: string;
  
  /** Icon */
  icon?: LucideIcon;
  
  /** Options (for select/multiselect) */
  options?: Array<{
    value: string;
    label: string;
    icon?: LucideIcon;
    color?: string;
  }>;
  
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any, record: Record<string, any>) => string | null;
  };
  
  /** Format function */
  format?: (value: any, record: Record<string, any>) => string | ReactNode;
  
  /** Parse function (for editing) */
  parse?: (value: string) => any;
  
  /** Security: Field-Level Security (FLS) */
  security?: {
    read?: string[];   // Roles that can read
    write?: string[];  // Roles that can write
  };
}

/**
 * Data Record
 */
export interface DataRecord {
  id: string;
  [key: string]: any;
}

/**
 * Filter Configuration
 */
export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * Sort Configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Group Configuration
 */
export interface GroupConfig {
  field: string;
  direction?: 'asc' | 'desc';
  collapsed?: boolean;
}

/**
 * Pagination Configuration
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Action Configuration
 */
export interface ActionConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  requiresSelection?: boolean;
  confirmMessage?: string;
  onClick: (selectedIds: string[]) => void | Promise<void>;
}

/**
 * View State
 */
export interface ViewState {
  /** Current view type */
  type: ViewType;
  
  /** Search query */
  search: string;
  
  /** Active filters */
  filters: FilterConfig[];
  
  /** Active sorts */
  sorts: SortConfig[];
  
  /** Active groups */
  groups: GroupConfig[];
  
  /** Pagination */
  pagination: PaginationConfig;
  
  /** Selected record IDs */
  selectedIds: string[];
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Custom view config */
  customConfig?: Record<string, any>;
}

/**
 * Saved View
 */
export interface SavedView {
  id: string;
  name: string;
  description?: string;
  type: ViewType;
  state: Partial<ViewState>;
  isDefault?: boolean;
  isShared?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * View Props (Base)
 */
export interface ViewProps {
  /** Data records */
  data: DataRecord[];
  
  /** Field configuration */
  fields: FieldConfig[];
  
  /** Current view state */
  state: ViewState;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error message */
  error?: string | null;
  
  /** Record click handler */
  onRecordClick?: (record: DataRecord) => void;
  
  /** Record select handler */
  onRecordSelect?: (ids: string[]) => void;
  
  /** Search handler */
  onSearch?: (query: string) => void;
  
  /** Filter handler */
  onFilter?: (filters: FilterConfig[]) => void;
  
  /** Sort handler */
  onSort?: (sorts: SortConfig[]) => void;
  
  /** Group handler */
  onGroup?: (groups: GroupConfig[]) => void;
  
  /** Pagination handler */
  onPaginate?: (page: number, pageSize: number) => void;
  
  /** Create handler */
  onCreate?: () => void;
  
  /** Edit handler */
  onEdit?: (record: DataRecord) => void;
  
  /** Delete handler */
  onDelete?: (ids: string[]) => void;
  
  /** Duplicate handler */
  onDuplicate?: (record: DataRecord) => void;
  
  /** Refresh handler */
  onRefresh?: () => void;
  
  /** Export handler */
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
}

/**
 * Kanban Specific Types
 */
export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  wipLimit?: number;
  collapsed?: boolean;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  tags?: string[];
  dueDate?: Date;
  order: number;
}

/**
 * Gantt Specific Types
 */
export interface GanttTask {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress?: number;
  dependencies?: string[];
  milestone?: boolean;
  critical?: boolean;
  assignee?: string;
  parentId?: string;
}

/**
 * Calendar Specific Types
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  category?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: Date;
  };
}

/**
 * Dashboard Specific Types
 */
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'table';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number; w: number; h: number };
  config: {
    metric?: 'count' | 'sum' | 'average' | 'max' | 'min';
    field?: string;
    format?: 'number' | 'currency' | 'percentage';
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
    timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
    groupBy?: string;
    limit?: number;
  };
}

/**
 * Map Specific Types
 */
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  color?: string;
  icon?: LucideIcon;
}

/**
 * Workload Specific Types
 */
export interface WorkloadResource {
  id: string;
  name: string;
  capacity: number;
  color?: string;
}

export interface WorkloadAssignment {
  id: string;
  resourceId: string;
  taskId: string;
  start: Date;
  end: Date;
  effort: number;
}

/**
 * Security: Row-Level Security (RLS)
 */
export interface RLSConfig {
  /** Policy name */
  policy: string;
  
  /** Check function */
  check: (record: DataRecord, user: any) => boolean;
  
  /** Applies to operations */
  operations?: Array<'read' | 'create' | 'update' | 'delete'>;
}

/**
 * View Configuration
 */
export interface ViewConfig {
  /** View type */
  type: ViewType;
  
  /** Field definitions */
  fields: FieldConfig[];
  
  /** Available actions */
  actions?: ActionConfig[];
  
  /** Bulk actions */
  bulkActions?: ActionConfig[];
  
  /** Saved views */
  savedViews?: SavedView[];
  
  /** Enable search */
  searchable?: boolean;
  
  /** Enable filtering */
  filterable?: boolean;
  
  /** Enable sorting */
  sortable?: boolean;
  
  /** Enable grouping */
  groupable?: boolean;
  
  /** Enable pagination */
  paginated?: boolean;
  
  /** Enable selection */
  selectable?: boolean;
  
  /** Enable export */
  exportable?: boolean;
  
  /** Row-Level Security */
  rls?: RLSConfig[];
  
  /** Custom view configuration */
  customConfig?: Record<string, any>;
}
