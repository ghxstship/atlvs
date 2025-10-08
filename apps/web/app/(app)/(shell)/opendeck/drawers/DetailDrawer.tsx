'use client';

import React, { useState } from 'react';
import { Drawer, Button, Badge } from '@ghxstship/ui';
import { Edit, Trash2 } from 'lucide-react';
import { openDeckService, type Listing } from '../lib/opendeck-service';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  listing: Listing | null;
  vendor?: { id: string; name: string } | null;
}

export default function DetailDrawer({ 
  open, 
  onClose, 
  onEdit,
  onDelete,
  listing,
  vendor 
}: DetailDrawerProps) {
  const [deleting, setDeleting] = useState(false);

  if (!listing) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'secondary' | 'default'> = {
      active: 'success',
      draft: 'warning',
      inactive: 'secondary',
      archived: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={listing.title}
      description="Listing Details"
      width="lg"
    >
      <div className="space-y-md">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          {getStatusBadge(listing.status)}
          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-xs" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-xs" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Price */}
        <div className="bg-muted rounded-lg p-md">
          <p className="text-sm text-muted-foreground mb-xs">Price</p>
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(listing.price, listing.currency)}
          </p>
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-sm">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
        )}

        {/* Vendor */}
        {vendor && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-sm">Vendor</h3>
            <p className="text-sm text-muted-foreground">{vendor.name}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-md pt-md border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-xs">Created</p>
            <p className="text-sm text-foreground">
              {new Date(listing.created_at).toLocaleDateString()} at{' '}
              {new Date(listing.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-xs">Last Updated</p>
            <p className="text-sm text-foreground">
              {new Date(listing.updated_at).toLocaleDateString()} at{' '}
              {new Date(listing.updated_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* ID for reference */}
        <div className="pt-md border-t border-border">
          <p className="text-xs text-muted-foreground mb-xs">Listing ID</p>
          <code className="text-xs bg-muted px-sm py-xs rounded">
            {listing.id}
          </code>
        </div>
      </div>
    </Drawer>
  );
}
