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
  ViewSwitcher,
  StateManagerProvider,
  type FieldConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface RevenueClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Revenue {
  id: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  status: 'projected' | 'recognized' | 'received' | 'cancelled';
  source: string;
  expected_date: string;
  received_date?: string;
  recognition_date?: string;
  project_id?: string;
  client_name?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

export default function RevenueClient({ user, orgId, translations }: RevenueClientProps) {
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadRevenues();
  }, [orgId, statusFilter]);

  const loadRevenues = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('revenue')
        .select('*')
        .eq('organization_id', orgId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRevenues(data || []);
    } catch (error) {
      console.error('Error loading revenues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRevenue = () => {
    setSelectedRevenue(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditRevenue = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewRevenue = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteRevenue = async (revenueId: string) => {
    if (!confirm('Are you sure you want to delete this revenue record?')) return;

    try {
      const { error } = await supabase
        .from('revenue')
        .delete()
        .eq('id', revenueId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadRevenues();
    } catch (error) {
      console.error('Error deleting revenue:', error);
    }
  };

  const handleRecognizeRevenue = async (revenueId: string) => {
    try {
      const { error } = await supabase
        .from('revenue')
        .update({
          status: 'recognized',
          recognition_date: new Date().toISOString()
        })
        .eq('id', revenueId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadRevenues();
    } catch (error) {
      console.error('Error recognizing revenue:', error);
    }
  };

  const handleReceiveRevenue = async (revenueId: string) => {
    try {
      const { error } = await supabase
        .from('revenue')
        .update({
          status: 'received',
          received_date: new Date().toISOString()
        })
        .eq('id', revenueId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadRevenues();
    } catch (error) {
      console.error('Error marking revenue as received:', error);
    }
  };

  const handleSaveRevenue = async (revenueData: Partial<Revenue>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('revenue')
          .insert({
            ...revenueData,
            organization_id: orgId,
            created_by: user.id,
            status: 'projected'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedRevenue) {
        const { error } = await supabase
          .from('revenue')
          .update(revenueData)
          .eq('id', selectedRevenue.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadRevenues();
    } catch (error) {
      console.error('Error saving revenue:', error);
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
      projected: { variant: 'secondary' as const, label: 'Projected', color: 'text-blue-600' },
      recognized: { variant: 'default' as const, label: 'Recognized', color: 'text-yellow-600' },
      received: { variant: 'default' as const, label: 'Received', color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', color: 'text-red-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.projected;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'projected':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'recognized':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'title',
      label: 'Revenue Title',
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
        { label: 'Product Sales', value: 'product_sales' },
        { label: 'Service Revenue', value: 'service_revenue' },
        { label: 'Subscription', value: 'subscription' },
        { label: 'Licensing', value: 'licensing' },
        { label: 'Consulting', value: 'consulting' },
        { label: 'Commission', value: 'commission' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'source',
      label: 'Revenue Source',
      type: 'select',
      required: true,
      options: [
        { label: 'Direct Sales', value: 'direct_sales' },
        { label: 'Online Store', value: 'online_store' },
        { label: 'Partner Channel', value: 'partner_channel' },
        { label: 'Marketplace', value: 'marketplace' },
        { label: 'Referral', value: 'referral' },
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
      key: 'expected_date',
      label: 'Expected Date',
      type: 'date',
      required: true
    },
    {
      key: 'client_name',
      label: 'Client Name',
      type: 'text'
    },
    {
      key: 'project_id',
      label: 'Project ID',
      type: 'text'
    }
  ];

  const revenueRecords: DataRecord[] = revenues.map(revenue => ({
    id: revenue.id,
    title: revenue.title,
    description: revenue.description,
    category: revenue.category,
    source: revenue.source,
    amount: revenue.amount,
    currency: revenue.currency,
    status: revenue.status,
    expected_date: revenue.expected_date,
    received_date: revenue.received_date,
    client_name: revenue.client_name,
    created_at: revenue.created_at
  }));

  const statusCounts = {
    all: revenues.length,
    projected: revenues.filter(r => r.status === 'projected').length,
    recognized: revenues.filter(r => r.status === 'recognized').length,
    received: revenues.filter(r => r.status === 'received').length,
    cancelled: revenues.filter(r => r.status === 'cancelled').length
  };

  const totalAmounts = {
    projected: revenues.filter(r => r.status === 'projected').reduce((sum, r) => sum + r.amount, 0),
    recognized: revenues.filter(r => r.status === 'recognized').reduce((sum, r) => sum + r.amount, 0),
    received: revenues.filter(r => r.status === 'received').reduce((sum, r) => sum + r.amount, 0),
    total: revenues.reduce((sum, r) => sum + r.amount, 0)
  };

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
            <ViewSwitcher
              view={currentView}
              onViewChange={setCurrentView}
              views={['grid', 'list']}
            />
            <Button onClick={handleCreateRevenue}>
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status} ({count})
            </Button>
          ))}
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmounts.total)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Projected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmounts.projected)}
                </p>
                <p className="text-xs text-foreground/60">{statusCounts.projected} items</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Recognized</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalAmounts.recognized)}
                </p>
                <p className="text-xs text-foreground/60">{statusCounts.recognized} items</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Received</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmounts.received)}
                </p>
                <p className="text-xs text-foreground/60">{statusCounts.received} items</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Revenue Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenues.map((revenue) => (
              <Card key={revenue.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewRevenue(revenue)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(revenue.status)}
                    <div>
                      <h3 className="font-semibold text-foreground">{revenue.title}</h3>
                      <p className="text-sm text-foreground/70 capitalize">{revenue.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {getStatusBadge(revenue.status)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Amount</span>
                    <span className="font-medium text-green-600">{formatCurrency(revenue.amount, revenue.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Expected</span>
                    <span className="font-medium">{formatDate(revenue.expected_date)}</span>
                  </div>
                  
                  {revenue.received_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Received</span>
                      <span className="font-medium text-green-600">{formatDate(revenue.received_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Source</span>
                    <span className="font-medium capitalize">{revenue.source.replace('_', ' ')}</span>
                  </div>
                  
                  {revenue.client_name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Client</span>
                      <span className="font-medium">{revenue.client_name}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    {revenue.status === 'projected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecognizeRevenue(revenue.id);
                        }}
                      >
                        Recognize
                      </Button>
                    )}
                    {revenue.status === 'recognized' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReceiveRevenue(revenue.id);
                        }}
                      >
                        Mark Received
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRevenue(revenue);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRevenue(revenue.id);
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
          <Card className="p-6">
            <DataGrid
              records={revenueRecords}
              fields={fieldConfigs}
              onEdit={handleEditRevenue}
              onDelete={handleDeleteRevenue}
              onView={handleViewRevenue}
            />
          </Card>
        )}

        {/* Empty State */}
        {revenues.length === 0 && (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No revenue records found</h3>
            <p className="text-foreground/70 mb-4">Start tracking your revenue by adding your first record</p>
            <Button onClick={handleCreateRevenue}>
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Add Revenue' :
            drawerMode === 'edit' ? 'Edit Revenue' : 'Revenue Details'
          }
          mode={drawerMode}
          record={selectedRevenue}
          fields={fieldConfigs}
          onSave={handleSaveRevenue}
        />
      </div>
    </StateManagerProvider>
  );
}
