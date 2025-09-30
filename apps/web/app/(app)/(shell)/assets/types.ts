/**
 * Assets Module Types
 *
 * Enterprise-grade TypeScript type definitions for the Assets module.
 * Defines all data structures, schemas, and interfaces used throughout
 * the asset lifecycle management system.
 *
 * @module assets/types
 */

import { z } from 'zod';

// Core Asset Types
export const AssetStatus = z.enum([
  'available',
  'in_use',
  'maintenance',
  'retired',
  'lost',
  'damaged'
] as const);

export const AssetCondition = z.enum([
  'excellent',
  'good',
  'fair',
  'poor',
  'needs_repair'
] as const);

export const AssetCategory = z.enum([
  'it_equipment',
  'office_furniture',
  'vehicles',
  'machinery',
  'tools',
  'electronics',
  'safety_equipment',
  'other'
] as const);

// Asset Entity Schema
export const AssetSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Asset name is required'),
  asset_tag: z.string().min(1, 'Asset tag is required'),
  serial_number: z.string().optional(),
  barcode: z.string().optional(),
  qr_code: z.string().optional(),
  category: AssetCategory,
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  status: AssetStatus.default('available'),
  condition: AssetCondition.default('good'),
  location_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  purchase_date: z.date().optional(),
  purchase_price: z.number().positive().optional(),
  warranty_expiry: z.date().optional(),
  depreciation_rate: z.number().min(0).max(100).optional(),
  current_value: z.number().positive().optional(),
  supplier_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  image_urls: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Asset = z.infer<typeof AssetSchema>;

// Location Entity Schema
export const LocationType = z.enum([
  'building',
  'floor',
  'room',
  'area',
  'storage',
  'vehicle',
  'site'
] as const);

export const LocationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Location name is required'),
  type: LocationType,
  parent_location_id: z.string().uuid().optional(),
  address: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  capacity: z.number().int().positive().optional(),
  manager_id: z.string().uuid().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Location = z.infer<typeof LocationSchema>;

// Maintenance Entity Schema
export const MaintenanceType = z.enum([
  'preventive',
  'corrective',
  'emergency',
  'inspection',
  'calibration'
] as const);

export const MaintenanceStatus = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'overdue'
] as const);

export const MaintenancePriority = z.enum([
  'low',
  'medium',
  'high',
  'critical'
] as const);

export const MaintenanceSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  type: MaintenanceType,
  title: z.string().min(1, 'Maintenance title is required'),
  description: z.string().optional(),
  status: MaintenanceStatus.default('scheduled'),
  priority: MaintenancePriority.default('medium'),
  scheduled_date: z.date(),
  completed_date: z.date().optional(),
  assigned_to: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  parts_used: z.array(z.object({
    part_name: z.string(),
    quantity: z.number().int().positive(),
    cost: z.number().positive().optional(),
  })).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  next_maintenance_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Maintenance = z.infer<typeof MaintenanceSchema>;

// Assignment Entity Schema
export const AssignmentStatus = z.enum([
  'active',
  'returned',
  'overdue',
  'lost'
] as const);

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  assigned_by: z.string().uuid(),
  assignment_date: z.date(),
  return_date: z.date().optional(),
  expected_return_date: z.date().optional(),
  purpose: z.string().optional(),
  location_id: z.string().uuid().optional(),
  status: AssignmentStatus.default('active'),
  condition_at_assignment: AssetCondition,
  condition_at_return: AssetCondition.optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;

// Audit Entity Schema
export const AuditStatus = z.enum([
  'planned',
  'in_progress',
  'completed',
  'cancelled'
] as const);

export const AuditSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Audit name is required'),
  description: z.string().optional(),
  audit_date: z.date(),
  auditor_id: z.string().uuid(),
  location_ids: z.array(z.string().uuid()).optional(),
  category_filter: z.string().optional(),
  status: AuditStatus.default('planned'),
  total_assets_expected: z.number().int().optional(),
  total_assets_found: z.number().int().optional(),
  discrepancies_found: z.number().int().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Audit = z.infer<typeof AuditSchema>;

// UI Component Types
export interface AssetFilters {
  category?: string[];
  status?: string[];
  condition?: string[];
  location_id?: string[];
  assigned_to?: string[];
  search?: string;
}

export interface AssetSort {
  field: keyof Asset;
  direction: 'asc' | 'desc';
}

export interface AssetPagination {
  page: number;
  pageSize: number;
  total?: number;
}

export interface AssetViewState {
  viewType: 'grid' | 'list' | 'table' | 'kanban' | 'calendar' | 'gallery' | 'timeline' | 'chart' | 'gantt' | 'form';
  filters: AssetFilters;
  sort: AssetSort;
  pagination: AssetPagination;
  selectedIds: string[];
  visibleFields: (keyof Asset)[];
}

// API Response Types
export interface AssetQueryResponse {
  data: Asset[];
  pagination: AssetPagination;
  filters: AssetFilters;
  sort: AssetSort;
}

export interface AssetMutationResponse {
  data: Asset;
  success: boolean;
  errors?: string[];
}

// Realtime Event Types
export interface AssetRealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'assets' | 'asset_locations' | 'asset_maintenance' | 'asset_assignments' | 'asset_audits';
  record: Asset | Location | Maintenance | Assignment | Audit;
  old_record?: Asset | Location | Maintenance | Assignment | Audit;
}

// Permission Types
export interface AssetPermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  assign: boolean;
  maintain: boolean;
  audit: boolean;
}

// Export/Import Types
export interface AssetExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields: (keyof Asset)[];
  filters?: AssetFilters;
  includeImages?: boolean;
}

export interface AssetImportResult {
  success: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  duplicates: number;
}

// Error Types
export class AssetError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AssetError';
  }
}

// Validation Types
export interface AssetValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

// Analytics Types
// Enriched Asset Types (with joined data)
export interface EnrichedAsset extends Omit<Asset, 'assigned_to'> {
  location?: {
    name: string;
  };
  assigned_to?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  supplier?: {
    name: string;
  };
}

export interface AssetAnalytics {
  totalAssets: number;
  availableAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  totalValue: number;
  averageValue: number;
  utilizationRate: number;
  maintenanceDue: number;
  overdueMaintenance: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
}
