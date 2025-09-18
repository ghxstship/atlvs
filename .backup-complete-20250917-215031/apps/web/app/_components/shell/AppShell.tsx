import { ReactNode } from 'react';
import { requireAuth } from '../lib/sessionContext';
import { routeRegistry, toNavSections, filterByEntitlements, filterByRole } from '../../../lib/navigation/routeRegistry';
import { SidebarClient } from '../nav/SidebarClient';
import { CommandPalette } from '../nav/CommandPalette';
import { ProductToggle } from '../nav/ProductToggle';
import { BreadcrumbsNav } from '../nav/BreadcrumbsNav';
import NotificationsBell from '../NotificationsBell';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Server component that provides the full authenticated application shell
 * Includes sidebar, topbar, breadcrumbs, command palette, and notifications
 * Uses centralized session context and route registry
 */
export default async function AppShell({ children }: AppShellProps) {
  // Get authenticated session context with entitlements and role
  const { user, orgId, role, entitlements, projectsAssignedCount } = await requireAuth();

  // Build navigation from centralized route registry with entitlements + RBAC role filtering
  const filteredRoutes = filterByEntitlements(
    routeRegistry, 
    entitlements.feature_atlvs, 
    entitlements.feature_ghxstship
  );
  let roleFilteredRoutes = filterByRole(filteredRoutes, role || 'viewer');

  // Project-scoped RBAC: if user has no assigned projects and role is limited,
  // constrain Projects children to Overview only (hide deep pages that require assignments)
  const limitedRoles = new Set(['team_member', 'viewer', 'client', 'vendor', 'partner']);
  if (projectsAssignedCount === 0 && limitedRoles.has((role || 'viewer').toLowerCase())) {
    roleFilteredRoutes = roleFilteredRoutes.map((r) => {
      if (r.id !== 'projects' || !r.children) return r;
      const overview = r.children.find((c) => c.id === 'projects-overview');
      return { ...r, children: overview ? [overview] : [] };
    });
  }

  const navSections: Array<{ label: string; items: Array<{ label: string; href: string }> }> = toNavSections(roleFilteredRoutes);

  // Add product-specific navigation sections
  if (entitlements.feature_opendeck) {
    navSections.push({ label: 'Marketplace', items: [{ label: 'OPENDECK', href: '/opendeck' }] });
  }
  if (entitlements.feature_ghxstship) {
    navSections.push({ label: 'Company', items: [{ label: 'GHXSTSHIP', href: '/ghxstship' }] });
  }

  return (
    <div className="flex min-h-dvh">
      <SidebarClient navSections={navSections} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="sticky top-0 z-40 border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <div className="container mx-auto px-md py-sm flex items-center justify-between gap-md">
            <div className="flex items-center gap-sm">
              <BreadcrumbsNav />
              <ProductToggle 
                atlvsEnabled={entitlements.feature_atlvs} 
                opendeckEnabled={entitlements.feature_opendeck} 
              />
            </div>
            <NotificationsBell />
          </div>
        </div>
        <div className="container mx-auto p-md">
          <CommandPalette navSections={navSections} />
          {children}
        </div>
      </main>
    </div>
  );
}
