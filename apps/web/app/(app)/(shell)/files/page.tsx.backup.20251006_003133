import FilesClient from './FilesClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Files',
  description: 'Digital asset management and file organization',
};

export default async function FilesPage() {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect('/auth/signin');
  }

  const { data: profile } = await supabase
    .from('users')
    .select(
      `
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
      `,
    )
    .eq('auth_id', session.user.id)
    .single();

  if (!profile || !profile.memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const membership = profile.memberships[0];

  return (
    <FilesClient
      user={session.user}
      orgId={membership.organization_id}
      translations={{
        title: 'Files',
        subtitle: 'Digital asset management and file organization',
      }}
    />
  );
}
