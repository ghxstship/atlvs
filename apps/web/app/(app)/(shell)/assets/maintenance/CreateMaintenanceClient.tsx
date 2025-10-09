'use client';


import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Select, Textarea, Card } from '@ghxstship/ui';
import { AlertTriangle, Calendar, DollarSign, Save, Wrench, X } from 'lucide-react';

interface CreateMaintenanceClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (maintenance: any) => void;
}

interface MaintenanceFormData {
  assetId: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  assignedTo: string;
  description: string;
  cost: string;
  currency: string;
  vendor: string;
  notes: string;
}

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'calibration', label: 'Calibration' }
];

const MAINTENANCE_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const MAINTENANCE_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'overdue', label: 'Overdue' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' }
];

export default function CreateMaintenanceClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateMaintenanceClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    assetId: '',
    type: 'preventive',
    priority: 'medium',
    status: 'scheduled',
    scheduledDate: '',
    completedDate: '',
    assignedTo: '',
    description: '',
    cost: '',
    currency: 'USD',
    vendor: '',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof MaintenanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.description) return;

    setLoading(true);
    try {
      const maintenanceId = crypto.randomUUID();
      
      // Insert maintenance record
      const { data: maintenance, error } = await supabase
        .from('asset_maintenance')
        .insert({
          id: maintenanceId,
          organization_id: orgId,
          asset_id: formData.assetId,
          type: formData.type,
          priority: formData.priority,
          status: formData.status,
          scheduled_date: formData.scheduledDate || null,
          completed_date: formData.completedDate || null,
          assigned_to: formData.assignedTo || null,
          description: formData.description.trim(),
          cost: formData.cost ? parseFloat(formData.cost) : null,
          currency: formData.currency,
          vendor: formData.vendor.trim() || null,
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
          entity_type: 'asset_maintenance',
          entity_id: maintenanceId,
          metadata: {
            asset_id: formData.assetId,
            type: formData.type,
            priority: formData.priority,
            status: formData.status,
            description: formData.description
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        assetId: '',
        type: 'preventive',
        priority: 'medium',
        status: 'scheduled',
        scheduledDate: '',
        completedDate: '',
        assignedTo: '',
        description: '',
        cost: '',
        currency: 'USD',
        vendor: '',
        notes: ''
      });

      onSuccess?.(maintenance);
      onClose();
    } catch (error) {
      console.error('Error creating maintenance record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Schedule Maintenance"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Asset & Type */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Wrench className="h-icon-sm w-icon-sm color-accent" />
            <h3 className="text-body text-heading-4">Asset & Maintenance Type</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Asset ID *
              </label>
              <Input                 value={formData.assetId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assetId', e.target.value)}
                placeholder="Enter asset ID"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onChange={(value: any) => handleInputChange('type', value)}
                >
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  <AlertTriangle className="h-icon-xs w-icon-xs inline mr-xs" />
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(value: any) => handleInputChange('priority', value)}
                >
                  {MAINTENANCE_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
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
                  onChange={(value: any) => handleInputChange('status', value)}
                >
                  {MAINTENANCE_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
            <Calendar className="h-icon-sm w-icon-sm color-success" />
            <h3 className="text-body text-heading-4">Scheduling</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Scheduled Date
                </label>
                <Input                   type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('scheduledDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Completed Date
                </label>
                <Input                   type="datetime-local"
                  value={formData.completedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('completedDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Assigned To
              </label>
              <Input                 value={formData.assignedTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Person or team assigned to maintenance"
              />
            </div>
          </div>
        </Card>

        {/* Description & Details */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Wrench className="h-icon-sm w-icon-sm color-secondary" />
            <h3 className="text-body text-heading-4">Description & Details</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                placeholder="Describe the maintenance work to be performed"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Vendor/Service Provider
              </label>
              <Input                 value={formData.vendor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('vendor', e.target.value)}
                placeholder="External vendor or service provider"
              />
            </div>
          </div>
        </Card>

        {/* Cost Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <DollarSign className="h-icon-sm w-icon-sm color-warning" />
            <h3 className="text-body text-heading-4">Cost Information</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Estimated/Actual Cost
                </label>
                <Input                   type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Currency
                </label>
                <Select
                  value={formData.currency}
                  onChange={(value: any) => handleInputChange('currency', value)}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the maintenance"
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
            <X className="h-icon-xs w-icon-xs mr-sm" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.assetId || !formData.description}
          >
            <Save className="h-icon-xs w-icon-xs mr-sm" />
            {loading ? 'Creating...' : 'Schedule Maintenance'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
