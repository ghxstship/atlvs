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
  DataActions,
  StateManagerProvider,
  Input,
  Select,
  Textarea,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User as UserIcon
} from 'lucide-react';

interface InvoicesClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date?: string;
  description?: string;
  line_items: InvoiceLineItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function InvoicesClient({ user, orgId, translations }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    fetchInvoices();
  }, [orgId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setLineItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, total: 0 }]);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLineItems(invoice.line_items || []);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLineItems(invoice.line_items || []);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
      
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('invoices')
          .insert({
            ...invoiceData,
            organization_id: orgId,
            amount: totalAmount,
            line_items: lineItems,
            invoice_number: `INV-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedInvoice) {
        const { error } = await supabase
          .from('invoices')
          .update({
            ...invoiceData,
            amount: totalAmount,
            line_items: lineItems,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedInvoice.id);

        if (error) throw error;
      }

      setDrawerOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;
      fetchInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: crypto.randomUUID(), 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      total: 0 
    }]);
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
      paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'client_name',
      label: 'Client',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      sortable: true,
      filterable: true,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      sortable: true,
      filterable: true,
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      type: 'date',
      sortable: true,
      filterable: true,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      type: 'date',
      sortable: true,
      filterable: true,
    },
  ];

  const dataViewConfig: DataViewConfig = {
    defaultView: 'grid',
    enableSearch: true,
    enableFilters: true,
    enableSorting: true,
    enableExport: true,
    pageSize: 20,
  };

  const invoiceRecords: DataRecord[] = invoices.map(invoice => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    client_name: invoice.client_name,
    amount: formatCurrency(invoice.amount, invoice.currency),
    status: invoice.status,
    issue_date: formatDate(invoice.issue_date),
    due_date: formatDate(invoice.due_date),
    _raw: invoice,
  }));

  const renderInvoiceForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Client Name *
          </label>
          <Input
            defaultValue={selectedInvoice?.client_name || ''}
            placeholder="Enter client name"
            onChange={(e) => {
              if (selectedInvoice) {
                setSelectedInvoice({ ...selectedInvoice, client_name: e.target.value });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Client Email
          </label>
          <Input
            type="email"
            defaultValue={selectedInvoice?.client_email || ''}
            placeholder="client@example.com"
            onChange={(e) => {
              if (selectedInvoice) {
                setSelectedInvoice({ ...selectedInvoice, client_email: e.target.value });
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Issue Date *
          </label>
          <Input
            type="date"
            defaultValue={selectedInvoice?.issue_date || new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              if (selectedInvoice) {
                setSelectedInvoice({ ...selectedInvoice, issue_date: e.target.value });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Due Date *
          </label>
          <Input
            type="date"
            defaultValue={selectedInvoice?.due_date || ''}
            onChange={(e) => {
              if (selectedInvoice) {
                setSelectedInvoice({ ...selectedInvoice, due_date: e.target.value });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Currency
          </label>
          <Select
            defaultValue={selectedInvoice?.currency || 'USD'}
            onChange={(value) => {
              if (selectedInvoice) {
                setSelectedInvoice({ ...selectedInvoice, currency: value });
              }
            }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <Textarea
          defaultValue={selectedInvoice?.description || ''}
          placeholder="Invoice description"
          rows={3}
          onChange={(e) => {
            if (selectedInvoice) {
              setSelectedInvoice({ ...selectedInvoice, description: e.target.value });
            }
          }}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-foreground">Line Items</h4>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={formatCurrency(item.total)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  disabled={lineItems.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-foreground/70">Total Amount</div>
              <div className="text-lg font-semibold">
                {formatCurrency(lineItems.reduce((sum, item) => sum + item.total, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Notes
        </label>
        <Textarea
          defaultValue={selectedInvoice?.notes || ''}
          placeholder="Additional notes"
          rows={3}
          onChange={(e) => {
            if (selectedInvoice) {
              setSelectedInvoice({ ...selectedInvoice, notes: e.target.value });
            }
          }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{translations.title}</h1>
            <p className="text-muted-foreground">{translations.subtitle}</p>
          </div>
          <Button onClick={handleCreateInvoice}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              views={[
                { id: 'grid', label: 'Grid', icon: 'grid' },
                { id: 'list', label: 'List', icon: 'list' },
              ]}
            />
          </div>
          <DataActions
            selectedCount={0}
            onExport={() => {}}
            onBulkAction={() => {}}
          />
        </div>

        {currentView === 'list' ? (
          <DataGrid
            data={invoiceRecords}
            fields={fieldConfigs}
            config={dataViewConfig}
            onRowClick={(record) => handleViewInvoice(record._raw as Invoice)}
            actions={[
              {
                label: 'Edit',
                icon: Edit,
                onClick: (record) => handleEditInvoice(record._raw as Invoice),
              },
              {
                label: 'Send',
                icon: Send,
                onClick: (record) => handleSendInvoice(record.id),
                condition: (record) => (record._raw as Invoice).status === 'draft',
              },
              {
                label: 'Mark Paid',
                icon: CheckCircle,
                onClick: (record) => handleMarkPaid(record.id),
                condition: (record) => (record._raw as Invoice).status === 'sent',
              },
              {
                label: 'Delete',
                icon: Trash2,
                onClick: (record) => handleDeleteInvoice(record.id),
                variant: 'destructive',
              },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewInvoice(invoice)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{invoice.invoice_number}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.client_name}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Amount</span>
                      <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Issue Date</span>
                      <span>{formatDate(invoice.issue_date)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Due Date</span>
                      <span className={new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-600' : ''}>
                        {formatDate(invoice.due_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex space-x-2">
                      {invoice.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendInvoice(invoice.id);
                          }}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPaid(invoice.id);
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditInvoice(invoice);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInvoice(invoice.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Create Invoice' :
            drawerMode === 'edit' ? 'Edit Invoice' : 'Invoice Details'
          }
          mode={drawerMode}
          onSave={handleSaveInvoice}
          data={selectedInvoice}
        >
          {renderInvoiceForm()}
        </UniversalDrawer>
      </div>
    </StateManagerProvider>
  );
}
