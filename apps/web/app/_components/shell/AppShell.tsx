import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { AppShell as AppShellTemplate, Stack, Button, Avatar } from '@ghxstship/ui';
// TODO: ThemeToggle not exported from @ghxstship/ui - implement if needed
import { Command, CommandIcon, Search, Settings2, as } from "lucide-react";

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
  const { role, entitlements, projectsAssignedCount, user, orgId } = await requireAuth();

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

  const navSections = toNavSections(roleFilteredRoutes);

  // Add product-specific navigation sections
  if (entitlements.feature_opendeck) {
    navSections.push({ label: 'Marketplace', items: [{ label: 'OPENDECK', href: '/opendeck' }] });
  }
  if (entitlements.feature_ghxstship) {
    navSections.push({ label: 'Company', items: [{ label: 'GHXSTSHIP', href: '/ghxstship' }] });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background brand-atlvs">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <SidebarClient
          navSections={navSections}
          userId={user?.id}
          entitlements={entitlements}
          organizationName={orgId}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between gap-md px-md py-3">
            <div className="flex items-center gap-md">
              <BreadcrumbsNav />
              <ProductToggle
                atlvsEnabled={entitlements.feature_atlvs}
                opendeckEnabled={entitlements.feature_opendeck}
              />
            </div>
            <div className="flex items-center gap-sm">
              {/* TODO: Implement theme toggle when ThemeToggle component is exported */}
              {/* <ThemeToggle variant="simple" /> */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex items-center gap-xs"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('command-palette:toggle'));
                  }
                }}
              >
                <CommandIcon className="h-icon-xs w-icon-xs" />
                <span>Search</span>
                <kbd className="ml-xs text-2xs rounded border px-1 py-0.5">⌘K</kbd>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="md:hidden p-xs"
                aria-label="Open command palette"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('command-palette:toggle'));
                  }
                }}
              >
                <CommandIcon className="h-icon-xs w-icon-xs" />
              </Button>
              <NotificationsBell />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-xs"
                aria-label="Quick settings"
              >
                <Settings2 className="h-icon-xs w-icon-xs" />
              </Button>
              <Suspense fallback={<div className="h-icon-sm w-icon-sm rounded-full bg-muted animate-pulse" />}>
                <Link
                  href="/profile/overview"
                  className="inline-flex items-center gap-xs rounded-full border border-border/60 bg-card px-xs py-0.5 text-sm hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Avatar size="sm" fallback={(role || 'User').charAt(0).toUpperCase()} />
                  <span className="hidden lg:inline text-sm font-medium text-foreground/80">
                    {role ?? 'Member'}
                  </span>
                </Link>
              </Suspense>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Stack spacing="lg" className="h-full">
            <CommandPalette navSections={navSections} />
            {children}
          </Stack>
        </main>
      </div>
    </div>
  );
}
