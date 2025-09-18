'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Textarea,
  Select,
  Card
} from '@ghxstship/ui';
import { 
  TrendingUp,
  Calendar,
  User as UserIcon,
  DollarSign,
  Save,
  X
} from 'lucide-react';

interface CreateAdvancingClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (advancing: any) => void;
}

interface AdvancingFormData {
  assetId: string;
  advancedTo: string;
  advancedBy: string;
  advanceDate: string;
  returnDate: string;
  purpose: string;
  amount: string;
  currency: string;
  status: string;
  notes: string;
}

const ADVANCE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'returned', label: 'Returned' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' }
];

export default function CreateAdvancingClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAdvancingClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdvancingFormData>({
    assetId: '',
    advancedTo: '',
    advancedBy: user.id,
    advanceDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    purpose: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof AdvancingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.advancedTo || !formData.purpose) return;

    setLoading(true);
    try {
      const advancingId = crypto.randomUUID();
      
      // Insert advancing record
      const { data: advancing, error } = await supabase
        .from('asset_advancing')
        .insert({
          id: advancingId,
          organization_id: orgId,
          asset_id: formData.assetId,
          advanced_to: formData.advancedTo,
          advanced_by: formData.advancedBy,
          advance_date: formData.advanceDate,
          return_date: formData.returnDate || null,
          purpose: formData.purpose.trim(),
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: formData.currency,
          status: formData.status,
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
          entity_type: 'asset_advancing',
          entity_id: advancingId,
          metadata: {
            asset_id: formData.assetId,
            advanced_to: formData.advancedTo,
            purpose: formData.purpose,
            amount: formData.amount,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        assetId: '',
        advancedTo: '',
        advancedBy: user.id,
        advanceDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        purpose: '',
        amount: '',
        currency: 'USD',
        status: 'pending',
        notes: ''
      });

      onSuccess?.(advancing);
      onClose();
    } catch (error) {
      console.error('Error creating advancing record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Asset Advance"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Asset & Personnel */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <TrendingUp className="h-5 w-5 color-primary" />
            <h3 className="text-heading-4">Asset & Personnel</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Asset ID *
              </label>
              <Input
                value={formData.assetId}
                onChange={(e) => handleInputChange('assetId', e.target.value)}
                placeholder="Enter asset ID"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  <UserIcon className="h-4 w-4 inline mr-xs" />
                  Advanced To *
                </label>
                <Input
                  value={formData.advancedTo}
                  onChange={(e) => handleInputChange('advancedTo', e.target.value)}
                  placeholder="Person receiving the advance"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Advanced By
                </label>
                <Input
                  value={formData.advancedBy}
                  onChange={(e) => handleInputChange('advancedBy', e.target.value)}
                  placeholder="Person authorizing the advance"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Dates & Timeline */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Calendar className="h-5 w-5 color-success" />
            <h3 className="text-heading-4">Dates & Timeline</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Advance Date *
                </label>
                <Input
                  type="date"
                  value={formData.advanceDate}
                  onChange={(e) => handleInputChange('advanceDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Expected Return Date
                </label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Purpose & Details */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <UserIcon className="h-5 w-5 color-secondary" />
            <h3 className="text-heading-4">Purpose & Details</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Purpose *
              </label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Describe the purpose of this advance"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                {ADVANCE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <DollarSign className="h-5 w-5 color-warning" />
            <h3 className="text-heading-4">Financial Information</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
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
              <label className="block text-body-sm form-label mb-xs">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this advance"
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
            disabled={loading || !formData.assetId || !formData.advancedTo || !formData.purpose}
          >
            <Save className="h-4 w-4 mr-sm" />
            {loading ? 'Creating...' : 'Create Advance'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
