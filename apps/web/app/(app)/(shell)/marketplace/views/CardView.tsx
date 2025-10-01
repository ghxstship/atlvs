import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  User
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface CardViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function CardView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange,
}: CardViewProps) {
  // Fetch listings
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000,
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
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-icon-xs bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-xs">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
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
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedListings.includes(listing.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onListingSelect?.(listing)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight line-clamp-xs">
                    {listing.title}
                  </CardTitle>
                  <div className="flex items-center gap-xs mt-2">
                    <Badge variant={getTypeVariant(listing.type)} className="text-xs">
                      {listing.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {listing.category}
                    </Badge>
                  </div>
                </div>

                {/* Selection Checkbox */}
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectListing(listing.id, e.target.checked);
                    }}
                    className="rounded border-gray-300 ml-2"
                  />
                )}
              </div>

              {/* Featured indicator */}
              {listing.featured && (
                <div className="flex items-center gap-xs text-yellow-600 mt-2">
                  <Star className="h-icon-xs w-icon-xs fill-current" />
                  <span className="text-sm font-medium">Featured</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-md">
              {/* Description */}
              {listing.description && (
                <p className="text-sm text-muted-foreground line-clamp-sm">
                  {listing.description}
                </p>
              )}

              {/* Pricing */}
              {listing.pricing?.amount && (
                <div className="flex items-center gap-xs">
                  <DollarSign className="h-icon-xs w-icon-xs text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                  </span>
                  {listing.pricing.negotiable && (
                    <Badge variant="secondary" className="text-xs">
                      Negotiable
                    </Badge>
                  )}
                </div>
              )}

              {/* Location */}
              {(listing.location?.city || listing.location?.isRemote) && (
                <div className="flex items-center gap-xs text-sm text-muted-foreground">
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

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-md">
                  <div className="flex items-center gap-xs">
                    <MessageSquare className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <span>{listing.response_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Eye className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <span>{listing.view_count || 0}</span>
                  </div>
                </div>

                <Badge variant={getStatusVariant(listing.status)} className="text-xs">
                  {listing.status}
                </Badge>
              </div>

              {/* Created date */}
              <div className="flex items-center gap-xs text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Creator info */}
              {listing.creator && (
                <div className="flex items-center gap-xs text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{listing.creator.name || 'Anonymous'}</span>
                </div>
              )}
            </CardContent>

            {/* Actions */}
            <div className="px-lg pb-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-xs">
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
                </div>

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
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="text-center py-xsxl">
          <div className="mx-auto w-component-lg h-component-lg bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-icon-lg w-icon-lg text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create a new listing to get started
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
