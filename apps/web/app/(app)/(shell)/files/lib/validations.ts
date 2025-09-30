/**
 * Files Validation Schemas
 * Input validation schemas using Zod
 * Comprehensive validation for all file operations
 */

import { z } from 'zod';

// Base file types
export const FileCategorySchema = z.enum([
  'document',
  'image',
  'video',
  'audio',
  'drawing',
  'specification',
  'report',
  'template',
  'policy',
  'other'
]);

export const AccessLevelSchema = z.enum([
  'public',
  'team',
  'restricted',
  'private'
]);

export const FileStatusSchema = z.enum([
  'active',
  'archived',
  'processing',
  'error'
]);

// Create file input validation
export const CreateAssetInputSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  category: FileCategorySchema,

  tags: z.array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),

  access_level: AccessLevelSchema
    .default('private'),

  folder_id: z.string()
    .uuid('Invalid folder ID')
    .optional(),

  project_id: z.string()
    .uuid('Invalid project ID')
    .optional(),

  metadata: z.record(z.any())
    .optional(),

  file_path: z.string()
    .min(1, 'File path is required'),

  file_size: z.number()
    .positive('File size must be positive')
    .max(100 * 1024 * 1024, 'File size cannot exceed 100MB'),

  mime_type: z.string()
    .min(1, 'MIME type is required'),

  checksum: z.string()
    .optional(),
});

// Update file input validation
export const UpdateAssetInputSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),

  category: FileCategorySchema
    .optional(),

  tags: z.array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),

  access_level: AccessLevelSchema
    .optional(),

  folder_id: z.string()
    .uuid('Invalid folder ID')
    .nullable()
    .optional(),

  project_id: z.string()
    .uuid('Invalid project ID')
    .nullable()
    .optional(),

  metadata: z.record(z.any())
    .optional(),

  status: FileStatusSchema
    .optional(),
});

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size > 0, 'File cannot be empty')
    .refine((file) => file.size <= 100 * 1024 * 1024, 'File size cannot exceed 100MB'),

  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),

  category: FileCategorySchema,

  access_level: AccessLevelSchema
    .default('private'),

  folder_id: z.string()
    .uuid('Invalid folder ID')
    .optional(),

  project_id: z.string()
    .uuid('Invalid project ID')
    .optional(),
});

// Bulk operations validation
export const BulkFileUpdateSchema = z.object({
  ids: z.array(z.string().uuid('Invalid file ID'))
    .min(1, 'At least one file must be selected')
    .max(100, 'Maximum 100 files can be updated at once'),

  updates: UpdateAssetInputSchema,
});

export const BulkFileDeleteSchema = z.object({
  ids: z.array(z.string().uuid('Invalid file ID'))
    .min(1, 'At least one file must be selected')
    .max(100, 'Maximum 100 files can be deleted at once'),

  soft: z.boolean()
    .default(true),
});

// Folder operations validation
export const CreateFolderSchema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Folder name contains invalid characters'),

  parent_id: z.string()
    .uuid('Invalid parent folder ID')
    .nullable()
    .optional(),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const UpdateFolderSchema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Folder name contains invalid characters')
    .optional(),

  parent_id: z.string()
    .uuid('Invalid parent folder ID')
    .nullable()
    .optional(),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

// Search and filter validation
export const FileSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(500, 'Search query is too long'),

  category: FileCategorySchema
    .optional(),

  access_level: AccessLevelSchema
    .optional(),

  date_from: z.string()
    .datetime('Invalid date format')
    .optional(),

  date_to: z.string()
    .datetime('Invalid date format')
    .optional(),

  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  folder_id: z.string()
    .uuid('Invalid folder ID')
    .optional(),

  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit cannot exceed 1000')
    .default(50),

  offset: z.number()
    .min(0, 'Offset must be non-negative')
    .default(0),
});

// Import/Export validation
export const FileImportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json', 'xml'])
    .default('csv'),

  data: z.any(), // Will be validated based on format

  options: z.object({
    skip_duplicates: z.boolean().default(true),
    update_existing: z.boolean().default(false),
    folder_id: z.string().uuid('Invalid folder ID').optional(),
    category: FileCategorySchema.optional(),
    access_level: AccessLevelSchema.default('private'),
  }).optional(),
});

export const FileExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json', 'pdf'])
    .default('csv'),

  ids: z.array(z.string().uuid('Invalid file ID'))
    .optional(), // If not provided, export all based on filters

  filters: FileSearchSchema
    .omit({ limit: true, offset: true })
    .optional(),

  include_versions: z.boolean()
    .default(false),

  include_metadata: z.boolean()
    .default(true),
});

// Comment validation
export const FileCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters'),

  parent_id: z.string()
    .uuid('Invalid parent comment ID')
    .optional(), // For threaded comments
});

// Version control validation
export const FileVersionSchema = z.object({
  file_id: z.string()
    .uuid('Invalid file ID'),

  version_number: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)'),

  changes: z.string()
    .max(500, 'Change description must be less than 500 characters')
    .optional(),

  file_path: z.string()
    .min(1, 'File path is required'),

  file_size: z.number()
    .positive('File size must be positive'),

  checksum: z.string()
    .optional(),
});

// Access log validation
export const FileAccessLogSchema = z.object({
  file_id: z.string()
    .uuid('Invalid file ID'),

  user_id: z.string()
    .uuid('Invalid user ID'),

  action: z.enum(['view', 'download', 'edit', 'delete', 'share']),

  ip_address: z.string()
    .optional(),

  user_agent: z.string()
    .optional(),

  metadata: z.record(z.any())
    .optional(),
});

// Type exports for use in components
export type CreateAssetInput = z.infer<typeof CreateAssetInputSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetInputSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type BulkFileUpdateInput = z.infer<typeof BulkFileUpdateSchema>;
export type BulkFileDeleteInput = z.infer<typeof BulkFileDeleteSchema>;
export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;
export type UpdateFolderInput = z.infer<typeof UpdateFolderSchema>;
export type FileSearchInput = z.infer<typeof FileSearchSchema>;
export type FileImportInput = z.infer<typeof FileImportSchema>;
export type FileExportInput = z.infer<typeof FileExportSchema>;
export type FileCommentInput = z.infer<typeof FileCommentSchema>;
export type FileVersionInput = z.infer<typeof FileVersionSchema>;
export type FileAccessLogInput = z.infer<typeof FileAccessLogSchema>;
