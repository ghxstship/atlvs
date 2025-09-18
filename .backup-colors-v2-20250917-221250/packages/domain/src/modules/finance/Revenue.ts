export type RevenueStatus = 'projected' | 'contracted' | 'invoiced' | 'received' | 'cancelled';
export type RevenueCategory = 'project_fee' | 'milestone_payment' | 'subscription' | 'licensing' | 'merchandise' | 'other';

export interface Revenue {
  id: string;
  organizationId: string;
  projectId?: string;
  invoiceId?: string;
  title: string;
  description?: string;
  category: RevenueCategory;
  amount: number;
  currency: string;
  status: RevenueStatus;
  expectedDate: string;
  receivedDate?: string;
  clientCompanyId?: string;
  contractReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueRepository {
  findById(id: string, orgId: string): Promise<Revenue | null>;
  list(orgId: string, filters?: RevenueFilters, limit?: number, offset?: number): Promise<Revenue[]>;
  create(entity: Revenue): Promise<Revenue>;
  update(id: string, partial: Partial<Revenue>): Promise<Revenue>;
  delete(id: string, orgId: string): Promise<void>;
  getByProject(projectId: string, orgId: string): Promise<Revenue[]>;
  getByClient(clientId: string, orgId: string): Promise<Revenue[]>;
  getProjectedRevenue(orgId: string, dateFrom: string, dateTo: string): Promise<number>;
}

export interface RevenueFilters {
  status?: RevenueStatus;
  category?: RevenueCategory;
  projectId?: string;
  clientCompanyId?: string;
  dateFrom?: string;
  dateTo?: string;
}
