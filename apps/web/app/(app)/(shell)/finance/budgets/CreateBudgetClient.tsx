'use client';
import { Button, Card, Drawer, Input, Select } from '@ghxstship/ui';


import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, DollarSign, Calendar, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateBudgetClientProps {
  user: User;
  orgId: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (budget: any) => void;
}

interface BudgetFormData {
  name: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  projectId?: string;
  startDate: string;
  endDate: string;
}

export default function CreateBudgetClient({ 
  user, 
  orgId, 
  projectId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateBudgetClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    description: '',
    amount: 0,
    currency: 'USD',
    category: 'general',
    projectId: projectId || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const supabase = createBrowserClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.amount <= 0) return;

    try {
      setLoading(true);

      const budgetData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        project_id: formData.projectId || null,
        name: formData.name.trim(),
        description: formData.description.trim(),
        amount: formData.amount,
        currency: formData.currency,
        category: formData.category,
        spent: 0,
        status: 'active',
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'budget.created',
        entity_type: 'budget',
        entity_id: data.id,
        metadata: { budgetName: formData.name, amount: formData.amount }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        amount: 0,
        currency: 'USD',
        category: 'general',
        projectId: projectId || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });

    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Budget"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Budget Overview */}
        <Card className="p-md bg-accent/5 border-primary/20">
          <div className="flex items-center cluster-sm">
            <Target className="h-icon-lg w-icon-lg color-accent" />
            <div>
              <h3 className="text-heading-4 color-accent">Budget Planning</h3>
              <p className="text-body-sm color-accent/80">
                Set financial targets and track spending against your budget
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Budget Name *
            </label>
            <Input               value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Q1 Marketing Budget, Project Alpha Budget"
              required
            />
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this budget..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Budget Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="number"
                  value={formData.amount || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-2xl"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {formData.amount > 0 && (
                <p className="text-body-sm color-foreground/60 mt-xs">
                  {formatCurrency(formData.amount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}
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
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <option value="general">General</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
              <option value="personnel">Personnel</option>
              <option value="equipment">Equipment</option>
              <option value="travel">Travel</option>
              <option value="professional_services">Professional Services</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-2xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="date"
                  value={formData.endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-2xl"
                  min={formData.startDate}
                />
              </div>
            </div>
          </div>
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
            disabled={loading || !formData.name.trim() || formData.amount <= 0}
            className="min-w-component-xl"
          >
            {loading ? (
              <div className="flex items-center cluster-sm">
                <div className="w-icon-xs h-icon-xs border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center cluster-sm">
                <Plus className="h-icon-xs w-icon-xs" />
                <span>Create Budget</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
