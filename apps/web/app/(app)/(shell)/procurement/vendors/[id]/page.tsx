'use client';

import React from 'react';
import { DetailLayout } from '@ghxstship/ui/templates';

export default function DetailPage() {
  // TODO: Implement detail content using DetailLayout
  // This is a placeholder - actual implementation needed

  return (
    <DetailLayout
      title="Item Details"
      subtitle="Detailed view of the selected item"
      breadcrumbs={
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button className="hover:text-foreground">Home</button>
          <span>/</span>
          <button className="hover:text-foreground">Module</button>
          <span>/</span>
          <span className="text-foreground">Details</span>
        </nav>
      }
      actions={
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-input rounded-md">
            Edit
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md">
            Delete
          </button>
        </div>
      }
      avatar={
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
          D
        </div>
      }
      status={
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Active
          </span>
        </div>
      }
      tabs={{
        items: [
          { id: 'overview', label: 'Overview' },
          { id: 'details', label: 'Details' },
          { id: 'activity', label: 'Activity' },
        ],
        activeTab: 'overview',
        onTabChange: (tabId) => console.log('Switch to tab:', tabId),
      }}
      metaSidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div>Jan 1, 2024</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div>Jan 10, 2024</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">📊</span>
              <span className="text-sm font-medium">Metric 1</span>
            </div>
            <div className="text-2xl font-bold">42</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">📈</span>
              <span className="text-sm font-medium">Metric 2</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">⏱️</span>
              <span className="text-sm font-medium">Metric 3</span>
            </div>
            <div className="text-2xl font-bold">12d</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Content</h3>
          <div className="prose max-w-none">
            <p>Detailed content for this item goes here. This is a placeholder that will be replaced with actual content.</p>
          </div>
        </div>
      </div>
    </DetailLayout>
  );
}
