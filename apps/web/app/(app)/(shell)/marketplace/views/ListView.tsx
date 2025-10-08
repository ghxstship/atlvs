import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@ghxstship/ui';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  Archive,
  MapPin,
  DollarSign,
  MessageSquare,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface ListViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ListView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange
}: ListViewProps) {
  // Fetch listings
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000
  });

  const listings = listingsResponse?.listings || [];

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(listings.map(l => l.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedListings, listingId]);
    } else {
      onSelectionChange?.(selectedListings.filter(id => id !== listingId));
    }
  };

  // Format currency
  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  // Get type badge variant
  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'offer': return 'default';
      case 'request': return 'secondary';
      case 'exchange': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-component-md bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-xl">
        <p className="text-muted-foreground mb-4">Failed to load listings</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {/* Header with select all */}
      {onSelectionChange && listings.length > 0 && (
        <div className="flex items-center gap-sm p-sm bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            checked={selectedListings.length === listings.length && listings.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">
            {selectedListings.length > 0
              ? `${selectedListings.length} selected`
              : 'Select all'
            }
          </span>
        </div>
      )}

      {/* List Items */}
      {listings.map((listing) => (
        <div
          key={listing.id}
          className={`border rounded-lg p-md cursor-pointer transition-all hover:shadow-sm hover:border-primary/20 ${
            selectedListings.includes(listing.id) ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => onListingSelect?.(listing)}
        >
          <div className="flex items-start gap-md">
            {/* Selection Checkbox */}
            {onSelectionChange && (
              <input
                type="checkbox"
                checked={selectedListings.includes(listing.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectListing(listing.id, e.target.checked);
                }}
                className="rounded border-gray-300 mt-1"
              />
            )}

            {/* Featured indicator */}
            {listing.featured && (
              <Star className="h-icon-sm w-icon-sm text-yellow-500 fill-current flex-shrink-0 mt-1" />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-md">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-xs mb-2">
                    {listing.title}
                  </h3>

                  <div className="flex items-center gap-xs mb-3">
                    <Badge variant={getTypeVariant(listing.type)}>
                      {listing.type}
                    </Badge>
                    <Badge variant="outline">
                      {listing.category}
                    </Badge>
                    <Badge variant={getStatusVariant(listing.status)}>
                      {listing.status}
                    </Badge>
                  </div>

                  {listing.description && (
                    <p className="text-muted-foreground text-sm line-clamp-xs mb-3">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-md text-sm">
                    {/* Pricing */}
                    {listing.pricing?.amount && (
                      <div className="flex items-center gap-xs">
                        <DollarSign className="h-icon-xs w-icon-xs text-green-600" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                        </span>
                        {listing.pricing.negotiable && (
                          <span className="text-muted-foreground">(negotiable)</span>
                        )}
                      </div>
                    )}

                    {/* Location */}
                    {(listing.location?.city || listing.location?.isRemote) && (
                      <div className="flex items-center gap-xs text-muted-foreground">
                        <MapPin className="h-icon-xs w-icon-xs" />
                        <span>
                          {listing.location.isRemote
                            ? 'Remote'
                            : listing.location.city && listing.location.country
                            ? `${listing.location.city}, ${listing.location.country}`
                            : listing.location.city || listing.location.country || 'Location not specified'
                          }
                        </span>
                      </div>
                    )}

                    {/* Responses */}
                    <div className="flex items-center gap-xs text-muted-foreground">
                      <MessageSquare className="h-icon-xs w-icon-xs" />
                      <span>{listing.response_count || 0} responses</span>
                    </div>

                    {/* Created date */}
                    <div className="flex items-center gap-xs text-muted-foreground">
                      <Calendar className="h-icon-xs w-icon-xs" />
                      <span>
                        {new Date(listing.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Creator */}
                    {listing.creator && (
                      <div className="flex items-center gap-xs text-muted-foreground">
                        <User className="h-icon-xs w-icon-xs" />
                        <span>{listing.creator.name || 'Anonymous'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-xs flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onListingView?.(listing);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onListingEdit?.(listing);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => marketplaceService.featureListing(orgId, '', listing.id, !listing.featured)}
                      >
                        {listing.featured ? (
                          <>
                            <StarOff className="mr-2 h-icon-xs w-icon-xs" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-icon-xs w-icon-xs" />
                            Feature
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => marketplaceService.archiveListing(orgId, '', listing.id)}
                      >
                        <Archive className="mr-2 h-icon-xs w-icon-xs" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onListingDelete?.(listing)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="text-center py-xsxl">
          <div className="mx-auto w-component-md h-component-md bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-icon-md w-icon-md text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create your first listing
          </p>
          <Button>Create Listing</Button>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
        <span>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} •
          {selectedListings.length > 0 && ` ${selectedListings.length} selected`}
        </span>
        <span>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
