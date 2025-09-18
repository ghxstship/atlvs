'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
import { Plus, TrendingUp, Calendar, DollarSign, Building } from 'lucide-react';

interface CreateRevenueClientProps {
  user: User;
  orgId: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (revenue: any) => void;
}

interface RevenueFormData {
  description: string;
  amount: number;
  currency: string;
  source: string;
  projectId?: string;
  recognitionDate: string;
  invoiceId?: string;
}

export default function CreateRevenueClient({ 
  user, 
  orgId, 
  projectId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateRevenueClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RevenueFormData>({
    description: '',
    amount: 0,
    currency: 'USD',
    source: 'services',
    projectId: projectId || '',
    recognitionDate: new Date().toISOString().split('T')[0],
    invoiceId: ''
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    try {
      setLoading(true);

      const revenueData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        project_id: formData.projectId || null,
        invoice_id: formData.invoiceId || null,
        description: formData.description.trim(),
        amount: formData.amount,
        currency: formData.currency,
        source: formData.source,
        status: 'projected',
        recognition_date: formData.recognitionDate,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('revenue')
        .insert([revenueData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'revenue.created',
        entity_type: 'revenue',
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
        source: 'services',
        projectId: projectId || '',
        recognitionDate: new Date().toISOString().split('T')[0],
        invoiceId: ''
      });

    } catch (error) {
      console.error('Error creating revenue:', error);
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
      title="Add Revenue"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Revenue Overview */}
        <Card className="p-md bg-success/10 border-success/20">
          <div className="flex items-center cluster-sm">
            <TrendingUp className="h-8 w-8 color-success" />
            <div>
              <h3 className="text-heading-4 color-success-foreground">Revenue Tracking</h3>
              <p className="text-body-sm color-success/80">
                Record and track revenue streams and income recognition
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Revenue Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Project Alpha Payment, Consulting Services, Product Sales"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Revenue Source
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <option value="services">Professional Services</option>
                  <option value="products">Product Sales</option>
                  <option value="consulting">Consulting</option>
                  <option value="licensing">Licensing</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="events">Events & Performances</option>
                  <option value="grants">Grants & Funding</option>
                  <option value="partnerships">Partnerships</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Recognition Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
                <Input
                  type="date"
                  value={formData.recognitionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, recognitionDate: e.target.value }))}
                  className="pl-2xl"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Related Invoice ID
            </label>
            <Input
              value={formData.invoiceId}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
              placeholder="Optional: Link to existing invoice"
            />
            <p className="text-body-sm color-foreground/60 mt-xs">
              Connect this revenue to an existing invoice for tracking
            </p>
          </div>
        </div>

        {/* Revenue Summary */}
        {formData.amount > 0 && (
          <Card className="p-md bg-secondary border-border">
            <h4 className="form-label color-foreground mb-sm">Revenue Summary</h4>
            <div className="stack-xs text-body-sm">
              <div className="flex justify-between">
                <span className="color-foreground/70">Amount:</span>
                <span className="form-label color-success">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Source:</span>
                <span className="form-label capitalize">{formData.source.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Status:</span>
                <span className="form-label color-primary">Projected</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Recognition Date:</span>
                <span className="form-label">{new Date(formData.recognitionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        )}

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
            disabled={loading || !formData.description.trim() || formData.amount <= 0}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center cluster-sm">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center cluster-sm">
                <Plus className="h-4 w-4" />
                <span>Add Revenue</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
