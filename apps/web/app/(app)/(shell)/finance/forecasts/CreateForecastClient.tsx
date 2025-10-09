'use client';
import { Button, Card, Drawer, Input, Select } from '@ghxstship/ui';


import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, BarChart3, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface CreateForecastClientProps {
  user: User;
  orgId: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (forecast: any) => void;
}

interface ForecastFormData {
  name: string;
  description: string;
  projectedAmount: number;
  currency: string;
  confidenceLevel: string;
  forecastDate: string;
  periodStart: string;
  periodEnd: string;
  projectId?: string;
}

export default function CreateForecastClient({ 
  user, 
  orgId, 
  projectId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateForecastClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ForecastFormData>({
    name: '',
    description: '',
    projectedAmount: 0,
    currency: 'USD',
    confidenceLevel: 'medium',
    forecastDate: new Date().toISOString().split('T')[0],
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: '',
    projectId: projectId || ''
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.periodStart || !formData.periodEnd) return;

    try {
      setLoading(true);

      const forecastData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        project_id: formData.projectId || null,
        name: formData.name.trim(),
        description: formData.description.trim(),
        projected_amount: formData.projectedAmount,
        actual_amount: 0,
        variance: 0,
        confidence_level: formData.confidenceLevel,
        forecast_date: formData.forecastDate,
        period_start: formData.periodStart,
        period_end: formData.periodEnd,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('forecasts')
        .insert([forecastData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'forecast.created',
        entity_type: 'forecast',
        entity_id: data.id,
        metadata: { forecastName: formData.name, projectedAmount: formData.projectedAmount }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        projectedAmount: 0,
        currency: 'USD',
        confidenceLevel: 'medium',
        forecastDate: new Date().toISOString().split('T')[0],
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: '',
        projectId: projectId || ''
      });

    } catch (error) {
      console.error('Error creating forecast:', error);
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

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'color-success bg-success/10';
      case 'medium': return 'color-warning bg-warning/10';
      case 'low': return 'color-destructive bg-destructive/10';
      default: return 'color-muted bg-secondary';
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Forecast"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Forecast Overview */}
        <Card className="p-md bg-secondary/5 border-secondary/20">
          <div className="flex items-center cluster-sm">
            <BarChart3 className="h-icon-lg w-icon-lg color-secondary" />
            <div>
              <h3 className="text-heading-4 color-secondary">Financial Forecasting</h3>
              <p className="text-body-sm color-secondary/80">
                Create financial projections and track variance against actuals
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Forecast Name *
            </label>
            <Input               value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Q1 Revenue Forecast, Annual Budget Projection"
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
              placeholder="Describe the forecast methodology and assumptions..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Projected Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="number"
                  value={formData.projectedAmount || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, projectedAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-2xl"
                  step="0.01"
                />
              </div>
              {formData.projectedAmount !== 0 && (
                <p className="text-body-sm color-foreground/60 mt-xs">
                  {formatCurrency(formData.projectedAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Currency
              </label>
              <Select
                value={formData.currency}
                onChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}
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
                Confidence Level
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Select
                  value={formData.confidenceLevel}
                  onChange={(value: any) => setFormData(prev => ({ ...prev, confidenceLevel: value }))}
                >
                  <option value="high">High Confidence (90%+)</option>
                  <option value="medium">Medium Confidence (70-90%)</option>
                  <option value="low">Low Confidence (&lt;70%)</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Forecast Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="date"
                  value={formData.forecastDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, forecastDate: e.target.value }))}
                  className="pl-2xl"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Period Start *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="date"
                  value={formData.periodStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
                  className="pl-2xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Period End *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="date"
                  value={formData.periodEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className="pl-2xl"
                  min={formData.periodStart}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Summary */}
        {formData.name && formData.periodStart && formData.periodEnd && (
          <Card className="p-md bg-secondary border-border">
            <h4 className="form-label color-foreground mb-sm">Forecast Summary</h4>
            <div className="stack-sm text-body-sm">
              <div className="flex justify-between">
                <span className="color-foreground/70">Forecast Name:</span>
                <span className="form-label">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Projected Amount:</span>
                <span className="form-label color-secondary">
                  {formData.projectedAmount !== 0 ? formatCurrency(formData.projectedAmount) : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Confidence:</span>
                <span className={`px-sm py-xs rounded-full text-body-sm form-label ${getConfidenceBadgeColor(formData.confidenceLevel)}`}>
                  {formData.confidenceLevel.charAt(0).toUpperCase() + formData.confidenceLevel.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Period:</span>
                <span className="form-label">
                  {new Date(formData.periodStart).toLocaleDateString()} - {new Date(formData.periodEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Duration:</span>
                <span className="form-label">
                  {Math.ceil((new Date(formData.periodEnd).getTime() - new Date(formData.periodStart).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
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
            disabled={loading || !formData.name.trim() || !formData.periodStart || !formData.periodEnd}
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
                <span>Create Forecast</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
