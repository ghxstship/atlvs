// Qualifications Subdirectory Types

export interface QualificationFilters {
  search?: string;
  company_id?: string;
  type?: CompanyQualification['type'][];
  verification_status?: CompanyQualification['verification_status'][];
  issuing_authority?: string[];
  expiring_soon?: boolean;
  issue_date_from?: string;
  issue_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
}

export interface QualificationStats {
  totalQualifications: number;
  verifiedQualifications: number;
  expiredQualifications: number;
  expiringQualifications: number;
  pendingVerification: number;
  verificationRate: number;
  qualificationsByType: Record<string, number>;
  qualificationsByStatus: Record<string, number>;
}

export interface QualificationFormData {
  company_id: string;
  name: string;
  description?: string;
  type: CompanyQualification['type'];
  issuing_authority?: string;
  certificate_number?: string;
  issue_date?: string;
  expiry_date?: string;
  document_url?: string;
  notes?: string;
}

// Re-export from parent types
export type {
  CompanyQualification,
  CreateQualificationForm,
} from '../types';
