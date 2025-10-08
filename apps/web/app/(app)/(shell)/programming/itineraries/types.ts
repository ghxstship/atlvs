// Programming Itineraries - Comprehensive Type Definitions

export type ItineraryType = 
  | 'travel'
  | 'daily'
  | 'event'
  | 'tour'
  | 'business'
  | 'personal'
  | 'crew'
  | 'training';

export type ItineraryStatus = 
  | 'draft'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TransportationType = 
  | 'flight'
  | 'car'
  | 'train'
  | 'bus'
  | 'ship'
  | 'walking'
  | 'other';

export interface ItineraryDestination {
  name: string;
  address?: string;
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
}

export interface ItineraryAccommodation {
  name: string;
  address?: string;
  check_in?: string;
  check_out?: string;
  confirmation_number?: string;
  cost?: number;
}

export interface ItineraryTransportation {
  type: string;
  provider?: string;
  confirmation_number?: string;
  departure_time?: string;
  arrival_time?: string;
  cost?: number;
}

export interface ItineraryProject {
  id: string;
  name: string;
  status: string;
}

export interface ItineraryEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
}

export interface ProgrammingItinerary {
  id: string;
  name: string;
  description?: string | null;
  type: ItineraryType;
  status: ItineraryStatus;
  start_date: string;
  end_date: string;
  location?: string | null;
  transportation_type?: TransportationType | null;
  total_cost?: number | null;
  currency?: string | null;
  participants_count?: number | null;
  project_id?: string | null;
  event_id?: string | null;
  destinations: ItineraryDestination[];
  accommodations: ItineraryAccommodation[];
  transportation: ItineraryTransportation[];
  tags: string[];
  metadata: Record<string, unknown>;
  organization_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  project?: ItineraryProject | null;
  event?: ItineraryEvent | null;
}

export interface CreateItineraryData {
  name: string;
  description?: string;
  type: ItineraryType;
  status?: ItineraryStatus;
  start_date: string;
  end_date: string;
  location?: string;
  transportation_type?: TransportationType;
  total_cost?: number;
  currency?: string;
  participants_count?: number;
  project_id?: string;
  event_id?: string;
  destinations?: ItineraryDestination[];
  accommodations?: ItineraryAccommodation[];
  transportation?: ItineraryTransportation[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateItineraryData {
  name?: string;
  description?: string;
  type?: ItineraryType;
  status?: ItineraryStatus;
  start_date?: string;
  end_date?: string;
  location?: string;
  transportation_type?: TransportationType;
  total_cost?: number;
  currency?: string;
  participants_count?: number;
  project_id?: string;
  event_id?: string;
  destinations?: ItineraryDestination[];
  accommodations?: ItineraryAccommodation[];
  transportation?: ItineraryTransportation[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ItineraryFilters {
  project_id?: string;
  event_id?: string;
  status?: ItineraryStatus;
  type?: ItineraryType;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface ItinerarySort {
  field: keyof ProgrammingItinerary;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'timeline' | 'calendar' | 'map';

// Status badge configurations
export const STATUS_BADGE = {
  draft: { label: 'Draft', variant: 'default' as const },
  confirmed: { label: 'Confirmed', variant: 'info' as const },
  in_progress: { label: 'In Progress', variant: 'warning' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const }
} as const;

// Type badge configurations
export const TYPE_BADGE = {
  travel: { label: 'Travel', icon: '✈️' },
  daily: { label: 'Daily', icon: '📅' },
  event: { label: 'Event', icon: '🎭' },
  tour: { label: 'Tour', icon: '🗺️' },
  business: { label: 'Business', icon: '💼' },
  personal: { label: 'Personal', icon: '👤' },
  crew: { label: 'Crew', icon: '👥' },
  training: { label: 'Training', icon: '🎓' }
} as const;

// Transportation type labels
export const TRANSPORTATION_TYPE_LABEL = {
  flight: 'Flight',
  car: 'Car',
  train: 'Train',
  bus: 'Bus',
  ship: 'Ship',
  walking: 'Walking',
  other: 'Other'
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
  timeline: { label: 'Timeline', icon: 'Calendar' },
  calendar: { label: 'Calendar', icon: 'CalendarDays' },
  map: { label: 'Map', icon: 'Map' }
} as const;
