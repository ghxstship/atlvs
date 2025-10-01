/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { CheckCircle, Clock, XCircle, User, FileText } from 'lucide-react';

export const metadata = {
  title: 'Approval Details - GHXSTSHIP',
  description: 'View detailed approval workflow and decision information.',
};

interface ApprovalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApprovalDetailPage({ params }: ApprovalDetailPageProps) {
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

  // Get approval record
  const { data: approval, error: approvalError } = await supabase
    .from('procurement_approvals')
    .select(`
      *,
      request:procurement_requests(
        id,
        request_number,
        description,
        total_amount,
        requester:users!procurement_requests_requester_id_fkey(first_name, last_name, email)
      ),
      approver:users(id, first_name, last_name, email)
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (approvalError || !approval) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Approvals', href: '/procurement/approvals' },
          { label: 'Not Found' }
        ]}
        title="Approval Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested approval could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Approvals', href: '/procurement/approvals' },
    { label: `Approval ${(approval as any).id}` }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-icon-sm w-icon-sm text-green-500" />;
      case 'rejected':
        return <XCircle className="h-icon-sm w-icon-sm text-red-500" />;
      default:
        return <Clock className="h-icon-sm w-icon-sm text-yellow-500" />;
    }
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
          {/* Approval Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <FileText className="h-icon-sm w-icon-sm" />
                Approval Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-xs">
                  {getStatusIcon((approval as any).status)}
                  {getStatusBadge((approval as any).status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approval Level</span>
                <Badge variant="outline">
                  LEVEL {(approval as any).approval_level || 1}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((approval as any).amount || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Submitted</span>
                <span className="text-sm text-muted-foreground">
                  {(approval as any).submitted_at ? new Date((approval as any).submitted_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Decision Date</span>
                <span className="text-sm text-muted-foreground">
                  {(approval as any).decision_date ? new Date((approval as any).decision_date).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Requester & Approver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <User className="h-icon-sm w-icon-sm" />
                Workflow Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requester</p>
                <p className="font-medium">
                  {(approval as any).request?.requester?.first_name} {(approval as any).request?.requester?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(approval as any).request?.requester?.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Approver</p>
                <p className="font-medium">
                  {(approval as any).approver?.first_name} {(approval as any).approver?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(approval as any).approver?.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Associated Request */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Associated Procurement Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-md border rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      Request {(approval as any).request?.request_number || (approval as any).request?.id}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(approval as any).request?.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-md mt-2">
                      <span className="text-sm">Amount: {formatCurrency((approval as any).request?.total_amount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision & Comments */}
          {((approval as any).status === 'approved' || (approval as any).status === 'rejected') && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Decision & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  <div className="flex items-center gap-xs">
                    {getStatusIcon((approval as any).status)}
                    <span className="font-medium capitalize">{(approval as any).status} Decision</span>
                  </div>
                  {(approval as any).comments && (
                    <div className="p-sm bg-muted rounded">
                      <p className="text-sm">{(approval as any).comments}</p>
                    </div>
                  )}
                  {(approval as any).decision_date && (
                    <p className="text-xs text-muted-foreground">
                      Decided on {new Date((approval as any).decision_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Approval ${(approval as any).id}`}
      subtitle={`Status: ${(approval as any).status} • Level: ${(approval as any).approval_level || 1} • Amount: ${formatCurrency((approval as any).amount || 0)}`}
      tabs={tabs}
      backHref="/procurement/approvals"
    />
  );
}
