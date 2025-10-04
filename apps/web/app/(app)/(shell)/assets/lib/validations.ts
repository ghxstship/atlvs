import { z, type ZodTypeAny } from 'zod';

const requiredString = (field: string) =>
  z.string({ required_error: `${field} is required` }).min(1, `${field} is required`);

const optionalString = (max: number, message: string) =>
  z.string().max(max, message).optional();

const positiveNumber = (field: string) =>
  z.number({ required_error: `${field} is required` }).positive(`${field} must be positive`);

const futureDate = (field: string) =>
  z.date({ required_error: `${field} is required` }).refine((date) => date > new Date(), `${field} must be in the future`);

const pastOrPresentDate = (field: string) =>
  z.date({ required_error: `${field} is required` }).refine((date) => date <= new Date(), `${field} must be in the past or present`);

const createAssetSchemaBase = z.object({
  name: requiredString('Asset name').max(100, 'Asset name too long'),
  asset_tag: requiredString('Asset tag')
    .max(50, 'Asset tag too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Asset tag can only contain letters, numbers, hyphens, and underscores'),
  serial_number: optionalString(100, 'Serial number too long'),
  barcode: optionalString(100, 'Barcode too long'),
  qr_code: optionalString(100, 'QR code too long'),
  category: z.enum(
    [
      'it_equipment',
      'office_furniture',
      'vehicles',
      'machinery',
      'tools',
      'electronics',
      'safety_equipment',
      'other'
    ],
    { required_error: 'Category is required' }
  ),
  subcategory: optionalString(50, 'Subcategory too long'),
  brand: optionalString(50, 'Brand too long'),
  model: optionalString(100, 'Model too long'),
  description: optionalString(1000, 'Description too long'),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']).default('available'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'needs_repair']).default('good'),
  location_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  purchase_date: pastOrPresentDate('Purchase date').optional(),
  purchase_price: positiveNumber('Purchase price').optional(),
  warranty_expiry: z.date().optional(),
  depreciation_rate: z
    .number({ required_error: 'Depreciation rate is required' })
    .min(0, 'Depreciation rate cannot be negative')
    .max(100, 'Depreciation rate cannot exceed 100%')
    .optional(),
  current_value: positiveNumber('Current value').optional(),
  supplier_id: z.string().uuid().optional().nullable(),
  notes: optionalString(2000, 'Notes too long'),
  image_urls: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images').optional(),
  specifications: z.record(z.any()).optional()
});

const addAssetRefinements = <Schema extends ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data: any, ctx) => {
    if (data.warranty_expiry && !data.purchase_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Purchase date is required when warranty expiry is provided',
        path: ['purchase_date']
      });
    }

    if (data.warranty_expiry && data.purchase_date && data.warranty_expiry <= data.purchase_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Warranty expiry must be after purchase date',
        path: ['warranty_expiry']
      });
    }
  });

export const createAssetSchema = addAssetRefinements(createAssetSchemaBase);

const updateAssetSchemaBase = createAssetSchemaBase.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']).optional()
});

export const updateAssetSchema = addAssetRefinements(updateAssetSchemaBase);

const createLocationSchemaBase = z.object({
  name: requiredString('Location name').max(100, 'Location name too long'),
  type: z.enum(
    ['building', 'floor', 'room', 'area', 'storage', 'vehicle', 'site'],
    { required_error: 'Location type is required' }
  ),
  parent_location_id: z.string().uuid().optional().nullable(),
  address: optionalString(200, 'Address too long'),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    })
    .optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  manager_id: z.string().uuid().optional().nullable(),
  description: optionalString(500, 'Description too long'),
  is_active: z.boolean().default(true)
});

const addLocationRefinements = <Schema extends ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data: any, ctx) => {
    if (data.type === 'room' && !data.parent_location_id) {
      ctx.addIssue({
        code: 'custom',
        message: 'Parent location is required for room-type locations',
        path: ['parent_location_id']
      });
    }
  });

export const createLocationSchema = addLocationRefinements(createLocationSchemaBase);
export const updateLocationSchema = addLocationRefinements(
  createLocationSchemaBase.partial().extend({
    id: z.string().uuid()
  })
);

const createMaintenanceSchemaBase = z.object({
  asset_id: z.string().uuid('Valid asset is required'),
  type: z.enum(
    ['preventive', 'corrective', 'emergency', 'inspection', 'calibration'],
    { required_error: 'Maintenance type is required' }
  ),
  title: requiredString('Maintenance title').max(200, 'Title too long'),
  description: optionalString(1000, 'Description too long'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue']).default('scheduled'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  scheduled_date: z.date({ required_error: 'Scheduled date is required' }),
  completed_date: pastOrPresentDate('Completed date').optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  estimated_hours: positiveNumber('Estimated hours').max(1000, 'Estimated hours too high').optional(),
  actual_hours: positiveNumber('Actual hours').max(1000, 'Actual hours too high').optional(),
  cost: positiveNumber('Cost').max(1000000, 'Cost too high').optional(),
  parts_used: z
    .array(
      z.object({
        part_name: requiredString('Part name'),
        quantity: z.number().int().positive('Quantity must be positive'),
        cost: positiveNumber('Part cost').optional()
      })
    )
    .max(50, 'Too many parts')
    .optional(),
  notes: optionalString(2000, 'Notes too long'),
  attachments: z.array(z.string().url('Invalid attachment URL')).max(10, 'Maximum 10 attachments').optional(),
  next_maintenance_date: z.date().optional()
});

const addMaintenanceRefinements = <Schema extends ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data: any, ctx) => {
    if (data.completed_date && data.status !== 'completed') {
      ctx.addIssue({
        code: 'custom',
        message: 'Completed date can only be set when status is completed',
        path: ['completed_date']
      });
    }

    if (data.completed_date && data.scheduled_date && data.completed_date < data.scheduled_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Completed date must be after scheduled date',
        path: ['completed_date']
      });
    }

    if (data.actual_hours && !data.completed_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Actual hours can only be set when maintenance is completed',
        path: ['actual_hours']
      });
    }
  });

export const createMaintenanceSchema = addMaintenanceRefinements(createMaintenanceSchemaBase);
export const updateMaintenanceSchema = addMaintenanceRefinements(
  createMaintenanceSchemaBase.partial().extend({
    id: z.string().uuid()
  })
);

const createAssignmentSchemaBase = z.object({
  asset_id: z.string().uuid('Valid asset is required'),
  assigned_to: z.string().uuid('Assignee is required'),
  assigned_by: z.string().uuid().optional(),
  assignment_date: pastOrPresentDate('Assignment date').default(() => new Date()),
  return_date: pastOrPresentDate('Return date').optional(),
  expected_return_date: futureDate('Expected return date').optional(),
  purpose: optionalString(500, 'Purpose too long'),
  location_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'returned', 'overdue', 'lost']).default('active'),
  condition_at_assignment: z.enum(['excellent', 'good', 'fair', 'poor']),
  condition_at_return: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  notes: optionalString(1000, 'Notes too long')
});

const addAssignmentRefinements = <Schema extends ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data: any, ctx) => {
    if (data.return_date && !data.condition_at_return) {
      ctx.addIssue({
        code: 'custom',
        message: 'Return condition is required when return date is provided',
        path: ['condition_at_return']
      });
    }

    if (data.expected_return_date && data.assignment_date && data.expected_return_date <= data.assignment_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Expected return date must be after assignment date',
        path: ['expected_return_date']
      });
    }
  });

export const createAssignmentSchema = addAssignmentRefinements(createAssignmentSchemaBase);
export const updateAssignmentSchema = addAssignmentRefinements(
  createAssignmentSchemaBase.partial().extend({
    id: z.string().uuid()
  })
);

const createAuditSchemaBase = z.object({
  name: requiredString('Audit name').max(200, 'Audit name too long'),
  description: optionalString(1000, 'Description too long'),
  audit_date: z.date({ required_error: 'Audit date is required' }),
  auditor_id: z.string().uuid('Auditor is required'),
  location_ids: z.array(z.string().uuid()).max(100, 'Too many locations').optional(),
  category_filter: optionalString(50, 'Category filter too long'),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  total_assets_expected: z.number().int().min(0).optional(),
  total_assets_found: z.number().int().min(0).optional(),
  discrepancies_found: z.number().int().min(0).optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  notes: optionalString(2000, 'Notes too long')
});

const addAuditRefinements = <Schema extends ZodTypeAny>(schema: Schema) =>
  schema.superRefine((data: any, ctx) => {
    const status = data.status ?? 'planned';
    if (data.completion_percentage !== undefined && !['in_progress', 'completed'].includes(status)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Completion percentage can only be set for in-progress or completed audits',
        path: ['completion_percentage']
      });
    }
  });

export const createAuditSchema = addAuditRefinements(createAuditSchemaBase);
export const updateAuditSchema = addAuditRefinements(
  createAuditSchemaBase.partial().extend({
    id: z.string().uuid()
  })
);

export const bulkUpdateAssetsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one asset required').max(1000, 'Too many assets'),
  updates: z
    .object({
      status: z.enum(['available', 'in_use', 'maintenance', 'retired', 'lost', 'damaged']).optional(),
      condition: z.enum(['excellent', 'good', 'fair', 'poor', 'needs_repair']).optional(),
      location_id: z.string().uuid().optional(),
      notes: optionalString(2000, 'Notes too long')
    })
    .refine((updates) => Object.keys(updates).length > 0, {
      message: 'At least one field must be updated'
    })
});

export const bulkDeleteAssetsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one asset required').max(1000, 'Too many assets'),
  reason: requiredString('Deletion reason').max(500, 'Reason too long')
});

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

export const assetExportSchema = z.object({
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
  fields: z.array(z.string()).min(1, 'At least one field required'),
  filters: assetFiltersSchema.optional(),
  include_images: z.boolean().default(false),
  date_range: z
    .object({
      from: z.date(),
      to: z.date()
    })
    .optional()
});

export const assetImportSchema = z.object({
  format: z.enum(['csv', 'excel', 'json']),
  data: z.string().min(1, 'Import data required'),
  update_existing: z.boolean().default(false),
  validate_only: z.boolean().default(false)
});

export const validateAssetForm = (data: unknown) => createAssetSchema.safeParse(data);
export const validateAssetUpdate = (data: unknown) => updateAssetSchema.safeParse(data);
export const validateLocationForm = (data: unknown) => createLocationSchema.safeParse(data);
export const validateMaintenanceForm = (data: unknown) => createMaintenanceSchema.safeParse(data);
export const validateAssignmentForm = (data: unknown) => createAssignmentSchema.safeParse(data);
export const validateAuditForm = (data: unknown) => createAuditSchema.safeParse(data);

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
