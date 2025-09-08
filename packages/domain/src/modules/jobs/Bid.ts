export type BidStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
export type BidType = 'fixed_price' | 'time_materials' | 'cost_plus' | 'unit_price';

export interface Bid {
  id: string;
  organizationId: string;
  opportunityId?: string;
  rfpId?: string;
  title: string;
  description?: string;
  type: BidType;
  status: BidStatus;
  bidAmount: number;
  currency: string;
  submissionDeadline?: string;
  submittedAt?: string;
  clientName?: string;
  projectDuration?: number; // in days
  startDate?: string;
  endDate?: string;
  terms?: string;
  attachments?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBidRequest {
  organizationId: string;
  opportunityId?: string;
  rfpId?: string;
  title: string;
  description?: string;
  type: BidType;
  bidAmount: number;
  currency: string;
  submissionDeadline?: string;
  clientName?: string;
  projectDuration?: number;
  startDate?: string;
  endDate?: string;
  terms?: string;
  notes?: string;
}

export interface UpdateBidRequest {
  title?: string;
  description?: string;
  type?: BidType;
  status?: BidStatus;
  bidAmount?: number;
  currency?: string;
  submissionDeadline?: string;
  clientName?: string;
  projectDuration?: number;
  startDate?: string;
  endDate?: string;
  terms?: string;
  notes?: string;
}

export interface BidFilters {
  status?: BidStatus[];
  type?: BidType[];
  minAmount?: number;
  maxAmount?: number;
  clientName?: string;
  submissionDeadline?: {
    from?: string;
    to?: string;
  };
}

export interface BidRepository {
  findById(id: string, orgId: string): Promise<Bid | null>;
  list(orgId: string, filters?: BidFilters, limit?: number, offset?: number): Promise<Bid[]>;
  create(entity: Bid): Promise<Bid>;
  update(id: string, orgId: string, partial: Partial<Bid>): Promise<Bid>;
  delete(id: string, orgId: string): Promise<void>;
  submit(id: string, orgId: string): Promise<Bid>;
  getStats(orgId: string): Promise<{
    totalBids: number;
    submittedBids: number;
    acceptedBids: number;
    winRate: number;
    totalValue: number;
    countByStatus: Record<BidStatus, number>;
  }>;
}
