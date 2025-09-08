'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { UniversalDrawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
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
    <UniversalDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Expense"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expense Overview */}
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <Receipt className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Expense Tracking</h3>
              <p className="text-sm text-red-700">
                Record business expenses for approval and reimbursement
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Expense Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Client dinner, Office supplies, Travel expenses"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
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
                <p className="text-sm text-foreground/60 mt-1">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Expense Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
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
            <label className="block text-sm font-medium text-foreground mb-2">
              Receipt URL
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                placeholder="https://example.com/receipt.pdf"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-foreground/60 mt-1">
              Upload receipt to cloud storage and paste the URL here
            </p>
          </div>
        </div>

        {/* Expense Summary */}
        {formData.amount > 0 && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h4 className="font-medium text-foreground mb-2">Expense Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Amount:</span>
                <span className="font-medium">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Category:</span>
                <span className="font-medium capitalize">{formData.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Status:</span>
                <span className="font-medium text-yellow-600">Draft</span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
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
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Expense</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </UniversalDrawer>
  );
}
