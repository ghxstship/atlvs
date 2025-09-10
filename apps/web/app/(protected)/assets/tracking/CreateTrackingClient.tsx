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
  MapPin,
  Calendar,
  Navigation,
  Activity,
  Save,
  X
} from 'lucide-react';

interface CreateTrackingClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tracking: any) => void;
}

interface TrackingFormData {
  assetId: string;
  trackingType: string;
  status: string;
  location: string;
  coordinates: string;
  timestamp: string;
  assignedTo: string;
  condition: string;
  notes: string;
}

const TRACKING_TYPES = [
  { value: 'location', label: 'Location Update' },
  { value: 'status', label: 'Status Change' },
  { value: 'condition', label: 'Condition Check' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'inspection', label: 'Inspection' }
];

const TRACKING_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'at_location', label: 'At Location' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'storage', label: 'In Storage' },
  { value: 'missing', label: 'Missing' }
];

const ASSET_CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' }
];

export default function CreateTrackingClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateTrackingClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrackingFormData>({
    assetId: '',
    trackingType: 'location',
    status: 'active',
    location: '',
    coordinates: '',
    timestamp: new Date().toISOString().slice(0, 16),
    assignedTo: '',
    condition: 'good',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof TrackingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.location) return;

    setLoading(true);
    try {
      const trackingId = crypto.randomUUID();
      
      // Insert tracking record
      const { data: tracking, error } = await supabase
        .from('asset_tracking')
        .insert({
          id: trackingId,
          organization_id: orgId,
          asset_id: formData.assetId,
          tracking_type: formData.trackingType,
          status: formData.status,
          location: formData.location.trim(),
          coordinates: formData.coordinates.trim() || null,
          timestamp: formData.timestamp,
          assigned_to: formData.assignedTo || null,
          condition: formData.condition,
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
          entity_type: 'asset_tracking',
          entity_id: trackingId,
          metadata: {
            asset_id: formData.assetId,
            tracking_type: formData.trackingType,
            status: formData.status,
            location: formData.location,
            condition: formData.condition
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        assetId: '',
        trackingType: 'location',
        status: 'active',
        location: '',
        coordinates: '',
        timestamp: new Date().toISOString().slice(0, 16),
        assignedTo: '',
        condition: 'good',
        notes: ''
      });

      onSuccess?.(tracking);
      onClose();
    } catch (error) {
      console.error('Error creating tracking record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Tracking Record"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset & Type */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Asset & Tracking Type</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tracking Type
                </label>
                <Select
                  value={formData.trackingType}
                  onValueChange={(value) => handleInputChange('trackingType', value)}
                >
                  {TRACKING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  {TRACKING_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Location & Time */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Location & Time</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Current location of the asset"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Coordinates (GPS)
              </label>
              <Input
                value={formData.coordinates}
                onChange={(e) => handleInputChange('coordinates', e.target.value)}
                placeholder="Latitude, Longitude (e.g., 40.7128, -74.0060)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Timestamp *
              </label>
              <Input
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => handleInputChange('timestamp', e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Assignment & Condition */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Assignment & Condition</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assigned To
              </label>
              <Input
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Person currently responsible for asset"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Condition
              </label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange('condition', value)}
              >
                {ASSET_CONDITIONS.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this tracking update"
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
            disabled={loading || !formData.assetId || !formData.location}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Add Tracking Record'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
