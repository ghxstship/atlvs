/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Analytics Details - GHXSTSHIP',
  description: 'View detailed procurement analytics and insights.',
};

interface AnalyticsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalyticsDetailPage({ params }: AnalyticsDetailPageProps) {
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
    { label: 'Analytics', href: '/procurement/analytics' },
    { label: `Analytics ${id}` }
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
                <BarChart3 className="h-icon-sm w-icon-sm" />
                Procurement Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Advanced procurement analytics and reporting will be available here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <TrendingUp className="h-icon-sm w-icon-sm" />
                Trends & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Spending trends, vendor performance, and procurement insights.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <Calendar className="h-icon-sm w-icon-sm" />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Procurement reports and scheduled analytics will be displayed here.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Procurement Analytics ${id}`}
      subtitle="Advanced procurement analytics and reporting"
      tabs={tabs}
      backHref="/procurement/analytics"
    />
  );
}
