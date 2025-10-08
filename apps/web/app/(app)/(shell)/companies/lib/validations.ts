/**
 * Companies Validations Service
 * Input validation and sanitization
 * Zod schemas and validation logic for all company operations
 */

import { z } from 'zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'prospect', 'former']).default('active')
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

export const CompanyFiltersSchema = z.object({
  industry: z.string().optional(),
  size: z.string().optional(),
  status: z.string().optional(),
  founded_year_min: z.number().optional(),
  founded_year_max: z.number().optional(),
  has_contracts: z.boolean().optional(),
  has_qualifications: z.boolean().optional()
});

export const CompanySearchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: z.array(z.enum(['name', 'description', 'industry', 'website'])).optional(),
  fuzzy: z.boolean().default(false)
});

export const BulkCompanyOperationSchema = z.object({
  company_ids: z.array(z.string().uuid()),
  operation: z.enum(['update', 'delete', 'archive', 'activate']),
  data: z.record(z.any()).optional()
});

export class CompaniesValidationsService {
  /**
   * Validate create company input
   */
  validateCreate(input: unknown) {
    return CreateCompanySchema.safeParse(input);
  }

  /**
   * Validate update company input
   */
  validateUpdate(input: unknown) {
    return UpdateCompanySchema.safeParse(input);
  }

  /**
   * Validate filters
   */
  validateFilters(input: unknown) {
    return CompanyFiltersSchema.safeParse(input);
  }

  /**
   * Validate search parameters
   */
  validateSearch(input: unknown) {
    return CompanySearchSchema.safeParse(input);
  }

  /**
   * Validate bulk operations
   */
  validateBulkOperation(input: unknown) {
    return BulkCompanyOperationSchema.safeParse(input);
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(input: Record<string, any>): Record<string, any> {
    const sanitized = { ...input };

    // Trim strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    // Sanitize URLs
    if (sanitized.website) {
      sanitized.website = sanitized.website.toLowerCase();
    }

    // Sanitize email
    if (sanitized.email) {
      sanitized.email = sanitized.email.toLowerCase();
    }

    return sanitized;
  }

  /**
   * Validate business rules
   */
  validateBusinessRules(data: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Business rule: founded year cannot be in the future
    if (data.founded_year && data.founded_year > new Date().getFullYear()) {
      errors.push('Founded year cannot be in the future');
    }

    // Business rule: website must be valid if provided
    if (data.website && !data.website.match(/^https?:\/\/.+/)) {
      errors.push('Website must include http:// or https://');
    }

    // Business rule: name uniqueness (would need database check in real implementation)
    // This is a placeholder for business rule validation

    return { valid: errors.length === 0, errors };
  }
}

export const companiesValidationsService = new CompaniesValidationsService();
