import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import DomainsClient from './DomainsClient';
import { Card } from '@ghxstship/ui';

export const metadata = { title: 'Settings · Organization · Domains' };

export default async function OrgDomainsPage({ searchParams }: { searchParams?: { suggest?: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card title="Organization Domains">
          <div className="text-body-sm color-foreground/70">You must be signed in.</div>
        </Card>
      </div>
    );
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();

  const orgId = membership?.organization_id as string | undefined;
  const role = (membership as any)?.role as string | undefined;
  const suggest = searchParams?.suggest ? String(searchParams.suggest) : undefined;

  return (
    <div className="space-y-4">
      <Card title="Organization Domains">
        {orgId ? (
          <DomainsClient orgId={orgId} role={role} suggest={suggest} />
        ) : (
          <div className="text-body-sm color-foreground/70">You are not currently a member of an active organization.</div>
        )}
      </Card>
    </div>
  );
}
