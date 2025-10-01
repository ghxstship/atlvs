'use client';

import { Building, Globe, Mail, Phone, MapPin, Save, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, UnifiedInput } from '@ghxstship/ui';

interface EditCompanyClientProps {
  company: any; // TODO: Add proper type from companies types
  user: User;
  orgId: string;
  userRole: string;
  translations: {
    title: string;
    subtitle: string;
    cancel: string;
    save: string;
    saving: string;
  };
}

type CompanyIndustry =
  | 'construction'
  | 'entertainment'
  | 'technology'
  | 'logistics'
  | 'manufacturing'
  | 'consulting'
  | 'healthcare'
  | 'finance'
  | 'retail'
  | 'other';

type CompanyStatus = 'active' | 'inactive' | 'pending' | 'blacklisted';

interface CompanyFormData {
  name: string;
  description: string;
  industry: CompanyIndustry;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: CompanyStatus;
}

export default function EditCompanyClient({
  company,
  user,
  orgId,
  userRole,
  translations,
}: EditCompanyClientProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [formData, setFormData] = useState<CompanyFormData>({
    name: company.name || '',
    description: company.description || '',
    industry: company.industry || 'other',
    website: company.website || '',
    email: company.email || '',
    phone: company.phone || '',
    address: company.address || '',
    city: company.city || '',
    status: company.status || 'active',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((field: keyof CompanyFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

  const handleSelectChange = useCallback((field: keyof CompanyFormData) =>
    (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id)
        .eq('organization_id', orgId);

      if (updateError) throw updateError;

      router.push(`/companies/${company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/companies/${company.id}`);
  };

  const industries: { value: CompanyIndustry; label: string }[] = [
    { value: 'construction', label: 'Construction' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'technology', label: 'Technology' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' },
  ];

  const statuses: { value: CompanyStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ];

  return (
    <div className="container mx-auto max-w-4xl space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-icon-xs w-icon-xs" />
            {translations.cancel}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{translations.title}</h1>
            <p className="text-muted-foreground">{translations.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Basic Information */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <UnifiedInput
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <Select value={formData.industry} onValueChange={handleSelectChange('industry')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={handleSelectChange('status')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Enter company description"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-md">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <UnifiedInput
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange('website')}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <UnifiedInput
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <UnifiedInput
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <UnifiedInput
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <UnifiedInput
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-md bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-sm mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-icon-xs w-icon-xs mr-2" />
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-icon-xs w-icon-xs mr-2" />
              {isLoading ? translations.saving : translations.save}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
