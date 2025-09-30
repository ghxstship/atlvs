// Emergency Contacts Module - Type Definitions

export type EmergencyPriority = 'critical' | 'high' | 'medium' | 'low';
export type EmergencyAvailability = '24_7' | 'business_hours' | 'night_only' | 'weekends' | 'on_call';
export type EmergencyVerificationStatus = 'verified' | 'pending' | 'unverified';

export interface EmergencyContact {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state_province?: string | null;
  country?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  is_primary: boolean;
  is_backup: boolean;
  priority_level: EmergencyPriority;
  availability?: EmergencyAvailability | null;
  response_time_minutes?: number | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  last_verified?: string | null;
  verification_status: EmergencyVerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContactFilters {
  search?: string;
  priority?: EmergencyPriority | 'all';
  verification_status?: EmergencyVerificationStatus | 'all';
  is_primary?: 'all' | 'primary' | 'backup';
  availability?: EmergencyAvailability | 'all';
}

export interface EmergencyContactSort {
  field: keyof EmergencyContact;
  direction: 'asc' | 'desc';
}

export type EmergencyViewType = 'form' | 'card' | 'roster' | 'table' | 'analytics';

export interface EmergencyContactStats {
  totalContacts: number;
  primaryContacts: number;
  backupContacts: number;
  verifiedContacts: number;
  byPriority: Array<{
    priority: EmergencyPriority;
    count: number;
    percentage: number;
  }>;
  responseTimeDistribution: Array<{
    bucket: string;
    count: number;
  }>;
  availabilityBreakdown: Array<{
    availability: EmergencyAvailability;
    count: number;
    percentage: number;
  }>;
}

export interface EmergencyContactAnalytics {
  readinessScore: number;
  verificationRate: number;
  primaryCoverage: number;
  averageResponseTime: number;
  recentUpdates: Array<{
    date: string;
    updates: number;
    verifications: number;
  }>;
  priorityTrends: Array<{
    priority: EmergencyPriority;
    count: number;
  }>;
}

export interface EmergencyContactFormData {
  name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  is_primary: boolean;
  is_backup: boolean;
  priority_level: EmergencyPriority;
  availability?: EmergencyAvailability;
  response_time_minutes?: number;
  verification_status: EmergencyVerificationStatus;
}

export interface FieldConfig {
  key: keyof EmergencyContact;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'number' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  section?: string;
  visible?: boolean;
  editable?: boolean;
  description?: string;
}

export const CONTACT_FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter full name',
    section: 'Identity',
  },
  {
    key: 'relationship',
    label: 'Relationship',
    type: 'text',
    required: true,
    placeholder: 'e.g., Spouse, Parent, Supervisor',
    section: 'Identity',
  },
  {
    key: 'phone_primary',
    label: 'Primary Phone',
    type: 'tel',
    required: true,
    placeholder: '+1 (555) 123-4567',
    section: 'Contact Details',
  },
  {
    key: 'phone_secondary',
    label: 'Secondary Phone',
    type: 'tel',
    placeholder: '+1 (555) 765-4321',
    section: 'Contact Details',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'emergency@example.com',
    section: 'Contact Details',
  },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    section: 'Availability',
    options: [
      { value: '24_7', label: '24/7 Availability' },
      { value: 'business_hours', label: 'Business Hours' },
      { value: 'night_only', label: 'Night Only' },
      { value: 'weekends', label: 'Weekends' },
      { value: 'on_call', label: 'On Call' },
    ],
  },
  {
    key: 'response_time_minutes',
    label: 'Response Time (minutes)',
    type: 'number',
    section: 'Availability',
    placeholder: '15',
  },
  {
    key: 'priority_level',
    label: 'Priority Level',
    type: 'select',
    required: true,
    section: 'Status',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  {
    key: 'verification_status',
    label: 'Verification Status',
    type: 'select',
    required: true,
    section: 'Status',
    options: [
      { value: 'verified', label: 'Verified' },
      { value: 'pending', label: 'Pending Verification' },
      { value: 'unverified', label: 'Unverified' },
    ],
  },
  {
    key: 'is_primary',
    label: 'Primary Emergency Contact',
    type: 'checkbox',
    section: 'Status',
  },
  {
    key: 'is_backup',
    label: 'Backup Contact',
    type: 'checkbox',
    section: 'Status',
  },
  {
    key: 'address',
    label: 'Street Address',
    type: 'text',
    section: 'Location',
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    section: 'Location',
  },
  {
    key: 'state_province',
    label: 'State/Province',
    type: 'text',
    section: 'Location',
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text',
    section: 'Location',
  },
  {
    key: 'postal_code',
    label: 'Postal Code',
    type: 'text',
    section: 'Location',
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    section: 'Additional Details',
    placeholder: 'Emergency response instructions or other critical notes',
  },
];

export const VIEW_CONFIG = {
  form: { label: 'Form', icon: 'FileText' },
  card: { label: 'Card', icon: 'IdCard' },
  roster: { label: 'Roster', icon: 'Users' },
  table: { label: 'Table', icon: 'Table' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
} as const;

export const QUICK_FILTERS = [
  { label: 'All Contacts', value: 'all' },
  { label: 'Primary Contacts', value: 'primary' },
  { label: 'Backup Contacts', value: 'backup' },
  { label: 'Critical Priority', value: 'critical' },
  { label: 'Pending Verification', value: 'pending' },
] as const;

export function createEmptyFormData(): EmergencyContactFormData {
  return {
    name: '',
    relationship: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    address: '',
    city: '',
    state_province: '',
    country: '',
    postal_code: '',
    notes: '',
    is_primary: false,
    is_backup: false,
    priority_level: 'high',
    availability: '24_7',
    response_time_minutes: 15,
    verification_status: 'pending',
  };
}

export function createEmptyStats(): EmergencyContactStats {
  return {
    totalContacts: 0,
    primaryContacts: 0,
    backupContacts: 0,
    verifiedContacts: 0,
    byPriority: [],
    responseTimeDistribution: [],
    availabilityBreakdown: [],
  };
}

export function createEmptyAnalytics(): EmergencyContactAnalytics {
  return {
    readinessScore: 0,
    verificationRate: 0,
    primaryCoverage: 0,
    averageResponseTime: 0,
    recentUpdates: [],
    priorityTrends: [],
  };
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatAddress(contact: EmergencyContact): string {
  const parts = [
    contact.address,
    contact.city,
    contact.state_province,
    contact.postal_code,
    contact.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function validateEmergencyForm(data: EmergencyContactFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) {
    errors.name = 'Name is required.';
  }
  if (!data.relationship.trim()) {
    errors.relationship = 'Relationship is required.';
  }
  if (!data.phone_primary.trim()) {
    errors.phone_primary = 'Primary phone is required.';
  }
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Invalid email format.';
    }
  }
  if (data.response_time_minutes && data.response_time_minutes < 0) {
    errors.response_time_minutes = 'Response time cannot be negative.';
  }
  return errors;
}
