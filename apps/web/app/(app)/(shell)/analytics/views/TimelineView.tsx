'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Clock, Circle } from 'lucide-react';

interface TimelineViewProps {
  data?: unknown[];
  onItemClick?: (item: unknown) => void;
}

export default function TimelineView({ data = [], onItemClick }: TimelineViewProps) {
  const items = Array.isArray(data) ? data : [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5" />
          Timeline View
        </h3>
        <div className="text-sm text-muted-foreground">
          {items.length} events
        </div>
      </div>
      
      <div className="relative">
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground space-y-2">
              <Clock className="h-12 w-12 mx-auto opacity-50" />
              <p>No timeline events</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {items.map((item: any, index) => (
              <div key={item?.id || index} className="relative pl-8">
                {/* Timeline line */}
                {index !== items.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                
                {/* Timeline content */}
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item?.name || item?.title || 'Untitled'}
                        </h4>
                        {item?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {item?.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : 'No date'}
                      </div>
                    </div>
                    
                    {item?.status && (
                      <div className="mt-3 inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs">
                        <Circle className="h-2 w-2 fill-current" />
                        {item.status}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
