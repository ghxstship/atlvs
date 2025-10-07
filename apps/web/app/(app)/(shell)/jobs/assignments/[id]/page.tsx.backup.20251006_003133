import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AssignmentsClient from '../AssignmentsClient';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Assignment Details - Jobs',
  description: 'View assignment details and manage assignments',
};

interface AssignmentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

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
    .eq('auth_id', session.user.id)
    .single();

  if (!profile || !profile.memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const orgId = profile.memberships[0].organization_id;

  // Verify the assignment exists and belongs to the organization
  const { data: assignment } = await supabase
    .from('job_assignments')
    .select(`
      *,
      job:jobs!inner(
        id,
        organization_id
      )
    `)
    .eq('id', params.id)
    .single();

  if (!assignment || assignment.job.organization_id !== orgId) {
    redirect('/jobs/assignments');
  }

  return (
    <AssignmentsClient
      user={session.user}
      orgId={orgId}
      initialView="detail"
      selectedId={params.id}
    />
  );
}
