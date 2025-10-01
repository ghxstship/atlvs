'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { marketplaceService } from '../../lib/marketplace-service';
import type { MarketplaceListing, UpsertListingDto } from '../../types';

interface MarketplaceEditClientProps {
  orgId: string;
  userId: string;
  listingId: string;
  initialListing: MarketplaceListing;
}

export default function MarketplaceEditClient({
  orgId,
  userId,
  listingId,
  initialListing,
}: MarketplaceEditClientProps) {
  const router = useRouter();
  const t = useTranslations('marketplace');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MarketplaceListing>(initialListing);

  // Update form data when initial listing changes
  useEffect(() => {
    setFormData(initialListing);
  }, [initialListing]);

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateNestedFormData = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description?.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.type) {
        throw new Error('Type is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }

      // Transform formData to match UpsertListingDto (flatten nested objects and convert null to undefined)
      const transformedData: Partial<UpsertListingDto> = {
        ...formData,
        subcategory: formData.subcategory || undefined,
        amount: formData.pricing?.amount || undefined,
        currency: formData.pricing?.currency || undefined,
        negotiable: formData.pricing?.negotiable || undefined,
        paymentTerms: formData.pricing?.paymentTerms || undefined,
        city: formData.location?.city || undefined,
        state: formData.location?.state || undefined,
        country: formData.location?.country || undefined,
        isRemote: formData.location?.isRemote || undefined,
        startDate: formData.availability?.startDate || undefined,
        endDate: formData.availability?.endDate || undefined,
        flexible: formData.availability?.flexible || undefined,
        immediateAvailable: formData.availability?.immediateAvailable || undefined,
        requirements: formData.requirements || undefined,
        tags: formData.tags || undefined,
      };

      await marketplaceService.updateListing(orgId, userId, listingId, transformedData);
      router.push(`/marketplace/${listingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-lg">
      {/* Header */}
      <div className="flex items-center gap-md">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-icon-xs w-icon-xs mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground">
            Update your marketplace listing details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-lg">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-sm p-md bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-icon-sm w-icon-sm text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('title', e.target.value)}
                placeholder="Enter listing title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('description', e.target.value)}
                placeholder="Describe your listing in detail"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type || 'offer'}
                  onValueChange={(value: string) => updateFormData('type', value)}
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
                  onValueChange={(value: string) => updateFormData('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment & Tools</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                    <SelectItem value="talent">Talent & Staffing</SelectItem>
                    <SelectItem value="locations">Locations & Venues</SelectItem>
                    <SelectItem value="materials">Materials & Supplies</SelectItem>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('subcategory', e.target.value)}
                placeholder="Optional subcategory"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.pricing?.amount || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('pricing', 'amount', parseFloat(e.target.value) || undefined)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.pricing?.currency || 'USD'}
                  onValueChange={(value: string) => updateNestedFormData('pricing', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-xs">
              <input
                type="checkbox"
                id="negotiable"
                checked={formData.pricing?.negotiable || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('pricing', 'negotiable', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={formData.pricing?.paymentTerms || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('pricing', 'paymentTerms', e.target.value)}
                placeholder="e.g., 50% upfront, Net 30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.location?.city || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('location', 'city', e.target.value)}
                  placeholder="City"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.location?.country || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('location', 'country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="flex items-center space-x-xs">
              <input
                type="checkbox"
                id="remote"
                checked={formData.location?.isRemote || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('location', 'isRemote', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="remote">Remote work available</Label>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="startDate">Available From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.availability?.startDate ? new Date(formData.availability.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('availability', 'startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Available Until</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.availability?.endDate ? new Date(formData.availability.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('availability', 'endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-xs">
              <input
                type="checkbox"
                id="flexible"
                checked={formData.availability?.flexible || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('availability', 'flexible', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="flexible">Dates are flexible</Label>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div>
              <Label>Requirements</Label>
              <Textarea
                value={formData.requirements?.join('\n') || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('requirements', e.target.value.split('\n').filter(req => req.trim()))}
                placeholder="List requirements, one per line"
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                value={formData.tags?.join(', ') || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                placeholder="photography, event, professional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactInfo?.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('contactInfo', 'email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactInfo?.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNestedFormData('contactInfo', 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.contactInfo?.preferredMethod || 'platform'}
                onValueChange={(value: string) => updateNestedFormData('contactInfo', 'preferredMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform messaging</SelectItem>
                  <SelectItem value="email">Direct email</SelectItem>
                  <SelectItem value="phone">Phone call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'draft'}
                  onValueChange={(value: string) => updateFormData('status', value)}
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

              <div className="flex items-center space-x-xs pt-8">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('featured', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="featured">Mark as featured listing</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-sm">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="h-icon-xs w-icon-xs mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Listing'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
