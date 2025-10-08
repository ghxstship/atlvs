// Job History Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface JobHistoryEntry {
  id: string;
  organization_id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  department?: string | null;
  employment_type: EmploymentType;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  location?: string | null;
  description?: string | null;
  achievements: string[];
  skills_used: string[];
  responsibilities: string[];
  salary_range?: string | null;
  supervisor_name?: string | null;
  supervisor_contact?: string | null;
  reason_for_leaving?: string | null;
  company_size?: CompanySize | null;
  industry?: string | null;
  visibility: JobVisibility;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type EmploymentType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'temporary'
  | 'consultant';

export type CompanySize = 
  | 'startup'
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise';

export type JobVisibility = 
  | 'public'
  | 'organization'
  | 'private';

export type JobViewType = 
  | 'form'
  | 'card'
  | 'timeline'
  | 'resume'
  | 'analytics';

export interface JobHistoryFormData {
  company_name: string;
  job_title: string;
  department: string;
  employment_type: EmploymentType;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location: string;
  description: string;
  achievements: string[];
  skills_used: string[];
  responsibilities: string[];
  salary_range: string;
  supervisor_name: string;
  supervisor_contact: string;
  reason_for_leaving: string;
  company_size: CompanySize;
  industry: string;
  visibility: JobVisibility;
  tags: string[];
}

export interface JobFilters {
  search: string;
  employment_type: EmploymentType | 'all';
  company_size: CompanySize | 'all';
  visibility: JobVisibility | 'all';
  is_current: 'current' | 'past' | 'all';
  industry: string | 'all';
  date_from?: string;
  date_to?: string;
  has_achievements?: boolean;
}

export type JobHistoryFilters = JobFilters;

export interface JobSort {
  field: 'start_date' | 'end_date' | 'company_name' | 'job_title' | 'created_at' | 'duration';
  direction: 'asc' | 'desc';
}

export interface JobStats {
  totalJobs: number;
  currentJobs: number;
  completedJobs: number;
  totalYearsExperience: number;
  byEmploymentType: Array<{
    type: EmploymentType;
    count: number;
  }>;
  byCompanySize: Array<{
    size: CompanySize;
    count: number;
  }>;
  byIndustry: Array<{
    industry: string;
    count: number;
  }>;
  skillsFrequency: Array<{
    skill: string;
    count: number;
  }>;
  companiesWorked: Array<{
    company: string;
    positions: number;
    totalDuration: number;
  }>;
  averageJobDuration: number;
}

export interface JobAnalytics {
  careerProgression: Array<{
    year: number;
    jobs: JobHistoryEntry[];
    totalSalaryRange?: string;
  }>;
  skillsEvolution: Array<{
    skill: string;
    timeline: Array<{
      year: number;
      count: number;
    }>;
  }>;
  industryExperience: Array<{
    industry: string;
    duration: number;
    positions: number;
  }>;
  companyTenure: Array<{
    company: string;
    duration: number;
    positions: string[];
  }>;
  salaryProgression: Array<{
    year: number;
    range: string;
    company: string;
    title: string;
  }>;
  jobMobility: {
    averageTenure: number;
    longestTenure: number;
    shortestTenure: number;
    jobChangesPerYear: number;
  };
  locationHistory: Array<{
    location: string;
    duration: number;
    companies: number;
  }>;
}

// ============================================================================
// Schemas
// ============================================================================

export const employmentTypeSchema = zod.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
  'temporary',
  'consultant',
]);

export const companySizeSchema = zod.enum([
  'startup',
  'small',
  'medium',
  'large',
  'enterprise',
]);

export const jobVisibilitySchema = zod.enum([
  'public',
  'organization',
  'private',
]);

export const jobFilterSchema = zod.object({
  search: zod.string().optional(),
  employment_type: zod.union([employmentTypeSchema, zod.literal('all')]).optional(),
  company_size: zod.union([companySizeSchema, zod.literal('all')]).optional(),
  visibility: zod.union([jobVisibilitySchema, zod.literal('all')]).optional(),
  is_current: zod.enum(['current', 'past', 'all']).optional(),
  industry: zod.string().optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
  has_achievements: zod.boolean().optional()
});

export const jobUpsertSchema = zod.object({
  company_name: zod.string().min(1, 'Company name is required'),
  job_title: zod.string().min(1, 'Job title is required'),
  department: zod.string().optional().nullable(),
  employment_type: employmentTypeSchema,
  start_date: zod.string(),
  end_date: zod.string().optional().nullable(),
  is_current: zod.boolean(),
  location: zod.string().optional().nullable(),
  description: zod.string().optional().nullable(),
  achievements: zod.array(zod.string()),
  skills_used: zod.array(zod.string()),
  responsibilities: zod.array(zod.string()),
  salary_range: zod.string().optional().nullable(),
  supervisor_name: zod.string().optional().nullable(),
  supervisor_contact: zod.string().optional().nullable(),
  reason_for_leaving: zod.string().optional().nullable(),
  company_size: companySizeSchema.optional().nullable(),
  industry: zod.string().optional().nullable(),
  visibility: jobVisibilitySchema,
  tags: zod.array(zod.string())
});

// ============================================================================
// Constants
// ============================================================================

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  temporary: 'Temporary',
  consultant: 'Consultant'
};

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  startup: 'Startup (1-10)',
  small: 'Small (11-50)',
  medium: 'Medium (51-200)',
  large: 'Large (201-1000)',
  enterprise: 'Enterprise (1000+)'
};

export const VISIBILITY_LABELS: Record<JobVisibility, string> = {
  public: 'Public',
  organization: 'Organization',
  private: 'Private'
};

export const VIEW_CONFIG: Record<JobViewType, { label: string; description: string }> = {
  form: {
    label: 'Form',
    description: 'Add or edit job history'
  },
  card: {
    label: 'Card',
    description: 'Detailed card view'
  },
  timeline: {
    label: 'Timeline',
    description: 'Career timeline'
  },
  resume: {
    label: 'Resume',
    description: 'Resume format view'
  },
  analytics: {
    label: 'Analytics',
    description: 'Career insights'
  }
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Current', value: 'current' },
  { label: 'Full-time', value: 'full_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Recent', value: 'recent' },
];

export const COMMON_SKILLS = [
  'Leadership',
  'Project Management',
  'Team Management',
  'Strategic Planning',
  'Budget Management',
  'Client Relations',
  'Problem Solving',
  'Communication',
  'Negotiation',
  'Data Analysis',
  'Process Improvement',
  'Training & Development',
  'Quality Assurance',
  'Risk Management',
  'Vendor Management',
];

export const COMMON_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Government',
  'Non-profit',
  'Media',
  'Real Estate',
  'Transportation',
  'Energy',
  'Hospitality',
  'Agriculture',
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): JobHistoryFormData {
  return {
    company_name: '',
    job_title: '',
    department: '',
    employment_type: 'full_time',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_current: false,
    location: '',
    description: '',
    achievements: [],
    skills_used: [],
    responsibilities: [],
    salary_range: '',
    supervisor_name: '',
    supervisor_contact: '',
    reason_for_leaving: '',
    company_size: 'medium',
    industry: '',
    visibility: 'organization',
    tags: []
  };
}

export function createEmptyStats(): JobStats {
  return {
    totalJobs: 0,
    currentJobs: 0,
    completedJobs: 0,
    totalYearsExperience: 0,
    byEmploymentType: [],
    byCompanySize: [],
    byIndustry: [],
    skillsFrequency: [],
    companiesWorked: [],
    averageJobDuration: 0
  };
}

export function createEmptyAnalytics(): JobAnalytics {
  return {
    careerProgression: [],
    skillsEvolution: [],
    industryExperience: [],
    companyTenure: [],
    salaryProgression: [],
    jobMobility: {
      averageTenure: 0,
      longestTenure: 0,
      shortestTenure: 0,
      jobChangesPerYear: 0
    },
    locationHistory: []
  };
}

export function validateJobForm(data: JobHistoryFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.company_name.trim()) {
    errors.company_name = 'Company name is required';
  }
  
  if (!data.job_title.trim()) {
    errors.job_title = 'Job title is required';
  }
  
  if (!data.start_date) {
    errors.start_date = 'Start date is required';
  }
  
  if (data.end_date && new Date(data.end_date) <= new Date(data.start_date)) {
    errors.end_date = 'End date must be after start date';
  }
  
  if (data.is_current && data.end_date) {
    errors.end_date = 'End date should not be set for current positions';
  }
  
  if (!data.is_current && !data.end_date) {
    errors.end_date = 'End date is required for past positions';
  }
  
  return errors;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateRange(startDate: string, endDate?: string | null, isCurrent?: boolean): string {
  const start = formatDateShort(startDate);
  if (isCurrent) {
    return `${start} - Present`;
  }
  if (endDate) {
    return `${start} - ${formatDateShort(endDate)}`;
  }
  return start;
}

export function calculateDuration(startDate: string, endDate?: string | null, isCurrent?: boolean): string {
  const start = new Date(startDate);
  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} yr${diffYears > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    }
    return `${diffYears} yr${diffYears > 1 ? 's' : ''}`;
  }
  
  if (diffMonths > 0) {
    return `${diffMonths} mo${diffMonths > 1 ? 's' : ''}`;
  }
  
  return '< 1 mo';
}

export function getEmploymentTypeIcon(type: EmploymentType): string {
  const icons: Record<EmploymentType, string> = {
    full_time: '💼',
    part_time: '⏰',
    contract: '📝',
    freelance: '💻',
    internship: '🎓',
    temporary: '⚡',
    consultant: '🎯'
  };
  return icons[type];
}

export function getVisibilityBadgeVariant(visibility: JobVisibility): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (visibility) {
    case 'public':
      return 'default';
    case 'organization':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function sortJobEntries(
  entries: JobHistoryEntry[],
  sort: JobSort
): JobHistoryEntry[] {
  return [...entries].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'start_date':
        comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        break;
      case 'end_date':
        const aEnd = a.end_date ? new Date(a.end_date).getTime() : Date.now();
        const bEnd = b.end_date ? new Date(b.end_date).getTime() : Date.now();
        comparison = aEnd - bEnd;
        break;
      case 'company_name':
        comparison = a.company_name.localeCompare(b.company_name);
        break;
      case 'job_title':
        comparison = a.job_title.localeCompare(b.job_title);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'duration':
        const aDuration = calculateDurationInDays(a.start_date, a.end_date, a.is_current);
        const bDuration = calculateDurationInDays(b.start_date, b.end_date, b.is_current);
        comparison = aDuration - bDuration;
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterJobEntries(
  entries: JobHistoryEntry[],
  filters: JobFilters
): JobHistoryEntry[] {
  return entries.filter(entry => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        entry.company_name.toLowerCase().includes(searchLower) ||
        entry.job_title.toLowerCase().includes(searchLower) ||
        entry.department?.toLowerCase().includes(searchLower) ||
        entry.description?.toLowerCase().includes(searchLower) ||
        entry.location?.toLowerCase().includes(searchLower) ||
        entry.industry?.toLowerCase().includes(searchLower) ||
        entry.skills_used.some(skill => skill.toLowerCase().includes(searchLower)) ||
        entry.achievements.some(achievement => achievement.toLowerCase().includes(searchLower)) ||
        entry.responsibilities.some(resp => resp.toLowerCase().includes(searchLower)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Employment type filter
    if (filters.employment_type && filters.employment_type !== 'all') {
      if (entry.employment_type !== filters.employment_type) return false;
    }
    
    // Company size filter
    if (filters.company_size && filters.company_size !== 'all') {
      if (entry.company_size !== filters.company_size) return false;
    }
    
    // Visibility filter
    if (filters.visibility && filters.visibility !== 'all') {
      if (entry.visibility !== filters.visibility) return false;
    }
    
    // Current status filter
    if (filters.is_current && filters.is_current !== 'all') {
      const isCurrent = filters.is_current === 'current';
      if (entry.is_current !== isCurrent) return false;
    }
    
    // Industry filter
    if (filters.industry && filters.industry !== 'all') {
      if (entry.industry !== filters.industry) return false;
    }
    
    // Date range filter
    if (filters.date_from) {
      if (new Date(entry.start_date) < new Date(filters.date_from)) return false;
    }
    if (filters.date_to) {
      const endDate = entry.end_date || new Date().toISOString().split('T')[0];
      if (new Date(endDate) > new Date(filters.date_to)) return false;
    }
    
    // Has achievements filter
    if (filters.has_achievements) {
      if (entry.achievements.length === 0) return false;
    }
    
    return true;
  });
}

function calculateDurationInDays(startDate: string, endDate?: string | null, isCurrent?: boolean): number {
  const start = new Date(startDate);
  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
