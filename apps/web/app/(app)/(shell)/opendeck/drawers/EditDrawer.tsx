'use client';

import React, { useState, useCallback, useState, useEffect } from 'react';
import { Drawer, Button, Input, Textarea, Select } from '@ghxstship/ui';
import { openDeckService, type Listing } from '../lib/opendeck-service';

interface EditDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizationId: string;
  listing: Listing | null;
  vendors?: Array<{ id: string; name: string }>;
}

export default function EditDrawer({ 
  open, 
  onClose, 
  onSuccess, 
  organizationId,
  listing,
  vendors = [] 
}: EditDrawerProps) {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        currency: listing.currency,
        status: listing.status,
        vendor_id: listing.vendor_id || ''
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setLoading(true);
    setError(null);

    try {
      const result = await openDeckService.updateListing(listing.id, organizationId, {
        ...formData,
        vendor_id: formData.vendor_id || undefined
      });

      if (result) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to update listing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
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

  if (!listing) return null;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Edit Listing"
      description={`Update details for ${listing.title}`}
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-md py-sm rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-xs">
          <label htmlFor="edit-title" className="text-sm font-medium text-foreground">
            Title *
          </label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-xs">
          <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label htmlFor="edit-price" className="text-sm font-medium text-foreground">
              Price *
            </label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="edit-currency" className="text-sm font-medium text-foreground">
              Currency
            </label>
            <Select
              id="edit-currency"
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
            <label htmlFor="edit-vendor" className="text-sm font-medium text-foreground">
              Vendor
            </label>
            <Select
              id="edit-vendor"
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
          <label htmlFor="edit-status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <Select
            id="edit-status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            disabled={loading}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
