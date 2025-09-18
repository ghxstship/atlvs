export interface Company {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  industry: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  status: 'active' | 'inactive' | 'pending' | 'blacklisted';
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  foundedYear?: number;
  logoUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  organizationId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyContract {
  id: string;
  companyId: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  type: 'msa' | 'sow' | 'nda' | 'service' | 'supply' | 'other';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';
  value?: number;
  currency: string;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  terms?: string;
  documentUrl?: string;
  signedDate?: string;
  signedBy?: string;
  autoRenewal: boolean;
  renewalNoticeDays?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CompanyQualification {
  id: string;
  companyId: string;
  organizationId: string;
  type: 'certification' | 'license' | 'insurance' | 'bond' | 'safety' | 'other';
  name: string;
  description?: string;
  issuingAuthority?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  documentUrl?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyRating {
  id: string;
  companyId: string;
  organizationId: string;
  projectId?: string;
  ratedBy: string;
  category: 'overall' | 'quality' | 'timeliness' | 'communication' | 'cost' | 'safety';
  rating: number; // 1-5 scale
  review?: string;
  wouldRecommend: boolean;
  workCompletedDate?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyRepository {
  findById(id: string, orgId: string): Promise<Company | null>;
  list(orgId: string, filters?: { industry?: string; status?: string; size?: string }, pagination?: { limit?: number; offset?: number }): Promise<Company[]>;
  search(orgId: string, query: string, filters?: any): Promise<Company[]>;
  create(entity: Company): Promise<Company>;
  update(id: string, patch: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
}

export interface CompanyContactRepository {
  findByCompanyId(companyId: string, orgId: string): Promise<CompanyContact[]>;
  create(entity: CompanyContact): Promise<CompanyContact>;
  update(id: string, patch: Partial<CompanyContact>): Promise<CompanyContact>;
  delete(id: string): Promise<void>;
}

export interface CompanyContractRepository {
  findByCompanyId(companyId: string, orgId: string): Promise<CompanyContract[]>;
  list(orgId: string, filters?: { status?: string; type?: string }, pagination?: { limit?: number; offset?: number }): Promise<CompanyContract[]>;
  findExpiringContracts(orgId: string, daysAhead: number): Promise<CompanyContract[]>;
  create(entity: CompanyContract): Promise<CompanyContract>;
  update(id: string, patch: Partial<CompanyContract>): Promise<CompanyContract>;
  delete(id: string): Promise<void>;
}

export interface CompanyQualificationRepository {
  findByCompanyId(companyId: string, orgId: string): Promise<CompanyQualification[]>;
  list(orgId: string, filters?: { type?: string; status?: string }, pagination?: { limit?: number; offset?: number }): Promise<CompanyQualification[]>;
  findExpiringQualifications(orgId: string, daysAhead: number): Promise<CompanyQualification[]>;
  create(entity: CompanyQualification): Promise<CompanyQualification>;
  update(id: string, patch: Partial<CompanyQualification>): Promise<CompanyQualification>;
  delete(id: string): Promise<void>;
}

export interface CompanyRatingRepository {
  findByCompanyId(companyId: string, orgId: string): Promise<CompanyRating[]>;
  getAverageRating(companyId: string, category?: string): Promise<{ rating: number; count: number }>;
  list(orgId: string, filters?: { companyId?: string; category?: string }, pagination?: { limit?: number; offset?: number }): Promise<CompanyRating[]>;
  create(entity: CompanyRating): Promise<CompanyRating>;
  update(id: string, patch: Partial<CompanyRating>): Promise<CompanyRating>;
  delete(id: string): Promise<void>;
}
