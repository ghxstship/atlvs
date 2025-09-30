/**
 * Assets Detail Page
 *
 * Enterprise-grade detail page for viewing individual assets.
 * Features comprehensive asset information, related data display,
 * audit trail, quick actions, and navigation between assets.
 *
 * @module assets/[id]/page
 */

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import AssetDetailClient from './AssetDetailClient';
import React from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;

  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const cookie = cookieStore.get(name);
      return cookie ? { name: cookie.name, value: cookie.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      title: 'Asset Details',
      description: 'View comprehensive asset information'
    };
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership?.organization_id) {
    return {
      title: 'Asset Details',
      description: 'View comprehensive asset information'
    };
  }

  // Fetch asset for metadata
  const { data: asset } = await supabase
    .from('assets')
    .select('name, asset_tag, description')
    .eq('organization_id', membership.organization_id)
    .eq('id', id)
    .single();

  if (!asset) {
    return {
      title: 'Asset Not Found',
      description: 'The requested asset could not be found'
    };
  }

  return {
    title: `${asset.name} - Asset Details`,
    description: asset.description || `View details for asset ${asset.asset_tag}`,
  };
}

export default async function AssetDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const cookie = cookieStore.get(name);
      return cookie ? { name: cookie.name, value: cookie.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();

  if (!membership?.organization_id) {
    redirect('/auth/onboarding');
  }

  // Fetch asset
  const { data: asset } = await supabase
    .from('assets')
    .select(`
      *,
      location:asset_locations(name, address),
      assigned_to:users(name, avatar, email),
      supplier:companies(name)
    `)
    .eq('organization_id', membership.organization_id)
    .eq('id', id)
    .single();

  if (!asset) {
    notFound();
  }

  const translations = {
    title: 'Asset Details',
    subtitle: `Comprehensive information for ${asset.name}`,
    edit: 'Edit Asset',
    delete: 'Delete Asset',
    assign: 'Assign Asset',
    maintenance: 'Schedule Maintenance',
    duplicate: 'Duplicate Asset',
    export: 'Export Asset',
    history: 'View History',
    back: 'Back to Assets',
    notFound: 'Asset not found'
  } as const;

  return (
    <AssetDetailClient
      asset={asset}
      user={user}
      orgId={membership.organization_id}
      userRole={membership.role}
      translations={translations}
    />
  );
}
