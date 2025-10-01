/**
 * Analytics Edit Page
 *
 * Enterprise-grade edit form handler for GHXSTSHIP Analytics module.
 * Provides comprehensive record editing with validation and auto-save.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { isFeatureEnabled } from '../../../../../lib/feature-flags';
import AnalyticsEditClient from './AnalyticsEditClient';

export const dynamic = 'force-dynamic';


interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Edit Analytics - ${params.id}`,
    description: 'Edit analytics record details.',
  };
}

export default async function AnalyticsEditPage({ params }: PageProps) {
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

  const useUnifiedVersion = isFeatureEnabled('unified-analytics', {
    userId: user.id,
    orgId: membership.organization_id,
    role: membership.role ?? undefined,
  });

  if (!useUnifiedVersion) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="stack-sm text-center">
          <p className="text-lg font-semibold">Analytics module migration in progress</p>
          <p className="text-sm text-muted-foreground">
            The unified analytics experience is currently disabled for your organization. Please contact support if you
            need immediate access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsEditClient
      user={user}
      orgId={membership.organization_id}
      itemId={params.id}
    />
  );
}
