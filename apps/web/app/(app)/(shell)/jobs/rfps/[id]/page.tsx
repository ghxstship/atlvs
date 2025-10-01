/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { FileText, Calendar, Users, Target, TrendingUp, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'RFP Details - GHXSTSHIP',
  description: 'View detailed RFP information and response management.',
};

interface RfpDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RfpDetailPage({ params }: RfpDetailPageProps) {
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

  // Get RFP record
  const { data: rfp, error: rfpError } = await supabase
    .from('job_rfps')
    .select(`
      *,
      responses:job_rfp_responses(
        id,
        status,
        submitted_at,
        company:companies(id, name, contact_email)
      ),
      project:projects(id, name, status)
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (rfpError || !rfp) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'RFPs', href: '/jobs/rfps' },
          { label: 'Not Found' }
        ]}
        title="RFP Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested RFP could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'RFPs', href: '/jobs/rfps' },
    { label: (rfp as any).title }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      open: 'default',
      closed: 'secondary',
      awarded: 'default',
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
          {/* RFP Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <FileText className="h-icon-sm w-icon-sm" />
                RFP Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <h3 className="text-lg font-semibold">{(rfp as any).title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(rfp as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((rfp as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget Range</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((rfp as any).budget_min || 0)} - {formatCurrency((rfp as any).budget_max || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Deadline</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).response_deadline ? new Date((rfp as any).response_deadline).toLocaleDateString() : 'TBD'}
                </span>
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
                <span className="text-sm font-medium">Published Date</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).published_date ? new Date((rfp as any).published_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Deadline</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).response_deadline ? new Date((rfp as any).response_deadline).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Award Date</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).award_date ? new Date((rfp as any).award_date).toLocaleDateString() : 'Not awarded'}
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
                <p className="font-medium">{(rfp as any).project?.name || 'No associated project'}</p>
                <div className="flex items-center gap-xs mt-2">
                  <span className="text-sm">Project Status:</span>
                  {getStatusBadge((rfp as any).project?.status || 'unknown')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <TrendingUp className="h-icon-sm w-icon-sm" />
                Response Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Responses</span>
                <span className="text-sm font-semibold">
                  {(rfp as any).responses?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Submitted</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).responses?.filter((r: unknown) => r.status === 'submitted').length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Under Review</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).responses?.filter((r: unknown) => r.status === 'under_review').length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shortlisted</span>
                <span className="text-sm text-muted-foreground">
                  {(rfp as any).responses?.filter((r: unknown) => r.status === 'shortlisted').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'responses',
      label: 'Responses',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>RFP Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {(rfp as any).responses && (rfp as any).responses.length > 0 ? (
              <div className="space-y-sm">
                {(rfp as any).responses
                  .sort((a: unknown, b: unknown) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())
                  .map((response: unknown) => (
                    <div key={response.id} className="flex items-center justify-between p-md border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{response.company?.name || 'Unknown Company'}</p>
                        <p className="text-sm text-muted-foreground">
                          {response.company?.contact_email || 'No email'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {response.submitted_at ? new Date(response.submitted_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(response.status)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-xl">
                No responses submitted yet
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
      title={(rfp as any).title}
      subtitle={`Status: ${(rfp as any).status} • Budget: ${formatCurrency((rfp as any).budget_min || 0)} - ${formatCurrency((rfp as any).budget_max || 0)}`}
      tabs={tabs}
      backHref="/jobs/rfps"
    />
  );
}
