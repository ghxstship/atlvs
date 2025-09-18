import { SupabaseClient } from '@supabase/supabase-js';
import { PurchaseOrder, PurchaseOrderRepository } from '@ghxstship/domain';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency: string;
  sku?: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  rate: number;
  currency: string;
  unit: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export class ProcurementService {
  constructor(private supabase: SupabaseClient) {}

  async listPurchaseOrders(organizationId: string): Promise<PurchaseOrder[]> {
    const { data, error } = await this.supabase
      .from('procurement_orders')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  async createPurchaseOrder(organizationId: string, orderData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<PurchaseOrder> {
    // Audit logging
    console.log(`User ${userId} creating purchase order for organization ${organizationId}`);
    
    const { data, error } = await this.supabase
      .from('procurement_orders')
      .insert({ ...orderData, organization_id: organizationId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listProducts(organizationId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createProduct(organizationId: string, productData: Omit<Product, 'id' | 'organization_id' | 'created_at' | 'updated_at'>, userId: string): Promise<Product> {
    // Audit logging
    console.log(`User ${userId} creating product for organization ${organizationId}`);
    
    const { data, error } = await this.supabase
      .from('products')
      .insert({ ...productData, organization_id: organizationId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, organizationId: string, productData: Partial<Omit<Product, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>, userId: string): Promise<Product> {
    // Audit logging
    console.log(`User ${userId} updating product ${productId} for organization ${organizationId}`);
    
    const { data, error } = await this.supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(productId: string, organizationId: string, userId: string): Promise<void> {
    // Audit logging
    console.log(`User ${userId} deleting product ${productId} for organization ${organizationId}`);
    
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async listServices(organizationId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createService(organizationId: string, serviceData: Omit<Service, 'id' | 'organization_id' | 'created_at' | 'updated_at'>, userId: string): Promise<Service> {
    // Audit logging
    console.log(`User ${userId} creating service for organization ${organizationId}`);
    
    const { data, error } = await this.supabase
      .from('services')
      .insert({ ...serviceData, organization_id: organizationId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateService(serviceId: string, organizationId: string, serviceData: Partial<Omit<Service, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>, userId: string): Promise<Service> {
    // Audit logging
    console.log(`User ${userId} updating service ${serviceId} for organization ${organizationId}`);
    
    const { data, error } = await this.supabase
      .from('services')
      .update({ ...serviceData, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteService(serviceId: string, organizationId: string, userId: string): Promise<void> {
    // Audit logging
    console.log(`User ${userId} deleting service ${serviceId} for organization ${organizationId}`);
    
    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async updatePurchaseOrderStatus(orderId: string, organizationId: string, status: string, userId: string, trackingData?: { tracking_number?: string; shipping_carrier?: string; actual_delivery?: string }): Promise<PurchaseOrder> {
    // Audit logging
    console.log(`User ${userId} updating purchase order ${orderId} status to ${status} for organization ${organizationId}`);
    
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (trackingData) {
      Object.assign(updateData, trackingData);
    }

    const { data, error } = await this.supabase
      .from('procurement_orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Finance Integration Methods
  async createExpenseFromOrder(organizationId: string, purchaseOrderId: string, userId: string): Promise<void> {
    // Audit logging
    console.log(`User ${userId} creating expense from purchase order ${purchaseOrderId} for organization ${organizationId}`);
    
    // Get purchase order details
    const { data: order, error: orderError } = await this.supabase
      .from('procurement_orders')
      .select('*')
      .eq('id', purchaseOrderId)
      .eq('organization_id', organizationId)
      .single();

    if (orderError) throw orderError;

    // Create expense record
    const { error: expenseError } = await this.supabase
      .from('expenses')
      .insert({
        organization_id: organizationId,
        amount: order.total_amount,
        currency: order.currency,
        description: `Procurement: ${order.description}`,
        category: 'procurement',
        project_id: order.project_id,
        reference_id: purchaseOrderId,
        reference_type: 'purchase_order',
        created_by: userId
      });

    if (expenseError) throw expenseError;
  }

  async validateProjectBudget(organizationId: string, projectId: string, amount: number, currency: string): Promise<{ isValid: boolean; availableBudget: number; message?: string }> {
    // Get project budget information
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('budget, currency')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (projectError) {
      return { isValid: false, availableBudget: 0, message: 'Project not found' };
    }

    // Get total expenses for project
    const { data: expenses, error: expensesError } = await this.supabase
      .from('expenses')
      .select('amount')
      .eq('project_id', projectId)
      .eq('organization_id', organizationId);

    if (expensesError) throw expensesError;

    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const availableBudget = project.budget - totalExpenses;

    // Currency validation (simplified - in production would need proper currency conversion)
    if (project.currency !== currency) {
      return { isValid: false, availableBudget, message: 'Currency mismatch with project budget' };
    }

    const isValid = availableBudget >= amount;
    const message = isValid ? undefined : `Insufficient budget. Available: ${availableBudget} ${currency}`;

    return { isValid, availableBudget, message };
  }

  async allocateOrderToProject(organizationId: string, purchaseOrderId: string, projectId: string, allocationPercentage: number, userId: string): Promise<void> {
    // Audit logging
    console.log(`User ${userId} allocating purchase order ${purchaseOrderId} to project ${projectId} (${allocationPercentage}%) for organization ${organizationId}`);
    
    // Get purchase order details
    const { data: order, error: orderError } = await this.supabase
      .from('procurement_orders')
      .select('*')
      .eq('id', purchaseOrderId)
      .eq('organization_id', organizationId)
      .single();

    if (orderError) throw orderError;

    const allocatedAmount = (order.total_amount * allocationPercentage) / 100;

    // Validate budget if full allocation
    if (allocationPercentage === 100) {
      const budgetValidation = await this.validateProjectBudget(organizationId, projectId, allocatedAmount, order.currency);
      if (!budgetValidation.isValid) {
        throw new Error(budgetValidation.message || 'Budget validation failed');
      }
    }

    // Create project allocation record
    const { error: allocationError } = await this.supabase
      .from('project_allocations')
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        reference_id: purchaseOrderId,
        reference_type: 'purchase_order',
        allocation_percentage: allocationPercentage,
        allocated_amount: allocatedAmount,
        currency: order.currency,
        created_by: userId
      });

    if (allocationError) throw allocationError;

    // Update purchase order with project reference
    if (!order.project_id) {
      await this.supabase
        .from('procurement_orders')
        .update({ project_id: projectId })
        .eq('id', purchaseOrderId)
        .eq('organization_id', organizationId);
    }
  }

  async getProjectProcurementSummary(organizationId: string, projectId: string): Promise<{ totalAllocated: number; orderCount: number; currency: string }> {
    const { data: allocations, error } = await this.supabase
      .from('project_allocations')
      .select('allocated_amount, currency')
      .eq('project_id', projectId)
      .eq('organization_id', organizationId)
      .eq('reference_type', 'purchase_order');

    if (error) throw error;

    const totalAllocated = allocations?.reduce((sum, allocation) => sum + allocation.allocated_amount, 0) || 0;
    const orderCount = allocations?.length || 0;
    const currency = allocations?.[0]?.currency || 'USD';

    return { totalAllocated, orderCount, currency };
  }
}
