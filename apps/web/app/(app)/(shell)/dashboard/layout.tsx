import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Dashboard layout with parallel routes
 * Enables independent loading states for analytics and notifications
 * Implements Next.js 13+ parallel routes pattern
 */
export default function DashboardLayout({
  children,
  analytics,
  notifications,
}: {
  children: ReactNode;
  analytics: ReactNode;
  notifications: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
      {/* Main dashboard content - takes 2 columns on large screens */}
      <div className="lg:col-span-2">
        {children}
      </div>

      {/* Sidebar with parallel routes - takes 1 column on large screens */}
      <div className="space-y-md">
        {/* Analytics slot - loads independently */}
        {analytics}

        {/* Notifications slot - loads independently */}
        {notifications}
      </div>
    </div>
  );
}
