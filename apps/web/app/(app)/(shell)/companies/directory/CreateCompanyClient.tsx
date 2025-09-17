'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Select,
  Textarea,
  Card
} from '@ghxstship/ui';
import { 
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  X
} from 'lucide-react';

interface CreateCompanyClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (company: any) => void;
}

interface CompanyFormData {
  name: string;
  description: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: string;
}

const INDUSTRIES = [
  { value: 'construction', label: 'Construction' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'technology', label: 'Technology' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' }
];

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'blacklisted', label: 'Blacklisted' }
];

export default function CreateCompanyClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateCompanyClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    industry: 'other',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    status: 'active'
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const companyId = crypto.randomUUID();
      
      // Insert company record
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          id: companyId,
          organization_id: orgId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          industry: formData.industry,
          website: formData.website.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          country: formData.country.trim() || null,
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          id: crypto.randomUUID(),
          organization_id: orgId,
          user_id: user.id,
          action: 'create',
          entity_type: 'company',
          entity_id: companyId,
          metadata: {
            company_name: formData.name,
            industry: formData.industry,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        name: '',
        description: '',
        industry: 'other',
        website: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'USA',
        status: 'active'
      });

      onSuccess?.(company);
      onClose();
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add New Company"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Company Overview */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <Building className="h-5 w-5 color-primary" />
            <h3 className="text-heading-4">Company Information</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Company Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the company"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Industry *
                </label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  {INDUSTRIES.map(industry => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <Mail className="h-5 w-5 color-success" />
            <h3 className="text-heading-4">Contact Information</h3>
          </div>
          
          <div className="stack-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-4">
            <MapPin className="h-5 w-5 color-warning" />
            <h3 className="text-heading-4">Address Information</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Street Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  City
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  State/Province
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="CA"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-sm pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
