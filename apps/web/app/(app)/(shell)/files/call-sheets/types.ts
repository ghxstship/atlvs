export interface CallSheetProject {
  id: string;
  name: string;
  status: string;
}

export interface CallSheetEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
}

export interface CallSheetContact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

export interface CallSheetScheduleItem {
  time: string;
  activity: string;
  location?: string;
  notes?: string;
}

export interface CallSheetCrewAssignment {
  user_id?: string;
  role: string;
  department?: string;
  call_time?: string;
  notes?: string;
}

export interface CallSheetEquipment {
  item: string;
  quantity: number;
  responsible_person?: string;
  notes?: string;
}

export interface CallSheetDistribution {
  user_id?: string;
  email?: string;
  method: 'email' | 'sms' | 'app';
}

export interface CallSheet {
  id: string;
  organization_id?: string;
  project_id: string | null;
  project?: CallSheetProject | null;
  event_id: string | null;
  event?: CallSheetEvent | null;
  name: string;
  description?: string | null;
  call_type: 
    | "general"
    | "crew"
    | "talent"
    | "vendor"
    | "security"
    | "medical"
    | "transport";
  status: "draft" | "published" | "distributed" | "updated" | "cancelled";
  event_date: string;
  call_time: string;
  location: string;
  notes?: string | null;
  weather_info: Record<string, unknown>;
  contact_info: CallSheetContact[];
  schedule: CallSheetScheduleItem[];
  crew_assignments: CallSheetCrewAssignment[];
  equipment_list: CallSheetEquipment[];
  safety_notes?: string | null;
  distribution_list: CallSheetDistribution[];
  tags: string[];
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
