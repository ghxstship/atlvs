'use client';

import { useState, useEffect } from 'react';
import { Building, Globe, Upload, Trash2, CheckCircle, AlertTriangle, Settings as SettingsIcon } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
  Separator,
} from '@ghxstship/ui';

interface OrganizationSettingsProps {
  userId: string;
  orgId: string;
}

interface OrganizationProfile {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  logo_url?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
}

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  verified_at?: string;
  created_at: string;
}

export default function OrganizationSettings({ userId, orgId }: OrganizationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [showDemoData, setShowDemoData] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        // Load organization profile
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError) throw orgError;

        setOrganization(orgData);

        // Load domains
        const { data: domainsData, error: domainsError } = await supabase
          .from('organization_domains')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (domainsError && domainsError.code !== 'PGRST116') throw domainsError;

        setDomains(domainsData || []);

      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [orgId, supabase]);

  const handleSaveOrganization = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          description: organization.description,
          website: organization.website,
          industry: organization.industry,
          size: organization.size,
          address: organization.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId);

      if (error) throw error;


    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    try {
      const { data, error } = await supabase
        .from('organization_domains')
        .insert({
          organization_id: orgId,
          domain: newDomain.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setDomains(prev => [data, ...prev]);
      setNewDomain('');

    } catch (error) {
      console.error('Error adding domain:', error);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('organization_domains')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', domainId);

      if (error) throw error;

      setDomains(prev => prev.map(domain =>
        domain.id === domainId
          ? { ...domain, status: 'verified', verified_at: new Date().toISOString() }
          : domain
      ));

    } catch (error) {
      console.error('Error verifying domain:', error);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('organization_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      setDomains(prev => prev.filter(domain => domain.id !== domainId));

    } catch (error) {
      console.error('Error removing domain:', error);
    }
  };

  const handleRemoveDemoData = async () => {
    try {
      // This would call the demo removal API
      setShowDemoData(false);
    } catch (error) {
      console.error('Error removing demo data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Building className="h-icon-sm w-icon-sm" />
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-md">
              <div className="space-y-xs">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={organization?.name || ''}
                  onChange={(e) => setOrganization(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="space-y-xs">
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  value={organization?.description || ''}
                  onChange={(e) => setOrganization(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Brief description of your organization"
                  rows={3}
                />
              </div>

              <div className="space-y-xs">
                <Label htmlFor="org-website">Website</Label>
                <Input
                  id="org-website"
                  type="url"
                  value={organization?.website || ''}
                  onChange={(e) => setOrganization(prev => prev ? { ...prev, website: e.target.value } : null)}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div className="space-y-md">
              <div className="space-y-xs">
                <Label htmlFor="org-industry">Industry</Label>
                <Select
                  value={organization?.industry || ''}
                  onValueChange={(value) => setOrganization(prev => prev ? { ...prev, industry: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-xs">
                <Label htmlFor="org-size">Organization Size</Label>
                <Select
                  value={organization?.size || ''}
                  onValueChange={(value) => setOrganization(prev => prev ? { ...prev, size: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-xs">
                <Label>Organization Logo</Label>
                <div className="flex items-center gap-md">
                  <div className="w-component-md h-component-md bg-muted rounded-lg flex items-center justify-center">
                    {organization?.logo_url ? (
                      <img src={organization.logo_url} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building className="h-icon-lg w-icon-lg text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-icon-xs w-icon-xs mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveOrganization} disabled={saving}>
              <Building className="h-icon-xs w-icon-xs mr-2" />
              {saving ? 'Saving...' : 'Save Organization'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domain Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Globe className="h-icon-sm w-icon-sm" />
            Domain Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage verified domains for your organization. Verified domains allow you to invite users with matching email addresses.
          </p>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Add Domain */}
          <div className="flex gap-md">
            <div className="flex-1">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
              />
            </div>
            <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
              Add Domain
            </Button>
          </div>

          {/* Domains List */}
          <div className="space-y-md">
            {domains.length === 0 ? (
              <div className="text-center py-xl text-muted-foreground">
                <Globe className="mx-auto h-icon-2xl w-icon-2xl mb-4" />
                <p>No domains configured</p>
                <p className="text-sm">Add a domain above to get started</p>
              </div>
            ) : (
              domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-md border rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className={`p-xs rounded-full ${
                      domain.status === 'verified'
                        ? 'bg-green-100 dark:bg-green-900'
                        : domain.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {domain.status === 'verified' ? (
                        <CheckCircle className="h-icon-xs w-icon-xs text-green-600 dark:text-green-400" />
                      ) : domain.status === 'pending' ? (
                        <AlertTriangle className="h-icon-xs w-icon-xs text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <AlertTriangle className="h-icon-xs w-icon-xs text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {domain.status}
                        {domain.verified_at && ` • Verified ${new Date(domain.verified_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-xs">
                    <Badge variant={
                      domain.status === 'verified' ? 'default' :
                      domain.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {domain.status}
                    </Badge>

                    {domain.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDomain(domain.id)}
                      >
                        Verify
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-icon-xs w-icon-xs" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Trash2 className="h-icon-sm w-icon-sm" />
            Demo Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Remove demo data that was pre-populated in your organization.
          </p>
        </CardHeader>
        <CardContent className="space-y-md">
          <Alert>
            <AlertTriangle className="h-icon-xs w-icon-xs" />
            <AlertDescription>
              This action will permanently remove all demo data from your organization. This cannot be undone.
            </AlertDescription>
          </Alert>

          {!showDemoData ? (
            <Button
              variant="outline"
              onClick={() => setShowDemoData(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-icon-xs w-icon-xs mr-2" />
              Remove Demo Data
            </Button>
          ) : (
            <div className="space-y-md">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove all demo data? This will delete sample projects, users, and data.
              </p>
              <div className="flex gap-sm">
                <Button
                  variant="destructive"
                  onClick={handleRemoveDemoData}
                >
                  <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                  Yes, Remove Demo Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDemoData(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <SettingsIcon className="h-icon-sm w-icon-sm" />
            Additional Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Button variant="outline" className="justify-start">
              <Building className="h-icon-xs w-icon-xs mr-2" />
              Export Organization Data
            </Button>
            <Button variant="outline" className="justify-start">
              <SettingsIcon className="h-icon-xs w-icon-xs mr-2" />
              Advanced Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
