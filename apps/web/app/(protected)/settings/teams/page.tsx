import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import InviteMemberClient from './InviteMemberClient';

export const metadata = { title: 'Settings · Teams' };

export default async function SettingsTeamsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | undefined;
  let role: string | undefined;
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = (membership as any)?.organization_id;
    role = (membership as any)?.role;
  }

  return (
    <div className="space-y-4">
      <Card title="Settings · Teams">
        {orgId ? (
          <InviteMemberClient orgId={orgId} role={role} />
        ) : (
          <div className="text-sm text-foreground/70">You are not currently a member of an active organization.</div>
        )}
      </Card>
    </div>
  );
}
