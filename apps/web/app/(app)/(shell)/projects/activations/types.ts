// Project Activations - Type Definitions
// Specialized type definitions for the Project Activations submodule

import type { Project, User, ViewType, FieldConfig } from '../types';

export interface Activation {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "ready" | "active" | "completed" | "cancelled";
  activation_type: "soft_launch" | "beta" | "full_launch" | "pilot" | "rollout";
  project_id?: string;
  project?: {
    id: string;
    name: string;
    status: string;
  };
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

export interface CreateActivationData {
  name: string;
  description?: string;
  status?: Activation['status'];
  activation_type: Activation['activation_type'];
  project_id?: string;
  scheduled_date?: string;
  location?: string;
  budget?: number;
  success_metrics?: Record<string, unknown>;
  stakeholders?: string[];
  dependencies?: string[];
  risks?: string[];
  notes?: string;
}

export interface UpdateActivationData extends Partial<CreateActivationData> {
  id: string;
  actual_date?: string;
  completion_date?: string;
  actual_cost?: number;
}

export interface ActivationStats {
  total: number;
  planning: number;
  ready: number;
  active: number;
  completed: number;
  cancelled: number;
  totalBudget: number;
  totalActualCost: number;
  avgCompletionTime: number;
}

export interface ActivationFilters {
  status?: Activation['status'];
  activation_type?: Activation['activation_type'];
  project_id?: string;
  location?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ActivationViewConfig {
  viewType: ViewType;
  fields: FieldConfig[];
  filters: ActivationFilters;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedActivations: Set<string>;
}

// Activation-specific constants
export const ACTIVATION_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'blue' },
  { value: 'ready', label: 'Ready', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const ACTIVATION_TYPES = [
  { value: 'soft_launch', label: 'Soft Launch' },
  { value: 'beta', label: 'Beta' },
  { value: 'full_launch', label: 'Full Launch' },
  { value: 'pilot', label: 'Pilot' },
  { value: 'rollout', label: 'Rollout' },
] as const;

export const ACTIVATION_FIELD_CONFIG: FieldConfig[] = [
  { id: "name", label: "Name", visible: true, sortable: true },
  { id: "status", label: "Status", visible: true, sortable: true },
  { id: "activation_type", label: "Type", visible: true, sortable: true },
  { id: "project", label: "Project", visible: true, sortable: true },
  { id: "scheduled_date", label: "Scheduled Date", visible: true, sortable: true },
  { id: "actual_date", label: "Actual Date", visible: false, sortable: true },
  { id: "completion_date", label: "Completion Date", visible: false, sortable: true },
  { id: "location", label: "Location", visible: true, sortable: false },
  { id: "budget", label: "Budget", visible: true, sortable: true },
  { id: "actual_cost", label: "Actual Cost", visible: false, sortable: true },
  { id: "created_at", label: "Created", visible: false, sortable: true },
  { id: "updated_at", label: "Updated", visible: false, sortable: true },
];

export type ActivationStatus = typeof ACTIVATION_STATUSES[number]['value'];
export type ActivationType = typeof ACTIVATION_TYPES[number]['value'];
