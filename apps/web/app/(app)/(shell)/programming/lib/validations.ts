/**
 * Programming Module Validation Schemas
 * Zod schemas for all data validation
 */
import { z } from 'zod';

// Base schemas
const uuidSchema = z.string().uuid();
const emailSchema = z.string().email();
const urlSchema = z.string().url().optional();
const positiveIntegerSchema = z.number().int().positive();
const nonEmptyStringSchema = z.string().min(1, 'This field is required');

// Date and time schemas
const dateSchema = z.date();
const isoDateStringSchema = z.string().datetime();

// Event validation schemas
export const CreateEventSchema = z.object({
  title: nonEmptyStringSchema.max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  type: z.enum(['performance', 'workshop', 'rehearsal', 'meeting', 'other']),
  start_date: dateSchema,
  end_date: dateSchema,
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  capacity: positiveIntegerSchema.max(10000, 'Capacity cannot exceed 10,000').optional()
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional()
});

export const EventFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(['scheduled', 'in-progress', 'completed', 'cancelled'])).optional(),
  type: z.array(z.enum(['performance', 'workshop', 'rehearsal', 'meeting', 'other'])).optional(),
  date_from: dateSchema.optional(),
  date_to: dateSchema.optional(),
  location: z.string().optional(),
  capacity_min: positiveIntegerSchema.optional(),
  capacity_max: positiveIntegerSchema.optional()
});

// Performance validation schemas
export const CreatePerformanceSchema = z.object({
  title: nonEmptyStringSchema.max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  venue: z.string().max(500, 'Venue must be less than 500 characters').optional(),
  date: dateSchema,
  duration: positiveIntegerSchema.max(480, 'Duration cannot exceed 8 hours (480 minutes)').optional()
});

export const UpdatePerformanceSchema = CreatePerformanceSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['planned', 'rehearsing', 'ready', 'performed', 'cancelled']).optional()
});

export const PerformanceFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(['planned', 'rehearsing', 'ready', 'performed', 'cancelled'])).optional(),
  date_from: dateSchema.optional(),
  date_to: dateSchema.optional(),
  venue: z.string().optional()
});

// Call Sheet validation schemas
export const DepartmentCallSchema = z.object({
  department: nonEmptyStringSchema.max(100, 'Department name too long'),
  call_time: isoDateStringSchema,
  location: nonEmptyStringSchema.max(200, 'Location too long'),
  notes: z.string().max(500, 'Notes too long').optional()
});

export const CallSheetContentSchema = z.object({
  crew_call: isoDateStringSchema,
  performers_call: isoDateStringSchema,
  doors_open: isoDateStringSchema,
  show_start: isoDateStringSchema,
  intermission: isoDateStringSchema.optional(),
  show_end: isoDateStringSchema,
  notes: z.string().max(1000, 'Notes too long').optional(),
  departments: z.array(DepartmentCallSchema).max(20, 'Too many departments')
});

export const CreateCallSheetSchema = z.object({
  event_id: uuidSchema.optional(),
  performance_id: uuidSchema.optional(),
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  date: dateSchema,
  location: nonEmptyStringSchema.max(500, 'Location too long'),
  call_time: isoDateStringSchema,
  content: CallSheetContentSchema
}).refine((data) => data.event_id || data.performance_id, {
  message: 'Call sheet must be associated with either an event or performance'
});

export const UpdateCallSheetSchema = CreateCallSheetSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['draft', 'published', 'completed']).optional()
});

// Rider validation schemas
export const RiderRequirementSchema = z.object({
  category: nonEmptyStringSchema.max(100, 'Category too long'),
  item: nonEmptyStringSchema.max(200, 'Item name too long'),
  quantity: positiveIntegerSchema.optional(),
  specification: z.string().max(500, 'Specification too long').optional(),
  priority: z.enum(['required', 'preferred', 'optional'])
});

export const CreateRiderSchema = z.object({
  type: z.enum(['technical', 'hospitality', 'catering']),
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  requirements: z.array(RiderRequirementSchema).max(50, 'Too many requirements')
});

export const UpdateRiderSchema = CreateRiderSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['draft', 'active', 'archived']).optional()
});

// Itinerary validation schemas
export const DestinationSchema = z.object({
  name: nonEmptyStringSchema.max(200, 'Destination name too long'),
  arrival_date: dateSchema,
  departure_date: dateSchema,
  purpose: nonEmptyStringSchema.max(500, 'Purpose too long'),
  notes: z.string().max(1000, 'Notes too long').optional()
}).refine((data) => data.departure_date >= data.arrival_date, {
  message: 'Departure date must be after arrival date',
  path: ['departure_date']
});

export const TransportationSchema = z.object({
  type: z.enum(['flight', 'bus', 'train', 'car', 'other']),
  provider: nonEmptyStringSchema.max(200, 'Provider name too long'),
  confirmation_number: z.string().max(100, 'Confirmation number too long').optional(),
  departure_date: isoDateStringSchema,
  arrival_date: isoDateStringSchema,
  details: nonEmptyStringSchema.max(1000, 'Details too long')
});

export const AccommodationSchema = z.object({
  name: nonEmptyStringSchema.max(200, 'Name too long'),
  address: nonEmptyStringSchema.max(500, 'Address too long'),
  check_in: dateSchema,
  check_out: dateSchema,
  confirmation_number: z.string().max(100, 'Confirmation number too long').optional(),
  room_type: z.string().max(100, 'Room type too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
}).refine((data) => data.check_out >= data.check_in, {
  message: 'Check-out date must be after check-in date',
  path: ['check_out']
});

export const CreateItinerarySchema = z.object({
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  start_date: dateSchema,
  end_date: dateSchema,
  destinations: z.array(DestinationSchema).min(1, 'At least one destination required').max(20, 'Too many destinations'),
  transportation: z.array(TransportationSchema).max(50, 'Too many transportation entries'),
  accommodations: z.array(AccommodationSchema).max(50, 'Too many accommodation entries')
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const UpdateItinerarySchema = CreateItinerarySchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['planned', 'confirmed', 'in-progress', 'completed']).optional()
});

// Lineup validation schemas
export const ContactInfoSchema = z.object({
  name: nonEmptyStringSchema.max(200, 'Name too long'),
  email: emailSchema.optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  agent: z.string().max(200, 'Agent name too long').optional()
});

export const ActSchema = z.object({
  id: z.string().uuid(),
  name: nonEmptyStringSchema.max(200, 'Act name too long'),
  type: z.enum(['artist', 'band', 'performer', 'group']),
  genre: z.string().max(100, 'Genre too long').optional(),
  duration: positiveIntegerSchema.max(480, 'Duration too long').optional(),
  requirements: z.array(z.string().max(200, 'Requirement too long')).max(20, 'Too many requirements'),
  contact_info: ContactInfoSchema.optional()
});

export const SetTimeSchema = z.object({
  act_id: z.string().uuid(),
  start_time: isoDateStringSchema,
  end_time: isoDateStringSchema,
  notes: z.string().max(500, 'Notes too long').optional()
});

export const CreateLineupSchema = z.object({
  event_id: uuidSchema.optional(),
  performance_id: uuidSchema.optional(),
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  acts: z.array(ActSchema).min(1, 'At least one act required').max(50, 'Too many acts'),
  set_times: z.array(SetTimeSchema).min(1, 'At least one set time required').max(100, 'Too many set times')
}).refine((data) => data.event_id || data.performance_id, {
  message: 'Lineup must be associated with either an event or performance'
});

export const UpdateLineupSchema = CreateLineupSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['draft', 'confirmed', 'published']).optional()
});

// Space validation schemas
export const AvailabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  is_available: z.boolean()
});

export const CreateSpaceSchema = z.object({
  name: nonEmptyStringSchema.max(200, 'Name too long'),
  type: z.enum(['venue', 'stage', 'backstage', 'green_room', 'dressing_room', 'storage']),
  capacity: positiveIntegerSchema.max(10000, 'Capacity too high').optional(),
  location: nonEmptyStringSchema.max(500, 'Location too long'),
  amenities: z.array(z.string().max(100, 'Amenity name too long')).max(50, 'Too many amenities'),
  availability: z.array(AvailabilitySchema).max(7, 'Too many availability entries')
});

export const UpdateSpaceSchema = CreateSpaceSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['active', 'maintenance', 'inactive']).optional()
});

// Workshop validation schemas
export const WorkshopMaterialSchema = z.object({
  name: nonEmptyStringSchema.max(200, 'Material name too long'),
  type: z.enum(['provided', 'participant']),
  description: z.string().max(500, 'Description too long').optional(),
  quantity: positiveIntegerSchema.max(1000, 'Quantity too high').optional()
});

export const CreateWorkshopSchema = z.object({
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  instructor: nonEmptyStringSchema.max(200, 'Instructor name too long'),
  start_date: dateSchema,
  end_date: dateSchema,
  capacity: positiveIntegerSchema.max(1000, 'Capacity too high').optional(),
  prerequisites: z.array(z.string().max(500, 'Prerequisite too long')).max(20, 'Too many prerequisites'),
  materials: z.array(WorkshopMaterialSchema).max(50, 'Too many materials')
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date']
});

export const UpdateWorkshopSchema = CreateWorkshopSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(['planned', 'confirmed', 'in-progress', 'completed', 'cancelled']).optional()
});

// Bulk operation schemas
export const BulkActionSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one item required').max(1000, 'Too many items'),
  action: z.enum(['delete', 'update_status', 'export', 'duplicate']),
  data: z.record(z.any()).optional()
});

// Export/Import schemas
export const ExportOptionsSchema = z.object({
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
  fields: z.array(z.string()).min(1, 'At least one field required'),
  filters: z.record(z.any()).optional(),
  include_related: z.boolean().optional()
});

export const ImportResultSchema = z.object({
  success: z.boolean(),
  total_processed: z.number().int().min(0),
  successful: z.number().int().min(0),
  failed: z.number().int().min(0),
  errors: z.array(z.object({
    row: z.number().int().min(1),
    field: z.string().optional(),
    error: z.string(),
    data: z.record(z.any()).optional()
  }))
});

// Permission schemas
export const PermissionCheckSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'export', 'import']),
  entity: z.enum(['events', 'performances', 'call-sheets', 'riders', 'itineraries', 'lineups', 'spaces', 'workshops']),
  resource_id: uuidSchema.optional(),
  user_id: uuidSchema,
  organization_id: uuidSchema
});

export const PermissionResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  required_role: z.array(z.string()).optional()
});

// Search and filter schemas
export const SortOptionsSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc'])
});

export const PaginationSchema = z.object({
  page: positiveIntegerSchema.default(1),
  limit: positiveIntegerSchema.max(1000).default(20)
});

// API response schemas
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  success: z.boolean(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional()
});

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    total_pages: z.number().int().positive()
  })
});

// Validation helper functions
export const validateEventData = (data: unknown) => {
  return CreateEventSchema.safeParse(data);
};

export const validatePerformanceData = (data: unknown) => {
  return CreatePerformanceSchema.safeParse(data);
};

export const validateCallSheetData = (data: unknown) => {
  return CreateCallSheetSchema.safeParse(data);
};

export const validateRiderData = (data: unknown) => {
  return CreateRiderSchema.safeParse(data);
};

export const validateItineraryData = (data: unknown) => {
  return CreateItinerarySchema.safeParse(data);
};

export const validateLineupData = (data: unknown) => {
  return CreateLineupSchema.safeParse(data);
};

export const validateSpaceData = (data: unknown) => {
  return CreateSpaceSchema.safeParse(data);
};

export const validateWorkshopData = (data: unknown) => {
  return CreateWorkshopSchema.safeParse(data);
};

// Type exports
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventFilters = z.infer<typeof EventFilterSchema>;
export type CreatePerformanceInput = z.infer<typeof CreatePerformanceSchema>;
export type UpdatePerformanceInput = z.infer<typeof UpdatePerformanceSchema>;
export type PerformanceFilters = z.infer<typeof PerformanceFilterSchema>;
export type CreateCallSheetInput = z.infer<typeof CreateCallSheetSchema>;
export type UpdateCallSheetInput = z.infer<typeof UpdateCallSheetSchema>;
export type CreateRiderInput = z.infer<typeof CreateRiderSchema>;
export type UpdateRiderInput = z.infer<typeof UpdateRiderSchema>;
export type CreateItineraryInput = z.infer<typeof CreateItinerarySchema>;
export type UpdateItineraryInput = z.infer<typeof UpdateItinerarySchema>;
export type CreateLineupInput = z.infer<typeof CreateLineupSchema>;
export type UpdateLineupInput = z.infer<typeof UpdateLineupSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceSchema>;
export type CreateWorkshopInput = z.infer<typeof CreateWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof UpdateWorkshopSchema>;
export type BulkActionInput = z.infer<typeof BulkActionSchema>;
export type ExportOptionsInput = z.infer<typeof ExportOptionsSchema>;
export type ImportResultOutput = z.infer<typeof ImportResultSchema>;
export type PermissionCheckInput = z.infer<typeof PermissionCheckSchema>;
export type PermissionResultOutput = z.infer<typeof PermissionResultSchema>;
export type SortOptionsInput = z.infer<typeof SortOptionsSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
