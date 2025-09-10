'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
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
      currency: formData.currency,
    }).format(amount);
  };

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Forecast"
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Forecast Overview */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-900">Financial Forecasting</h3>
              <p className="text-sm text-purple-700">
                Create financial projections and track variance against actuals
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Forecast Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Q1 Revenue Forecast, Annual Budget Projection"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the forecast methodology and assumptions..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Projected Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="number"
                  value={formData.projectedAmount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectedAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-10"
                  step="0.01"
                />
              </div>
              {formData.projectedAmount !== 0 && (
                <p className="text-sm text-foreground/60 mt-1">
                  {formatCurrency(formData.projectedAmount)}
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
                Confidence Level
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Select
                  value={formData.confidenceLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, confidenceLevel: value }))}
                >
                  <option value="high">High Confidence (90%+)</option>
                  <option value="medium">Medium Confidence (70-90%)</option>
                  <option value="low">Low Confidence (&lt;70%)</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Forecast Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="date"
                  value={formData.forecastDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecastDate: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Period Start *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Period End *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className="pl-10"
                  min={formData.periodStart}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Summary */}
        {formData.name && formData.periodStart && formData.periodEnd && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h4 className="font-medium text-foreground mb-2">Forecast Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Forecast Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Projected Amount:</span>
                <span className="font-medium text-purple-600">
                  {formData.projectedAmount !== 0 ? formatCurrency(formData.projectedAmount) : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Confidence:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(formData.confidenceLevel)}`}>
                  {formData.confidenceLevel.charAt(0).toUpperCase() + formData.confidenceLevel.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Period:</span>
                <span className="font-medium">
                  {new Date(formData.periodStart).toLocaleDateString()} - {new Date(formData.periodEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Duration:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(formData.periodEnd).getTime() - new Date(formData.periodStart).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
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
            disabled={loading || !formData.name.trim() || !formData.periodStart || !formData.periodEnd}
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
                <span>Create Forecast</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
