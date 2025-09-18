import { ReactNode } from 'react';
import { requireAuth } from '../lib/sessionContext';

interface AuthGuardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Server component that enforces authentication
 * Redirects to /login if not authenticated
 * Provides minimal container for authenticated content
 */
export default async function AuthGuard({ children, className = "min-h-screen bg-background" }: AuthGuardProps) {
  // This will redirect if not authenticated
  await requireAuth();

  return (
    <div className={className}>
      {children}
    </div>
  );
}
