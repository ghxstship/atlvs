// Profile Module - Comprehensive Type Definitions
// Enterprise-grade TypeScript interfaces for Profile management

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Basic Information
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Professional Information
  employee_id?: string;
  department?: string;
  position?: string;
  manager_id?: string;
  hire_date?: string;
  employment_type?: 'full_time' | 'part_time' | 'contractor' | 'intern';
  salary?: number;
  currency?: string;
  
  // Contact Information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Profile Status
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  completion_percentage: number;
  last_login?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Additional fields for specific modules
  bio?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  skills?: string[];
  certifications_count?: number;
  endorsements_count?: number;
}

export interface ProfileFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'pending' | 'suspended';
  department?: string;
  employment_type?: string;
  manager_id?: string;
  completion_range?: {
    min: number;
    max: number;
  };
  date_from?: string;
  date_to?: string;
  has_certifications?: boolean;
  has_endorsements?: boolean;
  recent_login?: boolean;
}

export interface ProfileSort {
  field: keyof UserProfile;
  direction: 'asc' | 'desc';
}

export interface ProfileStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended?: number;
  completion_average: number;
  recent_updates: number;
  by_department?: Record<string, number>;
  by_employment_type?: Record<string, number>;
}

export interface ProfileAnalytics {
  trend_data: Array<{
    date: string;
    total: number;
    active: number;
    new_profiles: number;
    completion_rate: number;
  }>;
  growth_rate: number;
  completion_trend: Array<{
    date: string;
    average_completion: number;
  }>;
  department_distribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  recent_activity: Array<{
    id: string;
    user_name: string;
    action: string;
    timestamp: string;
    details?: string;
  }>;
}

export type ViewType = 'grid' | 'list' | 'table' | 'kanban' | 'calendar' | 'analytics';

// Form interfaces for CRUD operations
export interface CreateProfileFormData {
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  manager_id?: string;
  employment_type?: 'full_time' | 'part_time' | 'contractor' | 'intern';
  hire_date?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface UpdateProfileFormData extends Partial<CreateProfileFormData> {
  id: string;
}

// Certification related types
export interface Certification {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  status: 'active' | 'expired' | 'revoked';
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Endorsement related types
export interface Endorsement {
  id: string;
  user_id: string;
  endorser_id: string;
  organization_id: string;
  skill: string;
  message?: string;
  rating: number; // 1-5 scale
  project_id?: string;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  endorser_name?: string;
  endorser_position?: string;
  project_name?: string;
}

// Emergency contact types
export interface EmergencyContact {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Health record types
export interface HealthRecord {
  id: string;
  user_id: string;
  organization_id: string;
  record_type: 'medical' | 'vaccination' | 'allergy' | 'medication' | 'condition';
  title: string;
  description?: string;
  date_recorded: string;
  expiry_date?: string;
  provider?: string;
  document_url?: string;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

// Travel record types
export interface TravelRecord {
  id: string;
  user_id: string;
  organization_id: string;
  destination: string;
  purpose: 'business' | 'personal' | 'medical' | 'other';
  departure_date: string;
  return_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  passport_number?: string;
  visa_required?: boolean;
  visa_status?: 'not_required' | 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
}

// Performance record types
export interface PerformanceRecord {
  id: string;
  user_id: string;
  organization_id: string;
  review_period_start: string;
  review_period_end: string;
  reviewer_id: string;
  overall_rating: number; // 1-5 scale
  goals_achievement: number; // 1-5 scale
  technical_skills: number; // 1-5 scale
  soft_skills: number; // 1-5 scale
  comments?: string;
  goals_next_period?: string;
  status: 'draft' | 'submitted' | 'approved' | 'final';
  created_at: string;
  updated_at: string;
  
  // Populated fields
  reviewer_name?: string;
}

// Job history types
export interface JobHistory {
  id: string;
  user_id: string;
  organization_id: string;
  company_name: string;
  position: string;
  department?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  skills_used?: string[];
  salary?: number;
  currency?: string;
  reason_for_leaving?: string;
  created_at: string;
  updated_at: string;
}

// Activity log types
export interface ActivityRecord {
  id: string;
  user_id: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  
  // Populated fields
  user_name?: string;
  resource_name?: string;
}

// Uniform sizing types
export interface UniformSizing {
  id: string;
  user_id: string;
  organization_id: string;
  item_type: 'shirt' | 'pants' | 'jacket' | 'shoes' | 'hat' | 'gloves' | 'other';
  size: string;
  measurements?: Record<string, number>;
  brand?: string;
  notes?: string;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

// View configuration types
export interface ViewConfig {
  [key: string]: {
    label: string;
    icon: string;
    description: string;
  };
}

export interface QuickFilter {
  label: string;
  value: string;
}

// Field configuration for ATLVS DataViews
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'email' | 'phone' | 'currency';
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  width?: number;
  options?: Array<{ value: string; label: string }>;
  render?: (value: unknown, record: unknown) => React.ReactNode;
}

// Drawer and modal types
export interface DrawerState<T = any> {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  data?: T | null;
}

export interface BulkActionConfig {
  action: string;
  label: string;
  description: string;
  confirmationRequired: boolean;
  variant?: 'default' | 'destructive' | 'warning';
}

export interface ExportConfig {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  fields: string[];
  filters?: ProfileFilters;
  includeHeaders: boolean;
  filename?: string;
}

// API response types
export interface ProfileListResponse {
  profiles: UserProfile[];
  total: number;
  offset: number;
  limit: number;
  stats?: ProfileStats;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface ProfileStatsResponse extends ProfileStats {}

export interface ProfileAnalyticsResponse extends ProfileAnalytics {}

// Error types
export interface ProfileError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Utility functions for type creation
export const createEmptyProfile = (): Partial<UserProfile> => ({
  full_name: '',
  first_name: '',
  last_name: '',
  email: '',
  status: 'pending',
  completion_percentage: 0
});

export const createEmptyProfileStats = (): ProfileStats => ({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
  completion_average: 0,
  recent_updates: 0
});

export const createEmptyProfileAnalytics = (): ProfileAnalytics => ({
  trend_data: [],
  growth_rate: 0,
  completion_trend: [],
  department_distribution: [],
  recent_activity: []
});

// Validation schemas (for use with zod or similar)
export const PROFILE_VALIDATION_RULES = {
  full_name: { required: true, minLength: 2, maxLength: 100 },
  email: { required: true, format: 'email' },
  phone: { format: 'phone', optional: true },
  employee_id: { unique: true, optional: true },
  completion_percentage: { min: 0, max: 100 }
} as const;

// Constants
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
] as const;

export const PROFILE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
] as const;

export const DEPARTMENTS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal' },
] as const;
