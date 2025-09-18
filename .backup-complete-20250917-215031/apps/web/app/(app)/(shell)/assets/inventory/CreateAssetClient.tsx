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
  Package,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Save,
  X
} from 'lucide-react';

interface CreateAssetClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (asset: any) => void;
}

interface AssetFormData {
  name: string;
  description: string;
  category: string;
  type: string;
  status: string;
  sku: string;
  barcode: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: string;
  currentValue: string;
  location: string;
  notes: string;
}

const ASSET_CATEGORIES = [
  { value: 'site_infrastructure', label: 'Site Infrastructure' },
  { value: 'site_assets', label: 'Site Assets' },
  { value: 'site_vehicles', label: 'Site Vehicles' },
  { value: 'site_services', label: 'Site Services' },
  { value: 'heavy_machinery', label: 'Heavy Machinery & Equipment' },
  { value: 'it_communication', label: 'IT & Communication Services' },
  { value: 'office_admin', label: 'Office & Admin' },
  { value: 'access_credentials', label: 'Access & Credentials' },
  { value: 'parking', label: 'Parking' },
  { value: 'travel_lodging', label: 'Travel & Lodging' },
  { value: 'artist_technical', label: 'Artist Technical' },
  { value: 'artist_hospitality', label: 'Artist Hospitality' },
  { value: 'artist_travel', label: 'Artist Travel & Lodging' }
];

const ASSET_TYPES = [
  { value: 'fixed', label: 'Fixed Asset' },
  { value: 'rentable', label: 'Rentable Asset' },
  { value: 'service', label: 'Service Asset' }
];

const ASSET_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'missing', label: 'Missing' },
  { value: 'retired', label: 'Retired' }
];

export default function CreateAssetClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAssetClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    description: '',
    category: 'site_assets',
    type: 'fixed',
    status: 'available',
    sku: '',
    barcode: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchaseCost: '',
    currentValue: '',
    location: '',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof AssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const assetId = crypto.randomUUID();
      
      // Insert asset record
      const { data: asset, error } = await supabase
        .from('assets')
        .insert({
          id: assetId,
          organization_id: orgId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          type: formData.type,
          status: formData.status,
          sku: formData.sku.trim() || null,
          barcode: formData.barcode.trim() || null,
          manufacturer: formData.manufacturer.trim() || null,
          model: formData.model.trim() || null,
          serial_number: formData.serialNumber.trim() || null,
          purchase_date: formData.purchaseDate || null,
          purchase_cost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
          current_value: formData.currentValue ? parseFloat(formData.currentValue) : null,
          location: formData.location.trim() || null,
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
          entity_type: 'asset',
          entity_id: assetId,
          metadata: {
            asset_name: formData.name,
            category: formData.category,
            type: formData.type,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'site_assets',
        type: 'fixed',
        status: 'available',
        sku: '',
        barcode: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchaseCost: '',
        currentValue: '',
        location: '',
        notes: ''
      });

      onSuccess?.(asset);
      onClose();
    } catch (error) {
      console.error('Error creating asset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add New Asset"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Basic Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <Package className="h-5 w-5 color-primary" />
            <h3 className="text-heading-4">Basic Information</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Asset Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter asset name"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the asset"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  {ASSET_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Type *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  {ASSET_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {ASSET_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Identification */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <Tag className="h-5 w-5 color-success" />
            <h3 className="text-heading-4">Identification</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  SKU
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Stock Keeping Unit"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Barcode
                </label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="Barcode number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Manufacturer
                </label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="Manufacturer name"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Model
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Model number"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Serial Number
                </label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="Serial number"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <DollarSign className="h-5 w-5 color-warning" />
            <h3 className="text-heading-4">Financial Information</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Purchase Date
              </label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Purchase Cost
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchaseCost}
                  onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Current Value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => handleInputChange('currentValue', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Location & Notes */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <MapPin className="h-5 w-5 color-secondary" />
            <h3 className="text-heading-4">Location & Notes</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Current location of the asset"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the asset"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-sm pt-4 border-t">
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
            disabled={loading || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Asset'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
