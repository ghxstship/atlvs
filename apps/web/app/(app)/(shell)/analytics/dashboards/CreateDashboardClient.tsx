'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Drawer } from '@ghxstship/ui';
import { Plus, X, BarChart3, PieChart, LineChart, Activity } from 'lucide-react';

const DashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  layout: z.enum(['grid', 'freeform']).default('grid'),
  widgets: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['chart', 'metric', 'table', 'gauge']),
    chartType: z.enum(['bar', 'line', 'pie', 'area']).optional(),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number()
    }),
    config: z.record(z.any()).default({})
  })).default([])
});

type DashboardFormData = z.infer<typeof DashboardSchema>;

interface CreateDashboardClientProps {
  organizationId: string;
  onSuccess?: (dashboard: any) => void;
  onCancel?: () => void;
}

const WIDGET_TYPES = [
  { value: 'chart', label: 'Chart', icon: BarChart3, description: 'Visual data charts' },
  { value: 'metric', label: 'Metric', icon: Activity, description: 'Key performance indicators' },
  { value: 'table', label: 'Table', icon: LineChart, description: 'Data tables' },
  { value: 'gauge', label: 'Gauge', icon: PieChart, description: 'Progress indicators' }
];

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' }
];

const WIDGET_SIZES = [
  { value: 'small', label: 'Small', dimensions: '1x1' },
  { value: 'medium', label: 'Medium', dimensions: '2x2' },
  { value: 'large', label: 'Large', dimensions: '3x2' }
];

export default function CreateDashboardClient({ organizationId, onSuccess, onCancel }: CreateDashboardClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWidgetForm, setShowWidgetForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<number | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<DashboardFormData>({
    resolver: zodResolver(DashboardSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      layout: 'grid',
      widgets: []
    }
  });

  const widgets = watch('widgets');

  const addWidget = (widgetData: any) => {
    const newWidget = {
      id: crypto.randomUUID(),
      title: widgetData.title,
      type: widgetData.type,
      chartType: widgetData.chartType,
      size: widgetData.size,
      position: {
        x: widgets.length % 3,
        y: Math.floor(widgets.length / 3),
        w: widgetData.size === 'small' ? 1 : widgetData.size === 'medium' ? 2 : 3,
        h: widgetData.size === 'small' ? 1 : 2
      },
      config: widgetData.config || {}
    };
    
    setValue('widgets', [...widgets, newWidget]);
    setShowWidgetForm(false);
  };

  const removeWidget = (index: number) => {
    const updatedWidgets = widgets.filter((_, i) => i !== index);
    setValue('widgets', updatedWidgets);
  };

  const onSubmit = async (data: DashboardFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/analytics/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dashboard');
      }

      const result = await response.json();
      onSuccess?.(result.dashboard);
      reset();
    } catch (error) {
      console.error('Error creating dashboard:', error);
      alert(error instanceof Error ? error.message : 'Failed to create dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={true} onClose={onCancel || (() => {})} title="Create Dashboard">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-lg border-b">
          <div>
            <h2 className="text-body text-heading-4">Create Dashboard</h2>
            <p className="text-body-sm color-muted">Build a custom analytics dashboard</p>
          </div>
          <Button onClick={onCancel || (() => {})}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 p-lg stack-lg overflow-y-auto">
            {/* Basic Information */}
            <div className="stack-md">
              <h3 className="text-body-sm form-label">Basic Information</h3>
              
              <div>
                <label className="block text-body-sm form-label mb-1">Dashboard Name</label>
                <input
                  {...register('name')}
                  className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter dashboard name"
                />
                {errors.name && (
                  <p className="text-body-sm color-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Describe the purpose of this dashboard"
                />
              </div>

              <div className="flex items-center cluster-sm">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  className="rounded border-border color-primary focus:ring-primary"
                />
                <label className="text-body-sm form-label">Make dashboard public</label>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">Layout Type</label>
                <select
                  {...register('layout')}
                  className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="grid">Grid Layout</option>
                  <option value="freeform">Freeform Layout</option>
                </select>
              </div>
            </div>

            {/* Widgets Section */}
            <div className="stack-md">
              <div className="flex items-center justify-between">
                <h3 className="text-body-sm form-label">Dashboard Widgets</h3>
                <Button
                  type="button"
                  variant="outline"
                 
                  onClick={() => setShowWidgetForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Widget
                </Button>
              </div>

              {widgets.length === 0 ? (
                <div className="text-center py-xl color-muted">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No widgets added yet</p>
                  <p className="text-body-sm">Add widgets to build your dashboard</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {widgets.map((widget, index) => (
                    <Card key={widget.id} className="p-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="form-label">{widget.title}</h4>
                          <div className="flex items-center cluster-sm mt-1">
                            <Badge variant="secondary">{widget.type}</Badge>
                            {widget.chartType && (
                              <Badge variant="outline">{widget.chartType}</Badge>
                            )}
                            <Badge variant="outline">{widget.size}</Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                         
                          onClick={() => removeWidget(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-lg border-t bg-secondary/30 flex justify-end cluster-sm">
            <Button type="button" variant="outline" onClick={onCancel || (() => {})}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Dashboard'}
            </Button>
          </div>
        </form>
      </div>

      {/* Widget Form Modal */}
      {showWidgetForm && (
        <WidgetForm
          onCancel={() => setShowWidgetForm(false)}
          onSave={() => setShowWidgetForm(false)}
        />
      )}
    </Drawer>
  );
}

interface WidgetFormProps {
  onSave: (widget: any) => void;
  onCancel: () => void;
}

function WidgetForm({ onSave, onCancel }: WidgetFormProps) {
  const [widgetData, setWidgetData] = useState({
    title: '',
    type: 'chart' as const,
    chartType: 'bar' as const,
    size: 'medium' as const,
    dataSource: '',
    refreshInterval: 0,
    config: {}
  });

  const handleSave = () => {
    if (!widgetData.title.trim()) {
      alert('Widget title is required');
      return;
    }
    onSave(widgetData);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-lg w-full max-w-md border shadow-lg">
        <h3 className="text-body text-heading-4 mb-4">Add Widget</h3>
        
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label mb-1">Widget Title</label>
            <input
              value={widgetData.title}
              onChange={(e) => setWidgetData({ ...widgetData, title: e.target.value })}
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Enter widget title"
            />
          </div>

          <div>
            <label className="block text-body-sm form-label mb-1">Refresh Interval (seconds)</label>
            <input
              value={widgetData.refreshInterval}
              onChange={(e) => setWidgetData({ ...widgetData, refreshInterval: parseInt(e.target.value) || 0 })}
              type="number"
              min="0"
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Seconds (0 for manual refresh)"
            />
          </div>

          <div>
            <label className="block text-body-sm form-label mb-1">Widget Type</label>
            <select
              value={widgetData.type}
              onChange={(e) => setWidgetData({ ...widgetData, type: e.target.value as any })}
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              {WIDGET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {widgetData.type === 'chart' && (
            <div>
              <label className="block text-body-sm form-label mb-1">Data Source</label>
              <input
                value={widgetData.dataSource}
                onChange={(e) => setWidgetData({ ...widgetData, dataSource: e.target.value })}
                className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="e.g., /api/analytics/revenue"
              />
            </div>
          )}

          {widgetData.type === 'chart' && (
            <div>
              <label className="block text-body-sm form-label mb-1">Chart Type</label>
              <select
                value={widgetData.chartType}
                onChange={(e) => setWidgetData({ ...widgetData, chartType: e.target.value as any })}
                className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {CHART_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-body-sm form-label mb-1">Widget Size</label>
            <select
              value={widgetData.size}
              onChange={(e) => setWidgetData({ ...widgetData, size: e.target.value as any })}
              className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {WIDGET_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label} ({size.dimensions})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end cluster-sm mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  );
}
