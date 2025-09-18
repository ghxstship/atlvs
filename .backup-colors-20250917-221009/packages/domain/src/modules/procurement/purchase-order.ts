export type POStatus = 'draft' | 'approved' | 'sent' | 'received' | 'cancelled';

export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  order_number: string;
  vendor_name: string;
  description: string;
  total_amount: number;
  currency: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  project_id?: string;
  organization_id: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderRequest {
  order_number: string;
  vendor_name: string;
  description: string;
  total_amount: number;
  currency?: string;
  status?: PurchaseOrderStatus;
  order_date: string;
  expected_delivery?: string;
  project_id?: string;
  items?: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  product_id?: string;
  service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface UpdatePurchaseOrderRequest {
  vendor_name?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  status?: PurchaseOrderStatus;
  order_date?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  project_id?: string;
}

export interface PurchaseOrderRepository {
  findById(id: string, organizationId: string): Promise<PurchaseOrder | null>;
  findByOrganization(organizationId: string): Promise<PurchaseOrder[]>;
  findByStatus(status: PurchaseOrderStatus, organizationId: string): Promise<PurchaseOrder[]>;
  findByProject(projectId: string, organizationId: string): Promise<PurchaseOrder[]>;
  findPendingApproval(organizationId: string): Promise<PurchaseOrder[]>;
  create(organizationId: string, data: CreatePurchaseOrderRequest, userId: string): Promise<PurchaseOrder>;
  update(id: string, organizationId: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder>;
  updateStatus(id: string, organizationId: string, status: PurchaseOrderStatus, userId?: string): Promise<PurchaseOrder>;
  delete(id: string, organizationId: string): Promise<void>;
  search(query: string, organizationId: string): Promise<PurchaseOrder[]>;
}

export interface PurchaseOrderItemRepository {
  findByOrderId(orderId: string): Promise<PurchaseOrderItem[]>;
  create(orderId: string, data: CreatePurchaseOrderItemRequest): Promise<PurchaseOrderItem>;
  update(id: string, data: Partial<CreatePurchaseOrderItemRequest>): Promise<PurchaseOrderItem>;
  delete(id: string): Promise<void>;
}
