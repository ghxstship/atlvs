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
  ArrowDown
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
          <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
        </div>
        <Button onClick={loadFinanceOverview}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.totalRevenue || 0, summary?.currency)}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <Banknote className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.totalExpenses || 0, summary?.currency)}
              </p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last month
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        {/* Net Income */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Net Income</p>
              <p className={`text-2xl font-bold ${(summary?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.netIncome || 0, summary?.currency)}
              </p>
              <p className="text-xs text-foreground/60 flex items-center mt-1">
                {(summary?.netIncome || 0) >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                Revenue - Expenses
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        {/* Budget Utilization */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Budget Utilization</p>
              <p className="text-2xl font-bold text-foreground">
                {(summary?.budgetUtilization || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-foreground/60 mt-1">
                of {formatCurrency(summary?.totalBudget || 0, summary?.currency)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        {/* Accounts Balance */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Accounts Balance</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(summary?.accountsBalance || 0, summary?.currency)}
              </p>
              <p className="text-xs text-foreground/60 mt-1">Across all accounts</p>
            </div>
            <Banknote className="h-8 w-8 text-indigo-500" />
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Pending Invoices</p>
              <p className="text-2xl font-bold text-yellow-600">{summary?.pendingInvoices || 0}</p>
              <p className="text-xs text-foreground/60 mt-1">Awaiting payment</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        {/* Overdue Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-600">{summary?.overdueInvoices || 0}</p>
              <p className="text-xs text-foreground/60 mt-1">Require attention</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        {/* Cash Flow */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Cash Flow</p>
              <p className={`text-2xl font-bold ${(summary?.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.cashFlow || 0, summary?.currency)}
              </p>
              <p className="text-xs text-foreground/60 mt-1">This month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Budget Alerts</h3>
            <Badge variant="secondary">{budgetAlerts.length} alerts</Badge>
          </div>
          <div className="space-y-3">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${alert.status === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div>
                    <p className="font-medium text-foreground">{alert.budgetName}</p>
                    <p className="text-sm text-foreground/70">
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <Button>View All</Button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  {transaction.kind === 'revenue' ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-foreground/70">{transaction.accountName} • {formatDate(transaction.occurredAt)}</p>
                  </div>
                </div>
                <p className={`font-semibold ${transaction.kind === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.kind === 'revenue' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-foreground/50">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
              <p>No recent transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
