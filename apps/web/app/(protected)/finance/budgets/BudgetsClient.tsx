'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  UniversalDrawer,
  DataGrid,
  DataActions,
  StateManagerProvider,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  DollarSign,
  Plus,
  Edit,
  Grid3x3,
  List,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface BudgetsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Budget {
  id: string;
  name: string;
  description?: string;
  category: string;
  amount: number;
  spent: number;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  period_start: string;
  period_end: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

function BudgetsClient({ user, orgId, translations }: BudgetsClientProps) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadBudgets();
  }, [orgId]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleSaveBudget = async (budgetData: Partial<Budget>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('budgets')
          .insert({
            ...budgetData,
            organization_id: orgId,
            created_by: user.id,
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedBudget) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', selectedBudget.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getBudgetUtilization = (budget: Budget) => {
    return budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  };

  const getBudgetStatus = (budget: Budget) => {
    const utilization = getBudgetUtilization(budget);
    if (budget.status === 'cancelled') return { color: 'text-gray-500', label: 'Cancelled' };
    if (budget.status === 'completed') return { color: 'text-green-600', label: 'Completed' };
    if (utilization >= 100) return { color: 'text-red-600', label: 'Over Budget' };
    if (utilization >= 90) return { color: 'text-orange-600', label: 'Near Limit' };
    if (utilization >= 75) return { color: 'text-yellow-600', label: 'On Track' };
    return { color: 'text-green-600', label: 'Under Budget' };
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'name',
      label: 'Budget Name',
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
        { label: 'Marketing', value: 'marketing' },
        { label: 'Operations', value: 'operations' },
        { label: 'Personnel', value: 'personnel' },
        { label: 'Technology', value: 'technology' },
        { label: 'Travel', value: 'travel' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'amount',
      label: 'Budget Amount',
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
      key: 'period_start',
      label: 'Period Start',
      type: 'date',
      required: true
    },
    {
      key: 'period_end',
      label: 'Period End',
      type: 'date',
      required: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    }
  ];

  const dataViewConfig: DataViewConfig = {
    id: 'budgets',
    name: 'Budgets',
    viewType: 'grid',
    fields: fieldConfigs
  };

  const budgetRecords: DataRecord[] = budgets.map(budget => ({
    id: budget.id,
    name: budget.name,
    description: budget.description,
    category: budget.category,
    amount: budget.amount,
    spent: budget.spent,
    currency: budget.currency,
    status: budget.status,
    period_start: budget.period_start,
    period_end: budget.period_end,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
    utilization: getBudgetUtilization(budget),
    remaining: budget.amount - budget.spent
  }));

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
              <Skeleton className="h-2 w-full mb-2" />
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
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant={currentView === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('grid')}
                className="gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={currentView === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
            <Button onClick={handleCreateBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Budgets</p>
                <p className="text-2xl font-bold text-foreground">{budgets.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Allocated</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Avg Utilization</p>
                <p className="text-2xl font-bold text-foreground">
                  {budgets.length > 0 
                    ? (budgets.reduce((sum, b) => sum + getBudgetUtilization(b), 0) / budgets.length).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Budget Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const utilization = getBudgetUtilization(budget);
              const status = getBudgetStatus(budget);
              
              return (
                <Card key={budget.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewBudget(budget)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{budget.name}</h3>
                      <p className="text-sm text-foreground/70 capitalize">{budget.category}</p>
                    </div>
                    <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                      {budget.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Budget</span>
                      <span className="font-medium">{formatCurrency(budget.amount, budget.currency)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Spent</span>
                      <span className="font-medium">{formatCurrency(budget.spent, budget.currency)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Utilization</span>
                        <span className={`font-medium ${status.color}`}>{utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            utilization >= 100 ? 'bg-red-500' :
                            utilization >= 90 ? 'bg-orange-500' :
                            utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Remaining</span>
                      <span className={`font-medium ${budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budget.amount - budget.spent, budget.currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className={`text-xs ${status.color}`}>{status.label}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBudget(budget);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBudget(budget.id);
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Spent</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{budget.name}</td>
                      <td className="p-2">{budget.category}</td>
                      <td className="p-2">${budget.amount?.toLocaleString()}</td>
                      <td className="p-2">${budget.spent?.toLocaleString()}</td>
                      <td className="p-2">
                        <Badge variant={budget.status === 'active' ? 'success' : 'secondary'}>
                          {budget.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBudget(budget)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {budgets.length === 0 && (
          <Card className="p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No budgets found</h3>
            <p className="text-foreground/70 mb-4">Create your first budget to start tracking expenses</p>
            <Button onClick={handleCreateBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Create Budget' :
            drawerMode === 'edit' ? 'Edit Budget' : 'Budget Details'
          }
          mode={drawerMode}
          record={selectedBudget}
          fields={fieldConfigs}
          onSave={handleSaveBudget}
        />
      </div>
    </StateManagerProvider>
  );
}

export default BudgetsClient;
