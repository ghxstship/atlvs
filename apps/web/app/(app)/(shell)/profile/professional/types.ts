// Professional Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  organization_id: string;
  job_title?: string | null;
  department?: string | null;
  employee_id?: string | null;
  hire_date?: string | null;
  employment_type?: EmploymentType | null;
  manager_id?: string | null;
  manager_name?: string | null;
  skills: string[];
  bio?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  status: ProfileStatus;
  profile_completion_percentage: number;
  last_updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type EmploymentType = 
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'intern';

export type ProfileStatus = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended';

export type ProfessionalViewType = 
  | 'list'
  | 'grid'
  | 'table'
  | 'analytics'
  | 'kanban'
  | 'calendar';

export interface ProfessionalFormData {
  job_title: string;
  department: string;
  employee_id: string;
  hire_date: string;
  employment_type: EmploymentType;
  manager_id: string;
  skills: string[];
  bio: string;
  linkedin_url: string;
  website_url: string;
  status: ProfileStatus;
}

export interface ProfessionalFilters {
  search?: string;
  employment_type?: EmploymentType | 'all';
  status?: ProfileStatus | 'all';
  department?: string | 'all';
  manager?: string | 'all';
  skills?: string[];
  hire_date_from?: string;
  hire_date_to?: string;
  completion_min?: number;
  has_linkedin?: boolean;
  has_website?: boolean;
}

export interface ProfessionalSort {
  field: 'job_title' | 'department' | 'hire_date' | 'employment_type' | 'profile_completion_percentage' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

export interface ProfessionalStats {
  totalProfiles: number;
  activeProfiles: number;
  averageCompletion: number;
  byEmploymentType: Array<{
    type: EmploymentType;
    count: number;
    averageCompletion: number;
  }>;
  byDepartment: Array<{
    department: string;
    count: number;
    averageCompletion: number;
  }>;
  byStatus: Array<{
    status: ProfileStatus;
    count: number;
  }>;
  completionDistribution: Array<{
    range: string;
    count: number;
  }>;
  topSkills: Array<{
    skill: string;
    frequency: number;
  }>;
  recentHires: Array<{
    month: string;
    count: number;
  }>;
}

export interface ProfessionalAnalytics {
  profileTrends: Array<{
    period: string;
    totalProfiles: number;
    activeProfiles: number;
    averageCompletion: number;
  }>;
  skillAnalytics: Array<{
    skill: string;
    frequency: number;
    trend: number;
    departments: string[];
  }>;
  departmentBreakdown: Array<{
    department: string;
    totalEmployees: number;
    averageCompletion: number;
    topSkills: string[];
  }>;
  employmentTypeDistribution: Array<{
    type: EmploymentType;
    count: number;
    percentage: number;
    averageTenure: number;
  }>;
  hiringTrends: Array<{
    month: string;
    hires: number;
    departures: number;
    netGrowth: number;
  }>;
  completionMetrics: {
    averageCompletion: number;
    highCompletion: number; // >80%
    mediumCompletion: number; // 50-80%
    lowCompletion: number; // <50%
  };
}

// ============================================================================
// Schemas
// ============================================================================

export const employmentTypeSchema = zod.enum([
  'full-time',
  'part-time',
  'contract',
  'freelance',
  'intern',
]);

export const profileStatusSchema = zod.enum([
  'active',
  'inactive',
  'pending',
  'suspended',
]);

export const professionalFilterSchema = zod.object({
  search: zod.string().optional(),
  employment_type: zod.union([employmentTypeSchema, zod.literal('all')]).optional(),
  status: zod.union([profileStatusSchema, zod.literal('all')]).optional(),
  department: zod.string().optional(),
  manager: zod.string().optional(),
  skills: zod.array(zod.string()).optional(),
  hire_date_from: zod.string().optional(),
  hire_date_to: zod.string().optional(),
  completion_min: zod.number().min(0).max(100).optional(),
  has_linkedin: zod.boolean().optional(),
  has_website: zod.boolean().optional(),
});

export const professionalUpsertSchema = zod.object({
  job_title: zod.string().optional().nullable(),
  department: zod.string().optional().nullable(),
  employee_id: zod.string().optional().nullable(),
  hire_date: zod.string().optional().nullable(),
  employment_type: employmentTypeSchema.optional().nullable(),
  manager_id: zod.string().uuid().optional().nullable(),
  skills: zod.array(zod.string()),
  bio: zod.string().optional().nullable(),
  linkedin_url: zod.string().url().optional().nullable().or(zod.literal('')),
  website_url: zod.string().url().optional().nullable().or(zod.literal('')),
  status: profileStatusSchema,
});

// ============================================================================
// Constants
// ============================================================================

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  freelance: 'Freelance',
  intern: 'Intern',
};

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended',
};

export const VIEW_CONFIG: Record<ProfessionalViewType, { label: string; description: string }> = {
  list: {
    label: 'List',
    description: 'Detailed list view with expandable cards',
  },
  grid: {
    label: 'Grid',
    description: 'Card-based grid layout',
  },
  table: {
    label: 'Table',
    description: 'Sortable data table',
  },
  analytics: {
    label: 'Analytics',
    description: 'Professional insights and trends',
  },
  kanban: {
    label: 'Kanban',
    description: 'Status-based board view',
  },
  calendar: {
    label: 'Calendar',
    description: 'Hire date calendar view',
  },
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Full Time', value: 'full_time' },
  { label: 'Recent Hires', value: 'recent' },
  { label: 'Incomplete', value: 'incomplete' },
];

export const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Project Management',
  'Leadership',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Agile/Scrum',
  'Data Analysis',
  'UI/UX Design',
  'DevOps',
  'Machine Learning',
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): ProfessionalFormData {
  return {
    job_title: '',
    department: '',
    employee_id: '',
    hire_date: '',
    employment_type: 'full-time',
    manager_id: '',
    skills: [],
    bio: '',
    linkedin_url: '',
    website_url: '',
    status: 'active',
  };
}

export function createEmptyStats(): ProfessionalStats {
  return {
    totalProfiles: 0,
    activeProfiles: 0,
    averageCompletion: 0,
    byEmploymentType: [],
    byDepartment: [],
    byStatus: [],
    completionDistribution: [],
    topSkills: [],
    recentHires: [],
  };
}

export function createEmptyAnalytics(): ProfessionalAnalytics {
  return {
    profileTrends: [],
    skillAnalytics: [],
    departmentBreakdown: [],
    employmentTypeDistribution: [],
    hiringTrends: [],
    completionMetrics: {
      averageCompletion: 0,
      highCompletion: 0,
      mediumCompletion: 0,
      lowCompletion: 0,
    },
  };
}

export function validateProfessionalForm(data: ProfessionalFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (data.linkedin_url && !isValidUrl(data.linkedin_url)) {
    errors.linkedin_url = 'Please enter a valid LinkedIn URL';
  }
  
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.website_url = 'Please enter a valid website URL';
  }
  
  if (data.hire_date && new Date(data.hire_date) > new Date()) {
    errors.hire_date = 'Hire date cannot be in the future';
  }
  
  return errors;
}

export function calculateProfileCompletion(profile: ProfessionalProfile): number {
  const fields = [
    profile.job_title,
    profile.department,
    profile.employee_id,
    profile.hire_date,
    profile.employment_type,
    profile.bio,
    profile.skills?.length > 0 ? 'skills' : null,
  ];
  
  const completedFields = fields.filter(field => field && field !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateTenure(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - hire.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
}

export function getStatusBadgeVariant(status: ProfileStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'inactive':
      return 'outline';
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getCompletionColor(completion: number): string {
  if (completion >= 80) return 'green';
  if (completion >= 50) return 'yellow';
  return 'red';
}

export function sortProfessionalProfiles(
  profiles: ProfessionalProfile[],
  sort: ProfessionalSort
): ProfessionalProfile[] {
  return [...profiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'job_title':
        comparison = (a.job_title || '').localeCompare(b.job_title || '');
        break;
      case 'department':
        comparison = (a.department || '').localeCompare(b.department || '');
        break;
      case 'hire_date':
        const aDate = a.hire_date ? new Date(a.hire_date).getTime() : 0;
        const bDate = b.hire_date ? new Date(b.hire_date).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case 'employment_type':
        comparison = (a.employment_type || '').localeCompare(b.employment_type || '');
        break;
      case 'profile_completion_percentage':
        comparison = a.profile_completion_percentage - b.profile_completion_percentage;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterProfessionalProfiles(
  profiles: ProfessionalProfile[],
  filters: ProfessionalFilters
): ProfessionalProfile[] {
  return profiles.filter(profile => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        profile.job_title?.toLowerCase().includes(searchLower) ||
        profile.department?.toLowerCase().includes(searchLower) ||
        profile.employee_id?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        profile.skills.some((skill: string) => skill.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Employment type filter
    if (filters.employment_type && filters.employment_type !== 'all') {
      if (profile.employment_type !== filters.employment_type) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (profile.status !== filters.status) return false;
    }
    
    // Department filter
    if (filters.department && filters.department !== 'all') {
      if (profile.department !== filters.department) return false;
    }
    
    // Manager filter
    if (filters.manager && filters.manager !== 'all') {
      if (profile.manager_id !== filters.manager) return false;
    }
    
    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const hasSkills = filters.skills.some(skill => 
        profile.skills.some((profileSkill: string) => 
          profileSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasSkills) return false;
    }
    
    // Hire date range filter
    if (filters.hire_date_from && profile.hire_date) {
      if (new Date(profile.hire_date) < new Date(filters.hire_date_from)) return false;
    }
    if (filters.hire_date_to && profile.hire_date) {
      if (new Date(profile.hire_date) > new Date(filters.hire_date_to)) return false;
    }
    
    // Completion filter
    if (filters.completion_min) {
      if (profile.profile_completion_percentage < filters.completion_min) return false;
    }
    
    // LinkedIn filter
    if (filters.has_linkedin) {
      if (!profile.linkedin_url) return false;
    }
    
    // Website filter
    if (filters.has_website) {
      if (!profile.website_url) return false;
    }
    
    return true;
  });
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
