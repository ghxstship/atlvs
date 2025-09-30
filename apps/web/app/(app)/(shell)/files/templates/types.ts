// Templates - Type Definitions
// Specialized type definitions for document templates and forms

export interface Template {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  content: string;
  template_type: 'document' | 'form' | 'email' | 'report' | 'contract' | 'presentation' | 'other';
  category: string;
  version: string;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  thumbnail_url?: string | null;
  tags: string[];
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
    label: string;
    description?: string;
    required: boolean;
    default_value?: unknown;
    options?: string[]; // For select/multiselect
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  usage_count: number;
  access_level: 'public' | 'team' | 'restricted' | 'private';
  project_id?: string | null;
  folder_id?: string | null;
  status: 'draft' | 'active' | 'archived';
  is_featured: boolean;
  language: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CreateTemplateData {
  title: string;
  description?: string;
  content: string;
  template_type: Template['template_type'];
  category: string;
  version?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  thumbnail_url?: string;
  tags?: string[];
  variables?: Template['variables'];
  access_level?: Template['access_level'];
  project_id?: string;
  folder_id?: string;
  is_featured?: boolean;
  language?: string;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  id: string;
  status?: Template['status'];
}

export interface TemplateFilters {
  template_type?: Template['template_type'];
  category?: string;
  status?: Template['status'];
  access_level?: Template['access_level'];
  project_id?: string;
  folder_id?: string;
  is_featured?: boolean;
  language?: string;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  usage_range?: {
    min: number;
    max: number;
  };
}

export interface TemplateStats {
  total_templates: number;
  active_templates: number;
  draft_templates: number;
  featured_templates: number;
  total_usage: number;
  by_type: Array<{
    type: Template['template_type'];
    count: number;
    usage: number;
  }>;
  by_category: Array<{
    category: string;
    count: number;
    usage: number;
  }>;
  popular_templates: Array<{
    id: string;
    title: string;
    usage_count: number;
  }>;
}

export interface TemplateInstance {
  id: string;
  template_id: string;
  user_id: string;
  title: string;
  generated_content: string;
  variable_values: Record<string, unknown>;
  file_url?: string;
  status: 'draft' | 'completed' | 'shared';
  created_at: string;
  updated_at: string;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  action: 'view' | 'download' | 'generate' | 'share';
  metadata?: Record<string, unknown>;
  created_at: string;
}
