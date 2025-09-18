export type AccountKind = 'general' | 'bank' | 'card' | 'cash' | 'investment' | 'receivable' | 'payable';
export type AccountStatus = 'active' | 'inactive' | 'closed';

export interface Account {
  id: string;
  organizationId: string;
  name: string;
  kind: AccountKind;
  accountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  description?: string;
  lastReconciledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountRepository {
  findById(id: string, orgId: string): Promise<Account | null>;
  list(orgId: string, kind?: AccountKind, limit?: number, offset?: number): Promise<Account[]>;
  create(entity: Account): Promise<Account>;
  update(id: string, partial: Partial<Account>): Promise<Account>;
  delete(id: string, orgId: string): Promise<void>;
  updateBalance(id: string, amount: number, orgId: string): Promise<Account>;
  getByKind(kind: AccountKind, orgId: string): Promise<Account[]>;
}
