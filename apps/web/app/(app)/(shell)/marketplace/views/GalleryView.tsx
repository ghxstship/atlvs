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
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface ImageViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ImageView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange
}: ImageViewProps) {
  // Fetch listings
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000
  });

  const listings = listingsResponse?.listings || [];

  // Handle selection
  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedListings, listingId]);
    } else {
      onSelectionChange?.(selectedListings.filter(id => id !== listingId));
    }
  };

  // Format currency
  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-xsxl">
        <p className="text-muted-foreground mb-4">Failed to load listings</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
        {listings.map((listing) => {
          const primaryImage = listing.images?.find(img => img.isPrimary)?.url;

          return (
            <div
              key={listing.id}
              className={`group relative aspect-[4/3] bg-muted rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                selectedListings.includes(listing.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onListingSelect?.(listing)}
            >
              {/* Image */}
              <div className="absolute inset-0">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-icon-2xl w-icon-2xl text-muted-foreground" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onListingView?.(listing);
                    }}
                  >
                    <Eye className="h-icon-xs w-icon-xs mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Selection Checkbox */}
              {onSelectionChange && (
                <div className="absolute top-xs left-2">
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectListing(listing.id, e.target.checked);
                    }}
                    className="rounded border-white/20 bg-white/10 backdrop-blur-sm"
                  />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-xs right-2 flex gap-xs">
                <Badge variant={getTypeVariant(listing.type)} className="text-xs">
                  {listing.type}
                </Badge>
                {listing.featured && (
                  <div className="bg-yellow-500 text-yellow-900 px-xs.5 py-0.5 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-md">
                <h3 className="text-white font-semibold text-sm line-clamp-xs mb-1">
                  {listing.title}
                </h3>

                {listing.pricing?.amount && (
                  <div className="text-white/90 font-medium text-sm mb-1">
                    {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-white/70">
                  <div className="flex items-center gap-xs">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {listing.location?.city || 'Remote'}
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="absolute top-xs left-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-icon-md w-icon-md p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onListingView?.(listing)}>
                      <Eye className="mr-2 h-icon-xs w-icon-xs" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onListingEdit?.(listing)}>
                      <Edit className="mr-2 h-icon-xs w-icon-xs" />
                      Edit
                    </DropdownMenuItem>
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
          );
        })}
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="text-center py-xsxl">
          <div className="mx-auto w-component-md h-component-md bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-icon-md w-icon-md text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create your first listing
          </p>
          <Button>Create Listing</Button>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
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
