// Profile Basic Module - Type Definitions

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Basic Information
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  nationality?: string;
  languages: string[];
  
  // Contact Information
  phone_primary?: string;
  phone_secondary?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Professional Information
  job_title?: string;
  department?: string;
  employee_id?: string;
  hire_date?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'intern';
  manager_id?: string;
  skills: string[];
  bio?: string;
  linkedin_url?: string;
  website_url?: string;
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  profile_completion_percentage: number;
  last_updated_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ProfileFilters {
  status?: UserProfile['status'] | 'all';
  department?: string;
  employment_type?: UserProfile['employment_type'];
  completion_range?: {
    min: number;
    max: number;
  };
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface ProfileSort {
  field: keyof UserProfile;
  direction: 'asc' | 'desc';
}

export type ViewType = 'form' | 'card' | 'table' | 'analytics';

export interface ProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  averageCompletion: number;
  recentUpdates: number;
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
  employmentTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface ProfileAnalytics {
  completionTrends: Array<{
    date: string;
    averageCompletion: number;
    profilesUpdated: number;
  }>;
  departmentStats: Array<{
    department: string;
    totalProfiles: number;
    averageCompletion: number;
    activeProfiles: number;
  }>;
  skillsAnalysis: Array<{
    skill: string;
    count: number;
    departments: string[];
  }>;
  languageDistribution: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
}

// Field configuration for form display
export interface FieldConfig {
  key: keyof UserProfile;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'url' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  section: 'basic' | 'contact' | 'professional' | 'metadata';
  visible?: boolean;
  editable?: boolean;
}

export const PROFILE_FIELD_CONFIG: FieldConfig[] = [
  // Basic Information
  {
    key: 'avatar_url',
    label: 'Avatar URL',
    type: 'url',
    placeholder: 'https://example.com/avatar.jpg',
    section: 'basic',
    visible: true,
    editable: true
  },
  {
    key: 'date_of_birth',
    label: 'Date of Birth',
    type: 'date',
    section: 'basic',
    visible: true,
    editable: true
  },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    ],
    section: 'basic',
    visible: true,
    editable: true
  },
  {
    key: 'nationality',
    label: 'Nationality',
    type: 'text',
    placeholder: 'e.g., American, British, Canadian',
    section: 'basic',
    visible: true,
    editable: true
  },
  {
    key: 'languages',
    label: 'Languages',
    type: 'tags',
    section: 'basic',
    visible: true,
    editable: true
  },
  
  // Contact Information
  {
    key: 'phone_primary',
    label: 'Primary Phone',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'phone_secondary',
    label: 'Secondary Phone',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'address_line1',
    label: 'Address Line 1',
    type: 'text',
    placeholder: '123 Main Street',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'address_line2',
    label: 'Address Line 2',
    type: 'text',
    placeholder: 'Apt 4B',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'New York',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'state_province',
    label: 'State/Province',
    type: 'text',
    placeholder: 'NY',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'postal_code',
    label: 'Postal Code',
    type: 'text',
    placeholder: '10001',
    section: 'contact',
    visible: true,
    editable: true
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text',
    placeholder: 'United States',
    section: 'contact',
    visible: true,
    editable: true
  },
  
  // Professional Information
  {
    key: 'job_title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'Software Engineer',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'Engineering',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'employee_id',
    label: 'Employee ID',
    type: 'text',
    placeholder: 'EMP001',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'hire_date',
    label: 'Hire Date',
    type: 'date',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'employment_type',
    label: 'Employment Type',
    type: 'select',
    options: [
      { value: 'full-time', label: 'Full-time' },
      { value: 'part-time', label: 'Part-time' },
      { value: 'contract', label: 'Contract' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'intern', label: 'Intern' },
    ],
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'tags',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Tell us about yourself...',
    validation: { maxLength: 500 },
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    section: 'professional',
    visible: true,
    editable: true
  },
  {
    key: 'website_url',
    label: 'Website URL',
    type: 'url',
    placeholder: 'https://yourwebsite.com',
    section: 'professional',
    visible: true,
    editable: true
  },
];

export const VIEW_CONFIG = {
  form: { label: 'Form', icon: 'Edit' },
  card: { label: 'Card', icon: 'User' },
  table: { label: 'Table', icon: 'Table' },
  analytics: { label: 'Analytics', icon: 'BarChart3' }
} as const;

export const QUICK_FILTERS = [
  { label: 'All Profiles', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Recent Updates', value: 'recent' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
] as const;

export function createEmptyProfile(): Partial<UserProfile> {
  return {
    avatar_url: '',
    date_of_birth: '',
    gender: undefined,
    nationality: '',
    languages: [],
    phone_primary: '',
    phone_secondary: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    job_title: '',
    department: '',
    employee_id: '',
    hire_date: '',
    employment_type: undefined,
    skills: [],
    bio: '',
    linkedin_url: '',
    website_url: '',
    status: 'active',
    profile_completion_percentage: 0
  };
}

export function createEmptyProfileStats(): ProfileStats {
  return {
    totalProfiles: 0,
    activeProfiles: 0,
    averageCompletion: 0,
    recentUpdates: 0,
    departmentDistribution: [],
    completionDistribution: [],
    employmentTypeDistribution: []
  };
}

export function createEmptyProfileAnalytics(): ProfileAnalytics {
  return {
    completionTrends: [],
    departmentStats: [],
    skillsAnalysis: [],
    languageDistribution: []
  };
}
