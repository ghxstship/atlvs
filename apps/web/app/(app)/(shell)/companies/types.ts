// Companies Module Types

export interface Company {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: 'active' | 'pending' | 'inactive' | 'blacklisted';
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded_year?: number;
  logo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyContact {
  id: string;
  company_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
  department?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyContract {
  id: string;
  company_id: string;
  organization_id: string;
  title: string;
  description?: string;
  type: 'msa' | 'sow' | 'nda' | 'service_agreement' | 'purchase_order' | 'other';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';
  value?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  auto_renew: boolean;
  renewal_notice_days?: number;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
}

export interface CompanyQualification {
  id: string;
  company_id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'certification' | 'license' | 'insurance' | 'accreditation' | 'compliance' | 'other';
  issuing_authority?: string;
  certificate_number?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'pending' | 'verified' | 'expired' | 'rejected';
  verification_date?: string;
  verification_notes?: string;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
}

export interface CompanyRating {
  id: string;
  company_id: string;
  organization_id: string;
  project_id?: string;
  rater_user_id: string;
  rating: number; // 1-5 scale
  category: 'overall' | 'quality' | 'timeliness' | 'communication' | 'value' | 'reliability';
  review?: string;
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
  rater?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Form interfaces
export interface CreateCompanyForm {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  size?: Company['size'];
  founded_year?: number;
  notes?: string;
}

export interface UpdateCompanyForm extends Partial<CreateCompanyForm> {
  status?: Company['status'];
}

export interface CreateContactForm {
  company_id: string;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface CreateContractForm {
  company_id: string;
  title: string;
  description?: string;
  type: CompanyContract['type'];
  value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  auto_renew?: boolean;
  renewal_notice_days?: number;
  document_url?: string;
  notes?: string;
}

export interface CreateQualificationForm {
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

export interface CreateRatingForm {
  company_id: string;
  project_id?: string;
  rating: number;
  category: CompanyRating['category'];
  review?: string;
  recommendation: CompanyRating['recommendation'];
  is_public?: boolean;
}

// Filter interfaces
export interface CompanyFilters {
  search?: string;
  status?: Company['status'][];
  industry?: string[];
  size?: Company['size'][];
  country?: string[];
  founded_year_min?: number;
  founded_year_max?: number;
}

export interface ContractFilters {
  search?: string;
  company_id?: string;
  type?: CompanyContract['type'][];
  status?: CompanyContract['status'][];
  value_min?: number;
  value_max?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  expiring_soon?: boolean;
}

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

export interface RatingFilters {
  search?: string;
  company_id?: string;
  project_id?: string;
  category?: CompanyRating['category'][];
  rating_min?: number;
  rating_max?: number;
  recommendation?: CompanyRating['recommendation'][];
  is_public?: boolean;
  created_from?: string;
  created_to?: string;
}

// Statistics interfaces
export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  blacklistedCompanies: number;
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalQualifications: number;
  expiringQualifications: number;
  averageRating: number;
  totalRatings: number;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  expiringContracts: number;
  totalValue: number;
  averageValue: number;
  renewalRate: number;
}

export interface QualificationStats {
  totalQualifications: number;
  verifiedQualifications: number;
  expiredQualifications: number;
  expiringQualifications: number;
  pendingVerification: number;
  verificationRate: number;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recommendationRate: number;
  categoryAverages: Record<CompanyRating['category'], number>;
}

// API Response types
export interface CompaniesResponse {
  data: Company[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ContractsResponse {
  data: CompanyContract[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QualificationsResponse {
  data: CompanyQualification[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface RatingsResponse {
  data: CompanyRating[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Export formats
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filters?: unknown;
}

// Activity log types
export interface CompanyActivity {
  id: string;
  type: 'company_added' | 'contract_signed' | 'qualification_verified' | 'rating_submitted';
  companyName: string;
  description: string;
  timestamp: string;
  user: string;
}
