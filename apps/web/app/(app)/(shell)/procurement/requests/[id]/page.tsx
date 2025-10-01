/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { ClipboardList, Calendar, DollarSign, User, AlertTriangle, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Request Details - GHXSTSHIP',
  description: 'View detailed procurement request information and approval workflow.',
};

interface RequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
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

  // Get request record
  const { data: request, error: requestError } = await supabase
    .from('procurement_requests')
    .select(`
      *,
      requester:users!procurement_requests_requester_id_fkey(id, first_name, last_name, email),
      approver:users!procurement_requests_approver_id_fkey(id, first_name, last_name, email),
      items:procurement_request_items(
        id,
        description,
        quantity,
        estimated_cost,
        justification
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (requestError || !request) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Requests', href: '/procurement/requests' },
          { label: 'Not Found' }
        ]}
        title="Request Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested procurement request could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Requests', href: '/procurement/requests' },
    { label: `Request ${(request as any).request_number || (request as any).id}` }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      submitted: 'outline',
      approved: 'default',
      rejected: 'destructive',
      ordered: 'default',
      completed: 'secondary'
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
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <ClipboardList className="h-icon-sm w-icon-sm" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Request Number</span>
                <span className="text-sm font-mono">
                  {(request as any).request_number || (request as any).id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((request as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge variant="outline">
                  {(request as any).priority?.toUpperCase() || 'MEDIUM'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Estimated Cost</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(
                    (request as any).items?.reduce((sum: number, item: unknown) =>
                      sum + ((item.quantity || 0) * (item.estimated_cost || 0)), 0) || 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Requester & Approver */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <User className="h-icon-sm w-icon-sm" />
                Request Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requester</p>
                <p className="font-medium">
                  {(request as any).requester?.first_name} {(request as any).requester?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(request as any).requester?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requested: {(request as any).requested_date ? new Date((request as any).requested_date).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              {(request as any).approver && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approver</p>
                  <p className="font-medium">
                    {(request as any).approver?.first_name} {(request as any).approver?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(request as any).approver?.email}
                  </p>
                  {(request as any).approved_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Approved: {new Date((request as any).approved_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Requested Items</CardTitle>
            </CardHeader>
            <CardContent>
              {(request as any).items && (request as any).items.length > 0 ? (
                <div className="space-y-md">
                  {(request as any).items.map((item: unknown) => (
                    <div key={item.id} className="p-md border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.justification}
                          </p>
                          <div className="flex items-center gap-md mt-2">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="text-sm">Unit Cost: {formatCurrency(item.estimated_cost)}</span>
                            <span className="text-sm font-semibold">
                              Total: {formatCurrency((item.quantity || 0) * (item.estimated_cost || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-md">
                  No items in this request
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'approval',
      label: 'Approval Workflow',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="flex items-center gap-sm">
              {((request as any).status === 'approved') ? (
                <CheckCircle className="h-icon-sm w-icon-sm text-green-500" />
              ) : ((request as any).status === 'rejected') ? (
                <AlertTriangle className="h-icon-sm w-icon-sm text-red-500" />
              ) : (
                <AlertTriangle className="h-icon-sm w-icon-sm text-yellow-500" />
              )}
              <div>
                <p className="font-medium capitalize">{(request as any).status} Request</p>
                <p className="text-sm text-muted-foreground">
                  {(request as any).status === 'approved' && (request as any).approved_date
                    ? `Approved on ${new Date((request as any).approved_date).toLocaleDateString()}`
                    : (request as any).status === 'rejected'
                    ? `Rejected: ${(request as any).rejection_reason || 'No reason provided'}`
                    : 'Awaiting approval'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Request ${(request as any).request_number || (request as any).id}`}
      subtitle={`Status: ${(request as any).status} • Requester: ${(request as any).requester?.first_name} ${(request as any).requester?.last_name}`}
      tabs={tabs}
      backHref="/procurement/requests"
    />
  );
}
