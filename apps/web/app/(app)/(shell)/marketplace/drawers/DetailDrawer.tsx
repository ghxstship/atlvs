import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Separator
} from "@ghxstship/ui";
import { Badge ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Button ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Separator ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import {
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
  Globe,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing } from '../types';

interface DetailDrawerProps {
  orgId: string;
  listingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (listing: MarketplaceListing) => void;
  onDelete?: (listing: MarketplaceListing) => void;
  onFeature?: (listing: MarketplaceListing) => void;
  onArchive?: (listing: MarketplaceListing) => void;
}

export default function DetailDrawer({
  orgId,
  listingId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onFeature,
  onArchive
}: DetailDrawerProps) {
  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['marketplace-listing-detail', orgId, listingId],
    queryFn: () => listingId ? marketplaceService.getListing(orgId, listingId) : null,
    enabled: !!listingId && open
  });

  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-icon-xs w-icon-xs text-green-500" />;
      case 'draft': return <AlertCircle className="h-icon-xs w-icon-xs text-yellow-500" />;
      case 'archived': return <Archive className="h-icon-xs w-icon-xs text-gray-500" />;
      default: return <AlertCircle className="h-icon-xs w-icon-xs text-gray-500" />;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'offer': return 'default';
      case 'request': return 'secondary';
      case 'exchange': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Listing Details</DrawerTitle>
          <DrawerDescription>
            Comprehensive information about this marketplace listing
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-lg">
          {isLoading ? (
            <div className="space-y-md">
              <div className="h-icon-lg bg-muted animate-pulse rounded" />
              <div className="h-component-xl bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 gap-md">
                <div className="h-component-lg bg-muted animate-pulse rounded" />
                <div className="h-component-lg bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-xl">
              <AlertCircle className="mx-auto h-icon-2xl w-icon-2xl text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load listing</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the listing details
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : listing ? (
            <div className="space-y-lg">
              {/* Header Section */}
              <div className="space-y-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold leading-tight mb-2">
                      {listing.title}
                    </h2>
                    <div className="flex items-center gap-xs mb-3">
                      <Badge variant={getTypeVariant(listing.type)} className="text-sm">
                        {listing.type}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {listing.category}
                      </Badge>
                      <div className="flex items-center gap-xs">
                        {getStatusIcon(listing.status)}
                        <Badge
                          variant={listing.status === 'active' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      {listing.featured && (
                        <Badge variant="default" className="text-sm">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-xs ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(listing)}
                    >
                      <Edit className="h-icon-xs w-icon-xs mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFeature?.(listing)}
                    >
                      {listing.featured ? (
                        <StarOff className="h-icon-xs w-icon-xs mr-2" />
                      ) : (
                        <Star className="h-icon-xs w-icon-xs mr-2" />
                      )}
                      {listing.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onArchive?.(listing)}
                    >
                      <Archive className="h-icon-xs w-icon-xs mr-2" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete?.(listing)}
                    >
                      <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="bg-muted/50 rounded-lg p-md">
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Pricing & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {/* Pricing Card */}
                <div className="space-y-md">
                  <h3 className="text-lg font-semibold flex items-center gap-xs">
                    <DollarSign className="h-icon-sm w-icon-sm" />
                    Pricing
                  </h3>

                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">
                        {formatCurrency(listing.pricing?.amount, listing.pricing?.currency)}
                      </span>
                    </div>

                    {listing.pricing?.negotiable && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Negotiable</span>
                        <Badge variant="secondary">Yes</Badge>
                      </div>
                    )}

                    {listing.pricing?.paymentTerms && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment Terms</span>
                        <span className="text-sm">{listing.pricing.paymentTerms}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Card */}
                <div className="space-y-md">
                  <h3 className="text-lg font-semibold flex items-center gap-xs">
                    <MapPin className="h-icon-sm w-icon-sm" />
                    Location
                  </h3>

                  <div className="space-y-sm">
                    {listing.location?.isRemote ? (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary">Remote</Badge>
                      </div>
                    ) : (
                      <>
                        {listing.location?.city && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">City</span>
                            <span>{listing.location.city}</span>
                          </div>
                        )}
                        {listing.location?.country && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Country</span>
                            <span>{listing.location.country}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Availability */}
              {listing.availability && (
                <>
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold flex items-center gap-xs">
                      <Calendar className="h-icon-sm w-icon-sm" />
                      Availability
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                      {listing.availability.startDate && (
                        <div>
                          <span className="text-muted-foreground text-sm">Start Date</span>
                          <p className="font-medium">
                            {new Date(listing.availability.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {listing.availability.endDate && (
                        <div>
                          <span className="text-muted-foreground text-sm">End Date</span>
                          <p className="font-medium">
                            {new Date(listing.availability.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-muted-foreground text-sm">Flexible</span>
                        <p className="font-medium">
                          {listing.availability.flexible ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Contact Information */}
              {(listing.contactInfo || listing.creator) && (
                <>
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold flex items-center gap-xs">
                      <User className="h-icon-sm w-icon-sm" />
                      Contact Information
                    </h3>

                    <div className="space-y-sm">
                      {listing.creator && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Created by</span>
                          <span>{listing.creator.name || 'Anonymous'}</span>
                        </div>
                      )}

                      {listing.contactInfo?.email && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Email</span>
                          <div className="flex items-center gap-xs">
                            <Mail className="h-icon-xs w-icon-xs" />
                            <span>{listing.contactInfo.email}</span>
                          </div>
                        </div>
                      )}

                      {listing.contactInfo?.phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phone</span>
                          <div className="flex items-center gap-xs">
                            <Phone className="h-icon-xs w-icon-xs" />
                            <span>{listing.contactInfo.phone}</span>
                          </div>
                        </div>
                      )}

                      {listing.contactInfo?.preferredMethod && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Preferred Contact</span>
                          <span className="capitalize">{listing.contactInfo.preferredMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Statistics */}
              <div className="space-y-md">
                <h3 className="text-lg font-semibold flex items-center gap-xs">
                  <MessageSquare className="h-icon-sm w-icon-sm" />
                  Statistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="text-center p-md bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {listing.view_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>

                  <div className="text-center p-md bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {listing.response_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Responses</div>
                  </div>

                  <div className="text-center p-md bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {listing.organization?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Organization</div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {listing.requirements && listing.requirements.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold">Requirements</h3>
                    <ul className="space-y-xs">
                      {listing.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-xs">
                          <CheckCircle className="h-icon-xs w-icon-xs text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-xs">
                      {listing.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div className="space-y-md">
                <h3 className="text-lg font-semibold flex items-center gap-xs">
                  <Clock className="h-icon-sm w-icon-sm" />
                  Timeline
                </h3>

                <div className="space-y-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(listing.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{new Date(listing.updated_at).toLocaleString()}</span>
                  </div>
                  {listing.expires_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Expires</span>
                      <span>{new Date(listing.expires_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-xl">
              <Eye className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No listing selected</h3>
              <p className="text-muted-foreground">
                Select a listing to view its details
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
