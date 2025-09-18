import { ReactNode } from 'react';
import AuthGuard from '../_components/auth/AuthGuard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Unified authentication layout for all app routes
 * Enforces authentication and provides minimal container
 * Child route groups can add their own shell (shell) or remain minimal (chromeless)
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
