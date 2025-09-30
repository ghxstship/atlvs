import { type DataRecord } from '@ghxstship/ui';

// Core bid types
export type BidStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
export type BidType = 'fixed_price' | 'hourly' | 'milestone_based' | 'retainer';
export type BidCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Main bid interface
export interface JobBid extends DataRecord {
  id: string;
  opportunity_id: string;
  company_id: string;
  amount: number;
  status: BidStatus;
  submitted_at: string;
  // Enhanced fields from joins
  opportunity_title?: string;
  company_name?: string;
  project_title?: string;
  project_id?: string;
  organization_name?: string;
  client_contact?: string;
  response_deadline?: string;
  estimated_duration?: string;
  proposal_document_url?: string;
  notes?: string;
}

// API response types
export interface BidsResponse {
  bids: JobBid[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateBidData {
  opportunity_id: string;
  company_id: string;
  amount: number;
  currency?: BidCurrency;
  type?: BidType;
  estimated_duration?: string;
  proposal_document_url?: string;
  notes?: string;
  response_deadline?: string;
}

export interface UpdateBidData extends Partial<CreateBidData> {
  id: string;
  status?: BidStatus;
}

// Filter and search types
export interface BidFilters {
  status?: BidStatus;
  opportunity_id?: string;
  company_id?: string;
  type?: BidType;
  currency?: BidCurrency;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// Statistics types
export interface BidStats {
  total: number;
  byStatus: Record<BidStatus, number>;
  byType: Record<BidType, number>;
  totalValue: number;
  averageBidValue: number;
  winRate: number;
  recentBids: number;
  activeBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
}

// View configuration types
export interface BidViewConfig {
  showAmounts: boolean;
  groupByStatus: boolean;
  showOpportunityDetails: boolean;
  defaultSort: 'submitted_at' | 'amount' | 'status' | 'opportunity_title';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
  currencyDisplay: BidCurrency;
}

// Drawer types
export interface BidDrawerProps {
  bid?: JobBid;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateBidData | UpdateBidData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface BidService {
  getBids: (filters?: BidFilters) => Promise<BidsResponse>;
  getBid: (id: string) => Promise<JobBid>;
  createBid: (data: CreateBidData) => Promise<JobBid>;
  updateBid: (data: UpdateBidData) => Promise<JobBid>;
  deleteBid: (id: string) => Promise<void>;
  getBidStats: () => Promise<BidStats>;
  withdrawBid: (id: string) => Promise<JobBid>;
  submitBid: (id: string) => Promise<JobBid>;
}

// Opportunity integration types
export interface OpportunityInfo {
  id: string;
  title: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: BidCurrency;
  deadline?: string;
  client_name?: string;
  project_title?: string;
  requirements?: string[];
}

// Company integration types
export interface CompanyInfo {
  id: string;
  name: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  capabilities?: string[];
}

// Bid evaluation types
export interface BidEvaluation {
  bid_id: string;
  score?: number;
  criteria_scores?: Record<string, number>;
  evaluator_notes?: string;
  recommendation?: 'accept' | 'reject' | 'negotiate';
  evaluated_at?: string;
  evaluated_by?: string;
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
