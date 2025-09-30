import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Plus,
  GripVertical
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface KanbanViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type KanbanColumn = {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'archived';
  color: string;
  count: number;
};

export default function KanbanView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange,
}: KanbanViewProps) {
  const [draggedListing, setDraggedListing] = useState<MarketplaceListing | null>(null);

  // Fetch listings
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000,
  });

  const listings = listingsResponse?.listings || [];

  // Define kanban columns
  const columns: KanbanColumn[] = [
    { id: 'draft', title: 'Draft', status: 'draft', color: 'bg-gray-100', count: 0 },
    { id: 'active', title: 'Active', status: 'active', color: 'bg-green-100', count: 0 },
    { id: 'archived', title: 'Archived', status: 'archived', color: 'bg-blue-100', count: 0 },
  ];

  // Group listings by status
  const listingsByStatus = listings.reduce((acc, listing) => {
    const status = listing.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(listing);
    return acc;
  }, {} as Record<string, MarketplaceListing[]>);

  // Update column counts
  columns.forEach(column => {
    column.count = listingsByStatus[column.status]?.length || 0;
  });

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, listing: MarketplaceListing) => {
    setDraggedListing(listing);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();

    if (!draggedListing || draggedListing.status === newStatus) {
      setDraggedListing(null);
      return;
    }

    try {
      // Update listing status
      await marketplaceService.updateListing(orgId, '', draggedListing.id, { status: newStatus as any });
      setDraggedListing(null);

      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update listing status:', error);
      setDraggedListing(null);
    }
  };

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
      minimumFractionDigits: 0,
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
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-muted rounded-lg p-4">
              <div className="h-6 bg-muted-foreground/20 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-background rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load listings</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnListings = listingsByStatus[column.status] || [];

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-muted rounded-lg p-4 h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {column.count}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Drop Zone */}
                <div
                  className={`min-h-[400px] rounded border-2 border-dashed transition-colors ${
                    draggedListing ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  {/* Listing Cards */}
                  <div className="space-y-3 p-2">
                    {columnListings.map((listing) => (
                      <div
                        key={listing.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, listing)}
                        className={`bg-background rounded-lg p-3 cursor-move transition-all hover:shadow-sm border ${
                          selectedListings.includes(listing.id) ? 'ring-2 ring-primary' : ''
                        } ${draggedListing?.id === listing.id ? 'opacity-50' : ''}`}
                        onClick={() => onListingSelect?.(listing)}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                                {listing.title}
                              </h4>
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
                              className="rounded border-gray-300 ml-2 flex-shrink-0"
                            />
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1 mb-2">
                          <Badge variant={getTypeVariant(listing.type)} className="text-xs">
                            {listing.type}
                          </Badge>
                          {listing.featured && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>

                        {/* Pricing */}
                        {listing.pricing?.amount && (
                          <div className="text-sm font-medium text-green-600 mb-2">
                            {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                          </div>
                        )}

                        {/* Description */}
                        {listing.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {listing.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{listing.response_count || 0} responses</span>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onListingView?.(listing)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onListingEdit?.(listing)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => marketplaceService.featureListing(orgId, '', listing.id, !listing.featured)}
                              >
                                {listing.featured ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Unfeature
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Feature
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => marketplaceService.archiveListing(orgId, '', listing.id)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onListingDelete?.(listing)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty state for column */}
                  {columnListings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted-foreground/10 rounded-full flex items-center justify-center mb-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No {column.status} listings
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} •
          {selectedListings.length > 0 && ` ${selectedListings.length} selected`}
        </span>
        <span>
          Drag listings between columns to change status • Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
