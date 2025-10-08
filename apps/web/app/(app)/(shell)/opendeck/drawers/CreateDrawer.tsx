'use client';

import React, { useState } from 'react';
import { Drawer, Button, Input, Textarea, Select } from '@ghxstship/ui';
import { openDeckService } from '../lib/opendeck-service';

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  vendors?: Array<{ id: string; name: string }>;
}

export default function CreateDrawer({ 
  open, 
  onClose, 
  onSuccess, 
  organizationId,
  vendors = [] 
}: CreateDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    status: 'draft' as const,
    vendor_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await openDeckService.createListing(organizationId, {
        ...formData,
        vendor_id: formData.vendor_id || undefined
      });

      if (result) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: 0,
          currency: 'USD',
          status: 'draft',
          vendor_id: ''
        });
        onSuccess();
        onClose();
      } else {
        setError('Failed to create listing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Create New Listing"
      description="Add a new listing to the OpenDeck marketplace"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-md py-sm rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-xs">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter listing title"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-xs">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter listing description"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label htmlFor="price" className="text-sm font-medium text-foreground">
              Price *
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="currency" className="text-sm font-medium text-foreground">
              Currency
            </label>
            <Select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              disabled={loading}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </Select>
          </div>
        </div>

        {vendors.length > 0 && (
          <div className="space-y-xs">
            <label htmlFor="vendor" className="text-sm font-medium text-foreground">
              Vendor
            </label>
            <Select
              id="vendor"
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              disabled={loading}
            >
              <option value="">No vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-xs">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <Select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            disabled={loading}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-sm pt-md border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
