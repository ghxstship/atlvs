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
  Wrench,
  Calendar,
  AlertTriangle,
  DollarSign,
  Save,
  X
} from 'lucide-react';

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
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset & Type */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Asset & Maintenance Type</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Asset ID *
              </label>
              <Input
                value={formData.assetId}
                onChange={(e) => handleInputChange('assetId', e.target.value)}
                placeholder="Enter asset ID"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  {MAINTENANCE_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
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
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Scheduling</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Scheduled Date
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Completed Date
                </label>
                <Input
                  type="datetime-local"
                  value={formData.completedDate}
                  onChange={(e) => handleInputChange('completedDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Assigned To
              </label>
              <Input
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Person or team assigned to maintenance"
              />
            </div>
          </div>
        </Card>

        {/* Description & Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Description & Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the maintenance work to be performed"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Vendor/Service Provider
              </label>
              <Input
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="External vendor or service provider"
              />
            </div>
          </div>
        </Card>

        {/* Cost Information */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Cost Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Estimated/Actual Cost
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
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
              <label className="block text-sm font-medium mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the maintenance"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.assetId || !formData.description}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Schedule Maintenance'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
