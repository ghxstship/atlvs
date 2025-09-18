'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Skeleton } from '@ghxstship/ui';
// Using Lucide React icons as alternative to Heroicons
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Banknote,
  CreditCard,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calculator,
  Target
} from 'lucide-react';

interface FinanceOverviewClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalBudget: number;
  budgetUtilization: number;
  pendingInvoices: number;
  overdueInvoices: number;
  cashFlow: number;
  accountsBalance: number;
  currency: string;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  kind: 'revenue' | 'expense';
  occurredAt: string;
  accountName: string;
}

interface BudgetAlert {
  id: string;
  budgetName: string;
  spent: number;
  amount: number;
  utilization: number;
  status: 'warning' | 'critical';
}

export default function FinanceOverviewClient({ user, orgId, translations }: FinanceOverviewClientProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadFinanceOverview();
  }, [orgId]);

  const loadFinanceOverview = async () => {
    try {
      setLoading(true);
      
      // Load financial summary data
      const [
        revenueData,
        expensesData,
        budgetsData,
        invoicesData,
        accountsData,
        transactionsData
      ] = await Promise.all([
        supabase.from('revenue').select('amount, currency').eq('organization_id', orgId).eq('status', 'received'),
        supabase.from('expenses').select('amount, currency').eq('organization_id', orgId).eq('status', 'approved'),
        supabase.from('budgets').select('id, amount, spent, currency, name').eq('organization_id', orgId),
        supabase.from('invoices').select('amount_due, status').eq('organization_id', orgId),
        supabase.from('finance_accounts').select('balance, currency').eq('organization_id', orgId),
        supabase.from('finance_transactions').select('*, finance_accounts(name)').eq('organization_id', orgId).order('occurred_at', { ascending: false }).limit(10)
      ]);

      // Calculate summary metrics
      const totalRevenue = (revenueData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalExpenses = (expensesData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const totalBudget = (budgetsData.data || []).reduce((sum, item) => sum + Number(item.amount), 0);
      const budgetSpent = (budgetsData.data || []).reduce((sum, item) => sum + Number(item.spent), 0);
      const accountsBalance = (accountsData.data || []).reduce((sum, item) => sum + Number(item.balance), 0);
      
      const pendingInvoices = (invoicesData.data || []).filter(inv => inv.status === 'sent').length;
      const overdueInvoices = (invoicesData.data || []).filter(inv => inv.status === 'overdue').length;

      const financialSummary: FinancialSummary = {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        totalBudget,
        budgetUtilization: totalBudget > 0 ? (budgetSpent / totalBudget) * 100 : 0,
        pendingInvoices,
        overdueInvoices,
        cashFlow: totalRevenue - totalExpenses,
        accountsBalance,
        currency: 'USD'
      };

      setSummary(financialSummary);

      // Process recent transactions
      const transactions = (transactionsData.data || []).map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        kind: tx.kind,
        occurredAt: tx.occurred_at,
        accountName: tx.finance_accounts?.name || 'Unknown Account'
      }));
      setRecentTransactions(transactions);

      // Generate budget alerts
      const alerts = (budgetsData.data || [])
        .map((budget, index) => {
          const utilization = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          return {
            id: budget.id || `budget-${index}`,
            budgetName: budget.name,
            spent: budget.spent,
            amount: budget.amount,
            utilization,
            status: utilization >= 90 ? 'critical' as const : utilization >= 75 ? 'warning' as const : null
          };
        })
        .filter(alert => alert.status !== null) as BudgetAlert[];
      setBudgetAlerts(alerts);

    } catch (error) {
      console.error('Error loading finance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <Skeleton className="h-4 w-20 mb-sm" />
              <Skeleton className="h-8 w-32 mb-xs" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">Finance Overview</h1>
          <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
        </div>
        <Button onClick={loadFinanceOverview}>
          <BarChart3 className="h-4 w-4 mr-sm" />
          Refresh Data
        </Button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Total Revenue */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Total Revenue</p>
              <p className="text-heading-3 text-heading-3 color-success">{formatCurrency(summary?.totalRevenue || 0, summary?.currency)}</p>
              <p className="text-body-sm color-success flex items-center mt-xs">
                <TrendingUp className="h-3 w-3 mr-xs" />
                +12.5% from last month
              </p>
            </div>
            <Banknote className="h-8 w-8 color-success" />
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Total Expenses</p>
              <p className="text-heading-3 text-heading-3 color-destructive">{formatCurrency(summary?.totalExpenses || 0, summary?.currency)}</p>
              <p className="text-body-sm color-destructive flex items-center mt-xs">
                <TrendingUp className="h-3 w-3 mr-xs" />
                +8.2% from last month
              </p>
            </div>
            <CreditCard className="h-8 w-8 color-destructive" />
          </div>
        </Card>

        {/* Net Income */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Net Income</p>
              <p className={`text-heading-3 text-heading-3 ${(summary?.netIncome || 0) >= 0 ? 'color-success' : 'color-destructive'}`}>
                {formatCurrency(summary?.netIncome || 0, summary?.currency)}
              </p>
              <p className="text-body-sm color-muted flex items-center mt-xs">
                {(summary?.netIncome || 0) >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-xs color-success" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-xs color-destructive" />
                )}
                Revenue - Expenses
              </p>
            </div>
            <DollarSign className="h-8 w-8 color-primary" />
          </div>
        </Card>

        {/* Budget Utilization */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Budget Utilization</p>
              <p className="text-heading-3 text-heading-3 color-foreground">
                {(summary?.budgetUtilization || 0).toFixed(1)}%
              </p>
              <p className="text-body-sm color-foreground/60 mt-xs">
                of {formatCurrency(summary?.totalBudget || 0, summary?.currency)}
              </p>
            </div>
            <PieChart className="h-8 w-8 color-secondary" />
          </div>
        </Card>

        {/* Accounts Balance */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Accounts Balance</p>
              <p className="text-heading-3 text-heading-3 color-foreground">
                {formatCurrency(summary?.accountsBalance || 0, summary?.currency)}
              </p>
              <p className="text-body-sm color-foreground/60 mt-xs">Across all accounts</p>
            </div>
            <Banknote className="h-8 w-8 color-success" />
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Pending Invoices</p>
              <p className="text-heading-3 text-heading-3 color-primary">{summary?.pendingInvoices || 0}</p>
              <p className="text-body-sm color-muted mt-xs">Awaiting payment</p>
            </div>
            <Clock className="h-5 w-5 color-warning" />
          </div>
        </Card>

        {/* Overdue Invoices */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Overdue Invoices</p>
              <p className="text-heading-3 text-heading-3 color-destructive">{summary?.overdueInvoices || 0}</p>
              <p className="text-body-sm color-muted mt-xs">Require attention</p>
            </div>
            <AlertTriangle className="h-5 w-5 color-destructive" />
          </div>
        </Card>

        {/* Cash Flow */}
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Cash Flow</p>
              <p className={`text-heading-3 text-heading-3 ${(summary?.cashFlow || 0) >= 0 ? 'color-success' : 'color-destructive'}`}>
                {formatCurrency(summary?.cashFlow || 0, summary?.currency)}
              </p>
              <p className="text-body-sm color-muted">+12% from last month</p>
            </div>
            <TrendingUp className="h-8 w-8 color-primary" />
          </div>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-body text-heading-4 color-foreground">Budget Alerts</h3>
            <Badge variant="secondary">{budgetAlerts.length} alerts</Badge>
          </div>
          <div className="stack-sm">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-sm bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center cluster-sm">
                  <AlertTriangle className={`h-5 w-5 ${alert.status === 'critical' ? 'color-destructive' : 'color-warning'}`} />
                  <div>
                    <h4 className="form-label color-warning">Budget Alert</h4>
                    <p className="text-body-sm color-foreground/70">
                      {formatCurrency(alert.spent)} of {formatCurrency(alert.amount)} spent ({alert.utilization.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <Badge variant={alert.status === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.status === 'critical' ? 'Over Budget' : 'Near Limit'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-body text-heading-4 color-foreground">Recent Transactions</h3>
          <Button>View All</Button>
        </div>
        <div className="stack-sm">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-sm border border-border rounded-lg">
                <div className="flex items-center cluster-sm">
                  {transaction.kind === 'revenue' ? (
                    <ArrowUpRight className="h-4 w-4 color-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 color-destructive" />
                  )}
                  <div>
                    <p className="form-label color-foreground">{transaction.description}</p>
                    <span className="text-body-sm color-warning/70">{transaction.accountName} • {formatDate(transaction.occurredAt)}</span>
                  </div>
                </div>
                <span className={`text-body-sm form-label ${
                  transaction.kind === 'revenue' ? 'color-success' : 'color-destructive'
                }`}>{transaction.kind === 'revenue' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}</span>
              </div>
            ))
          ) : (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-md">
              <Calendar className="h-12 w-12 mx-auto mb-md color-muted/50" />
              <p>No recent transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
