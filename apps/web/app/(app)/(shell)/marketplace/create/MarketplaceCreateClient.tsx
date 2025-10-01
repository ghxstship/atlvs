'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LegacyInput as Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@ghxstship/ui';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { UpsertListingDto } from '../types';

interface MarketplaceCreateClientProps {
  orgId: string;
  userId: string;
}

export default function MarketplaceCreateClient({
  orgId,
  userId
}: MarketplaceCreateClientProps) {
  const router = useRouter();
  const t = useTranslations('marketplace');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UpsertListingDto>({
    type: 'offer',
    category: 'services',
    status: 'draft',
    featured: false,
  });

  const labelClass = 'block text-sm font-medium text-foreground';
  const checkboxLabelClass = 'inline-flex items-center gap-xs text-sm text-foreground';
  const subtleTextClass = 'text-xs text-muted-foreground mt-1';

  const updateFormData = <K extends keyof UpsertListingDto>(field: K, value: UpsertListingDto[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      await marketplaceService.createListing(orgId, userId, formData as UpsertListingDto);
      router.push('/marketplace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
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
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Add a new marketplace listing to connect with potential partners
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
              <label htmlFor="title" className={labelClass}>
                Title *
              </label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('title', event.target.value)
                }
                placeholder="Enter a compelling title for your listing"
                required
              />
              <p className={subtleTextClass}>
                Choose a clear, descriptive title that highlights what you're offering
              </p>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description *
              </label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateFormData('description', event.target.value)
                }
                placeholder="Provide detailed information about your offering, including key features, benefits, and what makes it unique"
                rows={6}
                required
              />
              <p className={subtleTextClass}>
                Be specific about what you're offering and what you're looking for in return
              </p>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="type" className={labelClass}>
                  Type *
                </label>
                <Select
                  value={formData.type || 'offer'}
                  onValueChange={(value) => updateFormData('type', value as UpsertListingDto['type'])}
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
                <label htmlFor="category" className={labelClass}>
                  Category *
                </label>
                <Select
                  value={formData.category || 'services'}
                  onValueChange={(value) => updateFormData('category', value as UpsertListingDto['category'])}
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
              <label htmlFor="subcategory" className={labelClass}>
                Subcategory
              </label>
              <Input
                id="subcategory"
                value={formData.subcategory || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('subcategory', event.target.value)
                }
                placeholder="e.g., Web Development, Event Catering, Sound Equipment"
              />
              <p className={subtleTextClass}>Optional: Add a more specific subcategory for better matching</p>
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
                <label htmlFor="amount" className={labelClass}>
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData('amount', event.target.value ? Number(event.target.value) : undefined)
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank if pricing is TBD or varies
                </p>
              </div>

              <div>
                <label htmlFor="currency" className={labelClass}>
                  Currency
                </label>
                <Select
                  value={formData.currency || 'USD'}
                  onValueChange={(value) => updateFormData('currency', value as UpsertListingDto['currency'])}
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
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('negotiable', event.target.checked)
                }
                className="rounded"
              />
              <span className={checkboxLabelClass}>Price is negotiable</span>
            </div>

            <div>
              <label htmlFor="paymentTerms" className={labelClass}>
                Payment Terms
              </label>
              <Input
                id="paymentTerms"
                value={formData.paymentTerms || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('paymentTerms', event.target.value)
                }
                placeholder="e.g., 50% upfront, Net 30, Milestone payments"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe your preferred payment schedule or terms
              </p>
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
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData('city', event.target.value)
                  }
                  placeholder="City or metropolitan area"
                />
              </div>

              <div>
                <label htmlFor="country" className={labelClass}>
                  Country
                </label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData('country', event.target.value)
                  }
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="flex items-center space-x-xs">
              <input
                type="checkbox"
                id="remote"
                checked={formData.isRemote || false}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('isRemote', event.target.checked)
                }
                className="rounded"
              />
              <span className={checkboxLabelClass}>This is a remote/offsite opportunity</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Specify where the work will be performed or where the service is located
            </p>
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
                <label htmlFor="startDate" className={labelClass}>
                  Available From
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData('startDate', event.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When can this start?
                </p>
              </div>

              <div>
                <label htmlFor="endDate" className={labelClass}>
                  Available Until
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormData('endDate', event.target.value)
                  }
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
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('flexible', event.target.checked)
                }
                className="rounded"
              />
              <span className={checkboxLabelClass}>Dates are flexible</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div>
              <span className={labelClass}>Requirements</span>
              <Textarea
                value={formData.requirements?.join('\n') || ''}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateFormData(
                    'requirements',
                    event.target.value
                      .split('\n')
                      .map((requirement) => requirement.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="List any specific requirements or prerequisites:"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                One requirement per line. Be specific about what you need.
              </p>
            </div>

            <div>
              <span className={labelClass}>Tags</span>
              <Input
                value={formData.tags?.join(', ') || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const tags = event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  updateFormData('tags', tags);
                }}
                placeholder="photography, event, professional, equipment"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add relevant tags to help others find your listing
              </p>
            </div>

            <div>
              <label htmlFor="contactEmail" className={labelClass}>
                Contact Email
              </label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('contactEmail', event.target.value)
                }
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className={labelClass}>
                Contact Phone
              </label>
              <Input
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormData('contactPhone', event.target.value)
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="preferredContactMethod" className={labelClass}>
                Preferred Contact Method
              </label>
              <Select
                value={formData.preferredContactMethod || 'platform'}
                onValueChange={(value) => updateFormData('preferredContactMethod', value as UpsertListingDto['preferredContactMethod'])}
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
          </CardContent>
        </Card>

        {/* Publishing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="status" className={labelClass}>
                Initial Status
              </label>
                <Select
                  value={formData.status || 'draft'}
                  onValueChange={(value) => updateFormData('status', value as UpsertListingDto['status'])}
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
                <span className={checkboxLabelClass}>Mark as featured listing</span>
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
            {isSubmitting ? 'Creating...' : 'Create Listing'}
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
