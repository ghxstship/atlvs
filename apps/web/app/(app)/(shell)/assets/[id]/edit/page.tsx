/**
 * Assets Edit Page
 *
 * Enterprise-grade edit page for modifying existing assets.
 * Features comprehensive form validation, change tracking, conflict resolution,
 * and seamless integration with the asset management system.
 *
 * @module assets/[id]/edit/page
 */

import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import EditAssetClient from './EditAssetClient';
import React from 'react';

export const dynamic = 'force-dynamic';


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
      title: 'Edit Asset',
      description: 'Modify asset information'
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
      title: 'Edit Asset',
      description: 'Modify asset information'
    };
  }

  // Fetch asset for metadata
  const { data: asset } = await supabase
    .from('assets')
    .select('name, asset_tag')
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
    title: `Edit ${asset.name}`,
    description: `Modify information for asset ${asset.asset_tag}`,
  };
}

export default async function EditAssetPage({ params }: PageProps): Promise<React.JSX.Element> {
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

  // Check permissions
  const allowedRoles = ['owner', 'admin', 'manager'];
  if (!allowedRoles.includes(membership.role)) {
    redirect(`/assets/${id}?error=insufficient_permissions`);
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
    title: 'Edit Asset',
    subtitle: `Modify information for ${asset.name}`,
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',
    success: 'Asset updated successfully',
    error: 'Failed to update asset',
    discard: 'Discard Changes'
  } as const;

  return (
    <EditAssetClient
      asset={asset}
      user={user}
      orgId={membership.organization_id}
      translations={translations}
    />
  );
}
