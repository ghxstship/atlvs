export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'cancelled';
export type ExpenseCategory = 'equipment' | 'construction' | 'catering' | 'travel' | 'personnel' | 'marketing' | 'office' | 'other';

export interface Expense {
  id: string;
  organizationId: string;
  projectId?: string;
  budgetId?: string;
  submittedBy: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  expenseDate: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRepository {
  findById(id: string, orgId: string): Promise<Expense | null>;
  list(orgId: string, filters?: ExpenseFilters, limit?: number, offset?: number): Promise<Expense[]>;
  create(entity: Expense): Promise<Expense>;
  update(id: string, partial: Partial<Expense>): Promise<Expense>;
  delete(id: string, orgId: string): Promise<void>;
  getByProject(projectId: string, orgId: string): Promise<Expense[]>;
  getBySubmitter(userId: string, orgId: string): Promise<Expense[]>;
  getPendingApprovals(orgId: string): Promise<Expense[]>;
}

export interface ExpenseFilters {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  submittedBy?: string;
  projectId?: string;
  budgetId?: string;
  dateFrom?: string;
  dateTo?: string;
}
