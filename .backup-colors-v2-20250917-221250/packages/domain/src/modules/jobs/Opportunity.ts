export type OpportunityStatus = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type OpportunityType = 'construction' | 'technical' | 'creative' | 'logistics' | 'consulting' | 'other';

export interface Opportunity {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  type: OpportunityType;
  status: OpportunityStatus;
  estimatedValue?: number;
  currency?: string;
  probability?: number; // 0-100
  expectedCloseDate?: string;
  clientName?: string;
  clientContact?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOpportunityRequest {
  organizationId: string;
  title: string;
  description?: string;
  type: OpportunityType;
  estimatedValue?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  clientName?: string;
  clientContact?: string;
  source?: string;
  notes?: string;
}

export interface UpdateOpportunityRequest {
  title?: string;
  description?: string;
  type?: OpportunityType;
  status?: OpportunityStatus;
  estimatedValue?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  clientName?: string;
  clientContact?: string;
  source?: string;
  notes?: string;
}

export interface OpportunityFilters {
  status?: OpportunityStatus[];
  type?: OpportunityType[];
  minValue?: number;
  maxValue?: number;
  clientName?: string;
  source?: string;
}

export interface OpportunityRepository {
  findById(id: string, orgId: string): Promise<Opportunity | null>;
  list(orgId: string, filters?: OpportunityFilters, limit?: number, offset?: number): Promise<Opportunity[]>;
  create(entity: Opportunity): Promise<Opportunity>;
  update(id: string, orgId: string, partial: Partial<Opportunity>): Promise<Opportunity>;
  delete(id: string, orgId: string): Promise<void>;
  getStats(orgId: string): Promise<{
    totalValue: number;
    wonValue: number;
    pipelineValue: number;
    conversionRate: number;
    countByStatus: Record<OpportunityStatus, number>;
  }>;
}
