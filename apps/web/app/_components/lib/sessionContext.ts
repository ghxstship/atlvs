import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { cache } from 'react';

export interface SessionContext {
  session: any;
  user: any;
  orgId: string | null;
  role: string | undefined;
  entitlements: {
    feature_atlvs: boolean;
    feature_opendeck: boolean;
    feature_ghxstship: boolean;
  };
  projectsAssignedCount: number;
}

/**
 * Cached server utility to get complete session context including auth, entitlements, and role
 * Used across layouts and pages to avoid duplicating auth/entitlement logic
 */
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get organization membership and role
  let orgId: string | null = null;
  let role: string | undefined = undefined;
  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();
  
  orgId = membership?.organization_id ?? null;
  role = membership?.role ?? undefined;

  // Get organization entitlements
  let orgEnt = null;
  if (orgId) {
    const { data } = await supabase
      .from('organization_entitlements')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    orgEnt = data || null;
  }

  // Get user entitlements
  let userEnt = null;
  const { data } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  userEnt = data || null;

  // Calculate feature entitlements
  const feature_opendeck = (orgEnt?.feature_opendeck ?? false) || (userEnt?.feature_opendeck ?? false);
  const feature_atlvs = (orgEnt?.feature_atlvs ?? true) || (userEnt?.feature_atlvs ?? true);
  const feature_ghxstship = (orgEnt?.feature_ghxstship ?? false) || (userEnt?.feature_ghxstship ?? false);

  // Get projects assigned count for RBAC
  let projectsAssignedCount = 0;
  const { count } = await supabase
    .from('projects_members')
    .select('project_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');
  projectsAssignedCount = count ?? 0;

  return {
    session,
    user,
    orgId,
    role,
    entitlements: {
      feature_atlvs,
      feature_opendeck,
      feature_ghxstship,
    },
    projectsAssignedCount,
  };
});

/**
 * Server utility to require authentication and return session context
 * Throws redirect if not authenticated
 */
export async function requireAuth(): Promise<SessionContext> {
  const context = await getSessionContext();
  if (!context) {
    const { redirect } = await import('next/navigation');
    redirect('/auth/signin');
    // This line will never be reached due to redirect, but TypeScript doesn't know that
    throw new Error('Unauthorized');
  }
  return context;
}
