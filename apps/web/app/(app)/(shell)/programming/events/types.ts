export interface ProgrammingEventProject {
  id: string;
  name: string;
  status: string;
}

export interface ProgrammingEventResource {
  name: string;
  quantity: number;
}

export interface ProgrammingEventStaffing {
  role: string;
  user_id?: string;
  notes?: string;
}

export interface ProgrammingEvent {
  id: string;
  organization_id?: string;
  project_id: string | null;
  project?: ProgrammingEventProject | null;
  title: string;
  description?: string | null;
  event_type:
    | "performance"
    | "activation"
    | "workshop"
    | "meeting"
    | "rehearsal"
    | "setup"
    | "breakdown"
    | "other";
  status: "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";
  location?: string | null;
  capacity?: number | null;
  start_at: string;
  end_at?: string | null;
  setup_start?: string | null;
  teardown_end?: string | null;
  timezone?: string | null;
  is_all_day: boolean;
  broadcast_url?: string | null;
  tags: string[];
  resources: ProgrammingEventResource[];
  staffing: ProgrammingEventStaffing[];
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
