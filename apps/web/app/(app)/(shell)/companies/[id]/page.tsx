/**
 * Companies Detail Page
 * Individual company record view with full information
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CompanyDetailClient from './CompanyDetailClient';

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
      .select('name, description')
      .eq('id', params.id)
      .single();

    if (!company) {
      return {
        title: 'Company Not Found',
      };
    }

    return {
      title: `${company.name} - Company Details`,
      description: company.description || `View details for ${company.name}`,
    };
  } catch (error) {
    return {
      title: 'Company Details',
    };
  }
}

export default async function CompanyDetailPage({ params }: PageProps) {
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

  // Get company data
  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      *,
      contacts:company_contacts(*),
      contracts:company_contracts(*),
      qualifications:company_qualifications(*),
      ratings:company_ratings(*)
    `)
    .eq('id', params.id)
    .eq('organization_id', orgId)
    .single();

  if (error || !company) {
    notFound();
  }

  return (
    <CompanyDetailClient
      company={company}
      user={session.user}
      orgId={orgId}
      translations={{
        title: 'Company Details',
        subtitle: `View and manage ${company.name}`,
        edit: 'Edit Company',
        back: 'Back to Companies',
      }}
    />
  );
}
