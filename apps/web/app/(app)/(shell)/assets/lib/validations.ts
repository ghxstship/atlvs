/**
 * Assets Validation Schemas
 *
 * Enterprise-grade input validation schemas using Zod.
 * Provides comprehensive validation with error messages,
 * conditional logic, and business rule enforcement.
 *
 * @module assets/lib/validations
 */

import { z } from 'zod';

// Base validation helpers
const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`);

const optionalString = z.string().optional();

const positiveNumber = (field: string) =>
  z.number().positive(`${field} must be positive`);

const futureDate = (field: string) =>
  z.date().refine((date) => date > new Date(), `${field} must be in the future`);

const pastOrPresentDate = (field: string) =>
  z.date().refine((date) => date <= new Date(), `${field} must be in the past or present`);

// Asset validation schemas
export const createAssetSchema = z.object({
  name: requiredString('Asset name').max(100, 'Asset name too long'),
  asset_tag: requiredString('Asset tag')
    .max(50, 'Asset tag too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Asset tag can only contain letters, numbers, hyphens, and underscores'),
  serial_number: optionalString.max(100, 'Serial number too long'),
  barcode: optionalString.max(100, 'Barcode too long'),
  qr_code: optionalString.max(100, 'QR code too long'),
  category: z.enum([
    'it_equipment',
    'office_furniture',
    'vehicles',
    'machinery',
    'tools',
    'electronics',
    'safety_equipment',
    'other'
  ], { required_error: 'Category is required' }),
  subcategory: optionalString.max(50, 'Subcategory too long'),
  brand: optionalString.max(50, 'Brand too long'),
  model: optionalString.max(100, 'Model too long'),
  description: optionalString.max(1000, 'Description too long'),
  status: z.enum([
    'available',
    'in_use',
    'maintenance',
    'retired',
    'lost',
    'damaged'
  ]).default('available'),
  condition: z.enum([
    'excellent',
    'good',
    'fair',
    'poor',
    'needs_repair'
  ]).default('good'),
  location_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  purchase_date: pastOrPresentDate('Purchase date').optional(),
  purchase_price: positiveNumber('Purchase price').optional(),
  warranty_expiry: z.date().optional(),
  depreciation_rate: z.number()
    .min(0, 'Depreciation rate cannot be negative')
    .max(100, 'Depreciation rate cannot exceed 100%')
    .optional(),
  current_value: positiveNumber('Current value').optional(),
  supplier_id: z.string().uuid().optional().nullable(),
  notes: optionalString.max(2000, 'Notes too long'),
  image_urls: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images').optional(),
  specifications: z.record(z.any()).optional()
}).refine((data) => {
  // Business rule: if warranty_expiry is provided, purchase_date must also be provided
  if (data.warranty_expiry && !data.purchase_date) {
    return false;
  }
  return true;
}, {
  message: 'Purchase date is required when warranty expiry is provided',
  path: ['purchase_date']
}).refine((data) => {
  // Business rule: warranty_expiry must be after purchase_date
  if (data.warranty_expiry && data.purchase_date && data.warranty_expiry <= data.purchase_date) {
    return false;
  }
  return true;
}, {
  message: 'Warranty expiry must be after purchase date',
  path: ['warranty_expiry']
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  id: z.string().uuid(),
  // Allow updating status to retired even if other validations fail
  status: z.enum([
    'available',
    'in_use',
    'maintenance',
    'retired',
    'lost',
    'damaged'
  ]).optional()
});

// Location validation schemas
export const createLocationSchema = z.object({
  name: requiredString('Location name').max(100, 'Location name too long'),
  type: z.enum([
    'building',
    'floor',
    'room',
    'area',
    'storage',
    'vehicle',
    'site'
  ], { required_error: 'Location type is required' }),
  parent_location_id: z.string().uuid().optional().nullable(),
  address: optionalString.max(200, 'Address too long'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  manager_id: z.string().uuid().optional().nullable(),
  description: optionalString.max(500, 'Description too long'),
  is_active: z.boolean().default(true)
}).refine((data) => {
  // Business rule: if type is 'room', parent_location_id is required
  if (data.type === 'room' && !data.parent_location_id) {
    return false;
  }
  return true;
}, {
  message: 'Parent location is required for room-type locations',
  path: ['parent_location_id']
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  id: z.string().uuid()
});

// Maintenance validation schemas
export const createMaintenanceSchema = z.object({
  asset_id: z.string().uuid('Valid asset is required'),
  type: z.enum([
    'preventive',
    'corrective',
    'emergency',
    'inspection',
    'calibration'
  ], { required_error: 'Maintenance type is required' }),
  title: requiredString('Maintenance title').max(200, 'Title too long'),
  description: optionalString.max(1000, 'Description too long'),
  status: z.enum([
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'overdue'
  ]).default('scheduled'),
  priority: z.enum([
    'low',
    'medium',
    'high',
    'critical'
  ]).default('medium'),
  scheduled_date: z.date('Scheduled date is required'),
  completed_date: pastOrPresentDate('Completed date').optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  estimated_hours: positiveNumber('Estimated hours').max(1000, 'Estimated hours too high').optional(),
  actual_hours: positiveNumber('Actual hours').max(1000, 'Actual hours too high').optional(),
  cost: positiveNumber('Cost').max(1000000, 'Cost too high').optional(),
  parts_used: z.array(z.object({
    part_name: requiredString('Part name'),
    quantity: z.number().int().positive('Quantity must be positive'),
    cost: positiveNumber('Part cost').optional()
  })).max(50, 'Too many parts').optional(),
  notes: optionalString.max(2000, 'Notes too long'),
  attachments: z.array(z.string().url('Invalid attachment URL')).max(10, 'Maximum 10 attachments').optional(),
  next_maintenance_date: z.date().optional()
}).refine((data) => {
  // Business rule: completed_date requires status to be completed
  if (data.completed_date && data.status !== 'completed') {
    return false;
  }
  return true;
}, {
  message: 'Completed date can only be set when status is completed',
  path: ['completed_date']
}).refine((data) => {
  // Business rule: completed_date must be after scheduled_date
  if (data.completed_date && data.scheduled_date && data.completed_date < data.scheduled_date) {
    return false;
  }
  return true;
}, {
  message: 'Completed date must be after scheduled date',
  path: ['completed_date']
}).refine((data) => {
  // Business rule: actual_hours requires completed_date
  if (data.actual_hours && !data.completed_date) {
    return false;
  }
  return true;
}, {
  message: 'Actual hours can only be set when maintenance is completed',
  path: ['actual_hours']
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial().extend({
  id: z.string().uuid()
});

// Assignment validation schemas
export const createAssignmentSchema = z.object({
  asset_id: z.string().uuid('Valid asset is required'),
  assigned_to: z.string().uuid('Assignee is required'),
  assigned_by: z.string().uuid().optional(), // Will be set by server
  assignment_date: pastOrPresentDate('Assignment date').default(() => new Date()),
  return_date: pastOrPresentDate('Return date').optional(),
  expected_return_date: futureDate('Expected return date').optional(),
  purpose: optionalString.max(500, 'Purpose too long'),
  location_id: z.string().uuid().optional().nullable(),
  status: z.enum([
    'active',
    'returned',
    'overdue',
    'lost'
  ]).default('active'),
  condition_at_assignment: z.enum([
    'excellent',
    'good',
    'fair',
    'poor'
  ]),
  condition_at_return: z.enum([
    'excellent',
    'good',
    'fair',
    'poor'
  ]).optional(),
  notes: optionalString.max(1000, 'Notes too long')
}).refine((data) => {
  // Business rule: return_date requires condition_at_return
  if (data.return_date && !data.condition_at_return) {
    return false;
  }
  return true;
}, {
  message: 'Return condition is required when return date is provided',
  path: ['condition_at_return']
}).refine((data) => {
  // Business rule: expected_return_date must be after assignment_date
  if (data.expected_return_date && data.assignment_date && data.expected_return_date <= data.assignment_date) {
    return false;
  }
  return true;
}, {
  message: 'Expected return date must be after assignment date',
  path: ['expected_return_date']
});

export const updateAssignmentSchema = createAssignmentSchema.partial().extend({
  id: z.string().uuid()
});

// Audit validation schemas
export const createAuditSchema = z.object({
  name: requiredString('Audit name').max(200, 'Audit name too long'),
  description: optionalString.max(1000, 'Description too long'),
  audit_date: z.date('Audit date is required'),
  auditor_id: z.string().uuid('Auditor is required'),
  location_ids: z.array(z.string().uuid()).max(100, 'Too many locations').optional(),
  category_filter: optionalString.max(50, 'Category filter too long'),
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'cancelled'
  ]).default('planned'),
  total_assets_expected: z.number().int().min(0).optional(),
  total_assets_found: z.number().int().min(0).optional(),
  discrepancies_found: z.number().int().min(0).optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  notes: optionalString.max(2000, 'Notes too long')
}).refine((data) => {
  // Business rule: completion_percentage requires status to be completed or in_progress
  if (data.completion_percentage !== undefined &&
      !['in_progress', 'completed'].includes(data.status)) {
    return false;
  }
  return true;
}, {
  message: 'Completion percentage can only be set for in-progress or completed audits',
  path: ['completion_percentage']
});

export const updateAuditSchema = createAuditSchema.partial().extend({
  id: z.string().uuid()
});

// Bulk operation validation schemas
export const bulkUpdateAssetsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one asset required').max(1000, 'Too many assets'),
  updates: z.object({
    status: z.enum(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']).optional(),
    condition: z.enum(['excellent', 'good', 'fair', 'poor', 'needs_repair']).optional(),
    location_id: z.string().uuid().optional(),
    notes: optionalString.max(2000, 'Notes too long').optional()
  }).refine((updates) => Object.keys(updates).length > 0, {
    message: 'At least one field must be updated'
  })
});

export const bulkDeleteAssetsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one asset required').max(1000, 'Too many assets'),
  reason: requiredString('Deletion reason').max(500, 'Reason too long')
});

// Search and filter validation
export const assetSearchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(100, 'Query too long'),
  fields: z.array(z.enum(['name', 'asset_tag', 'serial_number', 'brand', 'model'])).optional(),
  limit: z.number().int().min(1).max(100).default(20)
});

export const assetFiltersSchema = z.object({
  category: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  condition: z.array(z.string()).optional(),
  location_id: z.array(z.string()).optional(),
  assigned_to: z.array(z.string()).optional(),
  search: z.string().optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  value_min: z.number().positive().optional(),
  value_max: z.number().positive().optional()
});

// Export validation
export const assetExportSchema = z.object({
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
  fields: z.array(z.string()).min(1, 'At least one field required'),
  filters: assetFiltersSchema.optional(),
  include_images: z.boolean().default(false),
  date_range: z.object({
    from: z.date(),
    to: z.date()
  }).optional()
});

// Import validation
export const assetImportSchema = z.object({
  format: z.enum(['csv', 'excel', 'json']),
  data: z.string().min(1, 'Import data required'),
  update_existing: z.boolean().default(false),
  validate_only: z.boolean().default(false)
});

// Form validation helpers
export const validateAssetForm = (data: unknown) => {
  return createAssetSchema.safeParse(data);
};

export const validateAssetUpdate = (data: unknown) => {
  return updateAssetSchema.safeParse(data);
};

export const validateLocationForm = (data: unknown) => {
  return createLocationSchema.safeParse(data);
};

export const validateMaintenanceForm = (data: unknown) => {
  return createMaintenanceSchema.safeParse(data);
};

export const validateAssignmentForm = (data: unknown) => {
  return createAssignmentSchema.safeParse(data);
};

export const validateAuditForm = (data: unknown) => {
  return createAuditSchema.safeParse(data);
};

// Type exports
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type BulkUpdateAssetsInput = z.infer<typeof bulkUpdateAssetsSchema>;
export type BulkDeleteAssetsInput = z.infer<typeof bulkDeleteAssetsSchema>;
export type AssetSearchInput = z.infer<typeof assetSearchSchema>;
export type AssetFiltersInput = z.infer<typeof assetFiltersSchema>;
export type AssetExportInput = z.infer<typeof assetExportSchema>;
export type AssetImportInput = z.infer<typeof assetImportSchema>;
