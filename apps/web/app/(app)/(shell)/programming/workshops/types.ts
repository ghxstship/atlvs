// Programming Workshops - Comprehensive Type Definitions

export type WorkshopStatus = 
  | 'planning'
  | 'open_registration'
  | 'registration_closed'
  | 'full'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type WorkshopSkillLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'all_levels';

export type WorkshopCategory = 
  | 'technical'
  | 'creative'
  | 'business'
  | 'leadership'
  | 'production'
  | 'design'
  | 'marketing'
  | 'finance'
  | 'legal'
  | 'other';

export type WorkshopFormat = 
  | 'in_person'
  | 'virtual'
  | 'hybrid';

export type WorkshopType = 
  | 'workshop'
  | 'masterclass'
  | 'seminar'
  | 'bootcamp'
  | 'training'
  | 'certification'
  | 'conference'
  | 'panel';

export interface WorkshopInstructor {
  id: string;
  name: string;
  full_name?: string | null;
  email?: string;
  bio?: string;
  avatar_url?: string;
  credentials?: string[];
  specialties?: string[];
  rating?: number;
  total_workshops?: number;
}

export interface WorkshopMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'link' | 'other';
  url: string;
  description?: string;
  required: boolean;
  order: number;
}

export interface WorkshopSession {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  instructor_id?: string;
  materials?: WorkshopMaterial[];
  notes?: string;
}

export interface WorkshopParticipant {
  id: string;
  user_id: string;
  workshop_id: string;
  registered_at: string;
  status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded' | 'waived';
  notes?: string;
  feedback?: {
    rating?: number;
    comment?: string;
    submitted_at?: string;
  };
}

export interface WorkshopEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
  venue?: string;
}

export interface WorkshopProject {
  id: string;
  name: string;
  status: string;
}

export interface ProgrammingWorkshop {
  id: string;
  organization_id: string;
  project_id?: string | null;
  event_id?: string | null;
  
  // Basic information
  title: string;
  description?: string | null;
  category: WorkshopCategory;
  type: WorkshopType;
  status: WorkshopStatus;
  skill_level: WorkshopSkillLevel;
  
  // Scheduling
  start_date: string;
  end_date?: string | null;
  duration_minutes?: number | null;
  timezone?: string | null;
  
  // Format and delivery
  format: WorkshopFormat;
  location?: string | null;
  venue?: string | null;
  virtual_link?: string | null;
  recording_url?: string | null;
  
  // Capacity and registration
  max_participants?: number | null;
  min_participants?: number | null;
  current_participants: number;
  waitlist_count: number;
  registration_deadline?: string | null;
  registration_opens_at?: string | null;
  
  // Pricing
  price?: number | null;
  currency?: string | null;
  early_bird_price?: number | null;
  early_bird_deadline?: string | null;
  member_discount?: number | null;
  
  // Content and materials
  objectives?: string[] | null;
  prerequisites?: string[] | null;
  materials_provided?: string[] | null;
  materials_required?: string[] | null;
  agenda?: string | null;
  
  // Instructors and staff
  primary_instructor_id?: string | null;
  co_instructors?: string[] | null;
  assistants?: string[] | null;
  
  // Assessment and certification
  has_assessment: boolean;
  assessment_type?: 'quiz' | 'project' | 'presentation' | 'practical' | null;
  certification_available: boolean;
  certification_criteria?: string | null;
  
  // Feedback and evaluation
  feedback_form_url?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  
  // Administrative
  internal_notes?: string | null;
  public_notes?: string | null;
  cancellation_policy?: string | null;
  refund_policy?: string | null;
  
  // Media and promotion
  featured_image?: string | null;
  gallery_images?: string[] | null;
  promotional_video?: string | null;
  social_media_links?: Record<string, string> | null;
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  // Audit fields
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  project?: WorkshopProject | null;
  event?: WorkshopEvent | null;
  primary_instructor?: WorkshopInstructor | null;
  sessions?: WorkshopSession[] | null;
  participants?: WorkshopParticipant[] | null;
}

export interface CreateWorkshopData {
  project_id?: string;
  event_id?: string;
  title: string;
  description?: string;
  category: WorkshopCategory;
  type?: WorkshopType;
  status?: WorkshopStatus;
  skill_level?: WorkshopSkillLevel;
  start_date: string;
  end_date?: string;
  duration_minutes?: number;
  timezone?: string;
  format?: WorkshopFormat;
  location?: string;
  venue?: string;
  virtual_link?: string;
  max_participants?: number;
  min_participants?: number;
  registration_deadline?: string;
  registration_opens_at?: string;
  price?: number;
  currency?: string;
  early_bird_price?: number;
  early_bird_deadline?: string;
  member_discount?: number;
  objectives?: string[];
  prerequisites?: string[];
  materials_provided?: string[];
  materials_required?: string[];
  agenda?: string;
  primary_instructor_id?: string;
  co_instructors?: string[];
  assistants?: string[];
  has_assessment?: boolean;
  assessment_type?: 'quiz' | 'project' | 'presentation' | 'practical';
  certification_available?: boolean;
  certification_criteria?: string;
  internal_notes?: string;
  public_notes?: string;
  cancellation_policy?: string;
  refund_policy?: string;
  featured_image?: string;
  gallery_images?: string[];
  promotional_video?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkshopData {
  project_id?: string;
  event_id?: string;
  title?: string;
  description?: string;
  category?: WorkshopCategory;
  type?: WorkshopType;
  status?: WorkshopStatus;
  skill_level?: WorkshopSkillLevel;
  start_date?: string;
  end_date?: string;
  duration_minutes?: number;
  timezone?: string;
  format?: WorkshopFormat;
  location?: string;
  venue?: string;
  virtual_link?: string;
  max_participants?: number;
  min_participants?: number;
  registration_deadline?: string;
  registration_opens_at?: string;
  price?: number;
  currency?: string;
  early_bird_price?: number;
  early_bird_deadline?: string;
  member_discount?: number;
  objectives?: string[];
  prerequisites?: string[];
  materials_provided?: string[];
  materials_required?: string[];
  agenda?: string;
  primary_instructor_id?: string;
  co_instructors?: string[];
  assistants?: string[];
  has_assessment?: boolean;
  assessment_type?: 'quiz' | 'project' | 'presentation' | 'practical';
  certification_available?: boolean;
  certification_criteria?: string;
  internal_notes?: string;
  public_notes?: string;
  cancellation_policy?: string;
  refund_policy?: string;
  featured_image?: string;
  gallery_images?: string[];
  promotional_video?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkshopFilters {
  project_id?: string;
  event_id?: string;
  category?: WorkshopCategory;
  type?: WorkshopType;
  status?: WorkshopStatus;
  skill_level?: WorkshopSkillLevel;
  format?: WorkshopFormat;
  instructor_id?: string;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
  price_min?: number;
  price_max?: number;
  has_availability?: boolean;
  certification_available?: boolean;
  tags?: string[];
}

export interface WorkshopSort {
  field: keyof ProgrammingWorkshop;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'grid' | 'timeline' | 'analytics';

// Status badge configurations
export const STATUS_BADGE = {
  planning: { label: 'Planning', variant: 'secondary' as const },
  open_registration: { label: 'Open Registration', variant: 'success' as const },
  registration_closed: { label: 'Registration Closed', variant: 'warning' as const },
  full: { label: 'Full', variant: 'destructive' as const },
  in_progress: { label: 'In Progress', variant: 'info' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
  postponed: { label: 'Postponed', variant: 'warning' as const },
} as const;

// Skill level badge configurations
export const SKILL_LEVEL_BADGE = {
  beginner: { label: 'Beginner', variant: 'success' as const },
  intermediate: { label: 'Intermediate', variant: 'warning' as const },
  advanced: { label: 'Advanced', variant: 'destructive' as const },
  expert: { label: 'Expert', variant: 'destructive' as const },
  all_levels: { label: 'All Levels', variant: 'default' as const },
} as const;

// Category configurations
export const CATEGORY_BADGE = {
  technical: { label: 'Technical', icon: '⚙️' },
  creative: { label: 'Creative', icon: '🎨' },
  business: { label: 'Business', icon: '💼' },
  leadership: { label: 'Leadership', icon: '👑' },
  production: { label: 'Production', icon: '🎬' },
  design: { label: 'Design', icon: '🎨' },
  marketing: { label: 'Marketing', icon: '📢' },
  finance: { label: 'Finance', icon: '💰' },
  legal: { label: 'Legal', icon: '⚖️' },
  other: { label: 'Other', icon: '📚' },
} as const;

// Format configurations
export const FORMAT_BADGE = {
  in_person: { label: 'In Person', variant: 'success' as const, icon: '🏢' },
  virtual: { label: 'Virtual', variant: 'info' as const, icon: '💻' },
  hybrid: { label: 'Hybrid', variant: 'warning' as const, icon: '🔄' },
} as const;

// Type configurations
export const TYPE_BADGE = {
  workshop: { label: 'Workshop', icon: '🛠️' },
  masterclass: { label: 'Masterclass', icon: '🎓' },
  seminar: { label: 'Seminar', icon: '📚' },
  bootcamp: { label: 'Bootcamp', icon: '🏃' },
  training: { label: 'Training', icon: '📖' },
  certification: { label: 'Certification', icon: '🏆' },
  conference: { label: 'Conference', icon: '🎤' },
  panel: { label: 'Panel', icon: '👥' },
} as const;

// View configuration
export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  grid: { label: 'Grid', icon: 'Grid3X3' },
  timeline: { label: 'Timeline', icon: 'Calendar' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
} as const;

// Workshop analytics metrics
export interface WorkshopAnalytics {
  totalWorkshops: number;
  activeWorkshops: number;
  completedWorkshops: number;
  cancelledWorkshops: number;
  totalParticipants: number;
  averageParticipants: number;
  totalRevenue: number;
  averageRating: number;
  workshopsByCategory: Array<{ category: WorkshopCategory; count: number }>;
  workshopsByStatus: Array<{ status: WorkshopStatus; count: number }>;
  workshopsBySkillLevel: Array<{ skill_level: WorkshopSkillLevel; count: number }>;
  workshopsByFormat: Array<{ format: WorkshopFormat; count: number }>;
  monthlyTrends: Array<{ month: string; workshops: number; participants: number; revenue: number }>;
  topInstructors: Array<{ instructor: string; workshops: number; rating: number }>;
  popularCategories: Array<{ category: string; participants: number; rating: number }>;
  revenueByWorkshop: Array<{ workshop: string; revenue: number; participants: number }>;
}
