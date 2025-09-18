import type { PurchaseOrder, PurchaseOrderRepository, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderStatus } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SupabasePurchaseOrdersRepository implements PurchaseOrderRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async findById(id: string, organizationId: string): Promise<PurchaseOrder | null> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.findById' }, async () => {
      const { data, error } = await this.sb.from('procurement_orders').select('*').eq('id', id).eq('organization_id', organizationId).maybeSingle();
      if (error) throw error;
      return data ? this.map(data) : null;
    });
  }

  async findByOrganization(organizationId: string): Promise<PurchaseOrder[]> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.findByOrganization' }, async () => {
      const { data, error } = await this.sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async findByStatus(status: PurchaseOrderStatus, organizationId: string): Promise<PurchaseOrder[]> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.findByStatus' }, async () => {
      const { data, error } = await this.sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async findByProject(projectId: string, organizationId: string): Promise<PurchaseOrder[]> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.findByProject' }, async () => {
      const { data, error } = await this.sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async findPendingApproval(organizationId: string): Promise<PurchaseOrder[]> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.findPendingApproval' }, async () => {
      const { data, error } = await this.sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  async create(organizationId: string, data: CreatePurchaseOrderRequest, userId: string): Promise<PurchaseOrder> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.create' }, async () => {
      const row = {
        organization_id: organizationId,
        order_number: data.order_number,
        vendor_name: data.vendor_name,
        description: data.description,
        total_amount: data.total_amount,
        currency: data.currency || 'USD',
        status: data.status || 'draft',
        order_date: data.order_date,
        expected_delivery: data.expected_delivery,
        project_id: data.project_id,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data: result, error } = await this.sb.from('procurement_orders').insert(row).select('*').single();
      if (error) throw error;
      return this.map(result);
    });
  }

  async update(id: string, organizationId: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.update' }, async () => {
      const patch: any = { updated_at: new Date().toISOString() };
      if (data.vendor_name !== undefined) patch.vendor_name = data.vendor_name;
      if (data.description !== undefined) patch.description = data.description;
      if (data.total_amount !== undefined) patch.total_amount = data.total_amount;
      if (data.currency !== undefined) patch.currency = data.currency;
      if (data.status !== undefined) patch.status = data.status;
      if (data.order_date !== undefined) patch.order_date = data.order_date;
      if (data.expected_delivery !== undefined) patch.expected_delivery = data.expected_delivery;
      if (data.actual_delivery !== undefined) patch.actual_delivery = data.actual_delivery;
      if (data.tracking_number !== undefined) patch.tracking_number = data.tracking_number;
      if (data.shipping_carrier !== undefined) patch.shipping_carrier = data.shipping_carrier;
      if (data.project_id !== undefined) patch.project_id = data.project_id;
      
      const { data: result, error } = await this.sb
        .from('procurement_orders')
        .update(patch)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select('*')
        .single();
      if (error) throw error;
      return this.map(result);
    });
  }

  async updateStatus(id: string, organizationId: string, status: PurchaseOrderStatus, userId?: string): Promise<PurchaseOrder> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.updateStatus' }, async () => {
      const patch: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      if (userId && status === 'approved') {
        patch.approved_by = userId;
        patch.approved_at = new Date().toISOString();
      }
      
      const { data: result, error } = await this.sb
        .from('procurement_orders')
        .update(patch)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select('*')
        .single();
      if (error) throw error;
      return this.map(result);
    });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.delete' }, async () => {
      const { error } = await this.sb
        .from('procurement_orders')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);
      if (error) throw error;
    });
  }

  async search(query: string, organizationId: string): Promise<PurchaseOrder[]> {
    return Sentry.startSpan({ name: 'repo.purchaseOrders.search' }, async () => {
      const { data, error } = await this.sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`order_number.ilike.%${query}%,vendor_name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(this.map);
    });
  }

  private map = (d: any): PurchaseOrder => ({
    id: d.id,
    order_number: d.order_number,
    vendor_name: d.vendor_name,
    description: d.description,
    total_amount: Number(d.total_amount),
    currency: d.currency,
    status: d.status,
    order_date: d.order_date,
    expected_delivery: d.expected_delivery,
    actual_delivery: d.actual_delivery,
    tracking_number: d.tracking_number,
    shipping_carrier: d.shipping_carrier,
    project_id: d.project_id,
    organization_id: d.organization_id,
    created_by: d.created_by,
    approved_by: d.approved_by,
    approved_at: d.approved_at,
    created_at: d.created_at,
    updated_at: d.updated_at
  });
}
