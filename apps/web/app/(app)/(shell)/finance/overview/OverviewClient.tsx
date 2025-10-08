'use client';


import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { AlertTriangle, ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Badge, Banknote, BarChart3, Button, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle, Clock, CreditCard, DollarSign, Grid, PieChart, TrendingUp } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton
} from '@ghxstship/ui';
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton';
import { Grid, HStack, Stack } from '@ghxstship/ui/components/layouts';

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

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(dateString))

const useFinanceOverview = (supabase: SupabaseClient, orgId: string) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([])

  const loadFinanceOverview = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        const [revenueData, expensesData, budgetsData, invoicesData, accountsData, transactionsData] =
          await Promise.all([
            supabase
              .from('revenue')
              .select('amount, currency')
              .eq('organization_id', orgId)
              .eq('status', 'received'),
            supabase
              .from('expenses')
              .select('amount, currency')
              .eq('organization_id', orgId)
              .eq('status', 'approved'),
            supabase
              .from('budgets')
              .select('id, amount, spent, currency, name')
              .eq('organization_id', orgId),
            supabase.from('invoices').select('amount_due, status').eq('organization_id', orgId),
            supabase.from('finance_accounts').select('balance, currency').eq('organization_id', orgId),
            supabase
              .from('finance_transactions')
              .select('id, description, amount, kind, occurred_at, finance_accounts(name)')
              .eq('organization_id', orgId)
              .order('occurred_at', { ascending: false })
              .limit(10),
          ])

        const errors = [
          revenueData.error,
          expensesData.error,
          budgetsData.error,
          invoicesData.error,
          accountsData.error,
          transactionsData.error,
        ].filter(Boolean)

        if (errors.length > 0) {
          throw errors[0]
        }

        const revenueRows = revenueData.data ?? []
        const expenseRows = expensesData.data ?? []
        const budgetRows = budgetsData.data ?? []
        const invoiceRows = invoicesData.data ?? []
        const accountRows = accountsData.data ?? []
        const transactionRows = transactionsData.data ?? []

        const totalRevenue = revenueRows.reduce((sum, row) => sum + toNumber(row.amount), 0)
        const totalExpenses = expenseRows.reduce((sum, row) => sum + toNumber(row.amount), 0)
        const totalBudget = budgetRows.reduce((sum, row) => sum + toNumber(row.amount), 0)
        const budgetSpent = budgetRows.reduce((sum, row) => sum + toNumber(row.spent), 0)
        const accountsBalance = accountRows.reduce((sum, row) => sum + toNumber(row.balance), 0)

        const primaryCurrency =
          revenueRows.find((row) => row.currency)?.currency ||
          expenseRows.find((row) => row.currency)?.currency ||
          accountRows.find((row) => row.currency)?.currency ||
          'USD'

        const pendingInvoices = invoiceRows.filter((invoice) => invoice.status === 'sent').length
        const overdueInvoices = invoiceRows.filter((invoice) => invoice.status === 'overdue').length

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
          currency: primaryCurrency ?? 'USD'
        }

        setSummary(financialSummary)

        const alerts = budgetRows.reduce<BudgetAlert[]>((acc, budget, index) => {
          const amount = toNumber(budget.amount)
          const spent = toNumber(budget.spent)
          const utilization = amount > 0 ? (spent / amount) * 100 : 0

          if (utilization >= 75) {
            acc.push({
              id: (budget.id as string) ?? `budget-${index}`,
              budgetName: (budget.name as string) ?? 'Unnamed Budget',
              spent,
              amount,
              utilization,
              status: utilization >= 90 ? 'critical' : 'warning'
            })
          }

          return acc
        }, [])

        setBudgetAlerts(alerts)

        const transactions = transactionRows.map((tx) => {
          const kind = (tx.kind as RecentTransaction['kind']) ?? 'expense'
          const financeAccount = Array.isArray(tx.finance_accounts)
            ? tx.finance_accounts[0]
            : (tx.finance_accounts as { name?: string } | null)

          return {
            id: String(tx.id),
            description: (tx.description as string) ?? 'Untitled Transaction',
            amount: toNumber(tx.amount),
            kind,
            occurredAt: tx.occurred_at as string,
            accountName: financeAccount?.name ?? 'Unknown Account'
          }
        })

        setRecentTransactions(transactions)
      } catch (error) {
        console.error('Error loading finance overview:', error)
      } finally {
        if (mode === 'initial') {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      }
    },
    [supabase, orgId],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadFinanceOverview('initial')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFinanceOverview])

  return {
    loading,
    refreshing,
    summary,
    recentTransactions,
    budgetAlerts,
    refresh: () => loadFinanceOverview('refresh')
  }
}

export default function FinanceOverviewClient({ user: _user, orgId, translations }: FinanceOverviewClientProps) {
  const supabase = useMemo(() => createBrowserClient(), []) as unknown as SupabaseClient
  const { loading, refreshing, summary, recentTransactions, budgetAlerts, refresh } = useFinanceOverview(supabase, orgId)

  if (loading) {
    return (
      <Stack spacing="lg">
        <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-sm">
                <Skeleton className="h-icon-xs w-component-lg" />
                <Skeleton className="h-icon-lg w-component-xl" />
                <Skeleton className="h-3 w-component-md" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack spacing="lg">
      <HStack justify="between" align="center">
        <Stack spacing="xs">
          <h1 className="text-heading-3 font-anton uppercase text-foreground">{translations.title}</h1>
          <p className="text-body-sm text-muted-foreground">{translations.subtitle}</p>
        </Stack>
        <Button onClick={refresh} disabled={refreshing} variant={refreshing ? 'outline' : 'default'}>
          <HStack spacing="xs" align="center">
            <BarChart3 className="h-icon-xs w-icon-xs" />
            <span>{refreshing ? 'Refreshing…' : 'Refresh Data'}</span>
          </HStack>
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-heading-3 font-semibold text-success">
                  {formatCurrency(summary?.totalRevenue ?? 0, summary?.currency)}
                </span>
                <HStack spacing="xs" align="center" className="text-sm text-success">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5% from last month</span>
                </HStack>
              </Stack>
              <Banknote className="h-icon-lg w-icon-lg text-success" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-heading-3 font-semibold text-destructive">
                  {formatCurrency(summary?.totalExpenses ?? 0, summary?.currency)}
                </span>
                <HStack spacing="xs" align="center" className="text-sm text-destructive">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.2% from last month</span>
                </HStack>
              </Stack>
              <CreditCard className="h-icon-lg w-icon-lg text-destructive" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Net Income</span>
                <span
                  className={`text-heading-3 font-semibold ${
                    (summary?.netIncome ?? 0) >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {formatCurrency(summary?.netIncome ?? 0, summary?.currency)}
                </span>
                <HStack spacing="xs" align="center" className="text-sm text-muted-foreground">
                  {(summary?.netIncome ?? 0) >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span>Revenue - Expenses</span>
                </HStack>
              </Stack>
              <DollarSign className="h-icon-lg w-icon-lg text-accent" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Budget Utilization</span>
                <span className="text-heading-3 font-semibold text-foreground">
                  {(summary?.budgetUtilization ?? 0).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  of {formatCurrency(summary?.totalBudget ?? 0, summary?.currency)}
                </span>
              </Stack>
              <PieChart className="h-icon-lg w-icon-lg text-secondary" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Accounts Balance</span>
                <span className="text-heading-3 font-semibold text-foreground">
                  {formatCurrency(summary?.accountsBalance ?? 0, summary?.currency)}
                </span>
                <span className="text-sm text-muted-foreground">Across all accounts</span>
              </Stack>
              <Banknote className="h-icon-lg w-icon-lg text-success" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Pending Invoices</span>
                <span className="text-heading-3 font-semibold text-accent">{summary?.pendingInvoices ?? 0}</span>
                <span className="text-sm text-muted-foreground">Awaiting payment</span>
              </Stack>
              <Clock className="h-icon-lg w-icon-lg text-warning" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Overdue Invoices</span>
                <span className="text-heading-3 font-semibold text-destructive">{summary?.overdueInvoices ?? 0}</span>
                <span className="text-sm text-muted-foreground">Require attention</span>
              </Stack>
              <AlertTriangle className="h-icon-lg w-icon-lg text-destructive" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="start">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">Cash Flow</span>
                <span
                  className={`text-heading-3 font-semibold ${
                    (summary?.cashFlow ?? 0) >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {formatCurrency(summary?.cashFlow ?? 0, summary?.currency)}
                </span>
                <span className="text-sm text-muted-foreground">+12% from last month</span>
              </Stack>
              <TrendingUp className="h-icon-lg w-icon-lg text-accent" />
            </HStack>
          </CardContent>
        </Card>
      </Grid>

      {budgetAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <CardTitle className="text-lg text-foreground">Budget Alerts</CardTitle>
                <CardDescription>Stay ahead of approaching limits</CardDescription>
              </Stack>
              <Badge variant="secondary">{budgetAlerts.length} alerts</Badge>
            </HStack>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              {budgetAlerts.map((alert) => (
                <HStack
                  key={alert.id}
                  spacing="md"
                  justify="between"
                  align="center"
                  className="rounded-lg border border-warning/20 bg-warning/10 p-md"
                >
                  <HStack spacing="sm" align="center">
                    <AlertTriangle
                      className={`h-icon-sm w-icon-sm ${alert.status === 'critical' ? 'text-destructive' : 'text-warning'}`}
                    />
                    <Stack spacing="xs">
                      <span className="text-sm font-medium text-foreground">{alert.budgetName}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(alert.spent, summary?.currency)} of {formatCurrency(alert.amount, summary?.currency)} spent
                        ({alert.utilization.toFixed(1)}%)
                      </span>
                    </Stack>
                  </HStack>
                  <Badge variant={alert.status === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.status === 'critical' ? 'Over Budget' : 'Near Limit'}
                  </Badge>
                </HStack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Stack spacing="xs">
              <CardTitle className="text-lg text-foreground">Recent Transactions</CardTitle>
              <CardDescription>Latest revenue and expense activity</CardDescription>
            </Stack>
            <Button variant="secondary">View All</Button>
          </HStack>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <Stack spacing="sm">
              {recentTransactions.map((transaction) => (
                <HStack
                  key={transaction.id}
                  spacing="sm"
                  justify="between"
                  align="center"
                  className="rounded-lg border border-border bg-card/40 p-md"
                >
                  <HStack spacing="sm" align="center">
                    {transaction.kind === 'revenue' ? (
                      <ArrowUpRight className="h-icon-xs w-icon-xs text-success" />
                    ) : (
                      <ArrowDownRight className="h-icon-xs w-icon-xs text-destructive" />
                    )}
                    <Stack spacing="xs">
                      <span className="text-sm font-medium text-foreground">{transaction.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.accountName} • {formatDate(transaction.occurredAt)}
                      </span>
                    </Stack>
                  </HStack>
                  <span
                    className={`text-sm font-medium ${
                      transaction.kind === 'revenue' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {transaction.kind === 'revenue' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount), summary?.currency)}
                  </span>
                </HStack>
              ))}
            </Stack>
          ) : (
            <Stack
              spacing="md"
              align="center"
              className="rounded-lg border border-dashed border-warning/30 bg-warning/10 p-xl text-center"
            >
              <Calendar className="h-icon-2xl w-icon-2xl text-muted-foreground/60" />
              <Stack spacing="xs">
                <span className="text-sm font-medium text-foreground">No recent transactions found</span>
                <span className="text-sm text-muted-foreground">
                  Keep your books up-to-date to see activity here.
                </span>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
