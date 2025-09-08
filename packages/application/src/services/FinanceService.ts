import type { 
  InvoiceRepository, 
  Invoice, 
  BudgetRepository,
  Budget,
  ExpenseRepository,
  Expense,
  AccountRepository,
  Account,
  TransactionRepository,
  Transaction,
  RevenueRepository,
  Revenue,
  ForecastRepository,
  Forecast,
  TenantContext, 
  AuditLogger, 
  EventBus, 
  PurchaseOrderRepository 
} from '@ghxstship/domain';

export class FinanceService {
  constructor(
    private readonly repos: { 
      invoices: InvoiceRepository; 
      budgets: BudgetRepository;
      expenses: ExpenseRepository;
      accounts: AccountRepository;
      transactions: TransactionRepository;
      revenue: RevenueRepository;
      forecasts: ForecastRepository;
      purchaseOrders: PurchaseOrderRepository;
    },
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.invoices.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Invoice) {
    // Basic validations
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invoice amount must be a positive number');
    }
    const currency = (input.currency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error('Invoice currency must be a valid 3-letter code (e.g., USD)');
    }
    const status = (input.status || 'draft') as Invoice['status'];
    const allowed: Invoice['status'][] = ['draft', 'issued', 'paid', 'overdue', 'void'];
    if (!allowed.includes(status)) {
      throw new Error('Invalid invoice status');
    }
    const now = new Date().toISOString();
    // If linked to a PO, validate it exists and matches tenant/currency, and amount <= PO total
    if (input.purchaseOrderId) {
      const po = await this.repos.purchaseOrders.findById(input.purchaseOrderId, ctx.organizationId);
      if (!po) throw new Error('Linked purchase order not found for this organization');
      if (po.currency.toUpperCase() !== currency) throw new Error('Invoice currency must match purchase order currency');
      if (amount > Number(po.total_amount)) throw new Error('Invoice amount cannot exceed purchase order total');
    }

    const sanitized: Invoice = {
      ...input,
      amount,
      currency,
      status,
      organizationId: ctx.organizationId,
      createdAt: now,
      updatedAt: now
    };
    const created = await this.repos.invoices.create(sanitized);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'invoice', id: created.id }, meta: created });
    await this.bus.publish({
      name: 'finance.invoice.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: created
    });
    return created;
  }

  // Budget methods
  async listBudgets(ctx: TenantContext, projectId?: string, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.budgets.list(ctx.organizationId, projectId, limit, offset);
  }

  async createBudget(ctx: TenantContext, input: Budget) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Budget amount must be a positive number');
    }

    const now = new Date().toISOString();
    const sanitized: Budget = {
      ...input,
      amount,
      spent: 0,
      organizationId: ctx.organizationId,
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.budgets.create(sanitized);
    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'budget', id: created.id }, 
      meta: created 
    });
    await this.bus.publish({
      name: 'finance.budget.created',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: created
    });
    return created;
  }

  // Expense methods
  async listExpenses(ctx: TenantContext, filters?: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.expenses.list(ctx.organizationId, filters, limit, offset);
  }

  async createExpense(ctx: TenantContext, input: Expense) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Expense amount must be a positive number');
    }

    const now = new Date().toISOString();
    const sanitized: Expense = {
      ...input,
      amount,
      organizationId: ctx.organizationId,
      submittedBy: ctx.userId,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.expenses.create(sanitized);
    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'expense', id: created.id }, 
      meta: created 
    });
    return created;
  }

  async approveExpense(ctx: TenantContext, expenseId: string) {
    const expense = await this.repos.expenses.findById(expenseId, ctx.organizationId);
    if (!expense) throw new Error('Expense not found');
    if (expense.status !== 'submitted') throw new Error('Expense must be submitted for approval');

    const now = new Date().toISOString();
    const updated = await this.repos.expenses.update(expenseId, {
      status: 'approved',
      approvedBy: ctx.userId,
      approvedAt: now,
      updatedAt: now
    });

    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'approve', 
      entity: { type: 'expense', id: expenseId }, 
      meta: { previousStatus: expense.status, newStatus: 'approved' }
    });
    return updated;
  }

  // Account methods
  async listAccounts(ctx: TenantContext, kind?: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.accounts.list(ctx.organizationId, kind, limit, offset);
  }

  async createAccount(ctx: TenantContext, input: Account) {
    const now = new Date().toISOString();
    const sanitized: Account = {
      ...input,
      organizationId: ctx.organizationId,
      balance: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.accounts.create(sanitized);
    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'account', id: created.id }, 
      meta: created 
    });
    return created;
  }

  // Transaction methods
  async listTransactions(ctx: TenantContext, filters?: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.transactions.list(ctx.organizationId, filters, limit, offset);
  }

  async createTransaction(ctx: TenantContext, input: Transaction) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      throw new Error('Transaction amount must be a non-zero number');
    }

    const now = new Date().toISOString();
    const sanitized: Transaction = {
      ...input,
      amount,
      organizationId: ctx.organizationId,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.transactions.create(sanitized);
    
    // Update account balance
    await this.repos.accounts.updateBalance(input.accountId, amount, ctx.organizationId);

    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'transaction', id: created.id }, 
      meta: created 
    });
    return created;
  }

  // Revenue methods
  async listRevenue(ctx: TenantContext, filters?: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.revenue.list(ctx.organizationId, filters, limit, offset);
  }

  async createRevenue(ctx: TenantContext, input: Revenue) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Revenue amount must be a positive number');
    }

    const now = new Date().toISOString();
    const sanitized: Revenue = {
      ...input,
      amount,
      organizationId: ctx.organizationId,
      status: 'projected',
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.revenue.create(sanitized);
    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'revenue', id: created.id }, 
      meta: created 
    });
    return created;
  }

  // Forecast methods
  async listForecasts(ctx: TenantContext, filters?: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return this.repos.forecasts.list(ctx.organizationId, filters, limit, offset);
  }

  async createForecast(ctx: TenantContext, input: Forecast) {
    const projectedAmount = Number(input.projectedAmount);
    if (!Number.isFinite(projectedAmount)) {
      throw new Error('Forecast projected amount must be a valid number');
    }

    const now = new Date().toISOString();
    const sanitized: Forecast = {
      ...input,
      projectedAmount,
      organizationId: ctx.organizationId,
      createdBy: ctx.userId,
      createdAt: now,
      updatedAt: now
    };

    const created = await this.repos.forecasts.create(sanitized);
    await this.audit.record({ 
      occurredAt: now, 
      actor: { userId: ctx.userId }, 
      tenant: { organizationId: ctx.organizationId }, 
      action: 'create', 
      entity: { type: 'forecast', id: created.id }, 
      meta: created 
    });
    return created;
  }
}
