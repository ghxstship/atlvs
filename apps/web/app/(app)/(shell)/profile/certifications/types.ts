// Profile Certifications Module - Type Definitions

export interface Certification {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  issuing_organization: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  verification_url?: string;
  attachment_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificationFilters {
  status?: Certification['status'] | 'all';
  issuing_organization?: string;
  expiry_status?: 'active' | 'expiring_soon' | 'expired' | 'all';
  search?: string;
  date_from?: string;
  date_to?: string;
  issue_year?: string;
}

export interface CertificationSort {
  field: keyof Certification;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'table' | 'analytics';

export interface CertificationStats {
  totalCertifications: number;
  activeCertifications: number;
  expiredCertifications: number;
  expiringSoon: number;
  organizationDistribution: Array<{
    organization: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  expiryTrends: Array<{
    month: string;
    expiring: number;
    expired: number;
  }>;
  recentActivity: Array<{
    date: string;
    added: number;
    renewed: number;
  }>;
}

export interface CertificationAnalytics {
  certificationTrends: Array<{
    date: string;
    totalCertifications: number;
    newCertifications: number;
    renewals: number;
  }>;
  organizationAnalysis: Array<{
    organization: string;
    totalCertifications: number;
    activeCertifications: number;
    averageValidityPeriod: number;
  }>;
  expiryAnalysis: Array<{
    timeframe: string;
    count: number;
    percentage: number;
  }>;
  complianceMetrics: {
    overallCompliance: number;
    criticalCertifications: number;
    renewalRate: number;
    averageRenewalTime: number;
  };
}

export interface CertificationFormData {
  name: string;
  issuing_organization: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_url?: string;
  attachment_url?: string;
  notes?: string;
  status?: Certification['status'];
}

// Field configuration for form display
export interface FieldConfig {
  key: keyof Certification;
  label: string;
  type: 'text' | 'email' | 'url' | 'date' | 'select' | 'textarea';
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
}

export const CERTIFICATION_FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'name',
    label: 'Certification Name',
    type: 'text',
    required: true,
    placeholder: 'AWS Solutions Architect',
    visible: true,
    editable: true,
  },
  {
    key: 'issuing_organization',
    label: 'Issuing Organization',
    type: 'text',
    required: true,
    placeholder: 'Amazon Web Services',
    visible: true,
    editable: true,
  },
  {
    key: 'certification_number',
    label: 'Certification Number',
    type: 'text',
    placeholder: 'AWS-SAA-123456',
    visible: true,
    editable: true,
  },
  {
    key: 'issue_date',
    label: 'Issue Date',
    type: 'date',
    visible: true,
    editable: true,
  },
  {
    key: 'expiry_date',
    label: 'Expiry Date',
    type: 'date',
    visible: true,
    editable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'revoked', label: 'Revoked' },
    ],
    visible: true,
    editable: true,
  },
  {
    key: 'verification_url',
    label: 'Verification URL',
    type: 'url',
    placeholder: 'https://verify.aws.com/...',
    visible: true,
    editable: true,
  },
  {
    key: 'attachment_url',
    label: 'Attachment URL',
    type: 'url',
    placeholder: 'https://example.com/cert.pdf',
    visible: true,
    editable: true,
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes about this certification...',
    validation: { maxLength: 500 },
    visible: true,
    editable: true,
  },
];

export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  grid: { label: 'Grid', icon: 'Grid3X3' },
  table: { label: 'Table', icon: 'Table' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
} as const;

export const QUICK_FILTERS = [
  { label: 'All Certifications', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expiring Soon', value: 'expiring_soon' },
  { label: 'Expired', value: 'expired' },
  { label: 'This Year', value: 'this_year' },
  { label: 'AWS', value: 'aws' },
  { label: 'Microsoft', value: 'microsoft' },
  { label: 'Google', value: 'google' },
] as const;

export const STATUS_CONFIG = {
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800',
    description: 'Certification is currently valid'
  },
  expired: { 
    label: 'Expired', 
    color: 'bg-red-100 text-red-800',
    description: 'Certification has expired'
  },
  suspended: { 
    label: 'Suspended', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Certification is temporarily suspended'
  },
  revoked: { 
    label: 'Revoked', 
    color: 'bg-gray-100 text-gray-800',
    description: 'Certification has been revoked'
  },
} as const;

export function createEmptyCertification(): Partial<Certification> {
  return {
    name: '',
    issuing_organization: '',
    certification_number: '',
    issue_date: '',
    expiry_date: '',
    verification_url: '',
    attachment_url: '',
    notes: '',
    status: 'active',
  };
}

export function createEmptyCertificationStats(): CertificationStats {
  return {
    totalCertifications: 0,
    activeCertifications: 0,
    expiredCertifications: 0,
    expiringSoon: 0,
    organizationDistribution: [],
    statusDistribution: [],
    expiryTrends: [],
    recentActivity: [],
  };
}

export function createEmptyCertificationAnalytics(): CertificationAnalytics {
  return {
    certificationTrends: [],
    organizationAnalysis: [],
    expiryAnalysis: [],
    complianceMetrics: {
      overallCompliance: 0,
      criticalCertifications: 0,
      renewalRate: 0,
      averageRenewalTime: 0,
    },
  };
}

export function getCertificationStatus(certification: Certification): {
  status: string;
  color: string;
  isExpiring: boolean;
  daysUntilExpiry?: number;
} {
  if (certification.status === 'expired') {
    return { status: 'Expired', color: 'bg-red-100 text-red-800', isExpiring: false };
  }

  if (certification.expiry_date) {
    const expiry = new Date(certification.expiry_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (expiry < now) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', isExpiring: false, daysUntilExpiry };
    }
    
    if (expiry <= thirtyDaysFromNow) {
      return { status: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', isExpiring: true, daysUntilExpiry };
    }
    
    return { status: 'Active', color: 'bg-green-100 text-green-800', isExpiring: false, daysUntilExpiry };
  }
  
  const statusConfig = STATUS_CONFIG[certification.status] || STATUS_CONFIG.active;
  return { status: statusConfig.label, color: statusConfig.color, isExpiring: false };
}

export function validateCertificationForm(data: CertificationFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Certification name is required';
  }

  if (!data.issuing_organization?.trim()) {
    errors.issuing_organization = 'Issuing organization is required';
  }

  if (data.verification_url && data.verification_url.trim()) {
    try {
      new URL(data.verification_url);
    } catch {
      errors.verification_url = 'Verification URL must be valid';
    }
  }

  if (data.attachment_url && data.attachment_url.trim()) {
    try {
      new URL(data.attachment_url);
    } catch {
      errors.attachment_url = 'Attachment URL must be valid';
    }
  }

  if (data.issue_date && data.expiry_date && data.expiry_date < data.issue_date) {
    errors.expiry_date = 'Expiry date cannot be before issue date';
  }

  if (data.notes && data.notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters';
  }

  return errors;
}
