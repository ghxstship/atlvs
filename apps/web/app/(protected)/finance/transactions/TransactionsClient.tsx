'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  Drawer,
  DataGrid,
  ViewSwitcher,
  StateManagerProvider,
  type FieldConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  ArrowUpDown,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

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

  useEffect(() => {
    loadData();
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
      currency: currency,
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
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
            <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <ViewSwitcher />
            <Button onClick={handleCreateTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          {/* Status Filter */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
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
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalAmounts.debit)}
                </p>
                <p className="text-xs text-foreground/60">{kindCounts.debit} transactions</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmounts.credit)}
                </p>
                <p className="text-xs text-foreground/60">{kindCounts.credit} transactions</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Net Amount</p>
                <p className={`text-2xl font-bold ${totalAmounts.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalAmounts.net)}
                </p>
                <p className="text-xs text-foreground/60">Credits - Debits</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Transaction List/Grid View */}
        {currentView === 'list' ? (
          <Card className="p-6">
            <div className="space-y-4">
              {transactionRecords.map((transaction) => {
                const txData = transactions.find(t => t.id === transaction.id)!;
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleViewTransaction(txData)}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {txData.kind === 'credit' ? (
                          <ArrowUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-red-500" />
                        )}
                        {getStatusIcon(txData.status)}
                      </div>
                      
                      <div>
                        <p className="font-medium text-foreground">{txData.description}</p>
                        <p className="text-sm text-foreground/70">
                          {txData.account?.name} • {txData.category} • {formatDateTime(txData.occurred_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-semibold ${txData.kind === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txData.kind === 'credit' ? '+' : '-'}{formatCurrency(txData.amount, txData.currency)}
                        </p>
                        {getStatusBadge(txData.status)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                         
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTransaction(txData);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                         
                          onClick={(e) => {
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
          <Card className="p-6">
            <DataGrid />
          </Card>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Card className="p-12 text-center">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
            <p className="text-foreground/70 mb-4">Start tracking your financial transactions</p>
            <Button onClick={handleCreateTransaction}>
              <Plus className="h-4 w-4 mr-2" />
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
          <div className="p-4">
            <p>Transaction form will be implemented here.</p>
          </div>
        </Drawer>
      </div>
    </StateManagerProvider>
  );
}
