import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateAssignmentClient from '../../CreateAssignmentClient';

export const dynamic = 'force-dynamic';


interface EditAssignmentPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Edit Assignment - Jobs',
  description: 'Edit job assignment details',
};

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
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
    <CreateAssignmentClient
      user={session.user}
      orgId={orgId}
      editMode={true}
      assignmentId={params.id}
    />
  );
}
