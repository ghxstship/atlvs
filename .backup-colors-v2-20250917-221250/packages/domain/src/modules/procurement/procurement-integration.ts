export interface ProcurementFinanceIntegration {
  id: string;
  purchase_order_id: string;
  expense_id?: string;
  invoice_id?: string;
  budget_allocation_id?: string;
  amount: number;
  currency: string;
  integration_type: 'expense' | 'invoice' | 'budget_allocation';
  status: 'pending' | 'processed' | 'failed';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProcurementProjectIntegration {
  id: string;
  purchase_order_id: string;
  project_id: string;
  task_id?: string;
  allocation_percentage: number;
  allocated_amount: number;
  currency: string;
  cost_category: 'materials' | 'services' | 'equipment' | 'other';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetValidation {
  project_id: string;
  requested_amount: number;
  currency: string;
  available_budget: number;
  is_valid: boolean;
  validation_message?: string;
}

export interface ExpenseCreationRequest {
  purchase_order_id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  project_id?: string;
  receipt_url?: string;
}

export interface InvoiceCreationRequest {
  purchase_order_id: string;
  vendor_name: string;
  amount: number;
  currency: string;
  due_date: string;
  description: string;
  project_id?: string;
}

export interface ProcurementIntegrationService {
  // Finance Integration
  createExpenseFromOrder(organizationId: string, request: ExpenseCreationRequest, userId: string): Promise<ProcurementFinanceIntegration>;
  createInvoiceFromOrder(organizationId: string, request: InvoiceCreationRequest, userId: string): Promise<ProcurementFinanceIntegration>;
  validateBudgetAllocation(organizationId: string, projectId: string, amount: number, currency: string): Promise<BudgetValidation>;
  
  // Project Integration
  allocateOrderToProject(organizationId: string, purchaseOrderId: string, projectId: string, allocationPercentage: number, costCategory: string, userId: string): Promise<ProcurementProjectIntegration>;
  getProjectAllocations(organizationId: string, projectId: string): Promise<ProcurementProjectIntegration[]>;
  updateProjectAllocation(organizationId: string, integrationId: string, allocationPercentage: number, userId: string): Promise<ProcurementProjectIntegration>;
  
  // Reporting
  getFinanceIntegrations(organizationId: string, purchaseOrderId?: string): Promise<ProcurementFinanceIntegration[]>;
  getProjectIntegrations(organizationId: string, projectId?: string): Promise<ProcurementProjectIntegration[]>;
}
