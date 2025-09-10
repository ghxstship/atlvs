// Data Views System Types
// Comprehensive type definitions for enterprise data visualization

import { ReactNode } from 'react';

export type ViewType = 
  | 'grid' 
  | 'kanban' 
  | 'calendar' 
  | 'timeline' 
  | 'gallery' 
  | 'list' 
  | 'dashboard' 
  | 'form';

export interface DataRecord {
  id: string;
  [key: string]: any;
}

export type FieldType = 
  | 'text' 
  | 'textarea'
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'select' 
  | 'multiselect'
  | 'currency'
  | 'url'
  | 'email'
  | 'phone'
  | 'password'
  | 'toggle'
  | 'array'
  | 'object';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  visible?: boolean;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  rows?: number;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  format?: (value: any) => string;
  validate?: (value: any) => boolean | string;
  validation?: (value: any, formData: Record<string, any>) => string | string[] | null;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'between';
  value: any;
  label?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  field: string;
  direction?: 'asc' | 'desc';
  collapsed?: boolean;
}

export interface DataViewConfig {
  id: string;
  name: string;
  viewType: ViewType;
  defaultView?: ViewType;
  fields: FieldConfig[];
  filters?: FilterConfig[];
  sorts?: SortConfig[];
  groups?: GroupConfig[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  importConfig?: ImportConfig;
  exportConfig?: ExportConfig;
  
  // Data and saved views
  data?: DataRecord[];
  savedViews?: SavedView[];
  
  // Callback functions
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterConfig[]) => void;
  onSort?: (sorts: SortConfig[]) => void;
  onGroup?: (groups: GroupConfig[]) => void;
  onPaginate?: (page: number, pageSize: number) => void;
  onRefresh?: () => void;
  onExport?: (data: DataRecord[], format: string) => void;
  onImport?: (data: any[]) => void;
  onSaveView?: (view: Omit<SavedView, 'id'>) => void;
  onLoadView?: (viewId: string) => void;
}

export interface ViewState {
  loading: boolean;
  error: string | null;
  data: DataRecord[];
  totalCount: number;
  
  // Configuration properties that components expect
  type: ViewType;
  search: string;
  filters: FilterConfig[];
  sorts: SortConfig[];
  groups: GroupConfig[];
  fields: FieldConfig[];
  
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  selection: string[];
  customConfig?: Record<string, any>;
}

export interface ActionConfig {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  onClick: (selectedIds: string[]) => void | Promise<void>;
  requiresSelection?: boolean;
  confirmMessage?: string;
}

export interface ExportConfig {
  formats: Array<'csv' | 'excel' | 'pdf' | 'json'>;
  includeFilters?: boolean;
  customFields?: string[];
  onExport: (format: string, data: DataRecord[], config: any) => void | Promise<void>;
}

export interface ImportConfig {
  formats: Array<'csv' | 'excel' | 'json'>;
  template?: string;
  validation?: (data: any[]) => { valid: boolean; errors: string[] };
  onImport: (data: any[]) => void | Promise<void>;
}

export interface DataViewConfig {
  // Core configuration
  data?: DataRecord[];
  fields: FieldConfig[];
  loading?: boolean;
  error?: string;
  
  // View options
  defaultView?: ViewType;
  availableViews?: ViewType[];
  
  // Actions
  actions?: ActionConfig[];
  bulkActions?: ActionConfig[];
  
  // Data operations
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterConfig[]) => void;
  onSort?: (sorts: SortConfig[]) => void;
  onGroup?: (groups: GroupConfig[]) => void;
  onPaginate?: (page: number, pageSize: number) => void;
  
  // CRUD operations
  onCreate?: () => void;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (ids: string[]) => void;
  onDuplicate?: (record: DataRecord) => void;
  
  // Import/Export
  exportConfig?: ExportConfig;
  importConfig?: ImportConfig;
  
  // Saved views
  savedViews?: SavedView[];
  onSaveView?: (view: Omit<SavedView, 'id'>) => void;
  onLoadView?: (viewId: string) => void;
  onDeleteView?: (viewId: string) => void;
  
  // Customization
  allowCustomFields?: boolean;
  allowSavedViews?: boolean;
  allowExport?: boolean;
  allowImport?: boolean;
  
  // Performance
  virtualScrolling?: boolean;
  lazyLoading?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  type: ViewType;
  state: Partial<ViewState>;
  isDefault?: boolean;
  isShared?: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Kanban specific types
export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  wipLimit?: number;
  collapsed?: boolean;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  dueDate?: Date;
  columnId: string;
}

// Calendar specific types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  category?: string;
}

// Timeline specific types
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  progress?: number;
  dependencies?: string[];
  milestone?: boolean;
  critical?: boolean;
}

// Gallery specific types
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  image?: string;
  video?: string;
  metadata?: Record<string, any>;
}

// Dashboard specific types
export interface ViewProps {
  data?: DataRecord[];
  loading?: boolean;
  error?: string;
  onRecordClick?: (record: DataRecord) => void;
  onRecordSelect?: (record: DataRecord) => void;
  selectedRecords?: DataRecord[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormValidation {
  rules?: Record<string, any>;
  onValidate?: (data: Record<string, any>) => Record<string, string[]>;
}

export interface ListGroup {
  key: string;
  label: string;
  items: DataRecord[];
  collapsed?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'table';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; w: number; h: number };
  config: {
    metric?: 'count' | 'sum' | 'average' | 'max' | 'min';
    field?: string;
    format?: 'number' | 'currency' | 'percentage';
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeRange?: '7d' | '30d' | '90d' | '1y';
    groupBy?: string;
    limit?: number;
    showTimestamp?: boolean;
    icon?: string;
    subtitle?: string;
  };
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
  margin: [number, number];
  padding: [number, number];
}
