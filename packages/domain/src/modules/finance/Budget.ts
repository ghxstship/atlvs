export type BudgetStatus = 'draft' | 'approved' | 'active' | 'closed' | 'exceeded';
export type BudgetCategory = 'equipment' | 'construction' | 'catering' | 'travel' | 'personnel' | 'marketing' | 'other';

export interface Budget {
  id: string;
  organizationId: string;
  projectId: string;
  category: BudgetCategory;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  currency: string;
  status: BudgetStatus;
  startDate: string;
  endDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRepository {
  findById(id: string, orgId: string): Promise<Budget | null>;
  list(orgId: string, projectId?: string, limit?: number, offset?: number): Promise<Budget[]>;
  create(entity: Budget): Promise<Budget>;
  update(id: string, partial: Partial<Budget>): Promise<Budget>;
  delete(id: string, orgId: string): Promise<void>;
  getByProject(projectId: string, orgId: string): Promise<Budget[]>;
  getTotalByCategory(orgId: string, category: BudgetCategory): Promise<number>;
}
