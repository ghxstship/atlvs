// Programming Performances - Comprehensive Type Definitions

export type PerformanceType = 
  | 'concert'
  | 'theater'
  | 'dance'
  | 'comedy'
  | 'spoken_word'
  | 'variety'
  | 'festival'
  | 'other';

export type PerformanceStatus = 
  | 'planning'
  | 'rehearsal'
  | 'ready'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface PerformanceTicketInfo {
  price_min?: number;
  price_max?: number;
  currency?: string;
  sales_url?: string;
  sold_out?: boolean;
}

export interface PerformanceTechnicalRequirements {
  sound_system?: string;
  lighting?: string;
  stage_setup?: string;
  equipment_needed?: string[];
  crew_requirements?: string;
}

export interface PerformanceProductionNotes {
  rehearsal_schedule?: string;
  call_time?: string;
  sound_check?: string;
  special_instructions?: string;
}

export interface PerformanceAudienceInfo {
  expected_attendance?: number;
  target_demographic?: string;
  accessibility_notes?: string;
}

export interface PerformanceProject {
  id: string;
  name: string;
  status: string;
}

export interface PerformanceEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
}

export interface ProgrammingPerformance {
  id: string;
  event_id: string;
  project_id?: string | null;
  name: string;
  description?: string | null;
  performance_type?: PerformanceType;
  status: PerformanceStatus;
  starts_at: string;
  ends_at?: string | null;
  duration_minutes?: number | null;
  venue?: string | null;
  venue_capacity?: number | null;
  ticket_info: PerformanceTicketInfo;
  technical_requirements: PerformanceTechnicalRequirements;
  production_notes: PerformanceProductionNotes;
  audience_info: PerformanceAudienceInfo;
  tags: string[];
  metadata: Record<string, unknown>;
  organization_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  project?: PerformanceProject | null;
  event?: PerformanceEvent | null;
  lineup_count?: number;
}

export interface CreatePerformanceData {
  event_id: string;
  project_id?: string;
  name: string;
  description?: string;
  performance_type?: PerformanceType;
  status?: PerformanceStatus;
  starts_at: string;
  ends_at?: string;
  duration_minutes?: number;
  venue?: string;
  venue_capacity?: number;
  ticket_info?: PerformanceTicketInfo;
  technical_requirements?: PerformanceTechnicalRequirements;
  production_notes?: PerformanceProductionNotes;
  audience_info?: PerformanceAudienceInfo;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdatePerformanceData {
  event_id?: string;
  project_id?: string;
  name?: string;
  description?: string;
  performance_type?: PerformanceType;
  status?: PerformanceStatus;
  starts_at?: string;
  ends_at?: string;
  duration_minutes?: number;
  venue?: string;
  venue_capacity?: number;
  ticket_info?: PerformanceTicketInfo;
  technical_requirements?: PerformanceTechnicalRequirements;
  production_notes?: PerformanceProductionNotes;
  audience_info?: PerformanceAudienceInfo;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface PerformanceFilters {
  event_id?: string;
  project_id?: string;
  status?: PerformanceStatus;
  performance_type?: PerformanceType;
  venue?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface PerformanceSort {
  field: keyof ProgrammingPerformance;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'timeline' | 'analytics';

// Status badge configurations
export const STATUS_BADGE = {
  planning: { label: 'Planning', variant: 'default' as const },
  rehearsal: { label: 'Rehearsal', variant: 'warning' as const },
  ready: { label: 'Ready', variant: 'info' as const },
  live: { label: 'Live', variant: 'destructive' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'secondary' as const }
} as const;

// Performance type configurations
export const PERFORMANCE_TYPE_BADGE = {
  concert: { label: 'Concert', icon: '🎵' },
  theater: { label: 'Theater', icon: '🎭' },
  dance: { label: 'Dance', icon: '💃' },
  comedy: { label: 'Comedy', icon: '😄' },
  spoken_word: { label: 'Spoken Word', icon: '🎙️' },
  variety: { label: 'Variety', icon: '🎪' },
  festival: { label: 'Festival', icon: '🎉' },
  other: { label: 'Other', icon: '🎨' }
} as const;

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'JPY', label: 'JPY (¥)' },
] as const;

// View configuration
export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  grid: { label: 'Grid', icon: 'Grid3X3' },
  timeline: { label: 'Timeline', icon: 'Calendar' },
  analytics: { label: 'Analytics', icon: 'BarChart3' }
} as const;

// Equipment options for technical requirements
export const EQUIPMENT_OPTIONS = [
  'Sound System',
  'Microphones',
  'Speakers',
  'Mixing Board',
  'Amplifiers',
  'Instruments',
  'Lighting Rig',
  'Spotlights',
  'Stage Lights',
  'Projectors',
  'Screens',
  'Cameras',
  'Recording Equipment',
  'Staging',
  'Backdrop',
  'Props',
  'Costumes',
  'Makeup Station',
  'Dressing Rooms',
  'Security',
  'Barriers',
  'Seating',
  'Tables',
  'Catering Equipment',
  'Power Supply',
  'Generators',
  'Cables',
  'Other',
] as const;

// Venue type options
export const VENUE_TYPES = [
  'Concert Hall',
  'Theater',
  'Arena',
  'Stadium',
  'Club',
  'Bar',
  'Restaurant',
  'Outdoor Stage',
  'Park',
  'Beach',
  'Gallery',
  'Museum',
  'Conference Center',
  'Hotel',
  'Private Venue',
  'Street Performance',
  'Festival Ground',
  'Other',
] as const;

// Duration presets (in minutes)
export const DURATION_PRESETS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
] as const;

// Target demographic options
export const TARGET_DEMOGRAPHICS = [
  'All Ages',
  'Children (0-12)',
  'Teens (13-17)',
  'Young Adults (18-25)',
  'Adults (26-40)',
  'Middle Age (41-55)',
  'Seniors (55+)',
  'Families',
  'Professionals',
  'Students',
  'Tourists',
  'Locals',
  'VIP/Premium',
  'General Public',
] as const;

// Performance analytics metrics
export interface PerformanceAnalytics {
  totalPerformances: number;
  upcomingPerformances: number;
  completedPerformances: number;
  cancelledPerformances: number;
  averageDuration: number;
  totalRevenue: number;
  averageAttendance: number;
  topVenues: Array<{ venue: string; count: number }>;
  performancesByType: Array<{ type: PerformanceType; count: number }>;
  performancesByStatus: Array<{ status: PerformanceStatus; count: number }>;
  monthlyTrends: Array<{ month: string; count: number; revenue: number }>;
}
