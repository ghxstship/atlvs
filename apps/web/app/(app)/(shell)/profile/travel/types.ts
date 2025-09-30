// Travel Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface TravelRecord {
  id: string;
  user_id: string;
  organization_id: string;
  travel_type: TravelType;
  destination: string;
  country: string;
  purpose: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  accommodation?: string | null;
  transportation?: string | null;
  visa_required: boolean;
  visa_status: VisaStatus;
  passport_used?: string | null;
  notes?: string | null;
  expenses?: number | null;
  currency: string;
  status: TravelStatus;
  booking_reference?: string | null;
  emergency_contact?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelInfo {
  id: string;
  user_id: string;
  organization_id: string;
  passport_number?: string | null;
  passport_country?: string | null;
  passport_issue_date?: string | null;
  passport_expiry_date?: string | null;
  visa_info: VisaInfo[];
  preferred_airline?: string | null;
  frequent_flyer_numbers: Record<string, string>;
  seat_preference?: SeatPreference | null;
  meal_preference?: string | null;
  accommodation_preference?: string | null;
  travel_restrictions?: string | null;
  countries_cannot_visit: string[];
  created_at: string;
  updated_at: string;
}

export interface VisaInfo {
  country: string;
  visa_type: string;
  issue_date: string;
  expiry_date: string;
  visa_number: string;
  status: VisaStatus;
}

export type TravelType = 
  | 'business'
  | 'personal'
  | 'relocation'
  | 'training'
  | 'conference'
  | 'other';

export type VisaStatus = 
  | 'not-required'
  | 'pending'
  | 'approved'
  | 'denied'
  | 'expired';

export type TravelStatus = 
  | 'planned'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type SeatPreference = 
  | 'aisle'
  | 'window'
  | 'middle'
  | 'no-preference';

export type TravelViewType = 
  | 'list'
  | 'grid'
  | 'table'
  | 'analytics';

export interface TravelFormData {
  travel_type: TravelType;
  destination: string;
  country: string;
  purpose: string;
  start_date: string;
  end_date: string;
  accommodation: string;
  transportation: string;
  visa_required: boolean;
  visa_status: VisaStatus;
  passport_used: string;
  notes: string;
  expenses: string;
  currency: string;
  status: TravelStatus;
  booking_reference: string;
  emergency_contact: string;
}

export interface TravelFilters {
  search?: string;
  travel_type?: TravelType | 'all';
  status?: TravelStatus | 'all';
  country?: string | 'all';
  visa_required?: boolean;
  date_from?: string;
  date_to?: string;
  expenses_min?: number;
  expenses_max?: number;
  has_visa?: boolean;
  duration_min?: number;
  duration_max?: number;
}

export interface TravelSort {
  field: 'start_date' | 'end_date' | 'destination' | 'country' | 'travel_type' | 'status' | 'expenses' | 'duration_days' | 'created_at';
  direction: 'asc' | 'desc';
}

export interface TravelStats {
  totalTrips: number;
  completedTrips: number;
  totalExpenses: number;
  averageTripDuration: number;
  byTravelType: Array<{
    type: TravelType;
    count: number;
    totalExpenses: number;
    averageDuration: number;
  }>;
  byCountry: Array<{
    country: string;
    count: number;
    totalExpenses: number;
  }>;
  byStatus: Array<{
    status: TravelStatus;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    trips: number;
    expenses: number;
  }>;
  topDestinations: Array<{
    destination: string;
    country: string;
    count: number;
    totalExpenses: number;
  }>;
  visaRequirements: {
    required: number;
    notRequired: number;
    pending: number;
    approved: number;
    denied: number;
  };
}

export interface TravelAnalytics {
  travelTrends: Array<{
    period: string;
    totalTrips: number;
    businessTrips: number;
    personalTrips: number;
    totalExpenses: number;
  }>;
  destinationAnalytics: Array<{
    destination: string;
    country: string;
    frequency: number;
    averageStay: number;
    totalExpenses: number;
    lastVisit: string;
  }>;
  expenseAnalysis: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }>;
  visaAnalytics: Array<{
    country: string;
    visaRequired: boolean;
    approvalRate: number;
    averageProcessingTime: number;
  }>;
  seasonalPatterns: Array<{
    month: string;
    businessTrips: number;
    personalTrips: number;
    averageExpenses: number;
  }>;
  complianceMetrics: {
    visaCompliance: number;
    documentationComplete: number;
    expenseReporting: number;
  };
}

// ============================================================================
// Schemas
// ============================================================================

export const travelTypeSchema = zod.enum([
  'business',
  'personal',
  'relocation',
  'training',
  'conference',
  'other',
]);

export const visaStatusSchema = zod.enum([
  'not-required',
  'pending',
  'approved',
  'denied',
  'expired',
]);

export const travelStatusSchema = zod.enum([
  'planned',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
]);

export const seatPreferenceSchema = zod.enum([
  'aisle',
  'window',
  'middle',
  'no-preference',
]);

export const travelFilterSchema = zod.object({
  search: zod.string().optional(),
  travel_type: zod.union([travelTypeSchema, zod.literal('all')]).optional(),
  status: zod.union([travelStatusSchema, zod.literal('all')]).optional(),
  country: zod.string().optional(),
  visa_required: zod.boolean().optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
  expenses_min: zod.number().min(0).optional(),
  expenses_max: zod.number().min(0).optional(),
  has_visa: zod.boolean().optional(),
  duration_min: zod.number().min(1).optional(),
  duration_max: zod.number().min(1).optional(),
});

export const travelRecordUpsertSchema = zod.object({
  travel_type: travelTypeSchema,
  destination: zod.string().min(1, 'Destination is required'),
  country: zod.string().min(1, 'Country is required'),
  purpose: zod.string().min(1, 'Purpose is required'),
  start_date: zod.string().min(1, 'Start date is required'),
  end_date: zod.string().min(1, 'End date is required'),
  accommodation: zod.string().optional().nullable(),
  transportation: zod.string().optional().nullable(),
  visa_required: zod.boolean(),
  visa_status: visaStatusSchema,
  passport_used: zod.string().optional().nullable(),
  notes: zod.string().optional().nullable(),
  expenses: zod.number().min(0).optional().nullable(),
  currency: zod.string().default('USD'),
  status: travelStatusSchema,
  booking_reference: zod.string().optional().nullable(),
  emergency_contact: zod.string().optional().nullable(),
});

export const travelInfoUpsertSchema = zod.object({
  passport_number: zod.string().optional().nullable(),
  passport_country: zod.string().optional().nullable(),
  passport_issue_date: zod.string().optional().nullable(),
  passport_expiry_date: zod.string().optional().nullable(),
  visa_info: zod.array(zod.object({
    country: zod.string(),
    visa_type: zod.string(),
    issue_date: zod.string(),
    expiry_date: zod.string(),
    visa_number: zod.string(),
    status: visaStatusSchema,
  })),
  preferred_airline: zod.string().optional().nullable(),
  frequent_flyer_numbers: zod.record(zod.string()),
  seat_preference: seatPreferenceSchema.optional().nullable(),
  meal_preference: zod.string().optional().nullable(),
  accommodation_preference: zod.string().optional().nullable(),
  travel_restrictions: zod.string().optional().nullable(),
  countries_cannot_visit: zod.array(zod.string()),
});

// ============================================================================
// Constants
// ============================================================================

export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  business: 'Business',
  personal: 'Personal',
  relocation: 'Relocation',
  training: 'Training',
  conference: 'Conference',
  other: 'Other',
};

export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  'not-required': 'Not Required',
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired',
};

export const TRAVEL_STATUS_LABELS: Record<TravelStatus, string> = {
  planned: 'Planned',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SEAT_PREFERENCE_LABELS: Record<SeatPreference, string> = {
  aisle: 'Aisle',
  window: 'Window',
  middle: 'Middle',
  'no-preference': 'No Preference',
};

export const VIEW_CONFIG: Record<TravelViewType, { label: string; description: string }> = {
  list: {
    label: 'List',
    description: 'Detailed list view with trip information',
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
    description: 'Travel insights and trends',
  },
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Business', value: 'business' },
  { label: 'Completed', value: 'completed' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'High Expenses', value: 'high_expenses' },
];

export const COMMON_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Netherlands',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Belgium',
  'Austria',
  'Italy',
  'Spain',
  'Portugal',
  'Ireland',
  'New Zealand',
];

export const COMMON_AIRLINES = [
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
  'Southwest Airlines',
  'British Airways',
  'Lufthansa',
  'Air France',
  'KLM',
  'Emirates',
  'Qatar Airways',
  'Singapore Airlines',
  'Cathay Pacific',
  'Japan Airlines',
  'All Nippon Airways',
  'Air Canada',
  'Qantas',
];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): TravelFormData {
  return {
    travel_type: 'business',
    destination: '',
    country: '',
    purpose: '',
    start_date: '',
    end_date: '',
    accommodation: '',
    transportation: '',
    visa_required: false,
    visa_status: 'not-required',
    passport_used: '',
    notes: '',
    expenses: '',
    currency: 'USD',
    status: 'planned',
    booking_reference: '',
    emergency_contact: '',
  };
}

export function createEmptyStats(): TravelStats {
  return {
    totalTrips: 0,
    completedTrips: 0,
    totalExpenses: 0,
    averageTripDuration: 0,
    byTravelType: [],
    byCountry: [],
    byStatus: [],
    monthlyTrends: [],
    topDestinations: [],
    visaRequirements: {
      required: 0,
      notRequired: 0,
      pending: 0,
      approved: 0,
      denied: 0,
    },
  };
}

export function createEmptyAnalytics(): TravelAnalytics {
  return {
    travelTrends: [],
    destinationAnalytics: [],
    expenseAnalysis: [],
    visaAnalytics: [],
    seasonalPatterns: [],
    complianceMetrics: {
      visaCompliance: 0,
      documentationComplete: 0,
      expenseReporting: 0,
    },
  };
}

export function validateTravelForm(data: TravelFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.destination.trim()) {
    errors.destination = 'Destination is required';
  }
  
  if (!data.country.trim()) {
    errors.country = 'Country is required';
  }
  
  if (!data.purpose.trim()) {
    errors.purpose = 'Purpose is required';
  }
  
  if (!data.start_date) {
    errors.start_date = 'Start date is required';
  }
  
  if (!data.end_date) {
    errors.end_date = 'End date is required';
  }
  
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (endDate < startDate) {
      errors.end_date = 'End date must be after start date';
    }
  }
  
  if (data.expenses && parseFloat(data.expenses) < 0) {
    errors.expenses = 'Expenses cannot be negative';
  }
  
  return errors;
}

export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || currency;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStatusBadgeVariant(status: TravelStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'confirmed':
    case 'in_progress':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'planned':
      return 'outline';
    default:
      return 'outline';
  }
}

export function getVisaStatusColor(status: VisaStatus): string {
  switch (status) {
    case 'approved':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'denied':
    case 'expired':
      return 'red';
    case 'not-required':
      return 'gray';
    default:
      return 'gray';
  }
}

export function sortTravelRecords(
  records: TravelRecord[],
  sort: TravelSort
): TravelRecord[] {
  return [...records].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'start_date':
        comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        break;
      case 'end_date':
        comparison = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        break;
      case 'destination':
        comparison = a.destination.localeCompare(b.destination);
        break;
      case 'country':
        comparison = a.country.localeCompare(b.country);
        break;
      case 'travel_type':
        comparison = a.travel_type.localeCompare(b.travel_type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'expenses':
        const aExpenses = a.expenses || 0;
        const bExpenses = b.expenses || 0;
        comparison = aExpenses - bExpenses;
        break;
      case 'duration_days':
        comparison = a.duration_days - b.duration_days;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterTravelRecords(
  records: TravelRecord[],
  filters: TravelFilters
): TravelRecord[] {
  return records.filter(record => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        record.destination.toLowerCase().includes(searchLower) ||
        record.country.toLowerCase().includes(searchLower) ||
        record.purpose.toLowerCase().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower) ||
        record.accommodation?.toLowerCase().includes(searchLower) ||
        record.transportation?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Travel type filter
    if (filters.travel_type && filters.travel_type !== 'all') {
      if (record.travel_type !== filters.travel_type) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (record.status !== filters.status) return false;
    }
    
    // Country filter
    if (filters.country && filters.country !== 'all') {
      if (record.country !== filters.country) return false;
    }
    
    // Visa required filter
    if (filters.visa_required !== undefined) {
      if (record.visa_required !== filters.visa_required) return false;
    }
    
    // Date range filter
    if (filters.date_from) {
      if (new Date(record.start_date) < new Date(filters.date_from)) return false;
    }
    if (filters.date_to) {
      if (new Date(record.end_date) > new Date(filters.date_to)) return false;
    }
    
    // Expenses range filter
    const expenses = record.expenses || 0;
    if (filters.expenses_min && expenses < filters.expenses_min) return false;
    if (filters.expenses_max && expenses > filters.expenses_max) return false;
    
    // Duration range filter
    if (filters.duration_min && record.duration_days < filters.duration_min) return false;
    if (filters.duration_max && record.duration_days > filters.duration_max) return false;
    
    // Has visa filter
    if (filters.has_visa) {
      if (!record.visa_required || record.visa_status === 'not-required') return false;
    }
    
    return true;
  });
}

export function isUpcomingTrip(record: TravelRecord): boolean {
  const now = new Date();
  const startDate = new Date(record.start_date);
  return startDate > now && (record.status === 'planned' || record.status === 'confirmed');
}

export function isCurrentTrip(record: TravelRecord): boolean {
  const now = new Date();
  const startDate = new Date(record.start_date);
  const endDate = new Date(record.end_date);
  return startDate <= now && endDate >= now && record.status === 'in_progress';
}
