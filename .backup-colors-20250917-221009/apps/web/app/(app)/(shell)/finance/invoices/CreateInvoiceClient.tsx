'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
import { Plus, FileText, Calendar, DollarSign, Building, Trash2 } from 'lucide-react';

interface CreateInvoiceClientProps {
  user: User;
  orgId: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invoice: any) => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  description: string;
  clientCompanyId: string;
  projectId?: string;
  currency: string;
  dueDate: string;
  issuedDate: string;
  lineItems: LineItem[];
  taxAmount: number;
  discountAmount: number;
  notes: string;
}

export default function CreateInvoiceClient({ 
  user, 
  orgId, 
  projectId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateInvoiceClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${Date.now()}`,
    description: '',
    clientCompanyId: '',
    projectId: projectId || '',
    currency: 'USD',
    dueDate: '',
    issuedDate: new Date().toISOString().split('T')[0],
    lineItems: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    taxAmount: 0,
    discountAmount: 0,
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber.trim() || formData.lineItems.length === 0) return;

    try {
      setLoading(true);

      const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
      const totalAmount = subtotal + formData.taxAmount - formData.discountAmount;

      const invoiceData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        project_id: formData.projectId || null,
        client_company_id: formData.clientCompanyId || null,
        invoice_number: formData.invoiceNumber.trim(),
        description: formData.description.trim(),
        line_items: formData.lineItems,
        amount: subtotal,
        tax_amount: formData.taxAmount,
        discount_amount: formData.discountAmount,
        total_amount: totalAmount,
        amount_due: totalAmount,
        currency: formData.currency,
        status: 'draft',
        issued_date: formData.issuedDate,
        due_at: formData.dueDate || null,
        notes: formData.notes.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'invoice.created',
        entity_type: 'invoice',
        entity_id: data.id,
        metadata: { invoiceNumber: formData.invoiceNumber, totalAmount }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        invoiceNumber: `INV-${Date.now()}`,
        description: '',
        clientCompanyId: '',
        projectId: projectId || '',
        currency: 'USD',
        dueDate: '',
        issuedDate: new Date().toISOString().split('T')[0],
        lineItems: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
        taxAmount: 0,
        discountAmount: 0,
        notes: ''
      });

    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + formData.taxAmount - formData.discountAmount;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Invoice"
      width="xl"
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Invoice Overview */}
        <Card className="p-md bg-primary/10 border-primary/20">
          <div className="flex items-center cluster-sm">
            <FileText className="h-8 w-8 color-primary" />
            <div>
              <h3 className="text-heading-4 color-primary-foreground">Invoice Creation</h3>
              <p className="text-body-sm color-primary/80">
                Create professional invoices with line items and payment terms
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Invoice Number *
              </label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-001"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Invoice Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of services or products"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Issue Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="date"
                  value={formData.issuedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                  className="pl-2xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="pl-2xl"
                  min={formData.issuedDate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="stack-md">
          <div className="flex items-center justify-between">
            <h4 className="form-label color-foreground">Line Items</h4>
            <Button onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-sm" />
              Add Item
            </Button>
          </div>

          <div className="stack-sm">
            {formData.lineItems.map((item, index) => (
              <Card key={item.id} className="p-md">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-end">
                  <div className="md:col-span-5">
                    <label className="block text-body-sm form-label color-foreground mb-sm">
                      Description
                    </label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-body-sm form-label color-foreground mb-sm">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-body-sm form-label color-foreground mb-sm">
                      Unit Price
                    </label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-body-sm form-label color-foreground mb-sm">
                      Total
                    </label>
                    <div className="px-sm py-sm bg-secondary border border-border rounded-md text-body-sm form-label">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-1">
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                       
                        onClick={() => removeLineItem(item.id)}
                        className="color-destructive hover:color-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Totals */}
        <Card className="p-md bg-secondary">
          <h4 className="form-label color-foreground mb-md">Invoice Totals</h4>
          
          <div className="stack-sm">
            <div className="flex justify-between text-body-sm">
              <span>Subtotal:</span>
              <span className="form-label">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Tax Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                  <Input
                    type="number"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="pl-2xl"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Discount Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                  <Input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="pl-2xl"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-body text-heading-4 pt-sm border-t border-border">
              <span>Total Amount:</span>
              <span className="color-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <div>
          <label className="block text-body-sm form-label color-foreground mb-sm">
            Notes
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Payment terms, additional notes, or special instructions..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end cluster-sm pt-lg border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.invoiceNumber.trim() || formData.lineItems.length === 0}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center cluster-sm">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center cluster-sm">
                <Plus className="h-4 w-4" />
                <span>Create Invoice</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
