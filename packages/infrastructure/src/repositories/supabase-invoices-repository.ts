import type { Invoice, InvoiceRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabaseInvoicesRepository implements InvoiceRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<Invoice | null> {
    return Sentry.startSpan({ name: 'repo.invoices.findById' }, async () => {
      const { data, error } = await this.sb.from('invoices').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<Invoice[]> {
    return Sentry.startSpan({ name: 'repo.invoices.list' }, async () => {
      const { data, error } = await this.sb
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(entity: Invoice): Promise<Invoice> {
    return Sentry.startSpan({ name: 'repo.invoices.create' }, async () => {
      const row = {
        id: entity.id,
        organization_id: entity.organizationId,
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        purchase_order_id: entity.purchaseOrderId ?? null,
        due_date: entity.dueDate ?? null,
        created_at: entity.createdAt ?? new Date().toISOString(),
        updated_at: entity.updatedAt ?? new Date().toISOString()
      } as any;
      const { data, error } = await this.sb.from('invoices').insert(row).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  async update(id: string, partial: Partial<Invoice>): Promise<Invoice> {
    return Sentry.startSpan({ name: 'repo.invoices.update' }, async () => {
      const patch: any = {};
      if (partial.amount !== undefined) patch.amount = partial.amount;
      if (partial.currency !== undefined) patch.currency = partial.currency;
      if (partial.status !== undefined) patch.status = partial.status;
      if (partial.purchaseOrderId !== undefined) patch.purchase_order_id = partial.purchaseOrderId ?? null;
      if (partial.dueDate !== undefined) patch.due_date = partial.dueDate;
      const { data, error } = await this.sb.from('invoices').update(patch).eq('id', id).select('*').single();
      if (error) throw error;
      return this.map(data);
    });
  }

  private map = (d: any): Invoice => ({
    id: d.id,
    organizationId: d.organization_id,
    amount: Number(d.amount),
    currency: d.currency,
    status: d.status,
    purchaseOrderId: d.purchase_order_id ?? undefined,
    dueDate: d.due_date ?? undefined,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
