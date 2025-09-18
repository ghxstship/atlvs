export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  purchaseOrderId?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceRepository {
  findById(id: string, orgId: string): Promise<Invoice | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Invoice[]>;
  create(entity: Invoice): Promise<Invoice>;
  update(id: string, partial: Partial<Invoice>): Promise<Invoice>;
}
