'use client';


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Card, Badge, Button, Drawer } from '@ghxstship/ui';
import { Plus, X, Download, Calendar, FileText, Database } from 'lucide-react';

const ExportJobSchema = z.object({
  name: z.string().min(1, 'Export job name is required'),
  description: z.string().optional(),
  dataSource: z.enum(['projects', 'people', 'finance', 'events', 'assets', 'companies', 'custom_query']).default('projects'),
  format: z.enum(['csv', 'xlsx', 'json', 'pdf']).default('csv'),
  filters: z.record(z.any()).default({}),
  fields: z.array(z.string()).default([]),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('weekly'),
    time: z.string().default('09:00'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    timezone: z.string().default('UTC')
  }).optional(),
  compression: z.boolean().default(false),
  includeHeaders: z.boolean().default(true),
  maxRecords: z.number().min(1).max(1000000).optional(),
  notifications: z.object({
    onSuccess: z.boolean().default(true),
    onFailure: z.boolean().default(true),
    recipients: z.array(z.string().email()).default([])
  }).default({
    onSuccess: true,
    onFailure: true,
    recipients: []
  })
});

type ExportJobFormData = z.infer<typeof ExportJobSchema>;

interface CreateExportClientProps {
  organizationId: string;
  onSuccess?: (exportJob: any) => void;
  onCancel?: () => void;
}

const DATA_SOURCES = [
  { 
    value: 'projects', 
    label: 'Projects', 
    icon: FileText,
    description: 'Project data, timelines, budgets',
    fields: ['name', 'status', 'budget', 'start_date', 'end_date', 'progress', 'team_size']
  },
  { 
    value: 'people', 
    label: 'People', 
    icon: Database,
    description: 'Team members, roles, contacts',
    fields: ['name', 'email', 'role', 'department', 'hire_date', 'status', 'skills']
  },
  { 
    value: 'finance', 
    label: 'Finance', 
    icon: Download,
    description: 'Expenses, revenue, budgets',
    fields: ['amount', 'type', 'category', 'date', 'status', 'account', 'description']
  },
  { 
    value: 'events', 
    label: 'Events', 
    icon: Calendar,
    description: 'Scheduled events, meetings',
    fields: ['title', 'type', 'date', 'location', 'attendees', 'status', 'duration']
  },
  { 
    value: 'assets', 
    label: 'Assets', 
    icon: Database,
    description: 'Equipment, inventory, tracking',
    fields: ['name', 'type', 'category', 'status', 'location', 'value', 'condition']
  },
  { 
    value: 'companies', 
    label: 'Companies', 
    icon: FileText,
    description: 'Vendors, clients, partners',
    fields: ['name', 'industry', 'status', 'contact', 'revenue', 'employees', 'location']
  },
  { 
    value: 'custom_query', 
    label: 'Custom Query', 
    icon: Database,
    description: 'Custom SQL query results',
    fields: []
  }
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' }
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

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' }
];

export default function CreateExportClient({ organizationId, onSuccess, onCancel }: CreateExportClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filterFields, setFilterFields] = useState<Array<{ field: string; operator: string; value: string }>>([]);
  const [customQuery, setCustomQuery] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ExportJobFormData>({
    resolver: zodResolver(ExportJobSchema),
    defaultValues: {
      name: '',
      description: '',
      dataSource: 'projects',
      format: 'csv',
      filters: {},
      fields: [],
      compression: false,
      includeHeaders: true,
      schedule: {
        enabled: false,
        frequency: 'weekly',
        time: '09:00',
        timezone: 'UTC'
      },
      notifications: {
        onSuccess: true,
        onFailure: true,
        recipients: []
      }
    }
  });

  const dataSource = watch('dataSource');
  const scheduleEnabled = watch('schedule.enabled');
  const frequency = watch('schedule.frequency');

  const selectedDataSource = DATA_SOURCES.find(ds => ds.value === dataSource);
  const availableFields = selectedDataSource?.fields || [];

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

  const onSubmit = async (data: ExportJobFormData) => {
    setIsSubmitting(true);
    try {
      const exportJobData = {
        ...data,
        customQuery: dataSource === 'custom_query' ? customQuery : undefined
      };

      const response = await fetch('/api/v1/analytics/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId
        },
        body: JSON.stringify(exportJobData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create export job');
      }

      const result = await response.json();
      onSuccess?.(result.exportJob);
      reset();
    } catch (error) {
      console.error('Error creating export job:', error);
      alert(error instanceof Error ? error.message : 'Failed to create export job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={true} onClose={onCancel || (() => {})} title="Create Export">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-lg border-b">
          <div>
            <h2 className="text-body text-heading-4">Create Export Job</h2>
            <p className="text-body-sm color-muted">Set up automated data exports</p>
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
                <label className="block text-body-sm form-label mb-xs">Export Job Name</label>
                <input
                  {...register('name')}
                  className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter export job name"
                />
                {errors.name && (
                  <p className="text-body-sm color-destructive mt-xs">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the purpose of this export"
                />
              </div>
            </div>

            {/* Data Source & Format */}
            <div className="stack-md">
              <h3 className="text-body-sm form-label">Data Source & Format</h3>
              
              <div>
                <label className="block text-body-sm form-label mb-sm">Data Source</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  {DATA_SOURCES.map((source: any) => {
                    const IconComponent = source.icon;
                    return (
                      <label key={source.value} className="flex items-start cluster-sm p-sm border-border rounded cursor-pointer hover:bg-secondary/50">
                        <input
                          {...register('dataSource')}
                          type="radio"
                          value={source.value}
                          className="mt-xs color-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center cluster-sm">
                            <IconComponent className="h-4 w-4" />
                            <span className="form-label">{source.label}</span>
                          </div>
                          <p className="text-body-sm color-muted mt-xs">{source.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Export Format</label>
                  <select
                    {...register('format')}
                    className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {EXPORT_FORMATS.map((format: any) => (
                      <option key={format.value} value={format.value}>
                        {format.label} - {format.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm form-label mb-xs">Max Records</label>
                  <input
                    {...register('maxRecords', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="1000000"
                    className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="flex items-center cluster">
                <label className="flex items-center cluster-sm">
                  <input
                    {...register('includeHeaders')}
                    type="checkbox"
                    className="rounded border-border color-primary focus:ring-primary"
                  />
                  <span className="text-body-sm">Include headers</span>
                </label>
                
                <label className="flex items-center cluster-sm">
                  <input
                    {...register('compression')}
                    type="checkbox"
                    className="rounded border-border color-primary focus:ring-primary"
                  />
                  <span className="text-body-sm">Compress file</span>
                </label>
              </div>
            </div>

            {/* Fields Selection */}
            {dataSource !== 'custom_query' && availableFields.length > 0 && (
              <div className="stack-md">
                <h3 className="text-body-sm form-label">Export Fields</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
                  {availableFields.map((field: any) => (
                    <label key={field} className="flex items-center cluster-sm p-sm border-border rounded cursor-pointer hover:bg-secondary/50">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleField(field)}
                        className="rounded border-border color-primary focus:ring-primary"
                      />
                      <span className="text-body-sm capitalize">{field.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Query */}
            {dataSource === 'custom_query' && (
              <div className="stack-md">
                <h3 className="text-body-sm form-label">Custom SQL Query</h3>
                <textarea
                  value={customQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomQuery(e.target.value)}
                  rows={6}
                  className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-body-sm"
                  placeholder="SELECT * FROM projects WHERE status = 'active'"
                />
                <p className="text-body-sm color-muted">
                  Write a custom SQL query to export specific data. Be careful with permissions and data access.
                </p>
              </div>
            )}

            {/* Filters */}
            {dataSource !== 'custom_query' && (
              <div className="stack-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-sm form-label">Filters</h3>
                  <Button
                    type="button"
                    variant="outline"
                   
                    onClick={addFilter}
                  >
                    <Plus className="h-4 w-4 mr-xs" />
                    Add Filter
                  </Button>
                </div>

                {filterFields.map((filter, index) => (
                  <div key={index} className="flex items-center cluster-sm p-sm border-border rounded">
                    <select
                      value={filter.field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter(index, 'field', e.target.value)}
                      className="flex-1  px-md py-xs border-border rounded text-body-sm"
                    >
                      {availableFields.map((field: any) => (
                        <option key={field} value={field}>
                          {field.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={filter.operator}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter(index, 'operator', e.target.value)}
                      className=" px-md py-xs border-border rounded text-body-sm"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="not_null">Not Empty</option>
                    </select>
                    
                    <input
                      value={filter.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter(index, 'value', e.target.value)}
                      className="flex-1  px-md py-xs border-border rounded text-body-sm"
                      placeholder="Filter value"
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                     
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Scheduling */}
            <div className="stack-md">
              <div className="flex items-center cluster-sm">
                <input
                  {...register('schedule.enabled')}
                  type="checkbox"
                  className="rounded border-border color-primary focus:ring-primary"
                />
                <label className="text-body-sm form-label">Enable scheduled exports</label>
              </div>

              {scheduleEnabled && (
                <div className="pl-lg stack-md border-l-2 border-primary/20">
                  <div className="grid grid-cols-3 gap-md">
                    <div>
                      <label className="block text-body-sm form-label mb-xs">Frequency</label>
                      <select
                        {...register('schedule.frequency')}
                        className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {FREQUENCIES.map((freq: any) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-body-sm form-label mb-xs">Time</label>
                      <input
                        {...register('schedule.time')}
                        type="time"
                        className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-body-sm form-label mb-xs">Timezone</label>
                      <select
                        {...register('schedule.timezone')}
                        className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {TIMEZONES.map((tz: any) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {frequency === 'weekly' && (
                    <div>
                      <label className="block text-body-sm form-label mb-xs">Day of Week</label>
                      <select
                        {...register('schedule.dayOfWeek', { valueAsNumber: true })}
                        className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {DAYS_OF_WEEK.map((day: any) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {frequency === 'monthly' && (
                    <div>
                      <label className="block text-body-sm form-label mb-xs">Day of Month</label>
                      <input
                        {...register('schedule.dayOfMonth', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="31"
                        className="w-full  px-md py-sm border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="1-31"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="stack-md">
              <h3 className="text-body-sm form-label">Notifications</h3>
              
              <div className="flex items-center cluster">
                <label className="flex items-center cluster-sm">
                  <input
                    {...register('notifications.onSuccess')}
                    type="checkbox"
                    className="rounded border-border color-primary focus:ring-primary"
                  />
                  <span className="text-body-sm">Notify on success</span>
                </label>
                
                <label className="flex items-center cluster-sm">
                  <input
                    {...register('notifications.onFailure')}
                    type="checkbox"
                    className="rounded border-border color-primary focus:ring-primary"
                  />
                  <span className="text-body-sm">Notify on failure</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-lg border-t bg-secondary/30 flex justify-end cluster-sm">
            <Button type="button" variant="outline" onClick={onCancel || (() => {})}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Export Job'}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
