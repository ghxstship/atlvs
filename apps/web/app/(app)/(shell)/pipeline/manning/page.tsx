'use client';

import React from 'react';
import { DashboardLayout } from '@ghxstship/ui/templates';
import { DashboardWidget } from '@ghxstship/ui/organisms';

export default function DashboardPage() {
  // TODO: Implement dashboard content using DashboardLayout
  // This is a placeholder - actual implementation needed

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome to your workspace"
      showRefresh={true}
      showExport={true}
      showSettings={true}
      sidebar={
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              {/* TODO: Add quick actions */}
            </div>
          </div>
        </div>
      }
      rightPanel={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Recent Activity</h3>
            {/* TODO: Add activity feed */}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TODO: Add dashboard widgets */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-medium mb-2">Widget Placeholder</h3>
          <p className="text-muted-foreground">Dashboard content coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
