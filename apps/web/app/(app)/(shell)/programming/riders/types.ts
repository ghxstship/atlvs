export interface Rider {
  id: string;
  organization_id: string;
  project_id?: string | null;
  event_id?: string | null;
  title: string;
  description?: string | null;
  type: "technical" | "hospitality" | "security" | "catering" | "transportation" | "other";
  requirements: string[];
  special_requests?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  budget_estimate?: number | null;
  deadline?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "submitted" | "approved" | "rejected" | "fulfilled";
  approval_notes?: string | null;
  fulfillment_notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiderRequirement {
  id: string;
  category: string;
  item: string;
  quantity?: number | null;
  specifications?: string | null;
  is_mandatory: boolean;
  notes?: string | null;
}

export interface CreateRiderData {
  title: string;
  description?: string;
  type: "technical" | "hospitality" | "security" | "catering" | "transportation" | "other";
  project_id?: string;
  event_id?: string;
  requirements: string[];
  special_requests?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  budget_estimate?: number;
  deadline?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status?: "draft" | "submitted" | "approved" | "rejected" | "fulfilled";
}

export interface UpdateRiderData extends Partial<CreateRiderData> {
  id: string;
}
