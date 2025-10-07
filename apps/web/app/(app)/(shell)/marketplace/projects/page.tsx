'use client';

import React from 'react';
import { ListLayout } from '@ghxstship/ui/templates';
import { BoardView } from '@ghxstship/ui/organisms';

export default function uprojectsPage() {
  // TODO: Implement uprojects content using ListLayout + BoardView
  // This is a placeholder - actual implementation needed

  return (
    <ListLayout
      title="uprojects"
      subtitle="Manage and track all your uprojects"
      actions={
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          New uprojects
        </button>
      }
      search={{
        value: '',
        onChange: (value) => console.log('Search:', value),
        placeholder: 'Search uprojects...',
      }}
      filters={{
        activeCount: 0,
        onClear: () => console.log('Clear filters'),
      }}
      sidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Filters</h3>
            <div className="space-y-2">
              {/* TODO: Add uprojects filters */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Active
              </label>
            </div>
          </div>
        </div>
      }
    >
      <BoardView
        columns={[
          {
            id: 'todo',
            title: 'To Do',
            status: 'todo',
            color: '#6b7280',
            tasks: [
              // TODO: Add sample tasks
            ]
          }
        ]}
        onTaskClick={(task) => console.log('Task clicked:', task)}
        onTaskEdit={(task) => console.log('Edit task:', task)}
        onTaskDelete={(task) => console.log('Delete task:', task)}
        onTaskCreate={(columnId) => console.log('Create task in:', columnId)}
      />
    </ListLayout>
  );
}
