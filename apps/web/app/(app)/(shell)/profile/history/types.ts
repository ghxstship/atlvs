// History Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface HistoryEntry {
  id: string;
  organization_id: string;
  user_id: string;
  entry_type: HistoryEntryType;
  title: string;
  organization?: string | null;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  skills_gained: string[];
  achievements: string[];
  references?: string | null;
  website_url?: string | null;
  salary_range?: string | null;
  employment_type?: EmploymentType | null;
  education_level?: EducationLevel | null;
  grade_gpa?: string | null;
  project_status?: ProjectStatus | null;
  visibility: HistoryVisibility;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type HistoryEntryType = 
  | 'employment'
  | 'education'
  | 'project'
  | 'achievement'
  | 'certification'
  | 'volunteer'
  | 'internship'
  | 'freelance'
  | 'other';

export type EmploymentType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'volunteer';

export type EducationLevel = 
  | 'high_school'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'doctorate'
  | 'certificate'
  | 'bootcamp'
  | 'other';

export type ProjectStatus = 
  | 'completed'
  | 'in_progress'
  | 'on_hold'
  | 'cancelled';

export type HistoryVisibility = 
  | 'public'
  | 'organization'
  | 'private';

export type HistoryViewType = 
  | 'form'
  | 'card'
  | 'timeline'
  | 'resume'
  | 'analytics';

export interface HistoryEntryFormData {
  entry_type: HistoryEntryType;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  skills_gained: string[];
  achievements: string[];
  references: string;
  website_url: string;
  salary_range: string;
  employment_type: EmploymentType;
  education_level: EducationLevel;
  grade_gpa: string;
  project_status: ProjectStatus;
  visibility: HistoryVisibility;
  tags: string[];
}

export interface HistoryFilters {
  search: string;
  entry_type: HistoryEntryType | 'all';
  employment_type: EmploymentType | 'all';
  education_level: EducationLevel | 'all';
  project_status: ProjectStatus | 'all';
  visibility: HistoryVisibility | 'all';
  is_current: 'current' | 'past' | 'all';
  date_from?: string;
  date_to?: string;
  has_achievements?: boolean;
}

export interface HistorySort {
  field: 'start_date' | 'end_date' | 'title' | 'created_at' | 'duration';
  direction: 'asc' | 'desc';
}

export interface HistoryStats {
  totalEntries: number;
  currentEntries: number;
  completedEntries: number;
  totalYearsExperience: number;
  byType: Array<{
    type: HistoryEntryType;
    count: number;
  }>;
  byEmploymentType: Array<{
    type: EmploymentType;
    count: number;
  }>;
  byEducationLevel: Array<{
    level: EducationLevel;
    count: number;
  }>;
  skillsFrequency: Array<{
    skill: string;
    count: number;
  }>;
  organizationsWorked: Array<{
    organization: string;
    count: number;
    totalDuration: number;
  }>;
}

export interface HistoryAnalytics {
  careerProgression: Array<{
    year: number;
    entries: HistoryEntry[];
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
    entries: number;
  }>;
  educationJourney: Array<{
    level: EducationLevel;
    institutions: string[];
    completionYear?: number;
  }>;
  achievementTimeline: Array<{
    year: number;
    achievements: string[];
    entryId: string;
  }>;
  careerGaps: Array<{
    startDate: string;
    endDate: string;
    duration: number;
  }>;
  locationHistory: Array<{
    location: string;
    duration: number;
    entries: number;
  }>;
}

// ============================================================================
// Schemas
// ============================================================================

export const historyEntryTypeSchema = zod.enum([
  'employment',
  'education',
  'project',
  'achievement',
  'certification',
  'volunteer',
  'internship',
  'freelance',
  'other',
]);

export const employmentTypeSchema = zod.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
  'volunteer',
]);

export const educationLevelSchema = zod.enum([
  'high_school',
  'associate',
  'bachelor',
  'master',
  'doctorate',
  'certificate',
  'bootcamp',
  'other',
]);

export const projectStatusSchema = zod.enum([
  'completed',
  'in_progress',
  'on_hold',
  'cancelled',
]);

export const historyVisibilitySchema = zod.enum([
  'public',
  'organization',
  'private',
]);

export const historyFilterSchema = zod.object({
  search: zod.string().optional(),
  entry_type: zod.union([historyEntryTypeSchema, zod.literal('all')]).optional(),
  employment_type: zod.union([employmentTypeSchema, zod.literal('all')]).optional(),
  education_level: zod.union([educationLevelSchema, zod.literal('all')]).optional(),
  project_status: zod.union([projectStatusSchema, zod.literal('all')]).optional(),
  visibility: zod.union([historyVisibilitySchema, zod.literal('all')]).optional(),
  is_current: zod.enum(['current', 'past', 'all']).optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
  has_achievements: zod.boolean().optional()
});

export const historyUpsertSchema = zod.object({
  entry_type: historyEntryTypeSchema,
  title: zod.string().min(1, 'Title is required'),
  organization: zod.string().optional().nullable(),
  location: zod.string().optional().nullable(),
  start_date: zod.string(),
  end_date: zod.string().optional().nullable(),
  is_current: zod.boolean(),
  description: zod.string().optional().nullable(),
  skills_gained: zod.array(zod.string()),
  achievements: zod.array(zod.string()),
  references: zod.string().optional().nullable(),
  website_url: zod.string().url().optional().nullable(),
  salary_range: zod.string().optional().nullable(),
  employment_type: employmentTypeSchema.optional().nullable(),
  education_level: educationLevelSchema.optional().nullable(),
  grade_gpa: zod.string().optional().nullable(),
  project_status: projectStatusSchema.optional().nullable(),
  visibility: historyVisibilitySchema,
  tags: zod.array(zod.string())
});

// ============================================================================
// Constants
// ============================================================================

export const ENTRY_TYPE_LABELS: Record<HistoryEntryType, string> = {
  employment: 'Employment',
  education: 'Education',
  project: 'Project',
  achievement: 'Achievement',
  certification: 'Certification',
  volunteer: 'Volunteer Work',
  internship: 'Internship',
  freelance: 'Freelance',
  other: 'Other'
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  volunteer: 'Volunteer'
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  high_school: 'High School',
  associate: 'Associate Degree',
  bachelor: 'Bachelor\'s Degree',
  master: 'Master\'s Degree',
  doctorate: 'Doctorate',
  certificate: 'Certificate',
  bootcamp: 'Bootcamp',
  other: 'Other'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  cancelled: 'Cancelled'
};

export const VISIBILITY_LABELS: Record<HistoryVisibility, string> = {
  public: 'Public',
  organization: 'Organization',
  private: 'Private'
};

export const VIEW_CONFIG: Record<HistoryViewType, { label: string; description: string }> = {
  form: {
    label: 'Form',
    description: 'Add or edit history entries'
  },
  card: {
    label: 'Card',
    description: 'Detailed card view'
  },
  timeline: {
    label: 'Timeline',
    description: 'Chronological timeline'
  },
  resume: {
    label: 'Resume',
    description: 'Resume format view'
  },
  analytics: {
    label: 'Analytics',
    description: 'Career insights and metrics'
  }
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Current', value: 'current' },
  { label: 'Employment', value: 'employment' },
  { label: 'Education', value: 'education' },
  { label: 'Projects', value: 'projects' },
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
  'Git',
  'Agile',
  'Scrum',
  'Leadership',
  'Project Management',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Data Analysis',
  'Machine Learning',
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): HistoryEntryFormData {
  return {
    entry_type: 'employment',
    title: '',
    organization: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_current: false,
    description: '',
    skills_gained: [],
    achievements: [],
    references: '',
    website_url: '',
    salary_range: '',
    employment_type: 'full_time',
    education_level: 'bachelor',
    grade_gpa: '',
    project_status: 'completed',
    visibility: 'organization',
    tags: []
  };
}

export function createEmptyStats(): HistoryStats {
  return {
    totalEntries: 0,
    currentEntries: 0,
    completedEntries: 0,
    totalYearsExperience: 0,
    byType: [],
    byEmploymentType: [],
    byEducationLevel: [],
    skillsFrequency: [],
    organizationsWorked: []
  };
}

export function createEmptyAnalytics(): HistoryAnalytics {
  return {
    careerProgression: [],
    skillsEvolution: [],
    industryExperience: [],
    educationJourney: [],
    achievementTimeline: [],
    careerGaps: [],
    locationHistory: []
  };
}

export function validateHistoryForm(data: HistoryEntryFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
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
  
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.website_url = 'Invalid website URL';
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

export function getEntryTypeIcon(type: HistoryEntryType): string {
  const icons: Record<HistoryEntryType, string> = {
    employment: '💼',
    education: '🎓',
    project: '🚀',
    achievement: '🏆',
    certification: '📜',
    volunteer: '🤝',
    internship: '👨‍💼',
    freelance: '💻',
    other: '📋'
  };
  return icons[type];
}

export function getVisibilityBadgeVariant(visibility: HistoryVisibility): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (visibility) {
    case 'public':
      return 'default';
    case 'organization':
      return 'secondary';
    default:
      return 'outline';
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sortHistoryEntries(
  entries: HistoryEntry[],
  sort: HistorySort
): HistoryEntry[] {
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
      case 'title':
        comparison = a.title.localeCompare(b.title);
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

export function filterHistoryEntries(
  entries: HistoryEntry[],
  filters: HistoryFilters
): HistoryEntry[] {
  return entries.filter(entry => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchLower) ||
        entry.organization?.toLowerCase().includes(searchLower) ||
        entry.description?.toLowerCase().includes(searchLower) ||
        entry.location?.toLowerCase().includes(searchLower) ||
        entry.skills_gained.some(skill => skill.toLowerCase().includes(searchLower)) ||
        entry.achievements.some(achievement => achievement.toLowerCase().includes(searchLower)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Entry type filter
    if (filters.entry_type && filters.entry_type !== 'all') {
      if (entry.entry_type !== filters.entry_type) return false;
    }
    
    // Employment type filter
    if (filters.employment_type && filters.employment_type !== 'all') {
      if (entry.employment_type !== filters.employment_type) return false;
    }
    
    // Education level filter
    if (filters.education_level && filters.education_level !== 'all') {
      if (entry.education_level !== filters.education_level) return false;
    }
    
    // Project status filter
    if (filters.project_status && filters.project_status !== 'all') {
      if (entry.project_status !== filters.project_status) return false;
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
