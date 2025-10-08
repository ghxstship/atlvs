'use client';

import React from 'react';
import { Badge } from '@ghxstship/ui';
import type { Listing } from '../lib/opendeck-service';

interface GridViewProps {
  listings: Listing[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function GridView({ listings, onSelect, loading = false }: GridViewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse h-48 bg-muted rounded-lg" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {listings.map((listing) => (
        <div
          key={listing.id}
          onClick={() => onSelect(listing.id)}
          className="border border-border rounded-lg p-md hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between mb-sm">
            <h3 className="font-medium text-foreground flex-1 line-clamp-2">{listing.title}</h3>
            {getStatusBadge(listing.status)}
          </div>
          
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-md">
              {listing.description}
            </p>
          )}
          
          <div className="mt-auto pt-md border-t border-border">
            <p className="text-lg font-semibold text-foreground">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-xs">
              {new Date(listing.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
