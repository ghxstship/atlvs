import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { FileText, Save, X, Plus, Trash2 } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing, ListingFilters } from '../types';

interface FormViewProps {
  orgId: string;
  filters?: ListingFilters;
  onListingCreate?: (listing: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>) => void;
  onListingUpdate?: (listing: MarketplaceListing) => void;
}

export default function FormView({
  orgId,
  filters = {},
  onListingCreate,
  onListingUpdate,
}: FormViewProps) {
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<MarketplaceListing>({
    type: 'offer',
    category: 'services',
    status: 'draft',
    featured: false,
  });

  // Fetch listings for selection
  const { data: listingsResponse, isLoading } = useQuery({
    queryKey: ['marketplace-listings', orgId, filters],
    queryFn: () => marketplaceService.getListings(orgId, filters),
  });

  const listings = listingsResponse?.listings || [];

  const handleSelectListing = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setFormData(listing);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedListing(null);
    setFormData({
      type: 'offer',
      category: 'services',
      status: 'draft',
      featured: false,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (selectedListing) {
        // Update existing listing
        await marketplaceService.updateListing(orgId, '', selectedListing.id, formData);
        onListingUpdate?.({ ...selectedListing, ...formData } as MarketplaceListing);
      } else {
        // Create new listing
        const newListing = await marketplaceService.createListing(orgId, '', formData as any);
        onListingCreate?.(newListing);
      }

      setIsEditing(false);
      setSelectedListing(null);
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Failed to save listing:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedListing(null);
    setFormData({});
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Listing Form
          </h2>
          <p className="text-muted-foreground">
            Create and edit marketplace listings
          </p>
        </div>

        {!isEditing && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing
                ? (selectedListing ? 'Edit Listing' : 'Create New Listing')
                : 'Select a Listing to Edit'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Enter listing title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe your listing in detail"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type || 'offer'}
                        onValueChange={(value) => updateFormData('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="request">Request</SelectItem>
                          <SelectItem value="exchange">Exchange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category || 'services'}
                        onValueChange={(value) => updateFormData('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="talent">Talent</SelectItem>
                          <SelectItem value="locations">Locations</SelectItem>
                          <SelectItem value="materials">Materials</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory || ''}
                      onChange={(e) => updateFormData('subcategory', e.target.value)}
                      placeholder="Optional subcategory"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.pricing?.amount || ''}
                        onChange={(e) => updateNestedFormData('pricing', 'amount', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.pricing?.currency || 'USD'}
                        onValueChange={(value) => updateNestedFormData('pricing', 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="negotiable"
                      checked={formData.pricing?.negotiable || false}
                      onChange={(e) => updateNestedFormData('pricing', 'negotiable', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="negotiable">Negotiable price</Label>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.location?.city || ''}
                        onChange={(e) => updateNestedFormData('location', 'city', e.target.value)}
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.location?.country || ''}
                        onChange={(e) => updateNestedFormData('location', 'country', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remote"
                      checked={formData.location?.isRemote || false}
                      onChange={(e) => updateNestedFormData('location', 'isRemote', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="remote">Remote work available</Label>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status || 'draft'}
                        onValueChange={(value) => updateFormData('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured || false}
                        onChange={(e) => updateFormData('featured', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="featured">Featured listing</Label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {selectedListing ? 'Update' : 'Create'} Listing
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No listing selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a listing from the list to edit, or create a new one
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Listing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedListing?.id === listing.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelectListing(listing)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1 mb-1">
                        {listing.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {listing.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {listing.category}
                        </Badge>
                        {listing.featured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{listing.response_count || 0} responses</span>
                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Badge
                      variant={listing.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {listing.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {listings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No listings available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
