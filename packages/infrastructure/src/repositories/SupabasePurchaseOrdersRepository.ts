import type { PurchaseOrder, PurchaseOrderRepository } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePurchaseOrdersRepository implements PurchaseOrderRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, orgId: string): Promise<PurchaseOrder | null> {
    const { data, error } = await this.sb.from('purchase_orders').select('*').eq('id', id).eq('organization_id', orgId).maybeSingle();
    if (error) throw error;
    return data ? this.map(data) : null;
  }

  async list(orgId: string, limit = 20, offset = 0): Promise<PurchaseOrder[]> {
    const { data, error } = await this.sb
      .from('purchase_orders')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(entity: PurchaseOrder): Promise<PurchaseOrder> {
    const row = {
      id: entity.id,
      organization_id: entity.organizationId,
      vendor: entity.vendor,
      total: entity.total,
      currency: entity.currency,
      status: entity.status,
      created_at: entity.createdAt ?? new Date().toISOString(),
      updated_at: entity.updatedAt ?? new Date().toISOString()
    };
    const { data, error } = await this.sb.from('purchase_orders').insert(row).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, partial: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const patch: any = {};
    if (partial.vendor !== undefined) patch.vendor = partial.vendor;
    if (partial.total !== undefined) patch.total = partial.total;
    if (partial.currency !== undefined) patch.currency = partial.currency;
    if (partial.status !== undefined) patch.status = partial.status;
    const { data, error } = await this.sb.from('purchase_orders').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return this.map(data);
  }

  private map = (d: any): PurchaseOrder => ({
    id: d.id,
    organizationId: d.organization_id,
    vendor: d.vendor,
    total: Number(d.total),
    currency: d.currency,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  });
}
