import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { routeRegistry, toNavSections, filterByEntitlements, filterByRole } from '../../lib/navigation/routeRegistry';
import { SidebarClient } from '../_components/nav/SidebarClient';
import { CommandPalette } from '../_components/nav/CommandPalette';
import { ProductToggle } from '../_components/nav/ProductToggle';
import { BreadcrumbsNav } from '../_components/nav/BreadcrumbsNav';
import NotificationsBell from '../_components/NotificationsBell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Entitlements: determine features for ATLVS/OPENDECK/GHXSTSHIP
  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | null = null;
  let role: string | undefined = undefined;
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
    role = membership?.role ?? undefined;
  }

  let orgEnt: any = null;
  if (orgId) {
    const { data } = await supabase
      .from('organization_entitlements')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    orgEnt = data || null;
  }

  let userEnt: any = null;
  if (user) {
    const { data } = await supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    userEnt = data || null;
  }

  const feature_opendeck = (orgEnt?.feature_opendeck ?? false) || (userEnt?.feature_opendeck ?? false);
  const feature_atlvs = (orgEnt?.feature_atlvs ?? true) || (userEnt?.feature_atlvs ?? true);
  const feature_ghxstship = (orgEnt?.feature_ghxstship ?? false) || (userEnt?.feature_ghxstship ?? false);

  // Build navigation from centralized route registry with entitlements + RBAC role filtering
  const filteredRoutes = filterByEntitlements(routeRegistry, feature_atlvs, feature_ghxstship);
  let roleFilteredRoutes = filterByRole(filteredRoutes, role || 'viewer');

  // Project-scoped RBAC: if user has no assigned projects and role is limited,
  // constrain Projects children to Overview only (hide deep pages that require assignments)
  let projectsAssignedCount = 0;
  if (user) {
    const { count } = await supabase
      .from('projects_members')
      .select('project_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');
    projectsAssignedCount = count ?? 0;
  }

  const limitedRoles = new Set(['team_member', 'viewer', 'client', 'vendor', 'partner']);
  if (projectsAssignedCount === 0 && limitedRoles.has((role || 'viewer').toLowerCase())) {
    roleFilteredRoutes = roleFilteredRoutes.map((r) => {
      if (r.id !== 'projects' || !r.children) return r;
      const overview = r.children.find((c) => c.id === 'projects-overview');
      return { ...r, children: overview ? [overview] : [] };
    });
  }

  const navSections: Array<{ label: string; items: Array<{ label: string; href: string }> }> = toNavSections(roleFilteredRoutes);

  if (feature_opendeck) {
    navSections.push({ label: 'Marketplace', items: [{ label: 'OPENDECK', href: '/opendeck' }] });
  }
  if (feature_ghxstship) {
    navSections.push({ label: 'Company', items: [{ label: 'GHXSTSHIP', href: '/ghxstship' }] });
  }

  return (
    <div className="flex min-h-dvh">
      <SidebarClient navSections={navSections} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="sticky top-0 z-40 border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BreadcrumbsNav />
              <ProductToggle atlvsEnabled={feature_atlvs} opendeckEnabled={feature_opendeck} />
            </div>
            <NotificationsBell />
          </div>
        </div>
        <div className="container mx-auto p-4">
          <CommandPalette navSections={navSections} />
          {children}
        </div>
      </main>
    </div>
  );
}
