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
  DataActions,
  StateManagerProvider,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  Receipt,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  User as UserIcon
} from 'lucide-react';

interface ExpensesClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Expense {
  id: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_by: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  payment_date?: string;
  receipt_url?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export default function ExpensesClient({ user, orgId, translations }: ExpensesClientProps) {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadExpenses();
  }, [orgId, statusFilter]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', orgId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', expenseId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleRejectExpense = async (expenseId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejected_reason: reason || 'No reason provided'
        })
        .eq('id', expenseId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const handleSubmitExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'submitted',
          submitted_by: user.id,
          submitted_at: new Date().toISOString()
        })
        .eq('id', expenseId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadExpenses();
    } catch (error) {
      console.error('Error submitting expense:', error);
    }
  };

  const handleSaveExpense = async (expenseData: Partial<Expense>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('expenses')
          .insert({
            ...expenseData,
            organization_id: orgId,
            submitted_by: user.id,
            status: 'draft'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', selectedExpense.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      submitted: { variant: 'default' as const, label: 'Submitted' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      paid: { variant: 'default' as const, label: 'Paid' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'title',
      label: 'Expense Title',
      type: 'text',
      required: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Travel', value: 'travel' },
        { label: 'Meals', value: 'meals' },
        { label: 'Office Supplies', value: 'office_supplies' },
        { label: 'Software', value: 'software' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Training', value: 'training' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Other', value: 'other' }
      ]
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
      key: 'expense_date',
      label: 'Expense Date',
      type: 'date',
      required: true
    },
    {
      key: 'receipt_url',
      label: 'Receipt URL',
      type: 'text'
    }
  ];

  const expenseRecords: DataRecord[] = expenses.map(expense => ({
    id: expense.id,
    title: expense.title,
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    currency: expense.currency,
    status: expense.status,
    expense_date: expense.expense_date,
    created_at: expense.created_at
  }));

  const statusCounts = {
    all: expenses.length,
    draft: expenses.filter(e => e.status === 'draft').length,
    submitted: expenses.filter(e => e.status === 'submitted').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    paid: expenses.filter(e => e.status === 'paid').length
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-lg">
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
      <div className="stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="text-body-sm color-foreground/70 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center cluster-sm">
            <ViewSwitcher />
            <Button onClick={handleCreateExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Create Expense
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex cluster-xs bg-secondary p-xs rounded-lg w-fit">
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

        {/* Expense Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Expenses</p>
                <p className="text-heading-3 text-heading-3 color-foreground">{expenses.length}</p>
              </div>
              <Receipt className="h-8 w-8 color-primary" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Amount</p>
                <p className="text-heading-3 text-heading-3 color-destructive">
                  {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 color-destructive" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Pending Approval</p>
                <p className="text-heading-3 text-heading-3 color-warning">{statusCounts.submitted}</p>
              </div>
              <Clock className="h-8 w-8 color-warning" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Approved</p>
                <p className="text-heading-3 text-heading-3 color-success">{statusCounts.approved}</p>
              </div>
              <Check className="h-8 w-8 color-success" />
            </div>
          </Card>
        </div>

        {/* Expense Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewExpense(expense)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-heading-4 color-foreground">{expense.title}</h3>
                    <p className="text-body-sm color-foreground/70 capitalize">{expense.category}</p>
                  </div>
                  {getStatusBadge(expense.status)}
                </div>
                
                <div className="stack-sm mb-4">
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Amount</span>
                    <span className="form-label">{formatCurrency(expense.amount, expense.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Date</span>
                    <span className="form-label">{formatDate(expense.expense_date)}</span>
                  </div>
                  
                  {expense.description && (
                    <div className="text-body-sm color-foreground/70">
                      {expense.description.length > 100 
                        ? `${expense.description.substring(0, 100)}...`
                        : expense.description
                      }
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex cluster-sm">
                    {expense.status === 'draft' && (
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleSubmitExpense(expense.id);
                        }}
                      >
                        Submit
                      </Button>
                    )}
                    {expense.status === 'submitted' && (
                      <>
                        <Button
                          variant="ghost"
                         
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleApproveExpense(expense.id);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                         
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            const reason = prompt('Rejection reason:');
                            if (reason !== null) {
                              handleRejectExpense(expense.id, reason);
                            }
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex cluster-sm">
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditExpense(expense);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteExpense(expense.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-lg">
            <DataGrid />
          </Card>
        )}

        {/* Empty State */}
        {expenses.length === 0 && (
          <Card className="p-2xl text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 color-foreground/30" />
            <h3 className="text-body text-heading-4 color-foreground mb-2">No expenses found</h3>
            <p className="color-foreground/70 mb-4">Create your first expense to start tracking</p>
            <Button onClick={handleCreateExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Create Expense
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Create New Expense"
        >
          <div className="p-md">
            <p>Expense creation form will be implemented here.</p>
          </div>
        </Drawer>

      </div>
    </StateManagerProvider>
  );
}
