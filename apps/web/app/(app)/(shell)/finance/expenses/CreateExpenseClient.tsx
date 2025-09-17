'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
import { Plus, Receipt, Calendar, DollarSign, Upload } from 'lucide-react';

interface CreateExpenseClientProps {
  user: User;
  orgId: string;
  projectId?: string;
  budgetId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (expense: any) => void;
}

interface ExpenseFormData {
  description: string;
  amount: number;
  currency: string;
  category: string;
  projectId?: string;
  budgetId?: string;
  expenseDate: string;
  receiptUrl?: string;
}

export default function CreateExpenseClient({ 
  user, 
  orgId, 
  projectId,
  budgetId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateExpenseClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    currency: 'USD',
    category: 'general',
    projectId: projectId || '',
    budgetId: budgetId || '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    try {
      setLoading(true);

      const expenseData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        project_id: formData.projectId || null,
        budget_id: formData.budgetId || null,
        description: formData.description.trim(),
        amount: formData.amount,
        currency: formData.currency,
        category: formData.category,
        status: 'draft',
        receipt_url: formData.receiptUrl || null,
        submitted_by: user.id,
        expense_date: formData.expenseDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'expense.created',
        entity_type: 'expense',
        entity_id: data.id,
        metadata: { description: formData.description, amount: formData.amount }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        description: '',
        amount: 0,
        currency: 'USD',
        category: 'general',
        projectId: projectId || '',
        budgetId: budgetId || '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptUrl: ''
      });

    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Expense"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Expense Overview */}
        <Card className="p-md bg-destructive/10 border-destructive/20">
          <div className="flex items-center cluster-sm">
            <Receipt className="h-8 w-8 color-destructive" />
            <div>
              <h3 className="text-heading-4 color-destructive-foreground">Expense Tracking</h3>
              <p className="text-body-sm color-destructive/80">
                Record business expenses for approval and reimbursement
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-2">
              Expense Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Client dinner, Office supplies, Travel expenses"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-10"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {formData.amount > 0 && (
                <p className="text-body-sm color-foreground/60 mt-1">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-2">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <option value="general">General</option>
                <option value="travel">Travel</option>
                <option value="meals">Meals & Entertainment</option>
                <option value="office_supplies">Office Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="software">Software & Subscriptions</option>
                <option value="professional_services">Professional Services</option>
                <option value="marketing">Marketing</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-2">
                Expense Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-2">
              Receipt URL
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
              <Input
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                placeholder="https://example.com/receipt.pdf"
                className="pl-10"
              />
            </div>
            <p className="text-body-sm color-foreground/60 mt-1">
              Upload receipt to cloud storage and paste the URL here
            </p>
          </div>
        </div>

        {/* Expense Summary */}
        {formData.amount > 0 && (
          <Card className="p-md bg-secondary border-border">
            <h4 className="form-label color-foreground mb-2">Expense Summary</h4>
            <div className="stack-xs text-body-sm">
              <div className="flex justify-between">
                <span className="color-foreground/70">Amount:</span>
                <span className="form-label">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Category:</span>
                <span className="form-label capitalize">{formData.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Status:</span>
                <span className="form-label color-warning">Draft</span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end cluster-sm pt-6 border-t border-border">
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
            disabled={loading || !formData.description.trim() || formData.amount <= 0}
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
                <span>Create Expense</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
