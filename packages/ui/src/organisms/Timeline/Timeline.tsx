/**
 * Timeline Component — Event Timeline
 * Display events in chronological order
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: LucideIcon;
  color?: string;
}

export interface TimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Timeline Component
 */
export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
}) => {
  const sortedItems = [...items].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  if (orientation === 'horizontal') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedItems.map((item, index) => (
          <div key={item.id} className="flex flex-col items-center min-w-[200px]">
            <div
              className={`
                w-10 h-10 rounded-full
                flex items-center justify-center
                ${item.color ? '' : 'bg-[var(--color-primary)]'}
                text-white
              `}
              style={item.color ? { backgroundColor: item.color } : undefined}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
            </div>
            
            {index < sortedItems.length - 1 && (
              <div className="h-px flex-1 bg-[var(--color-border)] my-2" />
            )}
            
            <div className="text-center mt-2">
              <div className="font-medium text-sm">{item.title}</div>
              {item.description && (
                <div className="text-xs text-[var(--color-foreground-secondary)] mt-1">
                  {item.description}
                </div>
              )}
              <div className="text-xs text-[var(--color-foreground-muted)] mt-1">
                {item.timestamp.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedItems.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex-shrink-0
                flex items-center justify-center
                ${item.color ? '' : 'bg-[var(--color-primary)]'}
                text-white
              `}
              style={item.color ? { backgroundColor: item.color } : undefined}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
            </div>
            
            {index < sortedItems.length - 1 && (
              <div className="w-px flex-1 bg-[var(--color-border)] mt-2" />
            )}
          </div>
          
          <div className="flex-1 pb-8">
            <div className="font-medium">{item.title}</div>
            {item.description && (
              <div className="text-sm text-[var(--color-foreground-secondary)] mt-1">
                {item.description}
              </div>
            )}
            <div className="text-sm text-[var(--color-foreground-muted)] mt-2">
              {item.timestamp.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

Timeline.displayName = 'Timeline';
