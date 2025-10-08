'use client';


import { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Badge, Button, Card, DataGrid, Drawer, Skeleton, StateManagerProvider, ViewSwitcher, type DataRecord } from '@ghxstship/ui';
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Calendar, CheckCircle, Clock, DollarSign, Edit, FileText, Filter, Plus, Search, Trash2 } from 'lucide-react';

interface TransactionsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  kind: 'debit' | 'credit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  category: string;
  account_id: string;
  reference_type?: 'invoice' | 'expense' | 'budget' | 'revenue';
  reference_id?: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
  account?: {
    name: string;
    kind: string;
  };
}

export default function TransactionsClient({ user, orgId, translations }: TransactionsClientProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, statusFilter, kindFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load accounts for dropdown
      const { data: accountsData } = await supabase
        .from('finance_accounts')
        .select('id, name, kind')
        .eq('organization_id', orgId);
      
      setAccounts(accountsData || []);

      // Load transactions with account info
      let query = supabase
        .from('finance_transactions')
        .select(`
          *,
          finance_accounts (
            name,
            kind
          )
        `)
        .eq('organization_id', orgId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (kindFilter !== 'all') {
        query = query.eq('kind', kindFilter);
      }

      const { data, error } = await query.order('occurred_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    setSelectedTransaction(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', transactionId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('finance_transactions')
          .insert({
            ...transactionData,
            organization_id: orgId,
            created_by: user.id,
            status: 'pending'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedTransaction) {
        const { error } = await supabase
          .from('finance_transactions')
          .update(transactionData)
          .eq('id', selectedTransaction.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-icon-xs w-icon-xs color-warning" />;
      case 'completed':
        return <CheckCircle className="h-icon-xs w-icon-xs color-success" />;
      case 'failed':
      case 'cancelled':
        return <AlertTriangle className="h-icon-xs w-icon-xs color-destructive" />;
      default:
        return <Clock className="h-icon-xs w-icon-xs color-muted" />;
    }
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      required: true
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      required: true
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }
      ]
    },
    {
      key: 'kind',
      label: 'Transaction Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Debit (Money Out)', value: 'debit' },
        { label: 'Credit (Money In)', value: 'credit' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Revenue', value: 'revenue' },
        { label: 'Expense', value: 'expense' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Fee', value: 'fee' },
        { label: 'Refund', value: 'refund' },
        { label: 'Adjustment', value: 'adjustment' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'account_id',
      label: 'Account',
      type: 'select',
      required: true,
      options: accounts.map(account => ({
        label: `${account.name} (${account.kind})`,
        value: account.id
      }))
    },
    {
      key: 'occurred_at',
      label: 'Transaction Date',
      type: 'text',
      required: true
    },
    {
      key: 'reference_type',
      label: 'Reference Type',
      type: 'select',
      options: [
        { label: 'None', value: '' },
        { label: 'Invoice', value: 'invoice' },
        { label: 'Expense', value: 'expense' },
        { label: 'Budget', value: 'budget' },
        { label: 'Revenue', value: 'revenue' }
      ]
    },
    {
      key: 'reference_id',
      label: 'Reference ID',
      type: 'text'
    }
  ];

  const transactionRecords: DataRecord[] = transactions
    .filter(transaction => 
      searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(transaction => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      kind: transaction.kind,
      status: transaction.status,
      category: transaction.category,
      account_name: transaction.account?.name || 'Unknown Account',
      occurred_at: transaction.occurred_at,
      created_at: transaction.created_at
    }));

  const statusCounts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    cancelled: transactions.filter(t => t.status === 'cancelled').length
  };

  const kindCounts = {
    all: transactions.length,
    debit: transactions.filter(t => t.kind === 'debit').length,
    credit: transactions.filter(t => t.kind === 'credit').length
  };

  const totalAmounts = {
    debit: transactions.filter(t => t.kind === 'debit').reduce((sum, t) => sum + t.amount, 0),
    credit: transactions.filter(t => t.kind === 'credit').reduce((sum, t) => sum + t.amount, 0),
    net: transactions.reduce((sum, t) => sum + (t.kind === 'credit' ? t.amount : -t.amount), 0)
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <Skeleton className="h-icon-lg w-container-xs" />
          <Skeleton className="h-icon-xl w-component-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <Skeleton className="h-icon-xs w-component-xl mb-sm" />
              <Skeleton className="h-icon-md w-component-lg mb-md" />
              <Skeleton className="h-icon-xs w-component-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
          </div>
          <div className="flex items-center cluster-sm">
            <ViewSwitcher />
            <Button onClick={handleCreateTransaction}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-md">
          {/* Search */}
          <div className="relative">
            <Search className="h-icon-xs w-icon-xs absolute left-3 top-xs/2 transform -translate-y-1/2 color-foreground/50" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-2xl pr-md py-sm border border-border rounded-md bg-background color-foreground"
            />
          </div>

          {/* Status Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
               
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status} ({count})
              </Button>
            ))}
          </div>

          {/* Kind Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(kindCounts).map(([kind, count]) => (
              <Button
                key={kind}
                variant={kindFilter === kind ? 'primary' : 'ghost'}
               
                onClick={() => setKindFilter(kind)}
                className="capitalize"
              >
                {kind} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Transactions</p>
                <p className="text-heading-3 text-heading-3 color-foreground">{transactions.length}</p>
              </div>
              <ArrowUpDown className="h-icon-lg w-icon-lg color-accent" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Debits</p>
                <p className="text-heading-3 text-heading-3 color-destructive">
                  {formatCurrency(totalAmounts.debit)}
                </p>
                <p className="text-body-sm color-foreground/60">{kindCounts.debit} transactions</p>
              </div>
              <ArrowDown className="h-icon-lg w-icon-lg color-destructive" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Credits</p>
                <p className="text-heading-3 text-heading-3 color-success">
                  {formatCurrency(totalAmounts.credit)}
                </p>
                <p className="text-body-sm color-foreground/60">{kindCounts.credit} transactions</p>
              </div>
              <ArrowUp className="h-icon-lg w-icon-lg color-success" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Net Amount</p>
                <p className={`text-heading-3 text-heading-3 ${totalAmounts.net >= 0 ? 'color-success' : 'color-destructive'}`}>
                  {formatCurrency(totalAmounts.net)}
                </p>
                <p className="text-body-sm color-foreground/60">Credits - Debits</p>
              </div>
              <DollarSign className="h-icon-lg w-icon-lg color-secondary" />
            </div>
          </Card>
        </div>

        {/* Transaction List/Grid View */}
        {currentView === 'list' ? (
          <Card className="p-lg">
            <div className="stack-md">
              {transactionRecords.map((transaction: any) => {
                const txData = transactions.find(t => t.id === transaction.id)!;
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-md border border-border rounded-lg hover:bg-secondary/50 cursor-pointer" onClick={() => handleViewTransaction(txData)}>
                    <div className="flex items-center cluster">
                      <div className="flex items-center cluster-sm">
                        {txData.kind === 'credit' ? (
                          <ArrowUp className="h-icon-sm w-icon-sm color-success" />
                        ) : (
                          <ArrowDown className="h-icon-sm w-icon-sm color-destructive" />
                        )}
                        {getStatusIcon(txData.status)}
                      </div>
                      
                      <div>
                        <p className="form-label color-foreground">{txData.description}</p>
                        <p className="text-body-sm color-foreground/70">
                          {txData.account?.name} • {txData.category} • {formatDateTime(txData.occurred_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center cluster">
                      <div className="text-right">
                        <p className={`text-heading-4 ${txData.kind === 'credit' ? 'color-success' : 'color-destructive'}`}>
                          {txData.kind === 'credit' ? '+' : '-'}{formatCurrency(txData.amount, txData.currency)}
                        </p>
                        {getStatusBadge(txData.status)}
                      </div>
                      
                      <div className="flex cluster-sm">
                        <Button
                          variant="ghost"
                         
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleEditTransaction(txData);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                         
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDeleteTransaction(txData.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-lg">
            <DataGrid />
          </Card>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Card className="p-xsxl text-center">
            <ArrowUpDown className="h-icon-2xl w-icon-2xl mx-auto mb-md color-foreground/30" />
            <h3 className="text-body text-heading-4 color-foreground mb-sm">No transactions found</h3>
            <p className="color-foreground/70 mb-md">Start tracking your financial transactions</p>
            <Button onClick={handleCreateTransaction}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              Add Transaction
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Add Transaction' :
            drawerMode === 'edit' ? 'Edit Transaction' : 'Transaction Details'
          }
        >
          <div className="p-md">
            <p>Transaction form will be implemented here.</p>
          </div>
        </Drawer>
      </div>
    </StateManagerProvider>
  );
}
