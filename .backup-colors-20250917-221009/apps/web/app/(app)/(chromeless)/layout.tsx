import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Chromeless layout for authenticated pages that don't need the full app shell
 * Examples: onboarding flows, focused forms, setup wizards
 * Inherits authentication from parent (app) layout
 */
export default function ChromelessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto p-md">
      {children}
    </div>
  );
}
