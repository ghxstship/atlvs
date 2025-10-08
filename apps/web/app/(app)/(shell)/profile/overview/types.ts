// Profile Overview Module - Comprehensive Type Definitions

export interface ProfileOverview {
  id: string;
  user_id: string;
  organization_id: string;
  
  // User Information
  full_name: string;
  email: string;
  avatar_url?: string;
  
  // Basic Profile Data
  job_title?: string;
  department?: string;
  employee_id?: string;
  phone_primary?: string;
  location?: string;
  bio?: string;
  
  // Status and Completion
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  profile_completion_percentage: number;
  last_login?: string;
  
  // Aggregated Counts
  certifications_count: number;
  job_history_count: number;
  emergency_contacts_count: number;
  endorsements_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
}

export interface ProfileOverviewFilters {
  status?: ProfileOverview['status'] | 'all';
  department?: string;
  completion_range?: {
    min: number;
    max: number;
  };
  search?: string;
  date_from?: string;
  date_to?: string;
  has_certifications?: boolean;
  has_job_history?: boolean;
  recent_login?: boolean;
}

export interface ProfileOverviewSort {
  field: keyof ProfileOverview;
  direction: 'asc' | 'desc';
}

export type ViewType = 'grid' | 'list' | 'table' | 'analytics' | 'kanban' | 'calendar';

export interface ProfileOverviewStats {
  totalProfiles: number;
  activeProfiles: number;
  averageCompletion: number;
  recentLogins: number;
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  completionDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ProfileOverviewAnalytics {
  completionTrends: Array<{
    date: string;
    averageCompletion: number;
    profilesUpdated: number;
  }>;
  loginActivity: Array<{
    date: string;
    uniqueLogins: number;
    totalSessions: number;
  }>;
  departmentStats: Array<{
    department: string;
    totalProfiles: number;
    averageCompletion: number;
    activeProfiles: number;
  }>;
  certificationStats: Array<{
    department: string;
    totalCertifications: number;
    averageCertifications: number;
    expiringCertifications: number;
  }>;
}

export interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: 'profile_updated' | 'certification_added' | 'certification_expired' | 'job_history_added' | 'emergency_contact_updated' | 'health_record_updated' | 'travel_info_updated' | 'uniform_sizing_updated' | 'performance_review_completed' | 'endorsement_received';
  activity_description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

// Field configuration for display and editing
export interface FieldConfig {
  key: keyof ProfileOverview;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'url' | 'number' | 'badge';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  section: 'basic' | 'contact' | 'professional' | 'status' | 'metadata';
  visible?: boolean;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export const PROFILE_OVERVIEW_FIELD_CONFIG: FieldConfig[] = [
  // Basic Information
  {
    key: 'full_name',
    label: 'Full Name',
    type: 'text',
    required: true,
    section: 'basic',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    section: 'basic',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'job_title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'Software Engineer',
    section: 'professional',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'Engineering',
    section: 'professional',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'employee_id',
    label: 'Employee ID',
    type: 'text',
    placeholder: 'EMP001',
    section: 'professional',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'phone_primary',
    label: 'Primary Phone',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    section: 'contact',
    visible: true,
    editable: true,
    sortable: false,
    filterable: false
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'New York, NY',
    section: 'contact',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
    ],
    section: 'status',
    visible: true,
    editable: true,
    sortable: true,
    filterable: true
  },
  {
    key: 'profile_completion_percentage',
    label: 'Profile Completion',
    type: 'number',
    validation: { min: 0, max: 100 },
    section: 'status',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'certifications_count',
    label: 'Certifications',
    type: 'number',
    validation: { min: 0 },
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: false
  },
  {
    key: 'job_history_count',
    label: 'Job History',
    type: 'number',
    validation: { min: 0 },
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: false
  },
  {
    key: 'last_login',
    label: 'Last Login',
    type: 'date',
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    type: 'date',
    section: 'metadata',
    visible: true,
    editable: false,
    sortable: true,
    filterable: true
  },
];

export const VIEW_CONFIG = {
  grid: { label: 'Grid', icon: 'Grid3X3' },
  list: { label: 'List', icon: 'List' },
  table: { label: 'Table', icon: 'Table' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
  kanban: { label: 'Kanban', icon: 'Kanban' },
  calendar: { label: 'Calendar', icon: 'Calendar' }
} as const;

export const QUICK_FILTERS = [
  { label: 'All Profiles', value: 'all', count: 0 },
  { label: 'Active', value: 'active', count: 0 },
  { label: 'Incomplete Profiles', value: 'incomplete', count: 0 },
  { label: 'Recent Updates', value: 'recent', count: 0 },
  { label: 'Missing Certifications', value: 'no-certs', count: 0 },
  { label: 'Engineering', value: 'engineering', count: 0 },
  { label: 'Marketing', value: 'marketing', count: 0 },
  { label: 'Sales', value: 'sales', count: 0 },
] as const;

export const BULK_ACTIONS = [
  { id: 'activate', label: 'Activate Profiles', icon: 'CheckCircle', variant: 'default' as const },
  { id: 'deactivate', label: 'Deactivate Profiles', icon: 'XCircle', variant: 'secondary' as const },
  { id: 'export', label: 'Export Selected', icon: 'Download', variant: 'outline' as const },
  { id: 'delete', label: 'Delete Profiles', icon: 'Trash2', variant: 'destructive' as const },
] as const;

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
] as const;

export function createEmptyProfileOverview(): Partial<ProfileOverview> {
  return {
    full_name: '',
    email: '',
    avatar_url: '',
    job_title: '',
    department: '',
    employee_id: '',
    phone_primary: '',
    location: '',
    bio: '',
    status: 'active',
    profile_completion_percentage: 0,
    certifications_count: 0,
    job_history_count: 0,
    emergency_contacts_count: 0,
    endorsements_count: 0
  };
}

export function createEmptyProfileOverviewStats(): ProfileOverviewStats {
  return {
    totalProfiles: 0,
    activeProfiles: 0,
    averageCompletion: 0,
    recentLogins: 0,
    departmentDistribution: [],
    completionDistribution: [],
    statusDistribution: []
  };
}

export function createEmptyProfileOverviewAnalytics(): ProfileOverviewAnalytics {
  return {
    completionTrends: [],
    loginActivity: [],
    departmentStats: [],
    certificationStats: []
  };
}

// Utility functions
export function getStatusColor(status: ProfileOverview['status']): string {
  const colors = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    suspended: 'destructive'
  };
  return colors[status] || 'secondary';
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'destructive';
}

export function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return 'Never';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  
  return date.toLocaleDateString();
}

export function getProfileCompletionTasks(profile: ProfileOverview): Array<{
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}> {
  return [
    {
      task: 'Add profile photo',
      completed: !!profile.avatar_url,
      priority: 'medium'
    },
    {
      task: 'Complete job information',
      completed: !!(profile.job_title && profile.department),
      priority: 'high'
    },
    {
      task: 'Add contact information',
      completed: !!profile.phone_primary,
      priority: 'high'
    },
    {
      task: 'Add professional bio',
      completed: !!profile.bio,
      priority: 'medium'
    },
    {
      task: 'Add certifications',
      completed: profile.certifications_count > 0,
      priority: 'high'
    },
    {
      task: 'Add job history',
      completed: profile.job_history_count > 0,
      priority: 'medium'
    },
  ];
}
