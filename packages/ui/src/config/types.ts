import { z } from 'zod';
import { LucideIcon } from 'lucide-react';
import type { FieldConfig, DrawerAction } from '../unified/drawers/UnifiedDrawer';

// User type
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  metadata?: Record<string, any>;
}

// Module entity configuration
export interface ModuleEntity {
  // Basic info
  table: string;
  singular: string;
  plural: string;
  schema: z.ZodSchema;
  
  // Data configuration
  includes?: string[];
  searchFields?: string[];
  orderBy?: string;
  defaultValues?: Record<string, any>;
  
  // UI configuration
  fields?: FieldConfig[];
  drawerLayout?: 'single' | 'tabs' | 'steps';
  drawerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  submitLabel?: string;
  cancelLabel?: string;
  deleteConfirmation?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  
  // Views configuration
  defaultViews?: ViewType[];
  customViews?: Record<string, React.ComponentType<any>>;
  
  // Permissions
  permissions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  
  // Actions
  drawerActions?: DrawerAction[];
  customActions?: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick: (item: any) => void | Promise<void>;
    condition?: (item: any) => boolean;
  }>;
  bulkActions?: Record<string, (ids: string[]) => Promise<void>>;
  headerActions?: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick: () => void;
  }>;
  
  // Filters
  filters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'boolean';
    options?: any[];
    defaultValue?: any;
  }>;
  
  // Empty state
  emptyState?: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  // Transforms
  transforms?: {
    beforeCreate?: (data: any) => any;
    afterFetch?: (data: any) => any;
    beforeUpdate?: (data: any) => any;
  };
  
  // Cache configuration
  cache?: {
    enabled?: boolean;
    ttl?: number;
    key?: (params: any) => string;
  };
}

// View types
export type ViewType = 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline' | 'dashboard' | 'table' | 'gallery' | 'map';

// Overview widget types
export interface OverviewWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'activity' | 'custom';
  title: string;
  description?: string;
  span?: 1 | 2 | 3 | 4 | 6 | 12; // Grid span
  
  // Metric widget
  metric?: string;
  value?: number | string | (() => Promise<number | string>);
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  
  // Chart widget
  chart?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  chartData?: any[] | (() => Promise<any[]>);
  chartConfig?: any;
  
  // List widget
  entity?: string;
  limit?: number;
  filters?: Record<string, any>;
  columns?: Array<{
    key: string;
    label: string;
    format?: (value: any) => string;
  }>;
  
  // Activity widget
  activities?: Array<{
    id: string;
    title: string;
    description?: string;
    timestamp: Date;
    user?: User;
    icon?: LucideIcon;
    color?: string;
  }> | (() => Promise<any[]>);
  
  // Custom widget
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

// Overview configuration
export interface OverviewConfig {
  widgets: OverviewWidget[];
  layout?: 'grid' | 'masonry' | 'flex';
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  refresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

// Module tab configuration
export interface ModuleTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
  badge?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  
  // Tab type
  type?: 'overview' | 'entity' | 'custom';
  
  // For entity tabs
  entity?: string;
  views?: ViewType[];
  
  // For overview tabs
  config?: OverviewConfig;
  
  // For custom tabs
  component?: React.ComponentType<any>;
}

// Module configuration
export interface ModuleConfig {
  // Basic info
  id: string;
  name: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  
  // Navigation
  path?: string;
  parentId?: string;
  order?: number;
  hidden?: boolean;
  
  // Tabs
  tabs: ModuleTab[];
  defaultTab?: string;
  
  // Entities
  entities: Record<string, ModuleEntity>;
  
  // Header actions
  headerActions?: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick: () => void;
  }>;
  
  // Permissions
  permissions?: {
    view?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
  };
  
  // Callbacks
  onCreateSuccess?: (data: any) => void;
  onUpdateSuccess?: (data: any) => void;
  onDeleteSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  
  // Feature flags
  features?: {
    search?: boolean;
    filters?: boolean;
    sort?: boolean;
    export?: boolean;
    import?: boolean;
    bulkActions?: boolean;
    realtime?: boolean;
    audit?: boolean;
    versioning?: boolean;
    comments?: boolean;
    attachments?: boolean;
    notifications?: boolean;
  };
  
  // Custom configuration
  custom?: Record<string, any>;
}

// Module registry
export interface ModuleRegistry {
  modules: Record<string, ModuleConfig>;
  
  // Helper methods
  getModule(id: string): ModuleConfig | undefined;
  getModules(): ModuleConfig[];
  getModulesByParent(parentId?: string): ModuleConfig[];
  getModulePath(id: string): string;
  hasPermission(moduleId: string, action: string, userRole?: string): boolean;
}

// Export all types
export type {
  FieldConfig,
  DrawerAction,
} from '../unified/drawers/UnifiedDrawer';

export type {
  ServiceConfig,
  ListParams,
  ListResult,
  BulkOperationResult,
} from '../unified/services/UnifiedService';
