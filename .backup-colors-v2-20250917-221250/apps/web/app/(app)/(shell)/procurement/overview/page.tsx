import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { Card } from '@ghxstship/ui';
import ProcurementOverviewClient from './ProcurementOverviewClient';

export const metadata = {
  title: 'Procurement Overview',
};

export default async function ProcurementOverview() {
  const cookieStore = cookies();
  const sb = createServerClient(cookieStore);

  // Check authentication
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's organization membership
  const { data: membership } = await sb
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership?.organization_id) {
    redirect('/onboarding');
  }

  return (
    <div className="stack-lg">
      <div>
        <h1 className="text-heading-3 text-heading-3">Procurement Overview</h1>
        <p className="color-foreground/70">
          Monitor your procurement activities and performance
        </p>
      </div>

      <ProcurementOverviewClient orgId={membership.organization_id} />
    </div>
  );
}
