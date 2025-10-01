/**
 * Companies Edit Page
 * Edit form handler for existing company records
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditCompanyClient from './EditCompanyClient';

export const dynamic = 'force-dynamic';


interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient();

  try {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', params.id)
      .single();

    if (!company) {
      return {
        title: 'Company Not Found',
      };
    }

    return {
      title: `Edit ${company.name} - Company Management`,
      description: `Edit company profile for ${company.name}`,
    };
  } catch (error) {
    return {
      title: 'Edit Company',
    };
  }
}

export default async function EditCompanyPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    return null; // Will redirect on client
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
    return null; // Will redirect on client
  }

  const orgId = profile.memberships[0].organization_id;
  const userRole = profile.memberships[0].role;

  // Get company data
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', orgId)
    .single();

  if (error || !company) {
    notFound();
  }

  return (
    <EditCompanyClient
      company={company}
      user={session.user}
      orgId={orgId}
      userRole={userRole}
      translations={{
        title: 'Edit Company',
        subtitle: `Update information for ${company.name}`,
        cancel: 'Cancel',
        save: 'Save Changes',
        saving: 'Saving...',
      }}
    />
  );
}
