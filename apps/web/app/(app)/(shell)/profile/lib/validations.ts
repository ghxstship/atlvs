import { z } from 'zod';

export const createProfileSchema = z.object({
  organization_id: z.string().uuid(),
  full_name: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Invalid email address'),
  title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active')
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional()
});

export const profileFilterSchema = z.object({
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  search: z.string().optional()
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileFilterInput = z.infer<typeof profileFilterSchema>;

export function validateCreateProfile(data: unknown): CreateProfileInput {
  return createProfileSchema.parse(data);
}

export function validateUpdateProfile(data: unknown): UpdateProfileInput {
  return updateProfileSchema.parse(data);
}

export function validateProfileFilters(data: unknown): ProfileFilterInput {
  return profileFilterSchema.parse(data);
}
