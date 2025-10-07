'use client';

import React from 'react';
import { ListLayout } from '@ghxstship/ui/templates';
import { BoardView } from '@ghxstship/ui/organisms';

export default function uassetsPage() {
  // TODO: Implement uassets content using ListLayout + BoardView
  // This is a placeholder - actual implementation needed

  return (
    <ListLayout
      title="uassets"
      subtitle="Manage and track all your uassets"
      actions={
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          New uassets
        </button>
      }
      search={{
        value: '',
        onChange: (value) => console.log('Search:', value),
        placeholder: 'Search uassets...',
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
              {/* TODO: Add uassets filters */}
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
