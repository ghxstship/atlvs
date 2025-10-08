'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Columns3, Plus } from 'lucide-react';

interface Column {
  id: string;
  title: string;
  items?: unknown[];
}

interface KanbanViewProps {
  data?: unknown[];
  columns?: Column[];
  onMove?: (item: unknown, toColumn: string) => void;
}

export default function KanbanView({ data = [], columns: customColumns, onMove }: KanbanViewProps) {
  const defaultColumns: Column[] = [
    { id: 'draft', title: 'Draft', items: [] },
    { id: 'active', title: 'Active', items: [] },
    { id: 'completed', title: 'Completed', items: [] },
  ];
  
  const columns = customColumns || defaultColumns;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Columns3 className="h-5 w-5" />
          Kanban Board
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{column.title}</h4>
              <span className="text-sm text-muted-foreground">
                {column.items?.length || 0}
              </span>
            </div>
            
            <div className="space-y-2 min-h-[200px] p-3 bg-muted/30 rounded-lg">
              {column.items?.map((item: any, index) => (
                <Card key={item?.id || index} className="p-3 cursor-move hover:shadow-md transition-shadow">
                  <h5 className="font-medium text-sm">
                    {item?.name || item?.title || 'Untitled'}
                  </h5>
                  {item?.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </Card>
              ))}
              
              <button className="w-full p-3 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
