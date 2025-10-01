'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, UnifiedInput, Card } from '@ghxstship/ui';
import { Save, Phone, Mail, MapPin } from 'lucide-react';

interface UserProfile {
  id: string;
  phone_primary?: string;
  phone_secondary?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
}

export default function ContactInfoClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone_primary: '',
    phone_secondary: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    loadProfile();
  }, [orgId, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await sb
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();

      if (userData) {
        const { data: profileData } = await sb
          .from('user_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .eq('organization_id', orgId)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            phone_primary: profileData.phone_primary || '',
            phone_secondary: profileData.phone_secondary || '',
            address_line1: profileData.address_line1 || '',
            address_line2: profileData.address_line2 || '',
            city: profileData.city || '',
            state_province: profileData.state_province || '',
            postal_code: profileData.postal_code || '',
            country: profileData.country || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('user_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await loadProfile();
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse stack-md">
          <div className="h-icon-xs bg-secondary rounded w-3/4"></div>
          <div className="h-icon-xs bg-secondary rounded w-1/2"></div>
          <div className="h-icon-xs bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Phone Numbers */}
      <Card>
        <div className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Phone className="h-icon-sm w-icon-sm" />
            <h3 className="text-body text-heading-4">Phone Numbers</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="stack-sm">
              <label className="text-body-sm form-label">Primary Phone</label>
              <UnifiedInput                 value={formData.phone_primary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone_primary: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="stack-sm">
              <label className="text-body-sm form-label">Secondary Phone</label>
              <UnifiedInput                 value={formData.phone_secondary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone_secondary: e.target.value }))}
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card>
        <div className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <MapPin className="h-icon-sm w-icon-sm" />
            <h3 className="text-body text-heading-4">Address</h3>
          </div>
          
          <div className="stack-md">
            <div className="stack-sm">
              <label className="text-body-sm form-label">Address Line 1</label>
              <UnifiedInput                 value={formData.address_line1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="stack-sm">
              <label className="text-body-sm form-label">Address Line 2</label>
              <UnifiedInput                 value={formData.address_line2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                placeholder="Apt 4B, Suite 200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="stack-sm">
                <label className="text-body-sm form-label">City</label>
                <UnifiedInput                   value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="San Francisco"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">State/Province</label>
                <UnifiedInput                   value={formData.state_province}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, state_province: e.target.value }))}
                  placeholder="California"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Postal Code</label>
                <UnifiedInput                   value={formData.postal_code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="94102"
                />
              </div>
            </div>
            
            <div className="stack-sm">
              <label className="text-body-sm form-label">Country</label>
              <UnifiedInput                 value={formData.country}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="United States"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-icon-xs w-icon-xs mr-sm" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
