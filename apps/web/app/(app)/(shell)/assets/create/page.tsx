/**
 * Assets Create Page
 *
 * Enterprise-grade create form page for new asset creation.
 * Features comprehensive form validation, auto-save, conditional logic,
 * file uploads, and seamless integration with the asset management system.
 *
 * @module assets/create/page
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import CreateAssetClient from './CreateAssetClient';
import React from 'react';

export const metadata = {
  title: 'Create Asset',
  description: 'Add a new asset to your inventory with comprehensive details and documentation.',
};

export default async function CreateAssetPage(): Promise<React.JSX.Element> {
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
    redirect('/assets?error=insufficient_permissions');
  }

  const translations = {
    title: 'Create New Asset',
    subtitle: 'Add a new asset to your inventory with comprehensive details and documentation',
    cancel: 'Cancel',
    create: 'Create Asset',
    saving: 'Creating...',
    success: 'Asset created successfully',
    error: 'Failed to create asset',
  } as const;

  return (
    <CreateAssetClient
      user={user}
      orgId={membership.organization_id}
      translations={translations}
    />
  );
}
