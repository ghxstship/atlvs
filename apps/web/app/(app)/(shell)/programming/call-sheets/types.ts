export interface CallSheet {
  id: string;
  organization_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  event_date: string;
  call_time: string;
  location: string;
  contact_info?: string | null;
  special_instructions?: string | null;
  weather_info?: string | null;
  parking_info?: string | null;
  catering_info?: string | null;
  equipment_list?: string[] | null;
  crew_list?: CallSheetCrew[] | null;
  status: "draft" | "published" | "distributed" | "completed";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CallSheetCrew {
  id: string;
  name: string;
  role: string;
  call_time: string;
  contact: string;
  notes?: string | null;
}

export interface CreateCallSheetData {
  title: string;
  description?: string;
  project_id?: string;
  event_date: string;
  call_time: string;
  location: string;
  contact_info?: string;
  special_instructions?: string;
  weather_info?: string;
  parking_info?: string;
  catering_info?: string;
  equipment_list?: string[];
  crew_list?: CallSheetCrew[];
  status?: "draft" | "published" | "distributed" | "completed";
}

export interface UpdateCallSheetData extends Partial<CreateCallSheetData> {
  id: string;
}
