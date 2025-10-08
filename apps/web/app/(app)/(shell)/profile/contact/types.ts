// Profile Contact Module - Type Definitions

export interface ContactInfo {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Phone Information
  phone_primary?: string;
  phone_secondary?: string;
  phone_mobile?: string;
  phone_work?: string;
  phone_extension?: string;
  
  // Primary Address
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Billing Address
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state_province?: string;
  billing_postal_code?: string;
  billing_country?: string;
  billing_same_as_primary?: boolean;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  
  // Additional Information
  timezone?: string;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'mail';
  do_not_contact?: boolean;
  contact_notes?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_verified?: string;
  verification_status?: 'verified' | 'pending' | 'unverified';
}

export interface ContactFilters {
  search?: string;
  country?: string;
  state_province?: string;
  city?: string;
  verification_status?: ContactInfo['verification_status'] | 'all';
  has_emergency_contact?: boolean;
  preferred_contact_method?: ContactInfo['preferred_contact_method'] | 'all';
}

export interface ContactSort {
  field: keyof ContactInfo;
  direction: 'asc' | 'desc';
}

export type ViewType = 'form' | 'card' | 'list' | 'map' | 'analytics';

export interface ContactStats {
  totalContacts: number;
  verifiedContacts: number;
  unverifiedContacts: number;
  withEmergencyContact: number;
  contactMethodDistribution: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  countryDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  verificationStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface ContactAnalytics {
  contactCompleteness: number;
  verificationRate: number;
  emergencyContactCoverage: number;
  addressCompleteness: number;
  phoneCompleteness: number;
  recentUpdates: Array<{
    date: string;
    updates: number;
    verifications: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

export interface ContactFormData {
  // Phone Information
  phone_primary?: string;
  phone_secondary?: string;
  phone_mobile?: string;
  phone_work?: string;
  phone_extension?: string;
  
  // Primary Address
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Billing Address
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state_province?: string;
  billing_postal_code?: string;
  billing_country?: string;
  billing_same_as_primary?: boolean;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  
  // Additional Information
  timezone?: string;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'mail';
  do_not_contact?: boolean;
  contact_notes?: string;
}

// Field configuration for form display
export interface FieldConfig {
  key: keyof ContactInfo;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  visible?: boolean;
  editable?: boolean;
  section?: string;
}

export const CONTACT_FIELD_CONFIG: FieldConfig[] = [
  // Phone Information
  {
    key: 'phone_primary',
    label: 'Primary Phone',
    type: 'tel',
    required: true,
    placeholder: '+1 (555) 123-4567',
    visible: true,
    editable: true,
    section: 'Phone Information'
  },
  {
    key: 'phone_secondary',
    label: 'Secondary Phone',
    type: 'tel',
    placeholder: '+1 (555) 987-6543',
    visible: true,
    editable: true,
    section: 'Phone Information'
  },
  {
    key: 'phone_mobile',
    label: 'Mobile Phone',
    type: 'tel',
    placeholder: '+1 (555) 555-5555',
    visible: true,
    editable: true,
    section: 'Phone Information'
  },
  {
    key: 'phone_work',
    label: 'Work Phone',
    type: 'tel',
    placeholder: '+1 (555) 111-2222',
    visible: true,
    editable: true,
    section: 'Phone Information'
  },
  // Primary Address
  {
    key: 'address_line1',
    label: 'Address Line 1',
    type: 'text',
    placeholder: '123 Main Street',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  {
    key: 'address_line2',
    label: 'Address Line 2',
    type: 'text',
    placeholder: 'Apt 4B, Suite 200',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'San Francisco',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  {
    key: 'state_province',
    label: 'State/Province',
    type: 'text',
    placeholder: 'California',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  {
    key: 'postal_code',
    label: 'Postal Code',
    type: 'text',
    placeholder: '94102',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  {
    key: 'country',
    label: 'Country',
    type: 'text',
    placeholder: 'United States',
    visible: true,
    editable: true,
    section: 'Primary Address'
  },
  // Emergency Contact
  {
    key: 'emergency_contact_name',
    label: 'Emergency Contact Name',
    type: 'text',
    placeholder: 'John Doe',
    visible: true,
    editable: true,
    section: 'Emergency Contact'
  },
  {
    key: 'emergency_contact_relationship',
    label: 'Relationship',
    type: 'text',
    placeholder: 'Spouse, Parent, Friend',
    visible: true,
    editable: true,
    section: 'Emergency Contact'
  },
  {
    key: 'emergency_contact_phone',
    label: 'Emergency Contact Phone',
    type: 'tel',
    placeholder: '+1 (555) 999-8888',
    visible: true,
    editable: true,
    section: 'Emergency Contact'
  },
  {
    key: 'emergency_contact_email',
    label: 'Emergency Contact Email',
    type: 'email',
    placeholder: 'emergency@example.com',
    visible: true,
    editable: true,
    section: 'Emergency Contact'
  },
];

export const VIEW_CONFIG = {
  form: { label: 'Form', icon: 'FileText' },
  card: { label: 'Card', icon: 'CreditCard' },
  list: { label: 'List', icon: 'List' },
  map: { label: 'Map', icon: 'Map' },
  analytics: { label: 'Analytics', icon: 'BarChart3' }
} as const;

export const QUICK_FILTERS = [
  { label: 'All Contacts', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Unverified', value: 'unverified' },
  { label: 'With Emergency', value: 'with_emergency' },
  { label: 'Missing Info', value: 'incomplete' },
] as const;

export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
] as const;

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
] as const;

export function createEmptyContact(): ContactFormData {
  return {
    phone_primary: '',
    phone_secondary: '',
    phone_mobile: '',
    phone_work: '',
    phone_extension: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state_province: '',
    billing_postal_code: '',
    billing_country: '',
    billing_same_as_primary: false,
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    emergency_contact_email: '',
    timezone: '',
    preferred_contact_method: 'email',
    do_not_contact: false,
    contact_notes: ''
  };
}

export function createEmptyContactStats(): ContactStats {
  return {
    totalContacts: 0,
    verifiedContacts: 0,
    unverifiedContacts: 0,
    withEmergencyContact: 0,
    contactMethodDistribution: [],
    countryDistribution: [],
    verificationStatus: []
  };
}

export function createEmptyContactAnalytics(): ContactAnalytics {
  return {
    contactCompleteness: 0,
    verificationRate: 0,
    emergencyContactCoverage: 0,
    addressCompleteness: 0,
    phoneCompleteness: 0,
    recentUpdates: [],
    geographicDistribution: []
  };
}

export function validateContactForm(data: ContactFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Phone validation
  if (!data.phone_primary?.trim()) {
    errors.phone_primary = 'Primary phone is required';
  }

  // Email validation for emergency contact
  if (data.emergency_contact_email && data.emergency_contact_email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emergency_contact_email)) {
      errors.emergency_contact_email = 'Invalid email format';
    }
  }

  // Postal code validation
  if (data.postal_code && data.postal_code.trim()) {
    if (data.country === 'US' && !/^\d{5}(-\d{4})?$/.test(data.postal_code)) {
      errors.postal_code = 'Invalid US postal code format';
    }
  }

  return errors;
}

export function calculateContactCompleteness(contact: ContactInfo): number {
  const fields = [
    'phone_primary',
    'address_line1',
    'city',
    'state_province',
    'postal_code',
    'country',
    'emergency_contact_name',
    'emergency_contact_phone',
  ];

  const filledFields = fields.filter(field => contact[field as keyof ContactInfo]);
  return Math.round((filledFields.length / fields.length) * 100);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as US phone number if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as international if starts with 1 and 11 digits
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function formatAddress(contact: ContactInfo): string {
  const parts = [
    contact.address_line1,
    contact.address_line2,
    contact.city,
    contact.state_province,
    contact.postal_code,
    contact.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}
