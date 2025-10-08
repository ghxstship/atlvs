import { z } from 'zod';

// Core Programming Entities
export interface ProgrammingEvent {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  type: 'performance' | 'workshop' | 'rehearsal' | 'meeting' | 'other';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  start_date: Date;
  end_date: Date;
  location?: string;
  capacity?: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Performance {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  venue?: string;
  date: Date;
  duration?: number;
  status: 'planned' | 'rehearsing' | 'ready' | 'performed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface CallSheet {
  id: string;
  organization_id: string;
  event_id?: string;
  performance_id?: string;
  title: string;
  date: Date;
  location: string;
  call_time: Date;
  status: 'draft' | 'published' | 'completed';
  content: CallSheetContent;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Rider {
  id: string;
  organization_id: string;
  type: 'technical' | 'hospitality' | 'catering';
  title: string;
  description?: string;
  requirements: RiderRequirement[];
  status: 'draft' | 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Itinerary {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  destinations: Destination[];
  transportation: Transportation[];
  accommodations: Accommodation[];
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Lineup {
  id: string;
  organization_id: string;
  event_id?: string;
  performance_id?: string;
  title: string;
  description?: string;
  acts: Act[];
  set_times: SetTime[];
  status: 'draft' | 'confirmed' | 'published';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Space {
  id: string;
  organization_id: string;
  name: string;
  type: 'venue' | 'stage' | 'backstage' | 'green_room' | 'dressing_room' | 'storage';
  capacity?: number;
  location: string;
  amenities: string[];
  availability: Availability[];
  status: 'active' | 'maintenance' | 'inactive';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Workshop {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  instructor: string;
  start_date: Date;
  end_date: Date;
  capacity?: number;
  prerequisites?: string[];
  materials: WorkshopMaterial[];
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

// Supporting Types
export interface CallSheetContent {
  crew_call: Date;
  performers_call: Date;
  doors_open: Date;
  show_start: Date;
  intermission?: Date;
  show_end: Date;
  notes?: string;
  departments: DepartmentCall[];
}

export interface DepartmentCall {
  department: string;
  call_time: Date;
  location: string;
  notes?: string;
}

export interface RiderRequirement {
  category: string;
  item: string;
  quantity?: number;
  specification?: string;
  priority: 'required' | 'preferred' | 'optional';
}

export interface Destination {
  name: string;
  arrival_date: Date;
  departure_date: Date;
  purpose: string;
  notes?: string;
}

export interface Transportation {
  type: 'flight' | 'bus' | 'train' | 'car' | 'other';
  provider: string;
  confirmation_number?: string;
  departure_date: Date;
  arrival_date: Date;
  details: string;
}

export interface Accommodation {
  name: string;
  address: string;
  check_in: Date;
  check_out: Date;
  confirmation_number?: string;
  room_type?: string;
  notes?: string;
}

export interface Act {
  id: string;
  name: string;
  type: 'artist' | 'band' | 'performer' | 'group';
  genre?: string;
  duration?: number;
  requirements?: string[];
  contact_info?: ContactInfo;
}

export interface SetTime {
  act_id: string;
  start_time: Date;
  end_time: Date;
  notes?: string;
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  agent?: string;
}

export interface Availability {
  day_of_week: number; // 0-6, Sunday = 0
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
}

export interface WorkshopMaterial {
  name: string;
  type: 'provided' | 'participant';
  description?: string;
  quantity?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SearchFilters {
  search?: string;
  status?: string[];
  type?: string[];
  date_from?: Date;
  date_to?: Date;
  location?: string;
  capacity_min?: number;
  capacity_max?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface CreateEventForm {
  title: string;
  description?: string;
  type: ProgrammingEvent['type'];
  start_date: Date;
  end_date: Date;
  location?: string;
  capacity?: number;
}

export interface UpdateEventForm extends Partial<CreateEventForm> {
  id: string;
  status?: ProgrammingEvent['status'];
}

export interface BulkActionRequest {
  ids: string[];
  action: 'delete' | 'update_status' | 'export' | 'duplicate';
  data?: Record<string, any>;
}

// Export/Import Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields: string[];
  filters?: SearchFilters;
  include_related?: boolean;
}

export interface ImportResult {
  success: boolean;
  total_processed: number;
  successful: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  error: string;
  data?: Record<string, any>;
}

// Real-time Types
export interface RealtimeEvent {
  type: 'create' | 'update' | 'delete' | 'bulk_update';
  entity: string;
  id: string | string[];
  data?: unknown;
  timestamp: Date;
  user_id: string;
}

// Permission Types
export interface PermissionCheck {
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';
  entity: string;
  resource_id?: string;
  user_id: string;
  organization_id: string;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  required_role?: string[];
}

// Validation Types
export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  type: z.enum(['performance', 'workshop', 'rehearsal', 'meeting', 'other']),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  capacity: z.number().int().positive().optional()
});

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional()
});

export const SearchFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  location: z.string().optional(),
  capacity_min: z.number().int().positive().optional(),
  capacity_max: z.number().int().positive().optional()
});

// UI State Types
export interface ViewState {
  currentView: 'table' | 'card' | 'list' | 'kanban' | 'calendar' | 'gallery' | 'timeline' | 'chart' | 'gantt' | 'form';
  filters: SearchFilters;
  sort: SortOptions;
  pagination: {
    page: number;
    limit: number;
  };
  selectedIds: string[];
  expandedRows: string[];
}

export interface DrawerState {
  isOpen: boolean;
  type: 'detail' | 'edit' | 'create' | 'bulk' | 'import' | 'export' | 'history' | null;
  data?: unknown;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Constants
export const EVENT_TYPES = [
  { value: 'performance', label: 'Performance' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'rehearsal', label: 'Rehearsal' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const PERFORMANCE_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'rehearsing', label: 'Rehearsing' },
  { value: 'ready', label: 'Ready' },
  { value: 'performed', label: 'Performed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// Utility Types
export type ProgrammingEntity = ProgrammingEvent | Performance | CallSheet | Rider | Itinerary | Lineup | Space | Workshop;
export type EntityType = 'events' | 'performances' | 'call-sheets' | 'riders' | 'itineraries' | 'lineups' | 'spaces' | 'workshops';
