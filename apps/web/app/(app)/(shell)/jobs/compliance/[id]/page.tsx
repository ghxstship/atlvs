/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { FileText, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Compliance Details - GHXSTSHIP',
  description: 'View detailed compliance requirement information and status.',
};

interface ComplianceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplianceDetailPage({ params }: ComplianceDetailPageProps) {
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

  // Get compliance record
  const { data: compliance, error: complianceError } = await supabase
    .from('job_compliance')
    .select(`
      *,
      job:jobs(
        id,
        title,
        status,
        project:projects(id, name)
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (complianceError || !compliance) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'Compliance', href: '/jobs/compliance' },
          { label: 'Not Found' }
        ]}
        title="Compliance Record Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-8">
              <p className="text-muted-foreground">The requested compliance record could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Compliance', href: '/jobs/compliance' },
    { label: (compliance as any).job?.title || 'Compliance Record' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      submitted: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Compliance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon((compliance as any).status)}
                  {getStatusBadge((compliance as any).status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">
                  {(compliance as any).kind?.toUpperCase() || 'N/A'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Due Date</span>
                <span className="text-sm text-muted-foreground">
                  {(compliance as any).due_at ? new Date((compliance as any).due_at).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Associated Job */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Associated Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{(compliance as any).job?.title || 'No associated job'}</p>
                <p className="text-sm text-muted-foreground">
                  Project: {(compliance as any).job?.project?.name || 'No project'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Job Status:</span>
                  {getStatusBadge((compliance as any).job?.status || 'unknown')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Details */}
          {(compliance as any).submitted_at && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submitted</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date((compliance as any).submitted_at).toLocaleDateString()}
                  </span>
                </div>
                {(compliance as any).approved_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date((compliance as any).approved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {(compliance as any).status === 'rejected' && (compliance as any).rejected_reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {(compliance as any).rejected_reason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'documents',
      label: 'Documents',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Document management coming soon...
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={(compliance as any).job?.title || 'Compliance Record'}
      subtitle={`Type: ${(compliance as any).kind?.toUpperCase()} • Status: ${(compliance as any).status?.replace('_', ' ')}`}
      tabs={tabs}
      backHref="/jobs/compliance"
    />
  );
}
