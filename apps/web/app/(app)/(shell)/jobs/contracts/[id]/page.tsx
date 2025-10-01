/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { FileText, Calendar, DollarSign, Building, CheckCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Contract Details - GHXSTSHIP',
  description: 'View detailed contract information and lifecycle management.',
};

interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
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

  // Get contract record
  const { data: contract, error: contractError } = await supabase
    .from('job_contracts')
    .select(`
      *,
      job:jobs(
        id,
        title,
        status,
        project:projects(id, name)
      ),
      company:companies(
        id,
        name,
        contact_email
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (contractError || !contract) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'Contracts', href: '/jobs/contracts' },
          { label: 'Not Found' }
        ]}
        title="Contract Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested contract could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Contracts', href: '/jobs/contracts' },
    { label: (contract as any).job?.title || 'Contract Details' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'outline',
      signed: 'default',
      active: 'default',
      completed: 'secondary',
      terminated: 'destructive',
      expired: 'destructive'
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
          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <FileText className="h-icon-sm w-icon-sm" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <h3 className="text-lg font-semibold">{(contract as any).title || 'Contract'}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(contract as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((contract as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract Type</span>
                <Badge variant="outline">
                  {(contract as any).contract_type?.toUpperCase() || 'GENERAL'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Value</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((contract as any).contract_value || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-icon-sm w-icon-sm" />
                Contract Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Start Date</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).start_date ? new Date((contract as any).start_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">End Date</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).end_date ? new Date((contract as any).end_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Signed Date</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).signed_date ? new Date((contract as any).signed_date).toLocaleDateString() : 'Not signed'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Renewal</span>
                <Badge variant={(contract as any).auto_renewal ? 'default' : 'secondary'}>
                  {(contract as any).auto_renewal ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Associated Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Building className="h-icon-sm w-icon-sm" />
                Associated Entities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job</p>
                <p className="font-medium">{(contract as any).job?.title || 'No associated job'}</p>
                <p className="text-sm text-muted-foreground">
                  Project: {(contract as any).job?.project?.name || 'No project'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="font-medium">{(contract as any).company?.name || 'No associated company'}</p>
                {(contract as any).company?.contact_email && (
                  <p className="text-sm text-muted-foreground">
                    {(contract as any).company.contact_email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Terms</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).payment_terms || 'Standard terms'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivery Terms</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).delivery_terms || 'Standard delivery'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Termination Clause</span>
                <span className="text-sm text-muted-foreground">
                  {(contract as any).termination_clause ? 'Included' : 'Not specified'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'documents',
      label: 'Documents',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Contract Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Contract documents and attachments will be available here.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={(contract as any).title || 'Contract Details'}
      subtitle={`Status: ${(contract as any).status} • Value: ${formatCurrency((contract as any).contract_value || 0)}`}
      tabs={tabs}
      backHref="/jobs/contracts"
    />
  );
}
