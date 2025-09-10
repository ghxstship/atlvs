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
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Revenue Overview */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Revenue Tracking</h3>
              <p className="text-sm text-green-700">
                Record and track revenue streams and income recognition
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Revenue Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Project Alpha Payment, Consulting Services, Product Sales"
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
                Revenue Source
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Recognition Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="date"
                  value={formData.recognitionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, recognitionDate: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Related Invoice ID
            </label>
            <Input
              value={formData.invoiceId}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
              placeholder="Optional: Link to existing invoice"
            />
            <p className="text-xs text-foreground/60 mt-1">
              Connect this revenue to an existing invoice for tracking
            </p>
          </div>
        </div>

        {/* Revenue Summary */}
        {formData.amount > 0 && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h4 className="font-medium text-foreground mb-2">Revenue Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Amount:</span>
                <span className="font-medium text-green-600">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Source:</span>
                <span className="font-medium capitalize">{formData.source.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Status:</span>
                <span className="font-medium text-blue-600">Projected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Recognition Date:</span>
                <span className="font-medium">{new Date(formData.recognitionDate).toLocaleDateString()}</span>
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
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
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
