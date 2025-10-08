'use client';

import React, { useState } from 'react';
import { Card } from '@ghxstship/ui';
import { Save, X } from 'lucide-react';

interface FormViewProps {
  data?: unknown[];
  onSave?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export default function FormView({ data = [], onSave, onCancel }: FormViewProps) {
  const projects = Array.isArray(data) ? data : [];
  const firstProject = projects[0] as Record<string, unknown> | undefined;

  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: firstProject?.name || '',
    description: firstProject?.description || '',
    status: firstProject?.status || 'planning',
    budget: firstProject?.budget || '',
    startsAt: firstProject?.startsAt || '',
    endsAt: firstProject?.endsAt || ''
  });

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={String(formData.name || '')}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={String(formData.description || '')}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={String(formData.status || 'planning')}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={String(formData.budget || '')}
                onChange={(e) => handleChange('budget', e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={String(formData.startsAt || '')}
                onChange={(e) => handleChange('startsAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={String(formData.endsAt || '')}
                onChange={(e) => handleChange('endsAt', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Project
            </button>
          </div>
        </form>
      </Card>

      {/* Form Help */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2 text-sm">Form Guidelines</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Project name is required and should be descriptive</li>
          <li>• Status determines the project's current state</li>
          <li>• Budget should be entered in USD</li>
          <li>• End date should be after start date</li>
        </ul>
      </Card>
    </div>
  );
}
