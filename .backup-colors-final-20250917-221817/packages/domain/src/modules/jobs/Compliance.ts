export type ComplianceStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
export type ComplianceKind = 'insurance' | 'license' | 'certification' | 'permit' | 'safety' | 'environmental' | 'tax' | 'other';

export interface JobCompliance {
  id: string;
  organizationId: string;
  jobId: string;
  kind: ComplianceKind;
  title: string;
  description?: string;
  status: ComplianceStatus;
  requiredBy?: string; // Authority or client requiring this compliance
  dueAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  expiresAt?: string;
  documentUrl?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateComplianceRequest {
  organizationId: string;
  jobId: string;
  kind: ComplianceKind;
  title: string;
  description?: string;
  requiredBy?: string;
  dueAt?: string;
  expiresAt?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface UpdateComplianceRequest {
  kind?: ComplianceKind;
  title?: string;
  description?: string;
  status?: ComplianceStatus;
  requiredBy?: string;
  dueAt?: string;
  expiresAt?: string;
  documentUrl?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface ComplianceFilters {
  status?: ComplianceStatus[];
  kind?: ComplianceKind[];
  jobId?: string;
  requiredBy?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
  expiryDate?: {
    from?: string;
    to?: string;
  };
}

export interface ComplianceRepository {
  findById(id: string, orgId: string): Promise<JobCompliance | null>;
  list(orgId: string, filters?: ComplianceFilters, limit?: number, offset?: number): Promise<JobCompliance[]>;
  create(entity: JobCompliance): Promise<JobCompliance>;
  update(id: string, orgId: string, partial: Partial<JobCompliance>): Promise<JobCompliance>;
  delete(id: string, orgId: string): Promise<void>;
  submit(id: string, orgId: string, documentUrl: string): Promise<JobCompliance>;
  approve(id: string, orgId: string): Promise<JobCompliance>;
  reject(id: string, orgId: string, reason?: string): Promise<JobCompliance>;
  getUpcoming(orgId: string, days: number): Promise<JobCompliance[]>;
  getExpiring(orgId: string, days: number): Promise<JobCompliance[]>;
  getStats(orgId: string): Promise<{
    totalCompliance: number;
    pendingCompliance: number;
    approvedCompliance: number;
    expiredCompliance: number;
    countByStatus: Record<ComplianceStatus, number>;
    countByKind: Record<ComplianceKind, number>;
  }>;
}
