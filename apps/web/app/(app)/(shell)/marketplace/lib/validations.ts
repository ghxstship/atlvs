import { z } from 'zod';

// Input validation schemas for marketplace operations

// Base marketplace listing schema
export const marketplaceListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  type: z.enum(['offer', 'request', 'exchange'], {
    errorMap: () => ({ message: 'Type must be offer, request, or exchange' })
  }),
  category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other'], {
    errorMap: () => ({ message: 'Invalid category selected' })
  }),
  subcategory: z.string().max(100, 'Subcategory must be less than 100 characters').optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  pricing: z.object({
    amount: z.number().min(0, 'Amount must be positive').optional(),
    currency: z.string().length(3, 'Currency must be 3 characters').optional(),
    negotiable: z.boolean().default(false),
    paymentTerms: z.string().max(500, 'Payment terms must be less than 500 characters').optional(),
  }).optional(),
  location: z.object({
    city: z.string().max(100, 'City must be less than 100 characters').optional(),
    state: z.string().max(100, 'State must be less than 100 characters').optional(),
    country: z.string().max(100, 'Country must be less than 100 characters').optional(),
    isRemote: z.boolean().default(false),
  }).optional(),
  availability: z.object({
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    flexible: z.boolean().default(false),
    immediateAvailable: z.boolean().default(false),
  }).optional(),
  requirements: z.array(z.string().max(500, 'Each requirement must be less than 500 characters')).max(20, 'Maximum 20 requirements').optional(),
  tags: z.array(z.string().max(50, 'Each tag must be less than 50 characters')).max(10, 'Maximum 10 tags').optional(),
  featured: z.boolean().default(false),
  expiresAt: z.string().datetime('Invalid expiration date').optional(),
  contactEmail: z.string().email('Invalid email address').optional(),
  contactPhone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'platform']).default('platform'),
});

// Create listing schema (extends base)
export const createListingSchema = marketplaceListingSchema.extend({
  // All fields are optional for drafts
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  type: z.enum(['offer', 'request', 'exchange'], {
    errorMap: () => ({ message: 'Type must be offer, request, or exchange' })
  }),
  category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other'], {
    errorMap: () => ({ message: 'Invalid category selected' })
  }),
});

// Update listing schema (all fields optional)
export const updateListingSchema = marketplaceListingSchema.partial();

// Vendor profile schema
export const vendorProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(200, 'Business name must be less than 200 characters'),
  businessType: z.enum(['individual', 'company', 'agency'], {
    errorMap: () => ({ message: 'Business type must be individual, company, or agency' })
  }),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters'),
  tagline: z.string().max(200, 'Tagline must be less than 200 characters').optional(),
  bio: z.string().max(2000, 'Bio must be less than 2000 characters').optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).max(10, 'Maximum 10 languages').optional(),
  yearsExperience: z.number().min(0, 'Experience must be positive').max(50, 'Experience must be less than 50 years').optional(),
  teamSize: z.number().min(1, 'Team size must be at least 1').max(10000, 'Team size must be less than 10,000').optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').max(10000, 'Hourly rate must be less than $10,000').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  primaryCategory: z.string().min(1, 'Primary category is required'),
  categories: z.array(z.string()).max(10, 'Maximum 10 categories').optional(),
  skills: z.array(z.string().max(100, 'Each skill must be less than 100 characters')).max(50, 'Maximum 50 skills').optional(),
  certifications: z.array(z.any()).max(20, 'Maximum 20 certifications').optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']).default('available'),
  responseTime: z.string().max(50, 'Response time must be less than 50 characters').optional(),
});

// Project schema
export const marketplaceProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(10000, 'Description must be less than 10,000 characters'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  subcategory: z.string().max(100, 'Subcategory must be less than 100 characters').optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed']).default('draft'),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
  budgetType: z.enum(['fixed', 'hourly', 'not_specified']).default('not_specified'),
  budgetMin: z.number().min(0, 'Budget minimum must be positive').optional(),
  budgetMax: z.number().min(0, 'Budget maximum must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  visibility: z.enum(['public', 'private', 'invite_only']).default('public'),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
});

// Proposal schema
export const marketplaceProposalSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  timeline: z.string().max(500, 'Timeline must be less than 500 characters').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
});

// Search and filter schemas
export const listingFiltersSchema = z.object({
  type: z.enum(['offer', 'request', 'exchange']).optional(),
  category: z.enum(['equipment', 'services', 'talent', 'locations', 'materials', 'other']).optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').optional(),
  search: z.string().max(200, 'Search query must be less than 200 characters').optional(),
  featured: z.boolean().optional(),
  showMine: z.boolean().optional(),
  active: z.boolean().optional(),
});

// Bulk operation schemas
export const bulkUpdateListingsSchema = z.object({
  ids: z.array(z.string().uuid('Invalid listing ID')).min(1, 'At least one listing must be selected').max(100, 'Maximum 100 listings per bulk operation'),
  updates: updateListingSchema,
});

export const bulkDeleteListingsSchema = z.object({
  ids: z.array(z.string().uuid('Invalid listing ID')).min(1, 'At least one listing must be selected').max(100, 'Maximum 100 listings per bulk operation'),
});

// Import/Export schemas
export const importListingsSchema = z.object({
  format: z.enum(['csv', 'json', 'excel']),
  data: z.string().min(1, 'Import data is required'),
  options: z.object({
    skipDuplicates: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false),
  }).optional(),
});

export const exportListingsSchema = z.object({
  format: z.enum(['csv', 'json', 'excel', 'pdf']),
  filters: listingFiltersSchema.optional(),
  fields: z.array(z.string()).min(1, 'At least one field must be selected').optional(),
  includeMetadata: z.boolean().default(true),
});

// Validation helper functions
export function validateListingData(data: unknown) {
  return createListingSchema.safeParse(data);
}

export function validateListingUpdate(data: unknown) {
  return updateListingSchema.safeParse(data);
}

export function validateVendorProfile(data: unknown) {
  return vendorProfileSchema.safeParse(data);
}

export function validateProject(data: unknown) {
  return marketplaceProjectSchema.safeParse(data);
}

export function validateProposal(data: unknown) {
  return marketplaceProposalSchema.safeParse(data);
}

export function validateFilters(data: unknown) {
  return listingFiltersSchema.safeParse(data);
}

export function validateBulkUpdate(data: unknown) {
  return bulkUpdateListingsSchema.safeParse(data);
}

export function validateBulkDelete(data: unknown) {
  return bulkDeleteListingsSchema.safeParse(data);
}

export function validateImport(data: unknown) {
  return importListingsSchema.safeParse(data);
}

export function validateExport(data: unknown) {
  return exportListingsSchema.safeParse(data);
}

// Type inference helpers
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;
export type MarketplaceProjectInput = z.infer<typeof marketplaceProjectSchema>;
export type MarketplaceProposalInput = z.infer<typeof marketplaceProposalSchema>;
export type ListingFiltersInput = z.infer<typeof listingFiltersSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateListingsSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteListingsSchema>;
export type ImportInput = z.infer<typeof importListingsSchema>;
export type ExportInput = z.infer<typeof exportListingsSchema>;
