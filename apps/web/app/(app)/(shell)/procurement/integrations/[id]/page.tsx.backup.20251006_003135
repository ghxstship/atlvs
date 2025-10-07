/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Zap, Settings, Webhook } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Integration Details - GHXSTSHIP',
  description: 'View detailed procurement system integrations.',
};

interface IntegrationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IntegrationDetailPage({ params }: IntegrationDetailPageProps) {
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Integrations', href: '/procurement/integrations' },
    { label: `Integration ${id}` }
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-lg md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Zap className="h-icon-sm w-icon-sm" />
                System Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                External system integrations and API connections.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Settings className="h-icon-sm w-icon-sm" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Integration settings, authentication, and connection details.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <Webhook className="h-icon-sm w-icon-sm" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Webhook endpoints, event subscriptions, and delivery logs.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Procurement Integration ${id}`}
      subtitle="External system integrations and API connections"
      tabs={tabs}
      backHref="/procurement/integrations"
    />
  );
}
