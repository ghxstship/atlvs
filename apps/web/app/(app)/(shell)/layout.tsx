import { ReactNode } from 'react';
import AppShell from '../../_components/shell/AppShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Full application shell layout for main app routes
 * Provides sidebar, topbar, breadcrumbs, command palette, and notifications
 * Uses centralized session context and route registry
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
