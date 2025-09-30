// Health Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface HealthRecord {
  id: string;
  organization_id: string;
  user_id: string;
  record_type: HealthRecordType;
  title: string;
  description?: string | null;
  date_recorded: string;
  expiry_date?: string | null;
  provider?: string | null;
  provider_contact?: string | null;
  document_url?: string | null;
  is_active: boolean;
  severity?: HealthSeverityLevel | null;
  category?: HealthCategory | null;
  tags: string[];
  notes?: string | null;
  privacy_level: HealthPrivacyLevel;
  reminder_enabled: boolean;
  reminder_days_before?: number | null;
  created_at: string;
  updated_at: string;
}

export type HealthRecordType = 
  | 'medical'
  | 'vaccination'
  | 'allergy'
  | 'medication'
  | 'condition'
  | 'emergency'
  | 'lab_result'
  | 'procedure'
  | 'appointment';

export type HealthSeverityLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type HealthCategory = 
  | 'preventive'
  | 'treatment'
  | 'chronic'
  | 'acute'
  | 'routine'
  | 'emergency';

export type HealthPrivacyLevel = 
  | 'private'
  | 'medical_team'
  | 'emergency_only'
  | 'public';

export type HealthViewType = 
  | 'form'
  | 'card'
  | 'timeline'
  | 'calendar'
  | 'analytics';

export interface HealthRecordFormData {
  record_type: HealthRecordType;
  title: string;
  description: string;
  date_recorded: string;
  expiry_date: string;
  provider: string;
  provider_contact: string;
  document_url: string;
  is_active: boolean;
  severity: HealthSeverityLevel;
  category: HealthCategory;
  tags: string[];
  notes: string;
  privacy_level: HealthPrivacyLevel;
  reminder_enabled: boolean;
  reminder_days_before: number;
}

export interface HealthFilters {
  search: string;
  record_type: HealthRecordType | 'all';
  severity: HealthSeverityLevel | 'all';
  category: HealthCategory | 'all';
  privacy_level: HealthPrivacyLevel | 'all';
  is_active: 'active' | 'inactive' | 'all';
  date_from?: string;
  date_to?: string;
  expiring_soon?: boolean;
}

export interface HealthSort {
  field: 'date_recorded' | 'expiry_date' | 'title' | 'created_at' | 'severity';
  direction: 'asc' | 'desc';
}

export interface HealthStats {
  totalRecords: number;
  activeRecords: number;
  expiringRecords: number;
  criticalRecords: number;
  byType: Array<{
    type: HealthRecordType;
    count: number;
  }>;
  bySeverity: Array<{
    severity: HealthSeverityLevel;
    count: number;
  }>;
  byCategory: Array<{
    category: HealthCategory;
    count: number;
  }>;
  upcomingReminders: Array<{
    record: HealthRecord;
    daysUntilExpiry: number;
  }>;
}

export interface HealthAnalytics {
  recordTrends: Array<{
    month: string;
    count: number;
    byType: Record<HealthRecordType, number>;
  }>;
  expiryAlerts: Array<{
    record: HealthRecord;
    daysUntilExpiry: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  providerDistribution: Array<{
    provider: string;
    count: number;
  }>;
  categoryBreakdown: Array<{
    category: HealthCategory;
    percentage: number;
  }>;
  tagCloud: Array<{
    tag: string;
    frequency: number;
    weight: number;
  }>;
  healthScore: number;
  completenessScore: number;
  recentActivity: HealthRecord[];
}

// ============================================================================
// Schemas
// ============================================================================

export const healthRecordTypeSchema = zod.enum([
  'medical',
  'vaccination',
  'allergy',
  'medication',
  'condition',
  'emergency',
  'lab_result',
  'procedure',
  'appointment',
]);

export const healthSeverityLevelSchema = zod.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const healthCategorySchema = zod.enum([
  'preventive',
  'treatment',
  'chronic',
  'acute',
  'routine',
  'emergency',
]);

export const healthPrivacyLevelSchema = zod.enum([
  'private',
  'medical_team',
  'emergency_only',
  'public',
]);

export const healthFilterSchema = zod.object({
  search: zod.string().optional(),
  record_type: zod.union([healthRecordTypeSchema, zod.literal('all')]).optional(),
  severity: zod.union([healthSeverityLevelSchema, zod.literal('all')]).optional(),
  category: zod.union([healthCategorySchema, zod.literal('all')]).optional(),
  privacy_level: zod.union([healthPrivacyLevelSchema, zod.literal('all')]).optional(),
  is_active: zod.enum(['active', 'inactive', 'all']).optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
  expiring_soon: zod.boolean().optional(),
});

export const healthUpsertSchema = zod.object({
  record_type: healthRecordTypeSchema,
  title: zod.string().min(1, 'Title is required'),
  description: zod.string().optional().nullable(),
  date_recorded: zod.string(),
  expiry_date: zod.string().optional().nullable(),
  provider: zod.string().optional().nullable(),
  provider_contact: zod.string().optional().nullable(),
  document_url: zod.string().url().optional().nullable(),
  is_active: zod.boolean(),
  severity: healthSeverityLevelSchema.optional().nullable(),
  category: healthCategorySchema.optional().nullable(),
  tags: zod.array(zod.string()),
  notes: zod.string().optional().nullable(),
  privacy_level: healthPrivacyLevelSchema,
  reminder_enabled: zod.boolean(),
  reminder_days_before: zod.number().min(0).optional().nullable(),
});

// ============================================================================
// Constants
// ============================================================================

export const RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  medical: 'Medical Record',
  vaccination: 'Vaccination',
  allergy: 'Allergy',
  medication: 'Medication',
  condition: 'Medical Condition',
  emergency: 'Emergency Info',
  lab_result: 'Lab Result',
  procedure: 'Medical Procedure',
  appointment: 'Appointment',
};

export const SEVERITY_LABELS: Record<HealthSeverityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const CATEGORY_LABELS: Record<HealthCategory, string> = {
  preventive: 'Preventive',
  treatment: 'Treatment',
  chronic: 'Chronic',
  acute: 'Acute',
  routine: 'Routine',
  emergency: 'Emergency',
};

export const PRIVACY_LABELS: Record<HealthPrivacyLevel, string> = {
  private: 'Private',
  medical_team: 'Medical Team',
  emergency_only: 'Emergency Only',
  public: 'Public',
};

export const VIEW_CONFIG: Record<HealthViewType, { label: string; description: string }> = {
  form: {
    label: 'Form',
    description: 'Add or edit health records',
  },
  card: {
    label: 'Card',
    description: 'Detailed card view',
  },
  timeline: {
    label: 'Timeline',
    description: 'Chronological timeline',
  },
  calendar: {
    label: 'Calendar',
    description: 'Calendar view with reminders',
  },
  analytics: {
    label: 'Analytics',
    description: 'Health insights and metrics',
  },
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expiring Soon', value: 'expiring' },
  { label: 'Critical', value: 'critical' },
  { label: 'Medications', value: 'medications' },
];

export const COMMON_TAGS = [
  'Chronic',
  'Acute',
  'Preventive',
  'Follow-up',
  'Routine',
  'Emergency',
  'Specialist',
  'Primary Care',
  'Lab Work',
  'Imaging',
  'Surgery',
  'Therapy',
  'Mental Health',
  'Dental',
  'Vision',
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): HealthRecordFormData {
  return {
    record_type: 'medical',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    expiry_date: '',
    provider: '',
    provider_contact: '',
    document_url: '',
    is_active: true,
    severity: 'low',
    category: 'routine',
    tags: [],
    notes: '',
    privacy_level: 'private',
    reminder_enabled: false,
    reminder_days_before: 30,
  };
}

export function createEmptyStats(): HealthStats {
  return {
    totalRecords: 0,
    activeRecords: 0,
    expiringRecords: 0,
    criticalRecords: 0,
    byType: [],
    bySeverity: [],
    byCategory: [],
    upcomingReminders: [],
  };
}

export function createEmptyAnalytics(): HealthAnalytics {
  return {
    recordTrends: [],
    expiryAlerts: [],
    providerDistribution: [],
    categoryBreakdown: [],
    tagCloud: [],
    healthScore: 0,
    completenessScore: 0,
    recentActivity: [],
  };
}

export function validateHealthForm(data: HealthRecordFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.date_recorded) {
    errors.date_recorded = 'Date recorded is required';
  }
  
  if (data.expiry_date && new Date(data.expiry_date) <= new Date(data.date_recorded)) {
    errors.expiry_date = 'Expiry date must be after recorded date';
  }
  
  if (data.document_url && !isValidUrl(data.document_url)) {
    errors.document_url = 'Invalid document URL';
  }
  
  if (data.reminder_enabled && (!data.reminder_days_before || data.reminder_days_before < 0)) {
    errors.reminder_days_before = 'Reminder days must be a positive number';
  }
  
  return errors;
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

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryUrgency(daysUntil: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysUntil < 0) return 'critical';
  if (daysUntil <= 7) return 'critical';
  if (daysUntil <= 30) return 'high';
  if (daysUntil <= 90) return 'medium';
  return 'low';
}

export function getSeverityColor(severity: HealthSeverityLevel): string {
  const colors: Record<HealthSeverityLevel, string> = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red',
  };
  return colors[severity];
}

export function getRecordTypeIcon(type: HealthRecordType): string {
  const icons: Record<HealthRecordType, string> = {
    medical: '🏥',
    vaccination: '💉',
    allergy: '⚠️',
    medication: '💊',
    condition: '🩺',
    emergency: '🚨',
    lab_result: '🧪',
    procedure: '⚕️',
    appointment: '📅',
  };
  return icons[type];
}

export function getPrivacyBadgeVariant(privacy: HealthPrivacyLevel): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (privacy) {
    case 'public':
      return 'default';
    case 'medical_team':
      return 'secondary';
    case 'emergency_only':
      return 'destructive';
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

export function sortHealthRecords(
  records: HealthRecord[],
  sort: HealthSort
): HealthRecord[] {
  return [...records].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'date_recorded':
        comparison = new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime();
        break;
      case 'expiry_date':
        const aExpiry = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
        const bExpiry = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
        comparison = aExpiry - bExpiry;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'severity':
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        const aSeverity = a.severity ? severityOrder[a.severity] : 0;
        const bSeverity = b.severity ? severityOrder[b.severity] : 0;
        comparison = aSeverity - bSeverity;
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterHealthRecords(
  records: HealthRecord[],
  filters: HealthFilters
): HealthRecord[] {
  return records.filter(record => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        record.title.toLowerCase().includes(searchLower) ||
        record.description?.toLowerCase().includes(searchLower) ||
        record.provider?.toLowerCase().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Record type filter
    if (filters.record_type && filters.record_type !== 'all') {
      if (record.record_type !== filters.record_type) return false;
    }
    
    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      if (record.severity !== filters.severity) return false;
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (record.category !== filters.category) return false;
    }
    
    // Privacy level filter
    if (filters.privacy_level && filters.privacy_level !== 'all') {
      if (record.privacy_level !== filters.privacy_level) return false;
    }
    
    // Active status filter
    if (filters.is_active && filters.is_active !== 'all') {
      const isActive = filters.is_active === 'active';
      if (record.is_active !== isActive) return false;
    }
    
    // Date range filter
    if (filters.date_from) {
      if (new Date(record.date_recorded) < new Date(filters.date_from)) return false;
    }
    if (filters.date_to) {
      if (new Date(record.date_recorded) > new Date(filters.date_to)) return false;
    }
    
    // Expiring soon filter
    if (filters.expiring_soon) {
      if (!record.expiry_date) return false;
      const daysUntil = getDaysUntilExpiry(record.expiry_date);
      if (daysUntil > 30 || daysUntil < 0) return false;
    }
    
    return true;
  });
}
