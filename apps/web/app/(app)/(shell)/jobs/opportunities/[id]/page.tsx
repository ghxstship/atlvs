/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Briefcase, Calendar, DollarSign, Building, Target, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Opportunity Details - GHXSTSHIP',
  description: 'View detailed job opportunity information and management.',
};

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
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

  // Get opportunity record
  const { data: opportunity, error: opportunityError } = await supabase
    .from('job_opportunities')
    .select(`
      *,
      bids:job_bids(
        id,
        amount,
        status,
        submitted_at,
        company:companies(id, name)
      ),
      project:projects(id, name, status)
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (opportunityError || !opportunity) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'Opportunities', href: '/jobs/opportunities' },
          { label: 'Not Found' }
        ]}
        title="Opportunity Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested opportunity could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Opportunities', href: '/jobs/opportunities' },
    { label: (opportunity as any).title }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      open: 'default',
      awarded: 'default',
      closed: 'secondary',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-lg md:grid-cols-2">
          {/* Opportunity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Briefcase className="h-icon-sm w-icon-sm" />
                Opportunity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <h3 className="text-lg font-semibold">{(opportunity as any).title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(opportunity as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((opportunity as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((opportunity as any).budget || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge variant="outline">
                  {(opportunity as any).priority?.toUpperCase() || 'MEDIUM'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-icon-sm w-icon-sm" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Posted Date</span>
                <span className="text-sm text-muted-foreground">
                  {(opportunity as any).posted_date ? new Date((opportunity as any).posted_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Deadline</span>
                <span className="text-sm text-muted-foreground">
                  {(opportunity as any).deadline ? new Date((opportunity as any).deadline).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Award Date</span>
                <span className="text-sm text-muted-foreground">
                  {(opportunity as any).award_date ? new Date((opportunity as any).award_date).toLocaleDateString() : 'Not awarded'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Associated Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Target className="h-icon-sm w-icon-sm" />
                Associated Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div>
                <p className="font-medium">{(opportunity as any).project?.name || 'No associated project'}</p>
                <div className="flex items-center gap-xs mt-2">
                  <span className="text-sm">Project Status:</span>
                  {getStatusBadge((opportunity as any).project?.status || 'unknown')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <TrendingUp className="h-icon-sm w-icon-sm" />
                Bidding Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Bids</span>
                <span className="text-sm font-semibold">
                  {(opportunity as any).bids?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Bid</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(
                    (opportunity as any).bids && (opportunity as any).bids.length > 0
                      ? (opportunity as any).bids.reduce((sum: number, bid: unknown) => sum + (bid.amount || 0), 0) / (opportunity as any).bids.length
                      : 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lowest Bid</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(
                    (opportunity as any).bids && (opportunity as any).bids.length > 0
                      ? Math.min(...(opportunity as any).bids.map((bid: unknown) => bid.amount || 0))
                      : 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'bids',
      label: 'Bids',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {(opportunity as any).bids && (opportunity as any).bids.length > 0 ? (
              <div className="space-y-sm">
                {(opportunity as any).bids
                  .sort((a: unknown, b: unknown) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())
                  .map((bid: unknown) => (
                    <div key={bid.id} className="flex items-center justify-between p-md border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{bid.company?.name || 'Unknown Company'}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {bid.submitted_at ? new Date(bid.submitted_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(bid.amount || 0)}</p>
                        {getStatusBadge(bid.status)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-xl">
                No bids submitted yet
              </p>
            )}
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={(opportunity as any).title}
      subtitle={`Status: ${(opportunity as any).status} • Budget: ${formatCurrency((opportunity as any).budget || 0)}`}
      tabs={tabs}
      backHref="/jobs/opportunities"
    />
  );
}
