import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Clock, Calendar, User, DollarSign, MapPin } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface TimelineViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
}

export default function TimelineView({
  orgId,
  filters = {},
  onListingSelect,
}: TimelineViewProps) {
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000,
  });

  const listings = listingsResponse?.listings || [];

  // Sort listings by creation date (newest first)
  const sortedListings = [...listings].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
              <div className="w-px h-16 bg-muted animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-48" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="relative">
        {sortedListings.map((listing, index) => {
          const isLast = index === sortedListings.length - 1;

          return (
            <div key={listing.id} className="flex gap-4 pb-8">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  getTypeVariant(listing.type) === 'default' ? 'bg-blue-500' :
                  getTypeVariant(listing.type) === 'secondary' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                {!isLast && <div className="w-px h-full bg-border mt-2" />}
              </div>

              {/* Content */}
              <div
                className="flex-1 pb-4 cursor-pointer hover:bg-muted/50 rounded-lg p-4 transition-colors"
                onClick={() => onListingSelect?.(listing)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <Badge variant={getTypeVariant(listing.type)}>
                        {listing.type}
                      </Badge>
                      {listing.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(listing.created_at).toLocaleTimeString()}</span>
                      </div>
                      {listing.creator && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{listing.creator.name || 'Anonymous'}</span>
                        </div>
                      )}
                    </div>

                    {listing.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      {listing.pricing?.amount && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">
                            {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                          </span>
                        </div>
                      )}

                      {listing.location?.city && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{listing.location.city}</span>
                        </div>
                      )}

                      <Badge variant="outline">
                        {listing.category}
                      </Badge>

                      <span className="text-sm text-muted-foreground">
                        {listing.response_count || 0} responses
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No listings in timeline</h3>
          <p className="text-muted-foreground">
            Listings will appear here as they are created
          </p>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {listings.length} listing{listings.length !== 1 ? 's' : ''} in timeline
      </div>
    </div>
  );
}
