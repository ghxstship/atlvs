import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { Save, X, Plus, AlertCircle } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { UpsertListingDto } from '../types';

interface CreateDrawerProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (listing: unknown) => void;
}

export default function CreateDrawer({
  orgId,
  open,
  onOpenChange,
  onCreate
}: CreateDrawerProps) {
  const [formData, setFormData] = useState<Partial<UpsertListingDto>({
    type: 'offer',
    category: 'services',
    status: 'draft',
    featured: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateNestedFormData = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    setError(null);
  };

  const handleCreate = async () => {
    setIsCreating(true);
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

      const newListing = await marketplaceService.createListing(orgId, '', formData as UpsertListingDto);
      onCreate?.(newListing);
      onOpenChange(false);

      // Reset form
      setFormData({
        type: 'offer',
        category: 'services',
        status: 'draft',
        featured: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'offer',
      category: 'services',
      status: 'draft',
      featured: false
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-xs">
            <Plus className="h-icon-sm w-icon-sm" />
            Create New Listing
          </DrawerTitle>
          <DrawerDescription>
            Add a new marketplace listing to connect with potential partners
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-lg">
          <div className="space-y-lg">
            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-sm p-md bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-icon-sm w-icon-sm text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter a compelling title for your listing"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a clear, descriptive title that highlights what you're offering
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Provide detailed information about your offering, including key features, benefits, and what makes it unique"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about what you're offering and what you're looking for in return
                </p>
              </div>

              <div className="grid grid-cols-2 gap-md">
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
                      <SelectItem value="offer">
                        <div>
                          <div className="font-medium">Offer</div>
                          <div className="text-xs text-muted-foreground">I'm providing a service or item</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="request">
                        <div>
                          <div className="font-medium">Request</div>
                          <div className="text-xs text-muted-foreground">I'm looking for a service or item</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="exchange">
                        <div>
                          <div className="font-medium">Exchange</div>
                          <div className="text-xs text-muted-foreground">I'm offering a trade or barter</div>
                        </div>
                      </SelectItem>
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
                  onChange={(e) => updateFormData('subcategory', e.target.value)}
                  placeholder="e.g., Web Development, Event Catering, Sound Equipment"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add a more specific subcategory for better matching
                </p>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Pricing</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank if pricing is TBD or varies
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency || 'USD'}
                    onValueChange={(value) => updateFormData('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-xs">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={formData.negotiable || false}
                  onChange={(e) => updateFormData('negotiable', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="negotiable">Price is negotiable</Label>
              </div>

              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                  placeholder="e.g., 50% upfront, Net 30, Milestone payments"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe your preferred payment schedule or terms
                </p>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Location</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="City or metropolitan area"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-xs">
                <input
                  type="checkbox"
                  id="remote"
                  checked={formData.isRemote || false}
                  onChange={(e) => updateFormData('isRemote', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="remote">This is a remote/offsite opportunity</Label>
              </div>

              <p className="text-xs text-muted-foreground">
                Specify where the work will be performed or where the service is located
              </p>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Availability</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="startDate">Available From</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When can this start?
                  </p>
                </div>

                <div>
                  <Label htmlFor="endDate">Available Until</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => updateFormData('endDate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When does this need to be completed by?
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-xs">
                <input
                  type="checkbox"
                  id="flexible"
                  checked={formData.flexible || false}
                  onChange={(e) => updateFormData('flexible', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="flexible">Dates are flexible</Label>
              </div>
            </div>

            <Separator />

            {/* Requirements & Tags */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Additional Details</h3>

              <div>
                <Label>Requirements</Label>
                <Textarea
                  value={formData.requirements?.join('\n') || ''}
                  onChange={(e) => updateFormData('requirements', e.target.value.split('\n').filter(req => req.trim()))}
                  placeholder="List any specific requirements or prerequisites:"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One requirement per line. Be specific about what you need.
                </p>
              </div>

              <div>
                <Label>Tags</Label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  placeholder="photography, event, professional, equipment"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add relevant tags to help others find your listing
                </p>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Contact Preferences</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => updateFormData('contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                <Select
                  value={formData.preferredContactMethod || 'platform'}
                  onValueChange={(value) => updateFormData('preferredContactMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform messaging (recommended)</SelectItem>
                    <SelectItem value="email">Direct email</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Publishing Settings</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => updateFormData('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                      <SelectItem value="active">Publish Immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-xs pt-8">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => updateFormData('featured', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Mark as featured listing</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-lg">
          <div className="flex gap-sm">
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1"
            >
              <Save className="h-icon-xs w-icon-xs mr-2" />
              {isCreating ? 'Creating...' : 'Create Listing'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              <X className="h-icon-xs w-icon-xs mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
