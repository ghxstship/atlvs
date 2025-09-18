'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Select,
  Textarea,
  Card
} from '@ghxstship/ui';
import { 
  FileText,
  Calendar,
  BarChart3,
  Filter,
  Save,
  X
} from 'lucide-react';

interface CreateReportClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (report: any) => void;
}

interface ReportFormData {
  name: string;
  description: string;
  type: string;
  format: string;
  frequency: string;
  status: string;
  parameters: string;
  filters: string;
  scheduledDate: string;
  recipients: string;
  notes: string;
}

const REPORT_TYPES = [
  { value: 'asset_inventory', label: 'Asset Inventory' },
  { value: 'asset_utilization', label: 'Asset Utilization' },
  { value: 'maintenance_summary', label: 'Maintenance Summary' },
  { value: 'assignment_tracking', label: 'Assignment Tracking' },
  { value: 'cost_analysis', label: 'Cost Analysis' },
  { value: 'depreciation', label: 'Depreciation Report' },
  { value: 'compliance', label: 'Compliance Report' },
  { value: 'custom', label: 'Custom Report' }
];

const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' }
];

const REPORT_FREQUENCIES = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const REPORT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'generating', label: 'Generating' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

export default function CreateReportClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateReportClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
    type: 'asset_inventory',
    format: 'pdf',
    frequency: 'once',
    status: 'draft',
    parameters: '',
    filters: '',
    scheduledDate: '',
    recipients: '',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const reportId = crypto.randomUUID();
      
      // Insert report record
      const { data: report, error } = await supabase
        .from('asset_reports')
        .insert({
          id: reportId,
          organization_id: orgId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          type: formData.type,
          format: formData.format,
          frequency: formData.frequency,
          status: formData.status,
          parameters: formData.parameters.trim() || null,
          filters: formData.filters.trim() || null,
          scheduled_date: formData.scheduledDate || null,
          recipients: formData.recipients.trim() || null,
          notes: formData.notes.trim() || null,
          created_by: user.id,
          updated_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          id: crypto.randomUUID(),
          organization_id: orgId,
          user_id: user.id,
          action: 'create',
          entity_type: 'asset_report',
          entity_id: reportId,
          metadata: {
            report_name: formData.name,
            type: formData.type,
            format: formData.format,
            frequency: formData.frequency,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'asset_inventory',
        format: 'pdf',
        frequency: 'once',
        status: 'draft',
        parameters: '',
        filters: '',
        scheduledDate: '',
        recipients: '',
        notes: ''
      });

      onSuccess?.(report);
      onClose();
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Asset Report"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Basic Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <FileText className="h-5 w-5 color-primary" />
            <h3 className="text-heading-4">Basic Information</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Report Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter report name"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the report"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  <BarChart3 className="h-4 w-4 inline mr-xs" />
                  Report Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  {REPORT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Format
                </label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => handleInputChange('format', value)}
                >
                  {REPORT_FORMATS.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Scheduling */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Calendar className="h-5 w-5 color-success" />
            <h3 className="text-heading-4">Scheduling</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Frequency
                </label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  {REPORT_FREQUENCIES.map(frequency => (
                    <option key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {REPORT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Scheduled Date/Time
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Recipients
              </label>
              <Input
                value={formData.recipients}
                onChange={(e) => handleInputChange('recipients', e.target.value)}
                placeholder="Email addresses separated by commas"
              />
            </div>
          </div>
        </Card>

        {/* Parameters & Filters */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Filter className="h-5 w-5 color-secondary" />
            <h3 className="text-heading-4">Parameters & Filters</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Report Parameters
              </label>
              <Textarea
                value={formData.parameters}
                onChange={(e) => handleInputChange('parameters', e.target.value)}
                placeholder="JSON format parameters for report generation"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Filters
              </label>
              <Textarea
                value={formData.filters}
                onChange={(e) => handleInputChange('filters', e.target.value)}
                placeholder="Filters to apply to the report data"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this report"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-sm pt-md border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-sm" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-sm" />
            {loading ? 'Creating...' : 'Create Report'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
