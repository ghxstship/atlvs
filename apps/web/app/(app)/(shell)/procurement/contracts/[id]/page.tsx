/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { FileText, Handshake, Building } from 'lucide-react';

export const metadata = {
  title: 'Procurement Contract Details - GHXSTSHIP',
  description: 'View detailed procurement contract information.',
};

interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProcurementContractDetailPage({ params }: ContractDetailPageProps) {
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
    { label: 'Contracts', href: '/procurement/contracts' },
    { label: `Contract ${id}` }
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
                <FileText className="h-icon-sm w-icon-sm" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Procurement contract details and terms will be displayed here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Handshake className="h-icon-sm w-icon-sm" />
                Vendor Agreement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Vendor contract terms, SLAs, and performance metrics.
              </p>
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
            <CardTitle className="flex items-center gap-xs">
              <Building className="h-icon-sm w-icon-sm" />
              Contract Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Contract documents, amendments, and legal agreements.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Procurement Contract ${id}`}
      subtitle="Vendor contracts and procurement agreements"
      tabs={tabs}
      backHref="/procurement/contracts"
    />
  );
}
