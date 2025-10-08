// Projects Module - Type Definitions
// Centralized type definitions for the Projects module and all submodules

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  currency?: string;
  starts_at?: string;
  ends_at?: string;
  client_id?: string;
  manager_id?: string;
  location?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee_id?: string;
  reporter_id?: string;
  parent_task_id?: string;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  tags?: string[];
  dependencies?: string[];
  attachments?: string[];
  position: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectFile {
  id: string;
  project_id?: string;
  organization_id: string;
  name: string;
  description?: string;
  file_url: string;
  file_size: number;
  file_type: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'drawing' | 'specification' | 'report' | 'other';
  version: string;
  is_latest: boolean;
  uploaded_by: string;
  tags: string[];
  access_level: 'public' | 'team' | 'restricted';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectActivation {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'ready' | 'active' | 'completed' | 'cancelled';
  activation_type: 'soft_launch' | 'beta' | 'full_launch' | 'pilot' | 'rollout';
  project_id?: string;
  scheduled_date?: string;
  actual_date?: string;
  completion_date?: string;
  location?: string;
  budget?: number;
  actual_cost?: number;
  success_metrics?: Record<string, unknown>;
  stakeholders?: string[];
  dependencies?: string[];
  risks?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description: string;
  category: 'technical' | 'financial' | 'operational' | 'strategic' | 'compliance' | 'external';
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  risk_score: number;
  status: 'identified' | 'assessed' | 'mitigating' | 'monitoring' | 'closed';
  owner_id?: string;
  mitigation_plan?: string;
  contingency_plan?: string;
  review_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectInspection {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description?: string;
  type: 'safety' | 'quality' | 'compliance' | 'progress' | 'final' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  inspector_id?: string;
  scheduled_date: string;
  completed_date?: string;
  location?: string;
  checklist_items?: InspectionChecklistItem[];
  findings?: string;
  recommendations?: string;
  photos?: string[];
  documents?: string[];
  score?: number;
  passed: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface InspectionChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  required: boolean;
  status: 'pending' | 'passed' | 'failed' | 'na';
  notes?: string;
  photos?: string[];
}

export interface ProjectLocation {
  id: string;
  project_id?: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'venue' | 'office' | 'warehouse' | 'site' | 'remote' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  facilities?: string[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner_id?: string;
  dependencies?: string[];
  deliverables?: string[];
  success_criteria?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Common interfaces
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

// View and UI types
export type ViewType = 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean' | 'currency';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form types
export interface CreateProjectData {
  name: string;
  description?: string;
  status?: Project['status'];
  priority?: Project['priority'];
  budget?: number;
  currency?: string;
  starts_at?: string;
  ends_at?: string;
  client_id?: string;
  manager_id?: string;
  location?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

// Export all types for easy importing
export type {
  Project,
  ProjectTask,
  ProjectFile,
  ProjectActivation,
  ProjectRisk,
  ProjectInspection,
  InspectionChecklistItem,
  ProjectLocation,
  ProjectMilestone,
  User,
  Organization,
  ViewType,
  FieldConfig,
  FilterConfig,
  SortConfig,
  ApiResponse,
  PaginatedResponse,
  CreateProjectData,
  UpdateProjectData
};
