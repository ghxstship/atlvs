export type RFPStatus = 'draft' | 'published' | 'closed' | 'cancelled';
export type RFPType = 'construction' | 'technical' | 'creative' | 'consulting' | 'logistics' | 'other';

export interface RFP {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  type: RFPType;
  status: RFPStatus;
  budget?: number;
  currency?: string;
  publishedAt?: string;
  submissionDeadline?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  requirements?: string[];
  deliverables?: string[];
  evaluationCriteria?: string[];
  contactEmail?: string;
  attachments?: string[];
  bidCount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRFPRequest {
  organizationId: string;
  title: string;
  description?: string;
  type: RFPType;
  budget?: number;
  currency?: string;
  submissionDeadline?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  requirements?: string[];
  deliverables?: string[];
  evaluationCriteria?: string[];
  contactEmail?: string;
  notes?: string;
}

export interface UpdateRFPRequest {
  title?: string;
  description?: string;
  type?: RFPType;
  status?: RFPStatus;
  budget?: number;
  currency?: string;
  submissionDeadline?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  requirements?: string[];
  deliverables?: string[];
  evaluationCriteria?: string[];
  contactEmail?: string;
  notes?: string;
}

export interface RFPFilters {
  status?: RFPStatus[];
  type?: RFPType[];
  minBudget?: number;
  maxBudget?: number;
  submissionDeadline?: {
    from?: string;
    to?: string;
  };
  projectStartDate?: {
    from?: string;
    to?: string;
  };
}

export interface RFPRepository {
  findById(id: string, orgId: string): Promise<RFP | null>;
  list(orgId: string, filters?: RFPFilters, limit?: number, offset?: number): Promise<RFP[]>;
  create(entity: RFP): Promise<RFP>;
  update(id: string, orgId: string, partial: Partial<RFP>): Promise<RFP>;
  delete(id: string, orgId: string): Promise<void>;
  publish(id: string, orgId: string): Promise<RFP>;
  close(id: string, orgId: string): Promise<RFP>;
  getStats(orgId: string): Promise<{
    totalRFPs: number;
    publishedRFPs: number;
    closedRFPs: number;
    totalBids: number;
    averageBidsPerRFP: number;
    countByStatus: Record<RFPStatus, number>;
    countByType: Record<RFPType, number>;
  }>;
}
