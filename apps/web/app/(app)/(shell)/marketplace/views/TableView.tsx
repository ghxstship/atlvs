import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@ghxstship/ui";
import { Badge ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Button ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Dropdown,
  
  DropdownItem,
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
  ExternalLink
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface TableViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function TableView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange
}: TableViewProps) {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch listings with real-time updates
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters, sortField, sortDirection],
    queryFn: () => marketplaceService.getListings(orgId, {
      ...filters,
      sortBy: sortField,
      sortOrder: sortDirection
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const listings = listingsResponse?.listings || [];

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
      <div className="space-y-md">
        <div className="h-icon-lg bg-muted animate-pulse rounded" />
        <div className="space-y-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-component-md bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-xl">
        <p className="text-muted-foreground">Failed to load listings</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-icon-2xl">
                  <input
                    type="checkbox"
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('title')}
              >
                Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('type')}
              >
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('pricing.amount')}
              >
                Price {sortField === 'pricing.amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('response_count')}
              >
                Responses {sortField === 'response_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-icon-2xl"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow
                key={listing.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onListingSelect?.(listing)}
              >
                {onSelectionChange && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectListing(listing.id, e.target.checked);
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-xs">
                    {listing.title}
                    {listing.featured && (
                      <Star className="h-icon-xs w-icon-xs text-yellow-500 fill-current" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeVariant(listing.type)}>
                    {listing.type}
                  </Badge>
                </TableCell>
                <TableCell>{listing.category}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(listing.pricing?.amount, listing.pricing?.currency)}
                </TableCell>
                <TableCell>
                  {listing.location?.city && listing.location?.country
                    ? `${listing.location.city}, ${listing.location.country}`
                    : listing.location?.isRemote
                    ? 'Remote'
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(listing.status)}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {listing.response_count || 0}
                </TableCell>
                <TableCell>
                  {new Date(listing.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onListingView?.(listing)}>
                        <Eye className="mr-2 h-icon-xs w-icon-xs" />
                        View Details
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="text-center py-xl">
          <p className="text-muted-foreground">No listings found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or create a new listing
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
