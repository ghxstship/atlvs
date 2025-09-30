// Programming Lineups - Comprehensive Type Definitions

export type PerformerType = 
  | 'artist'
  | 'band'
  | 'dj'
  | 'speaker'
  | 'host'
  | 'comedian'
  | 'dancer'
  | 'other';

export type LineupStatus = 
  | 'confirmed'
  | 'tentative'
  | 'cancelled'
  | 'pending';

export interface LineupContactInfo {
  email?: string;
  phone?: string;
  agent?: string;
  manager?: string;
}

export interface LineupTechnicalRequirements {
  sound_check?: string;
  equipment?: string[];
  special_requests?: string;
}

export interface LineupContractDetails {
  fee?: number;
  currency?: string;
  payment_terms?: string;
  contract_signed?: boolean;
}

export interface LineupProject {
  id: string;
  name: string;
  status: string;
}

export interface LineupEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
}

export interface ProgrammingLineup {
  id: string;
  event_id: string;
  project_id?: string | null;
  performer_name: string;
  performer_type?: PerformerType;
  role?: string | null;
  stage?: string | null;
  set_time?: string | null;
  duration_minutes?: number | null;
  status: LineupStatus;
  contact_info: LineupContactInfo;
  technical_requirements: LineupTechnicalRequirements;
  contract_details: LineupContractDetails;
  notes?: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  organization_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  project?: LineupProject | null;
  event?: LineupEvent | null;
}

export interface CreateLineupData {
  event_id: string;
  project_id?: string;
  performer_name: string;
  performer_type?: PerformerType;
  role?: string;
  stage?: string;
  set_time?: string;
  duration_minutes?: number;
  status?: LineupStatus;
  contact_info?: LineupContactInfo;
  technical_requirements?: LineupTechnicalRequirements;
  contract_details?: LineupContractDetails;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateLineupData {
  event_id?: string;
  project_id?: string;
  performer_name?: string;
  performer_type?: PerformerType;
  role?: string;
  stage?: string;
  set_time?: string;
  duration_minutes?: number;
  status?: LineupStatus;
  contact_info?: LineupContactInfo;
  technical_requirements?: LineupTechnicalRequirements;
  contract_details?: LineupContractDetails;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface LineupFilters {
  event_id?: string;
  project_id?: string;
  status?: LineupStatus;
  performer_type?: PerformerType;
  stage?: string;
  search?: string;
}

export interface LineupSort {
  field: keyof ProgrammingLineup;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'timeline' | 'schedule';

// Status badge configurations
export const STATUS_BADGE = {
  confirmed: { label: 'Confirmed', variant: 'success' as const },
  tentative: { label: 'Tentative', variant: 'warning' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
  pending: { label: 'Pending', variant: 'default' as const },
} as const;

// Performer type configurations
export const PERFORMER_TYPE_BADGE = {
  artist: { label: 'Artist', icon: '🎤' },
  band: { label: 'Band', icon: '🎸' },
  dj: { label: 'DJ', icon: '🎧' },
  speaker: { label: 'Speaker', icon: '🎙️' },
  host: { label: 'Host', icon: '📺' },
  comedian: { label: 'Comedian', icon: '😄' },
  dancer: { label: 'Dancer', icon: '💃' },
  other: { label: 'Other', icon: '🎭' },
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
  schedule: { label: 'Schedule', icon: 'Clock' },
} as const;

// Equipment options for technical requirements
export const EQUIPMENT_OPTIONS = [
  'Microphone',
  'Guitar Amp',
  'Bass Amp',
  'Drum Kit',
  'Keyboard',
  'DJ Controller',
  'Turntables',
  'Mixing Board',
  'Speakers',
  'Monitors',
  'Lighting',
  'Projector',
  'Screen',
  'Laptop',
  'Cables',
  'Power Strip',
  'Other',
] as const;

// Stage/venue options
export const STAGE_OPTIONS = [
  'Main Stage',
  'Second Stage',
  'Acoustic Stage',
  'DJ Booth',
  'VIP Area',
  'Lounge',
  'Conference Room',
  'Workshop Space',
  'Outdoor Stage',
  'Indoor Stage',
  'Other',
] as const;

// Duration presets (in minutes)
export const DURATION_PRESETS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
] as const;
