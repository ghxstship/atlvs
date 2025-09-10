'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Card, Badge, Button, Drawer } from '@ghxstship/ui';
import { Plus, X, FileText, Calendar, Filter, Download } from 'lucide-react';

const ReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  type: z.enum(['financial', 'operational', 'performance', 'custom']).default('operational'),
  dataSource: z.enum(['projects', 'people', 'finance', 'events', 'assets', 'companies']).default('projects'),
  fields: z.array(z.string()).min(1, 'At least one field is required'),
  filters: z.record(z.any()).default({}),
  groupBy: z.array(z.string()).default([]),
  sortBy: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('desc')
  }).optional(),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('weekly'),
    time: z.string().default('09:00'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    recipients: z.array(z.string().email()).default([])
  }).optional(),
  format: z.enum(['table', 'chart', 'summary']).default('table'),
  isPublic: z.boolean().default(false)
});

type ReportFormData = z.infer<typeof ReportSchema>;

interface CreateReportClientProps {
  organizationId: string;
  onSuccess?: (report: any) => void;
  onCancel?: () => void;
}

const REPORT_TYPES = [
  { value: 'financial', label: 'Financial Report', description: 'Revenue, expenses, budgets' },
  { value: 'operational', label: 'Operational Report', description: 'Projects, tasks, performance' },
  { value: 'performance', label: 'Performance Report', description: 'KPIs, metrics, analytics' },
  { value: 'custom', label: 'Custom Report', description: 'Custom data analysis' }
];

const DATA_SOURCES = [
  { value: 'projects', label: 'Projects', fields: ['name', 'status', 'budget', 'start_date', 'end_date', 'progress'] },
  { value: 'people', label: 'People', fields: ['name', 'email', 'role', 'department', 'hire_date', 'status'] },
  { value: 'finance', label: 'Finance', fields: ['amount', 'type', 'category', 'date', 'status', 'account'] },
  { value: 'events', label: 'Events', fields: ['title', 'type', 'date', 'location', 'attendees', 'status'] },
  { value: 'assets', label: 'Assets', fields: ['name', 'type', 'category', 'status', 'location', 'value'] },
  { value: 'companies', label: 'Companies', fields: ['name', 'industry', 'status', 'contact', 'revenue', 'employees'] }
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export default function CreateReportClient({ organizationId, onSuccess, onCancel }: CreateReportClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filterFields, setFilterFields] = useState<Array<{ field: string; operator: string; value: string }>>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'operational',
      dataSource: 'projects',
      fields: [],
      filters: {},
      groupBy: [],
      format: 'table',
      isPublic: false,
      schedule: {
        enabled: false,
        frequency: 'weekly',
        time: '09:00',
        recipients: []
      }
    }
  });

  const dataSource = watch('dataSource');
  const scheduleEnabled = watch('schedule.enabled');
  const frequency = watch('schedule.frequency');

  const availableFields = DATA_SOURCES.find(ds => ds.value === dataSource)?.fields || [];

  const toggleField = (field: string) => {
    const newFields = selectedFields.includes(field)
      ? selectedFields.filter(f => f !== field)
      : [...selectedFields, field];
    
    setSelectedFields(newFields);
    setValue('fields', newFields);
  };

  const addFilter = () => {
    setFilterFields([...filterFields, { field: availableFields[0] || '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    const newFilters = filterFields.filter((_, i) => i !== index);
    setFilterFields(newFilters);
    
    const filtersObject = newFilters.reduce((acc, filter, i) => {
      acc[`filter_${i}`] = { field: filter.field, operator: filter.operator, value: filter.value };
      return acc;
    }, {} as Record<string, any>);
    
    setValue('filters', filtersObject);
  };

  const updateFilter = (index: number, key: string, value: string) => {
    const newFilters = [...filterFields];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilterFields(newFilters);
    
    const filtersObject = newFilters.reduce((acc, filter, i) => {
      acc[`filter_${i}`] = { field: filter.field, operator: filter.operator, value: filter.value };
      return acc;
    }, {} as Record<string, any>);
    
    setValue('filters', filtersObject);
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const reportData = {
        ...data,
        definition: {
          type: data.type,
          dataSource: data.dataSource,
          fields: data.fields,
          filters: data.filters,
          groupBy: data.groupBy,
          sortBy: data.sortBy,
          format: data.format
        }
      };

      const response = await fetch('/api/v1/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create report');
      }

      const result = await response.json();
      onSuccess?.(result.report);
      reset();
    } catch (error) {
      console.error('Error creating report:', error);
      alert(error instanceof Error ? error.message : 'Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={true} onClose={onCancel || (() => {})} title="Create Report" width="lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Create Report</h2>
            <p className="text-sm text-gray-600">Build a custom analytics report</p>
          </div>
          <Button size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Report Name</label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter report name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the purpose of this report"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Type</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {REPORT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Source</label>
                  <select
                    {...register('dataSource')}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DATA_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium">Make report public</label>
              </div>
            </div>

            {/* Fields Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Report Fields</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableFields.map((field) => (
                  <label key={field} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => toggleField(field)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{field.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              {errors.fields && (
                <p className="text-sm text-red-600">{errors.fields.message}</p>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filters</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFilter}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>

              {filterFields.map((filter, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  >
                    {availableFields.map((field) => (
                      <option key={field} value={field}>
                        {field.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                  </select>
                  
                  <input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="Filter value"
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  {...register('schedule.enabled')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium">Enable scheduled delivery</label>
              </div>

              {scheduleEnabled && (
                <div className="pl-6 space-y-4 border-l-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequency</label>
                      <select
                        {...register('schedule.frequency')}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <input
                        {...register('schedule.time')}
                        type="time"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Day of Week</label>
                      <select
                        {...register('schedule.dayOfWeek', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Day of Month</label>
                      <input
                        {...register('schedule.dayOfMonth', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="31"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1-31"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
