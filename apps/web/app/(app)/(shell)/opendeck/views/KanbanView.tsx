'use client';

import React from 'react';
import { Badge } from '@ghxstship/ui';
import type { Listing } from '../lib/opendeck-service';

interface KanbanViewProps {
  listings: Listing[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function KanbanView({ listings, onSelect, loading = false }: KanbanViewProps) {
  const columns = [
    { id: 'draft', title: 'Draft', status: 'draft' },
    { id: 'active', title: 'Active', status: 'active' },
    { id: 'inactive', title: 'Inactive', status: 'inactive' },
    { id: 'archived', title: 'Archived', status: 'archived' },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const getListingsByStatus = (status: string) => {
    return listings.filter(l => l.status === status);
  };

  if (loading) {
    return (
      <div className="flex gap-md overflow-x-auto">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[280px]">
            <div className="bg-muted rounded-lg p-sm mb-sm">
              <div className="h-6 bg-background/50 rounded animate-pulse" />
            </div>
            <div className="space-y-sm">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-md overflow-x-auto pb-md">
      {columns.map((column) => {
        const columnListings = getListingsByStatus(column.status);
        return (
          <div key={column.id} className="flex-1 min-w-[280px]">
            <div className="bg-muted rounded-lg p-sm mb-sm">
              <h3 className="font-medium text-foreground">
                {column.title} <span className="text-muted-foreground">({columnListings.length})</span>
              </h3>
            </div>
            <div className="space-y-sm">
              {columnListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => onSelect(listing.id)}
                  className="bg-background border border-border rounded-lg p-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-sm line-clamp-2">
                    {listing.title}
                  </h4>
                  {listing.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-sm">
                      {listing.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {columnListings.length === 0 && (
                <div className="text-center py-md text-sm text-muted-foreground">
                  No {column.title.toLowerCase()} listings
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
