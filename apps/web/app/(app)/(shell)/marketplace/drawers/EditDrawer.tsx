import React, { useState, useEffect } from 'react';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea
} from "@ghxstship/ui";
import { Button ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Input ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Label ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Textarea ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { Badge ,
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
import { AlertCircle, Edit, Save, Settings, X } from "lucide-react";
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceListing } from '../types';

interface EditDrawerProps {
  orgId: string;
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (listing: MarketplaceListing) => void;
}

export default function EditDrawer({
  orgId,
  listing,
  open,
  onOpenChange,
  onSave
}: EditDrawerProps) {
  const [formData, setFormData] = useState<Partial<MarketplaceListing>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when listing changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (listing) {
      setFormData({ ...listing });
      setError(null);
    } else {
      setFormData({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing]);

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

  const handleSave = async () => {
    if (!listing) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedListing = await marketplaceService.updateListing(orgId, '', listing.id, formData);
      onSave?.(updatedListing);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(listing ? { ...listing } : {});
    setError(null);
    onOpenChange(false);
  };

  if (!listing) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-xs">
            <Edit className="h-icon-sm w-icon-sm" />
            Edit Listing
          </DrawerTitle>
          <DrawerDescription>
            Make changes to your marketplace listing
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

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type || 'offer'}
                    onChange={(e) => updateFormData('type', value)}
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
                    onChange={(e) => updateFormData('category', value)}
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
                    value={formData.pricing?.amount || ''}
                    onChange={(e) => updateNestedFormData('pricing', 'amount', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.pricing?.currency || 'USD'}
                    onChange={(e) => updateNestedFormData('pricing', 'currency', value)}
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

              <div className="flex items-center space-x-xs">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={formData.pricing?.negotiable || false}
                  onChange={(e) => updateNestedFormData('pricing', 'negotiable', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="negotiable">Negotiable price</Label>
              </div>

              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={formData.pricing?.paymentTerms || ''}
                  onChange={(e) => updateNestedFormData('pricing', 'paymentTerms', e.target.value)}
                  placeholder="e.g., Net 30, 50% upfront"
                />
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

              <div className="flex items-center space-x-xs">
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

            <Separator />

            {/* Availability */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Availability</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.availability?.startDate ? new Date(formData.availability.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateNestedFormData('availability', 'startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.availability?.endDate ? new Date(formData.availability.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateNestedFormData('availability', 'endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-xs">
                <input
                  type="checkbox"
                  id="flexible"
                  checked={formData.availability?.flexible || false}
                  onChange={(e) => updateNestedFormData('availability', 'flexible', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="flexible">Flexible dates</Label>
              </div>
            </div>

            <Separator />

            {/* Requirements & Tags */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <div>
                <Label>Requirements</Label>
                <Textarea
                  value={formData.requirements?.join('\n') || ''}
                  onChange={(e) => updateFormData('requirements', e.target.value.split('\n').filter(req => req.trim()))}
                  placeholder="Enter each requirement on a new line"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter each requirement on a separate line
                </p>
              </div>

              <div>
                <Label>Tags</Label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Settings</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onChange={(e) => updateFormData('status', value)}
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
                    onChange={(e) => updateFormData('featured', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Featured listing</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => updateNestedFormData('contactInfo', 'email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => updateNestedFormData('contactInfo', 'phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select
                  value={formData.contactInfo?.preferredMethod || 'platform'}
                  onChange={(e) => updateNestedFormData('contactInfo', 'preferredMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="platform">Platform messaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-lg">
          <div className="flex gap-sm">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="h-icon-xs w-icon-xs mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
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
