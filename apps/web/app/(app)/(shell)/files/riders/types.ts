// Programming Riders - Comprehensive Type Definitions

export type RiderKind = 
  | 'technical'
  | 'hospitality'
  | 'stage_plot'
  | 'security'
  | 'catering'
  | 'transportation'
  | 'accommodation'
  | 'production'
  | 'artist'
  | 'crew';

export type RiderStatus = 
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'fulfilled'
  | 'cancelled';

export type RiderPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'urgent';

export interface RiderTechnicalRequirements {
  sound_system?: string;
  lighting?: string;
  stage_setup?: string;
  power_requirements?: string;
  equipment_list?: string[];
  crew_requirements?: string;
  load_in_time?: string;
  sound_check_time?: string;
  special_instructions?: string;
}

export interface RiderHospitalityRequirements {
  catering?: string;
  beverages?: string;
  dietary_restrictions?: string[];
  green_room_setup?: string;
  towels_count?: number;
  water_bottles?: number;
  special_requests?: string;
  meal_times?: string;
}

export interface RiderStagePlot {
  stage_dimensions?: string;
  input_list?: string[];
  monitor_requirements?: string;
  backline?: string;
  risers?: string;
  special_staging?: string;
  plot_file_url?: string;
}

export interface RiderSecurityRequirements {
  security_level?: string;
  personnel_count?: number;
  backstage_access?: string;
  vip_requirements?: string;
  crowd_control?: string;
  emergency_procedures?: string;
}

export interface RiderTransportation {
  arrival_details?: string;
  departure_details?: string;
  local_transport?: string;
  parking_requirements?: string;
  load_in_access?: string;
  special_arrangements?: string;
}

export interface RiderAccommodation {
  hotel_requirements?: string;
  room_count?: number;
  check_in_date?: string;
  check_out_date?: string;
  special_requests?: string;
  proximity_requirements?: string;
}

export interface RiderEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
  venue?: string;
}

export interface RiderProject {
  id: string;
  name: string;
  status: string;
}

export interface ProgrammingRider {
  id: string;
  event_id: string;
  project_id?: string | null;
  kind: RiderKind;
  status: RiderStatus;
  priority: RiderPriority;
  title: string;
  description?: string | null;
  requirements: string;
  notes?: string | null;
  
  // Specific requirement details based on kind
  technical_requirements?: RiderTechnicalRequirements;
  hospitality_requirements?: RiderHospitalityRequirements;
  stage_plot?: RiderStagePlot;
  security_requirements?: RiderSecurityRequirements;
  transportation?: RiderTransportation;
  accommodation?: RiderAccommodation;
  
  // Fulfillment tracking
  fulfilled_at?: string | null;
  fulfilled_by?: string | null;
  fulfillment_notes?: string | null;
  
  // Approval workflow
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  
  // File attachments
  attachments?: string[];
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  organization_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  event?: RiderEvent | null;
  project?: RiderProject | null;
}

export interface CreateRiderData {
  event_id: string;
  project_id?: string;
  kind: RiderKind;
  status?: RiderStatus;
  priority?: RiderPriority;
  title: string;
  description?: string;
  requirements: string;
  notes?: string;
  technical_requirements?: RiderTechnicalRequirements;
  hospitality_requirements?: RiderHospitalityRequirements;
  stage_plot?: RiderStagePlot;
  security_requirements?: RiderSecurityRequirements;
  transportation?: RiderTransportation;
  accommodation?: RiderAccommodation;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateRiderData {
  event_id?: string;
  project_id?: string;
  kind?: RiderKind;
  status?: RiderStatus;
  priority?: RiderPriority;
  title?: string;
  description?: string;
  requirements?: string;
  notes?: string;
  technical_requirements?: RiderTechnicalRequirements;
  hospitality_requirements?: RiderHospitalityRequirements;
  stage_plot?: RiderStagePlot;
  security_requirements?: RiderSecurityRequirements;
  transportation?: RiderTransportation;
  accommodation?: RiderAccommodation;
  fulfilled_at?: string;
  fulfilled_by?: string;
  fulfillment_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  approved_at?: string;
  approved_by?: string;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RiderFilters {
  event_id?: string;
  project_id?: string;
  kind?: RiderKind;
  status?: RiderStatus;
  priority?: RiderPriority;
  search?: string;
  start_date?: string;
  end_date?: string;
  fulfilled?: boolean;
  approved?: boolean;
}

export interface RiderSort {
  field: keyof ProgrammingRider;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'timeline' | 'analytics';

// Status badge configurations
export const STATUS_BADGE = {
  draft: { label: 'Draft', variant: 'default' as const },
  pending_review: { label: 'Pending Review', variant: 'warning' as const },
  under_review: { label: 'Under Review', variant: 'info' as const },
  approved: { label: 'Approved', variant: 'success' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
  fulfilled: { label: 'Fulfilled', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'secondary' as const }
} as const;

// Priority badge configurations
export const PRIORITY_BADGE = {
  low: { label: 'Low', variant: 'secondary' as const },
  medium: { label: 'Medium', variant: 'default' as const },
  high: { label: 'High', variant: 'warning' as const },
  critical: { label: 'Critical', variant: 'destructive' as const },
  urgent: { label: 'Urgent', variant: 'destructive' as const }
} as const;

// Rider kind configurations
export const RIDER_KIND_BADGE = {
  technical: { label: 'Technical', icon: '🔧' },
  hospitality: { label: 'Hospitality', icon: '🍽️' },
  stage_plot: { label: 'Stage Plot', icon: '📋' },
  security: { label: 'Security', icon: '🛡️' },
  catering: { label: 'Catering', icon: '🍴' },
  transportation: { label: 'Transportation', icon: '🚐' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  production: { label: 'Production', icon: '🎬' },
  artist: { label: 'Artist', icon: '🎤' },
  crew: { label: 'Crew', icon: '👥' }
} as const;

// View configuration
export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  grid: { label: 'Grid', icon: 'Grid3X3' },
  timeline: { label: 'Timeline', icon: 'Calendar' },
  analytics: { label: 'Analytics', icon: 'BarChart3' }
} as const;

// Common equipment options for technical riders
export const TECHNICAL_EQUIPMENT_OPTIONS = [
  'Microphones',
  'DI Boxes',
  'Monitors',
  'Speakers',
  'Mixing Console',
  'Amplifiers',
  'Cables',
  'Power Distribution',
  'Lighting Rig',
  'Follow Spots',
  'Haze Machine',
  'Projectors',
  'Screens',
  'Cameras',
  'Recording Equipment',
  'Instruments',
  'Backline',
  'Drum Kit',
  'Guitar Amps',
  'Bass Amps',
  'Keyboards',
  'Other',
] as const;

// Common dietary restrictions
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergies',
  'Shellfish Allergies',
  'Kosher',
  'Halal',
  'Low Sodium',
  'Diabetic Friendly',
  'Other',
] as const;

// Rider analytics metrics
export interface RiderAnalytics {
  totalRiders: number;
  pendingRiders: number;
  approvedRiders: number;
  fulfilledRiders: number;
  rejectedRiders: number;
  averageApprovalTime: number;
  averageFulfillmentTime: number;
  ridersByKind: Array<{ kind: RiderKind; count: number }>;
  ridersByStatus: Array<{ status: RiderStatus; count: number }>;
  ridersByPriority: Array<{ priority: RiderPriority; count: number }>;
  monthlyTrends: Array<{ month: string; count: number; fulfilled: number }>;
  topEvents: Array<{ event: string; count: number }>;
}
