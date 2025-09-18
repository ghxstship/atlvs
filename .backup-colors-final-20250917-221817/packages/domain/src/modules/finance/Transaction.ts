export type TransactionKind = 'revenue' | 'expense' | 'transfer' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  organizationId: string;
  accountId: string;
  projectId?: string;
  invoiceId?: string;
  expenseId?: string;
  kind: TransactionKind;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  reference?: string;
  occurredAt: string;
  reconciledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRepository {
  findById(id: string, orgId: string): Promise<Transaction | null>;
  list(orgId: string, filters?: TransactionFilters, limit?: number, offset?: number): Promise<Transaction[]>;
  create(entity: Transaction): Promise<Transaction>;
  update(id: string, partial: Partial<Transaction>): Promise<Transaction>;
  delete(id: string, orgId: string): Promise<void>;
  getByAccount(accountId: string, orgId: string): Promise<Transaction[]>;
  getByProject(projectId: string, orgId: string): Promise<Transaction[]>;
  getUnreconciled(accountId: string, orgId: string): Promise<Transaction[]>;
}

export interface TransactionFilters {
  accountId?: string;
  projectId?: string;
  kind?: TransactionKind;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}
