export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  manager_id?: string;
  hire_date?: string;
  employment_status: 'active' | 'inactive' | 'terminated';
  bio?: string;
  skills?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  completion_percentage: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  certification_number?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JobHistory {
  id: string;
  user_id: string;
  organization_id: string;
  company_name: string;
  position: string;
  department?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  salary?: number;
  currency?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  created_at: string;
  updated_at: string;
}
