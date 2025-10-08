'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@ghxstship/ui';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  StarOff,
  Archive,
  Eye,
  MessageSquare,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import DetailDrawer from '../drawers/DetailDrawer';
import EditDrawer from '../drawers/EditDrawer';
import type { MarketplaceListing } from '../types';

interface MarketplaceDetailClientProps {
  orgId: string;
  userId: string;
  listingId: string;
  initialListing: MarketplaceListing;
}

export default function MarketplaceDetailClient({
  orgId,
  userId,
  listingId,
  initialListing
}: MarketplaceDetailClientProps) {
  const router = useRouter();
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<MarketplaceListing>(initialListing);

  // Fetch real-time listing data
  const { data: listing, isLoading } = useQuery({
    queryKey: ['marketplace-listing', orgId, listingId],
    queryFn: () => marketplaceService.getListing(orgId, listingId),
    initialData: initialListing,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeListing = listing || currentListing;

  const formatCurrency = (amount: number | null | undefined, currency: string = 'USD') => {
    if (amount == null) return 'Not specified';
    if (amount === 0) return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
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

  const handleEdit = (listing: MarketplaceListing) => {
    setCurrentListing(listing);
    setEditDrawerOpen(true);
  };

  const handleEditSave = (updatedListing: MarketplaceListing) => {
    setCurrentListing(updatedListing);
    setEditDrawerOpen(false);
  };

  const handleFeature = async (listing: MarketplaceListing) => {
    try {
      await marketplaceService.featureListing(orgId, userId, listing.id, !listing.featured);
      setCurrentListing({ ...listing, featured: !listing.featured });
    } catch (error) {
      console.error('Failed to update featured status:', error);
    }
  };

  const handleArchive = async (listing: MarketplaceListing) => {
    try {
      await marketplaceService.archiveListing(orgId, userId, listing.id);
      setCurrentListing({ ...listing, status: 'archived' });
    } catch (error) {
      console.error('Failed to archive listing:', error);
    }
  };

  const handleDelete = async (listing: MarketplaceListing) => {
    if (confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
      try {
        await marketplaceService.deleteListing(orgId, userId, listing.id);
        router.push('/marketplace');
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  if (isLoading && !activeListing) {
    return (
      <div className="max-w-4xl mx-auto space-y-lg">
        <div className="h-icon-lg bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 space-y-lg">
            <div className="h-container-sm bg-muted animate-pulse rounded-lg" />
            <div className="h-container-lg bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-lg">
            <div className="h-container-xs bg-muted animate-pulse rounded-lg" />
            <div className="h-component-xl bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeListing) {
    return (
      <div className="text-center py-xsxl">
        <AlertCircle className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The listing you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-lg">
      {/* Header */}
      <div className="flex items-center gap-md">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-icon-xs w-icon-xs mr-2" />
          Back to Marketplace
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-xs mb-2">
            <Badge variant={getTypeVariant(activeListing.type)}>
              {activeListing.type}
            </Badge>
            <Badge variant={getStatusVariant(activeListing.status)}>
              {activeListing.status}
            </Badge>
            {activeListing.featured && (
              <Badge variant="default">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{activeListing.title}</h1>
          <p className="text-muted-foreground">
            Listed {new Date(activeListing.created_at).toLocaleDateString()}
            {activeListing.creator && ` by ${activeListing.creator.name || 'Anonymous'}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {activeListing.description}
              </p>
            </CardContent>
          </Card>

          {/* Pricing & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-xs">
                  <DollarSign className="h-icon-sm w-icon-sm" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(activeListing.pricing?.amount, activeListing.pricing?.currency ?? 'USD')}
                  </div>
                  {activeListing.pricing?.negotiable && (
                    <Badge variant="secondary" className="mt-1">
                      Negotiable
                    </Badge>
                  )}
                </div>

                {activeListing.pricing?.paymentTerms && (
                  <div>
                    <div className="text-sm font-medium mb-1">Payment Terms</div>
                    <p className="text-sm text-muted-foreground">
                      {activeListing.pricing.paymentTerms}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-xs">
                  <MapPin className="h-icon-sm w-icon-sm" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-xs">
                  {activeListing.location?.isRemote ? (
                    <div className="flex items-center gap-xs">
                      <CheckCircle className="h-icon-xs w-icon-xs text-green-500" />
                      <span>Remote work available</span>
                    </div>
                  ) : (
                    <>
                      {activeListing.location?.city && (
                        <div>
                          <span className="text-sm font-medium">City:</span>
                          <p className="text-muted-foreground">{activeListing.location.city}</p>
                        </div>
                      )}
                      {activeListing.location?.country && (
                        <div>
                          <span className="text-sm font-medium">Country:</span>
                          <p className="text-muted-foreground">{activeListing.location.country}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requirements */}
          {activeListing.requirements && activeListing.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-xs">
                  {activeListing.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-sm">
                      <CheckCircle className="h-icon-xs w-icon-xs text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {activeListing.tags && activeListing.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-xs">
                  {activeListing.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setDetailDrawerOpen(true)}
              >
                <Eye className="h-icon-xs w-icon-xs mr-2" />
                View Details
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleEdit(activeListing)}
              >
                <Edit className="h-icon-xs w-icon-xs mr-2" />
                Edit Listing
              </Button>

              <Separator />

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleFeature(activeListing)}
              >
                {activeListing.featured ? (
                  <StarOff className="h-icon-xs w-icon-xs mr-2" />
                ) : (
                  <Star className="h-icon-xs w-icon-xs mr-2" />
                )}
                {activeListing.featured ? 'Unfeature' : 'Feature'}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleArchive(activeListing)}
              >
                <Archive className="h-icon-xs w-icon-xs mr-2" />
                Archive
              </Button>

              <Button
                className="w-full"
                variant="destructive"
                onClick={() => handleDelete(activeListing)}
              >
                <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <MessageSquare className="h-icon-sm w-icon-sm" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{activeListing.view_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Responses</span>
                  <span className="font-medium">{activeListing.response_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusVariant(activeListing.status)}>
                    {activeListing.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {(activeListing.contactInfo || activeListing.creator) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-xs">
                  <User className="h-icon-sm w-icon-sm" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  {activeListing.creator && (
                    <div>
                      <span className="text-sm font-medium">Listed by</span>
                      <p className="text-muted-foreground">{activeListing.creator.name || 'Anonymous'}</p>
                    </div>
                  )}

                  {activeListing.contactInfo?.preferredMethod && (
                    <div>
                      <span className="text-sm font-medium">Preferred Contact</span>
                      <p className="text-muted-foreground capitalize">
                        {activeListing.contactInfo.preferredMethod}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          {activeListing.availability && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-xs">
                  <Calendar className="h-icon-sm w-icon-sm" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  {activeListing.availability.startDate && (
                    <div>
                      <span className="text-sm font-medium">Available from</span>
                      <p className="text-muted-foreground">
                        {new Date(activeListing.availability.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {activeListing.availability.endDate && (
                    <div>
                      <span className="text-sm font-medium">Available until</span>
                      <p className="text-muted-foreground">
                        {new Date(activeListing.availability.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {activeListing.availability.flexible && (
                    <Badge variant="secondary">Flexible dates</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Clock className="h-icon-sm w-icon-sm" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-sm">
                <div>
                  <span className="text-sm font-medium">Created</span>
                  <p className="text-muted-foreground text-sm">
                    {new Date(activeListing.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Last Updated</span>
                  <p className="text-muted-foreground text-sm">
                    {new Date(activeListing.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawers */}
      <DetailDrawer
        orgId={orgId}
        listingId={listingId}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeature={handleFeature}
        onArchive={handleArchive}
      />

      <EditDrawer
        orgId={orgId}
        listing={activeListing}
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        onSave={handleEditSave}
      />
    </div>
  );
}
