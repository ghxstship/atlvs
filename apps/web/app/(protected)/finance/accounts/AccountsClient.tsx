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
  Banknote,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard
} from 'lucide-react';

interface AccountsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Account {
  id: string;
  name: string;
  description?: string;
  kind: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  balance: number;
  currency: string;
  account_number?: string;
  bank_name?: string;
  is_active: boolean;
  last_reconciled_at?: string;
  reconciliation_balance?: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export default function AccountsClient({ user, orgId, translations }: AccountsClientProps) {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [reconcileDrawerOpen, setReconcileDrawerOpen] = useState(false);
  const [reconcileBalance, setReconcileBalance] = useState<number>(0);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadAccounts();
  }, [orgId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('finance_accounts')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('finance_accounts')
        .delete()
        .eq('id', accountId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleReconcileAccount = (account: Account) => {
    setSelectedAccount(account);
    setReconcileBalance(account.reconciliation_balance || account.balance);
    setReconcileDrawerOpen(true);
  };

  const handleSaveReconciliation = async () => {
    if (!selectedAccount) return;

    try {
      const { error } = await supabase
        .from('finance_accounts')
        .update({
          reconciliation_balance: reconcileBalance,
          last_reconciled_at: new Date().toISOString()
        })
        .eq('id', selectedAccount.id)
        .eq('organization_id', orgId);

      if (error) throw error;
      
      setReconcileDrawerOpen(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error saving reconciliation:', error);
    }
  };

  const handleSaveAccount = async (accountData: Partial<Account>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('finance_accounts')
          .insert({
            ...accountData,
            organization_id: orgId,
            balance: accountData.balance || 0,
            is_active: true
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedAccount) {
        const { error } = await supabase
          .from('finance_accounts')
          .update(accountData)
          .eq('id', selectedAccount.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountIcon = (kind: string) => {
    switch (kind) {
      case 'checking':
      case 'savings':
        return <Building2 className="h-6 w-6 text-primary" />;
      case 'credit':
        return <CreditCard className="h-6 w-6 text-secondary" />;
      case 'investment':
        return <TrendingUp className="h-6 w-6 text-success" />;
      case 'cash':
        return <Banknote className="h-6 w-6 text-warning" />;
      default:
        return <DollarSign className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getReconciliationStatus = (account: Account) => {
    if (!account.last_reconciled_at) {
      return { status: 'never', color: 'text-muted-foreground', label: 'Never Reconciled' };
    }

    const daysSince = Math.floor((Date.now() - new Date(account.last_reconciled_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 7) {
      return { status: 'recent', color: 'text-success', label: 'Recently Reconciled' };
    } else if (daysSince <= 30) {
      return { status: 'moderate', color: 'text-warning', label: 'Needs Reconciliation' };
    } else {
      return { status: 'overdue', color: 'text-destructive', label: 'Overdue for Reconciliation' };
    }
  };

  const getBalanceDifference = (account: Account) => {
    if (!account.reconciliation_balance) return null;
    return account.balance - account.reconciliation_balance;
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'name',
      label: 'Account Name',
      type: 'text',
      required: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'kind',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Checking Account', value: 'checking' },
        { label: 'Savings Account', value: 'savings' },
        { label: 'Credit Card', value: 'credit' },
        { label: 'Investment Account', value: 'investment' },
        { label: 'Cash Account', value: 'cash' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'balance',
      label: 'Current Balance',
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
      key: 'account_number',
      label: 'Account Number',
      type: 'text'
    },
    {
      key: 'bank_name',
      label: 'Bank/Institution Name',
      type: 'text'
    },
    {
      key: 'is_active',
      label: 'Active Account',
      type: 'boolean',
      defaultValue: true
    }
  ];

  const accountRecords: DataRecord[] = accounts.map(account => ({
    id: account.id,
    name: account.name,
    description: account.description,
    kind: account.kind,
    balance: account.balance,
    currency: account.currency,
    bank_name: account.bank_name,
    is_active: account.is_active,
    last_reconciled_at: account.last_reconciled_at,
    created_at: account.created_at
  }));

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = accounts.filter(account => account.is_active);
  const needsReconciliation = accounts.filter(account => {
    const status = getReconciliationStatus(account);
    return status.status === 'moderate' || status.status === 'overdue';
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
            <Button onClick={handleCreateAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Accounts</p>
                <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
                <p className="text-xs text-foreground/60">{activeAccounts.length} active</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Balance</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Needs Reconciliation</p>
                <p className="text-2xl font-bold text-warning">{needsReconciliation.length}</p>
                <p className="text-xs text-foreground/60">accounts overdue</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Average Balance</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatCurrency(accounts.length > 0 ? totalBalance / accounts.length : 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </Card>
        </div>

        {/* Account Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const reconciliationStatus = getReconciliationStatus(account);
              const balanceDiff = getBalanceDifference(account);
              
              return (
                <Card key={account.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewAccount(account)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getAccountIcon(account.kind)}
                      <div>
                        <h3 className="font-semibold text-foreground">{account.name}</h3>
                        <p className="text-sm text-foreground/70 capitalize">{account.kind.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Balance</span>
                      <span className="font-medium text-success">{formatCurrency(account.balance, account.currency)}</span>
                    </div>
                    
                    {account.bank_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Bank</span>
                        <span className="font-medium">{account.bank_name}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Last Reconciled</span>
                      <span className={`font-medium ${reconciliationStatus.color}`}>
                        {formatDate(account.last_reconciled_at)}
                      </span>
                    </div>
                    
                    {balanceDiff !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Difference</span>
                        <span className={`font-medium ${balanceDiff === 0 ? 'text-success' : balanceDiff > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {balanceDiff === 0 ? 'Balanced' : formatCurrency(Math.abs(balanceDiff))}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleReconcileAccount(account);
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reconcile
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleEditAccount(account);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteAccount(account.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6">
            <DataGrid />
          </Card>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No accounts found</h3>
            <p className="text-foreground/70 mb-4">Add your first financial account to start tracking</p>
            <Button onClick={handleCreateAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Create New Account"
        >
          <div className="p-4">
            <p>Account creation form will be implemented here.</p>
          </div>
        </Drawer>

        {/* Reconciliation Drawer */}
        {reconcileDrawerOpen && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reconcile Account</h3>
                <Button onClick={() => setReconcileDrawerOpen(false)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/70 mb-2">Account: {selectedAccount.name}</p>
                  <p className="text-sm text-foreground/70 mb-2">Current Balance: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bank Statement Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={reconcileBalance}
                    onChange={(e) => setReconcileBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-foreground/70">
                    Difference: {formatCurrency(selectedAccount.balance - reconcileBalance, selectedAccount.currency)}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="ghost" onClick={() => setReconcileDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveReconciliation}>
                    Save Reconciliation
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </StateManagerProvider>
  );
}
