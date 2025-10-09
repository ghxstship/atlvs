import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  CalendarView
} from "@ghxstship/ui";
import { Button } from '@ghxstship/ui';
import { Calendar, CalendarIcon, ChevronLeft, ChevronRight, Clock, DollarSign, Edit, MapPin, as } from "lucide-react";
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface CalendarViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingSelect?: (listing: MarketplaceListing) => void;
  onListingEdit?: (listing: MarketplaceListing) => void;
  onListingDelete?: (listing: MarketplaceListing) => void;
  onListingView?: (listing: MarketplaceListing) => void;
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function CalendarView({
  orgId,
  filters = {},
  onListingSelect,
  onListingEdit,
  onListingDelete,
  onListingView,
  selectedListings = [],
  onSelectionChange
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch listings
  const { data: listingsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
    refetchInterval: 30000
  });

  const listings = listingsResponse?.listings || [];

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get listings for a specific date
  const getListingsForDate = (date: Date) => {
    return listings.filter(listing => {
      const listingDate = new Date(listing.created_at);
      return listingDate.toDateString() === date.toDateString();
    });
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

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isLoading) {
    return (
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <div className="h-icon-lg bg-muted animate-pulse rounded w-container-xs" />
          <div className="flex gap-xs">
            <div className="h-icon-lg w-component-lg bg-muted animate-pulse rounded" />
            <div className="h-icon-lg w-component-lg bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-xs">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
          ))}
        </div>
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
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-xs">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-icon-xs w-icon-xs" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-icon-xs w-icon-xs" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-sm text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="min-h-header-lg bg-muted/30" />;
            }

            const dayListings = getListingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`min-h-header-lg border-r border-b p-xs cursor-pointer transition-colors hover:bg-muted/50 ${
                  isToday ? 'bg-primary/5' : ''
                } ${isSelected ? 'bg-primary/10 ring-2 ring-primary/20' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </div>

                {/* Listings for this day */}
                <div className="space-y-xs">
                  {dayListings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className={`text-xs p-xs rounded cursor-pointer transition-all hover:shadow-sm ${
                        selectedListings.includes(listing.id) ? 'ring-1 ring-primary' : ''
                      } ${getTypeVariant(listing.type) === 'default' ? 'bg-blue-100 text-blue-800' :
                           getTypeVariant(listing.type) === 'secondary' ? 'bg-green-100 text-green-800' :
                           'bg-purple-100 text-purple-800'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onListingSelect?.(listing);
                      }}
                      title={`${listing.title} - ${formatCurrency(listing.pricing?.amount, listing.pricing?.currency)}`}
                    >
                      <div className="font-medium truncate">{listing.title}</div>
                      {listing.pricing?.amount && (
                        <div className="text-xs opacity-75">
                          {formatCurrency(listing.pricing.amount, listing.pricing.currency)}
                        </div>
                      )}
                    </div>
                  ))}

                  {dayListings.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayListings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border rounded-lg p-md">
          <div className="flex items-center gap-xs mb-4">
            <CalendarIcon className="h-icon-sm w-icon-sm" />
            <h3 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>

          <div className="space-y-sm">
            {getListingsForDate(selectedDate).map((listing) => (
              <div
                key={listing.id}
                className="flex items-start gap-md p-sm border rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onListingSelect?.(listing)}
              >
                {/* Selection Checkbox */}
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        onSelectionChange([...selectedListings, listing.id]);
                      } else {
                        onSelectionChange(selectedListings.filter(id => id !== listing.id));
                      }
                    }}
                    className="rounded border-gray-300 mt-1"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-xs mb-1">{listing.title}</h4>

                      <div className="flex items-center gap-xs mb-2">
                        <Badge variant={getTypeVariant(listing.type)}>
                          {listing.type}
                        </Badge>
                        <Badge variant="outline">
                          {listing.category}
                        </Badge>
                      </div>

                      {listing.description && (
                        <p className="text-sm text-muted-foreground line-clamp-xs mb-2">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-sm text-xs text-muted-foreground">
                        {listing.pricing?.amount && (
                          <div className="flex items-center gap-xs">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(listing.pricing.amount, listing.pricing.currency)}</span>
                          </div>
                        )}

                        {listing.location?.city && (
                          <div className="flex items-center gap-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.location.city}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-xs">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(listing.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-xs">
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        onListingView?.(listing);
                      }}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        onListingEdit?.(listing);
                      }}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {getListingsForDate(selectedDate).length === 0 && (
              <div className="text-center py-xl text-muted-foreground">
                No listings for this date
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} •
          {selectedListings.length > 0 && ` ${selectedListings.length} selected`}
        </span>
        <span>
          Click dates to view details • Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
