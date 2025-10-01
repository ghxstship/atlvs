/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Settings, Users, Shield, Bell, Palette, Database } from 'lucide-react';

export const metadata = {
  title: 'Settings Details - GHXSTSHIP',
  description: 'View detailed settings configuration and management.',
};

interface SettingsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsDetailPage({ params }: SettingsDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session }, error: authError } = await (supabase.auth.getSession() as any);

  if (authError || !session) {
    redirect('/auth/signin');
  }

  // Get user profile and organization membership
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      memberships!inner(
        organization_id,
        role,
        status,
        organization:organizations(
          id,
          name,
          slug
        )
      )
    `)
    .eq('auth_id', (session as any).user.id)
    .single();

  if (!profile || !(profile as any).memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const orgId = (profile as any).memberships[0].organization_id;

  // For settings, we'll show different content based on the setting type
  // This is a generic settings detail page that can handle different setting types
  const settingType = id;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} Settings` }
  ];

  const getSettingIcon = (type: string) => {
    const icons = {
      account: Users,
      billing: Database,
      organization: Shield,
      teams: Users,
      notifications: Bell,
      security: Shield,
      integrations: Settings,
      automations: Settings,
      permissions: Shield,
      domains: Shield,
      general: Settings,
      appearance: Palette,
    };
    return icons[type as keyof typeof icons] || Settings;
  };

  const getSettingTabs = (type: string) => {
    const baseTabs = [
      {
        id: 'overview',
        label: 'Overview',
        content: (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                {(() => {
                  const Icon = getSettingIcon(type);
                  return <Icon className="h-icon-sm w-icon-sm" />;
                })()}
                {type.charAt(0).toUpperCase() + type.slice(1)} Settings Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                {type.charAt(0).toUpperCase() + type.slice(1)} settings management coming soon...
              </p>
            </CardContent>
          </Card>
        )
      }
    ];

    // Add specific tabs based on setting type
    switch (type) {
      case 'account':
        baseTabs.push({
          id: 'profile',
          label: 'Profile',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-xl">
                  Profile configuration options will be available here.
                </p>
              </CardContent>
            </Card>
          )
        });
        break;
      case 'billing':
        baseTabs.push({
          id: 'subscription',
          label: 'Subscription',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-xl">
                  Billing and subscription management will be available here.
                </p>
              </CardContent>
            </Card>
          )
        });
        break;
      case 'teams':
        baseTabs.push({
          id: 'members',
          label: 'Members',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-xl">
                  Team member management will be available here.
                </p>
              </CardContent>
            </Card>
          )
        });
        break;
      case 'notifications':
        baseTabs.push({
          id: 'preferences',
          label: 'Preferences',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-xl">
                  Notification preference settings will be available here.
                </p>
              </CardContent>
            </Card>
          )
        });
        break;
      case 'security':
        baseTabs.push({
          id: 'authentication',
          label: 'Authentication',
          content: (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-xl">
                  Security and authentication settings will be available here.
                </p>
              </CardContent>
            </Card>
          )
        });
        break;
    }

    return baseTabs;
  };

  const tabs = getSettingTabs(settingType);

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`${settingType.charAt(0).toUpperCase() + settingType.slice(1)} Settings`}
      subtitle="Configure and manage system settings"
      tabs={tabs}
      backHref="/settings"
    />
  );
}
