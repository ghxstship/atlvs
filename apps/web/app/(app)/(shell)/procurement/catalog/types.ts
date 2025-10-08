import { z } from 'zod';

// Base catalog item interface
export interface CatalogItem {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  category?: string;
  subcategory?: string;
  price?: number;
  rate?: number;
  currency: string;
  unit?: string;
  sku?: string;
  supplier?: string;
  supplier_id?: string;
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  specifications?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  inventory_count?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  lead_time_days?: number;
  warranty_period?: string;
  compliance_certifications?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Product-specific interface
export interface Product extends Omit<CatalogItem, 'type' | 'rate' | 'unit'> {
  type: 'product';
  price: number;
  sku?: string;
}

// Service-specific interface
export interface Service extends Omit<CatalogItem, 'type' | 'price' | 'sku'> {
  type: 'service';
  rate: number;
  unit: 'hour' | 'day' | 'week' | 'month' | 'project' | 'fixed';
}

// Category interface
export interface Category {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'product' | 'service' | 'both';
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// Vendor interface
export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Filter interfaces
export interface CatalogFilters {
  search?: string;
  type?: 'all' | 'product' | 'service';
  category?: string;
  subcategory?: string;
  status?: 'all' | CatalogItem['status'];
  supplier?: string;
  supplier_id?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  rateRange?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  hasImages?: boolean;
  hasDocuments?: boolean;
  complianceCertifications?: string[];
  leadTimeRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
}
// Sort options
export type CatalogSortField = 'name' | 'price' | 'rate' | 'category' | 'supplier' | 'status' | 'created_at' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface CatalogSort {
  field: CatalogSortField;
  direction: SortDirection;
}

// View modes
export type CatalogViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'calendar' | 'timeline' | 'gallery' | 'dashboard' | 'form';

// Bulk action types
export type BulkActionType = 'delete' | 'update_status' | 'update_category' | 'update_supplier' | 'export';

export interface BulkAction {
  type: BulkActionType;
  itemIds: string[];
  data?: Record<string, unknown>;
}

// Statistics and analytics
export interface CatalogStats {
  totalItems: number;
  totalProducts: number;
  totalServices: number;
  activeItems: number;
  inactiveItems: number;
  discontinuedItems: number;
  categoriesCount: number;
  suppliersCount: number;
  averagePrice: number;
  totalValue: number;
  recentlyAdded: number;
  recentlyUpdated: number;
}

export interface CatalogAnalytics {
  itemsByCategory: Array<{ category: string; count: number; value: number }>;
  itemsBySupplier: Array<{ supplier: string; count: number; value: number }>;
  itemsByStatus: Array<{ status: string; count: number }>;
  itemsByType: Array<{ type: string; count: number; value: number }>;
  priceDistribution: Array<{ range: string; count: number }>;
  recentActivity: Array<{
    date: string;
    created: number;
    updated: number;
    deleted: number;
  }>;
  topCategories: Array<{ category: string; count: number; growth: number }>;
  topSuppliers: Array<{ supplier: string; count: number; rating: number }>;
}

// Field configuration for dynamic forms and tables
export interface CatalogFieldConfig {
  key: keyof CatalogItem;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'currency' | 'tags';
  required?: boolean;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodSchema;
  placeholder?: string;
  helpText?: string;
}

// Export/Import interfaces
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  filters?: CatalogFilters;
  includeHeaders?: boolean;
  filename?: string;
}

export interface ImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  skipFirstRow?: boolean;
  validateOnly?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  data?: CatalogItem[];
}

// Activity tracking
export interface CatalogActivity {
  id: string;
  organization_id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update' | 'import' | 'export';
  resource_type: 'catalog_item' | 'product' | 'service' | 'category' | 'vendor';
  resource_id?: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Validation schemas
export const catalogItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['product', 'service']),
  category: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  rate: z.number().min(0, 'Rate must be non-negative').optional(),
  currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
  unit: z.enum(['hour', 'day', 'week', 'month', 'project', 'fixed']).optional(),
  sku: z.string().optional(),
  supplier: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']),
  specifications: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['product', 'service', 'both']),
  parent_id: z.string().uuid().optional()
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(255, 'Name too long'),
  contact_email: z.string().email('Invalid email').optional(),
  contact_phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['active', 'inactive'])
});

export const catalogFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['all', 'product', 'service']).optional(),
  status: z.enum(['all', 'active', 'inactive', 'discontinued']).optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'warning';
    case 'discontinued': return 'destructive';
    default: return 'secondary';
  }
};

export const getTypeColor = (type: string): string => {
  return type === 'product' ? 'primary' : 'success';
};

export const getTypeIcon = (type: string): string => {
  return type === 'product' ? 'Package2' : 'Wrench';
};

// Default field configurations
export const defaultCatalogFields: CatalogFieldConfig[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 200
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 100,
    options: [
      { value: 'product', label: 'Product' },
      { value: 'service', label: 'Service' },
    ]
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    visible: true,
    sortable: true,
    filterable: true,
    width: 150
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    visible: true,
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'discontinued', label: 'Discontinued' },
    ]
  },
  {
    key: 'price',
    label: 'Price',
    type: 'currency',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    key: 'supplier',
    label: 'Supplier',
    type: 'select',
    visible: true,
    sortable: true,
    filterable: true,
    searchable: true,
    width: 150
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    visible: true,
    sortable: true,
    filterable: true,
    width: 120
  },
];
