// Programming Spaces - Comprehensive Type Definitions

export type SpaceKind = 
  | 'room'
  | 'green_room'
  | 'dressing_room'
  | 'meeting_room'
  | 'classroom'
  | 'studio'
  | 'rehearsal_room'
  | 'storage'
  | 'office'
  | 'lounge'
  | 'kitchen'
  | 'bathroom'
  | 'corridor'
  | 'lobby'
  | 'stage'
  | 'backstage'
  | 'loading_dock'
  | 'parking'
  | 'outdoor'
  | 'other';

export type SpaceStatus = 
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'cleaning'
  | 'setup'
  | 'breakdown'
  | 'out_of_service';

export type SpaceAccessLevel = 
  | 'public'
  | 'restricted'
  | 'staff_only'
  | 'talent_only'
  | 'vip'
  | 'crew_only'
  | 'private';

export interface SpaceAmenities {
  wifi?: boolean;
  air_conditioning?: boolean;
  heating?: boolean;
  lighting_control?: boolean;
  sound_system?: boolean;
  projection?: boolean;
  whiteboard?: boolean;
  tables?: boolean;
  chairs?: boolean;
  power_outlets?: boolean;
  windows?: boolean;
  private_bathroom?: boolean;
  kitchenette?: boolean;
  storage?: boolean;
  security_camera?: boolean;
  access_control?: boolean;
}

export interface SpaceTechnicalSpecs {
  audio_inputs?: number;
  video_inputs?: number;
  power_capacity?: string;
  internet_speed?: string;
  lighting_fixtures?: number;
  ceiling_height?: number;
  load_capacity?: number;
  hvac_zones?: number;
  emergency_exits?: number;
  fire_safety?: string[];
}

export interface SpaceBooking {
  id: string;
  space_id: string;
  event_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  booked_by: string;
  purpose: string;
  attendee_count?: number;
  setup_notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface SpaceEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
  venue?: string;
}

export interface SpaceProject {
  id: string;
  name: string;
  status: string;
}

export interface ProgrammingSpace {
  id: string;
  organization_id: string;
  project_id?: string | null;
  name: string;
  kind: SpaceKind;
  status: SpaceStatus;
  access_level: SpaceAccessLevel;
  
  // Basic information
  description?: string | null;
  location?: string | null;
  building?: string | null;
  floor?: string | null;
  room_number?: string | null;
  
  // Capacity and dimensions
  capacity?: number | null;
  max_capacity?: number | null;
  area_sqft?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  
  // Features and amenities
  amenities: SpaceAmenities;
  technical_specs: SpaceTechnicalSpecs;
  
  // Availability and booking
  is_bookable: boolean;
  booking_advance_days?: number | null;
  min_booking_duration?: number | null; // minutes
  max_booking_duration?: number | null; // minutes
  hourly_rate?: number | null;
  daily_rate?: number | null;
  
  // Operational details
  setup_time?: number | null; // minutes
  breakdown_time?: number | null; // minutes
  cleaning_time?: number | null; // minutes
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  
  // Rules and restrictions
  rules?: string | null;
  restrictions?: string | null;
  equipment_provided?: string[] | null;
  equipment_allowed?: string[] | null;
  equipment_prohibited?: string[] | null;
  
  // Maintenance
  last_maintenance?: string | null;
  next_maintenance?: string | null;
  maintenance_notes?: string | null;
  
  // Images and documents
  images?: string[];
  floor_plan?: string | null;
  documents?: string[];
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  // Audit fields
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  project?: SpaceProject | null;
  current_bookings?: SpaceBooking[];
  upcoming_bookings?: SpaceBooking[];
}

export interface CreateSpaceData {
  project_id?: string;
  name: string;
  kind: SpaceKind;
  status?: SpaceStatus;
  access_level?: SpaceAccessLevel;
  description?: string;
  location?: string;
  building?: string;
  floor?: string;
  room_number?: string;
  capacity?: number;
  max_capacity?: number;
  area_sqft?: number;
  length?: number;
  width?: number;
  height?: number;
  amenities?: SpaceAmenities;
  technical_specs?: SpaceTechnicalSpecs;
  is_bookable?: boolean;
  booking_advance_days?: number;
  min_booking_duration?: number;
  max_booking_duration?: number;
  hourly_rate?: number;
  daily_rate?: number;
  setup_time?: number;
  breakdown_time?: number;
  cleaning_time?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  rules?: string;
  restrictions?: string;
  equipment_provided?: string[];
  equipment_allowed?: string[];
  equipment_prohibited?: string[];
  images?: string[];
  floor_plan?: string;
  documents?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSpaceData {
  project_id?: string;
  name?: string;
  kind?: SpaceKind;
  status?: SpaceStatus;
  access_level?: SpaceAccessLevel;
  description?: string;
  location?: string;
  building?: string;
  floor?: string;
  room_number?: string;
  capacity?: number;
  max_capacity?: number;
  area_sqft?: number;
  length?: number;
  width?: number;
  height?: number;
  amenities?: SpaceAmenities;
  technical_specs?: SpaceTechnicalSpecs;
  is_bookable?: boolean;
  booking_advance_days?: number;
  min_booking_duration?: number;
  max_booking_duration?: number;
  hourly_rate?: number;
  daily_rate?: number;
  setup_time?: number;
  breakdown_time?: number;
  cleaning_time?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  rules?: string;
  restrictions?: string;
  equipment_provided?: string[];
  equipment_allowed?: string[];
  equipment_prohibited?: string[];
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_notes?: string;
  images?: string[];
  floor_plan?: string;
  documents?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SpaceFilters {
  project_id?: string;
  kind?: SpaceKind;
  status?: SpaceStatus;
  access_level?: SpaceAccessLevel;
  building?: string;
  floor?: string;
  search?: string;
  min_capacity?: number;
  max_capacity?: number;
  is_bookable?: boolean;
  available_from?: string;
  available_to?: string;
  has_amenities?: string[];
}

export interface SpaceSort {
  field: keyof ProgrammingSpace;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'timeline' | 'analytics';

// Status badge configurations
export const STATUS_BADGE = {
  available: { label: 'Available', variant: 'success' as const },
  occupied: { label: 'Occupied', variant: 'destructive' as const },
  reserved: { label: 'Reserved', variant: 'warning' as const },
  maintenance: { label: 'Maintenance', variant: 'secondary' as const },
  cleaning: { label: 'Cleaning', variant: 'info' as const },
  setup: { label: 'Setup', variant: 'warning' as const },
  breakdown: { label: 'Breakdown', variant: 'warning' as const },
  out_of_service: { label: 'Out of Service', variant: 'destructive' as const }
} as const;

// Access level badge configurations
export const ACCESS_LEVEL_BADGE = {
  public: { label: 'Public', variant: 'success' as const },
  restricted: { label: 'Restricted', variant: 'warning' as const },
  staff_only: { label: 'Staff Only', variant: 'secondary' as const },
  talent_only: { label: 'Talent Only', variant: 'info' as const },
  vip: { label: 'VIP', variant: 'destructive' as const },
  crew_only: { label: 'Crew Only', variant: 'default' as const },
  private: { label: 'Private', variant: 'destructive' as const }
} as const;

// Space kind configurations
export const SPACE_KIND_BADGE = {
  room: { label: 'Room', icon: '🏠' },
  green_room: { label: 'Green Room', icon: '🌿' },
  dressing_room: { label: 'Dressing Room', icon: '👗' },
  meeting_room: { label: 'Meeting Room', icon: '🤝' },
  classroom: { label: 'Classroom', icon: '🎓' },
  studio: { label: 'Studio', icon: '🎬' },
  rehearsal_room: { label: 'Rehearsal Room', icon: '🎭' },
  storage: { label: 'Storage', icon: '📦' },
  office: { label: 'Office', icon: '💼' },
  lounge: { label: 'Lounge', icon: '🛋️' },
  kitchen: { label: 'Kitchen', icon: '🍳' },
  bathroom: { label: 'Bathroom', icon: '🚿' },
  corridor: { label: 'Corridor', icon: '🚪' },
  lobby: { label: 'Lobby', icon: '🏛️' },
  stage: { label: 'Stage', icon: '🎪' },
  backstage: { label: 'Backstage', icon: '🎭' },
  loading_dock: { label: 'Loading Dock', icon: '🚛' },
  parking: { label: 'Parking', icon: '🅿️' },
  outdoor: { label: 'Outdoor', icon: '🌳' },
  other: { label: 'Other', icon: '📍' }
} as const;

// View configuration
export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  grid: { label: 'Grid', icon: 'Grid3X3' },
  timeline: { label: 'Timeline', icon: 'Calendar' },
  analytics: { label: 'Analytics', icon: 'BarChart3' }
} as const;

// Common amenities list
export const AMENITIES_LIST = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'air_conditioning', label: 'Air Conditioning' },
  { key: 'heating', label: 'Heating' },
  { key: 'lighting_control', label: 'Lighting Control' },
  { key: 'sound_system', label: 'Sound System' },
  { key: 'projection', label: 'Projection' },
  { key: 'whiteboard', label: 'Whiteboard' },
  { key: 'tables', label: 'Tables' },
  { key: 'chairs', label: 'Chairs' },
  { key: 'power_outlets', label: 'Power Outlets' },
  { key: 'windows', label: 'Windows' },
  { key: 'private_bathroom', label: 'Private Bathroom' },
  { key: 'kitchenette', label: 'Kitchenette' },
  { key: 'storage', label: 'Storage' },
  { key: 'security_camera', label: 'Security Camera' },
  { key: 'access_control', label: 'Access Control' },
] as const;

// Space analytics metrics
export interface SpaceAnalytics {
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  maintenanceSpaces: number;
  averageCapacity: number;
  totalCapacity: number;
  utilizationRate: number;
  spacesByKind: Array<{ kind: SpaceKind; count: number }>;
  spacesByStatus: Array<{ status: SpaceStatus; count: number }>;
  spacesByAccessLevel: Array<{ access_level: SpaceAccessLevel; count: number }>;
  spacesByBuilding: Array<{ building: string; count: number }>;
  spacesByFloor: Array<{ floor: string; count: number }>;
  bookingTrends: Array<{ date: string; bookings: number; utilization: number }>;
  popularSpaces: Array<{ space: string; bookings: number; utilization: number }>;
  revenueBySpace: Array<{ space: string; revenue: number }>;
}
