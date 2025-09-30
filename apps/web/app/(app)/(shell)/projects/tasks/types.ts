// Project Tasks - Type Definitions
// Specialized type definitions for the Project Tasks submodule

import type { Project, User, ViewType, FieldConfig } from '../types';

export interface Task {
  id: string;
  project_id: string;
  organization_id: string;
  project?: Project;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignee_id?: string;
  assignee?: User;
  reporter_id?: string;
  reporter?: User;
  parent_task_id?: string;
  parent_task?: Task;
  subtasks?: Task[];
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

export interface CreateTaskData {
  project_id: string;
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: string;
  parent_task_id?: string;
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
  tags?: string[];
  dependencies?: string[];
  attachments?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
  actual_hours?: number;
  completed_at?: string;
  position?: number;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  blocked: number;
  overdue: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionRate: number;
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: string;
  project_id?: string;
  parent_task_id?: string;
  tags?: string[];
  due_date_range?: {
    start: string;
    end: string;
  };
  overdue_only?: boolean;
}

export interface TaskViewConfig {
  viewType: ViewType;
  fields: FieldConfig[];
  filters: TaskFilters;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  selectedTasks: Set<string>;
  groupBy?: 'status' | 'priority' | 'assignee' | 'project';
}

export interface TaskBoard {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
  color: string;
  limit?: number;
}

export interface TaskTimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  hours: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Task-specific constants
export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'review', label: 'Review', color: 'yellow' },
  { value: 'done', label: 'Done', color: 'green' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' },
] as const;

export const TASK_FIELD_CONFIG: FieldConfig[] = [
  { id: "title", label: "Title", visible: true, sortable: true },
  { id: "status", label: "Status", visible: true, sortable: true },
  { id: "priority", label: "Priority", visible: true, sortable: true },
  { id: "assignee", label: "Assignee", visible: true, sortable: true },
  { id: "project", label: "Project", visible: true, sortable: true },
  { id: "due_date", label: "Due Date", visible: true, sortable: true },
  { id: "estimated_hours", label: "Estimated", visible: false, sortable: true },
  { id: "actual_hours", label: "Actual", visible: false, sortable: true },
  { id: "created_at", label: "Created", visible: false, sortable: true },
  { id: "updated_at", label: "Updated", visible: false, sortable: true },
];

export const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'review', title: 'Review', status: 'review' as const },
  { id: 'done', title: 'Done', status: 'done' as const },
  { id: 'blocked', title: 'Blocked', status: 'blocked' as const },
];

export type TaskStatus = typeof TASK_STATUSES[number]['value'];
export type TaskPriority = typeof TASK_PRIORITIES[number]['value'];

// Task utility types
export interface TaskDragResult {
  taskId: string;
  sourceStatus: TaskStatus;
  destinationStatus: TaskStatus;
  sourceIndex: number;
  destinationIndex: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  action: 'created' | 'updated' | 'assigned' | 'commented' | 'completed' | 'reopened';
  details?: Record<string, unknown>;
  created_at: string;
}
