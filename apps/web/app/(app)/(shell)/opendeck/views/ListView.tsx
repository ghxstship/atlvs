'use client';

import React from 'react';
import { Badge } from '@ghxstship/ui';
import type { Listing } from '../lib/opendeck-service';

interface ListViewProps {
  listings: Listing[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function ListView({ listings, onSelect, loading = false }: ListViewProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-xl">
        <p className="text-muted-foreground">No listings found. Create your first listing to get started.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'secondary' | 'default'> = {
      active: 'success',
      draft: 'warning',
      inactive: 'secondary',
      archived: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-sm">
      {listings.map((listing) => (
        <div
          key={listing.id}
          onClick={() => onSelect(listing.id)}
          className="flex items-center justify-between p-md border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{listing.title}</h3>
            {listing.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-xs">
                {listing.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-md">
            <span className="text-sm font-medium text-foreground">
              {formatPrice(listing.price, listing.currency)}
            </span>
            {getStatusBadge(listing.status)}
          </div>
        </div>
      ))}
    </div>
  );
}
