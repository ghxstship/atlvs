/**
 * GanttView Component — Timeline with Dependencies
 * Project timeline with task dependencies and milestones
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Diamond } from 'lucide-react';
import type { ViewProps, GanttTask } from '../types';

export interface GanttViewProps extends ViewProps {
  /** Start date field */
  startField: string;
  
  /** End date field */
  endField: string;
  
  /** Title field */
  titleField: string;
  
  /** Progress field */
  progressField?: string;
  
  /** Dependencies field */
  dependenciesField?: string;
  
  /** Milestone field */
  milestoneField?: string;
  
  /** Custom className */
  className?: string;
}

/**
 * GanttView Component
 */
export function GanttView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  startField,
  endField,
  titleField,
  progressField,
  milestoneField,
  className = '',
}: GanttViewProps) {
  // Calculate timeline range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (data.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        totalDays: 30,
      };
    }
    
    const dates = data.flatMap(record => [
      new Date(record[startField]),
      new Date(record[endField]),
    ]);
    
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 7);
    
    const days = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24));
    
    return { minDate: min, maxDate: max, totalDays: days };
  }, [data, startField, endField]);
  
  // Generate month headers
  const months = useMemo(() => {
    const result: Array<{ label: string; days: number }> = [];
    const current = new Date(minDate);
    
    while (current <= maxDate) {
      const month = current.getMonth();
      const year = current.getFullYear();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const start = current < monthStart ? monthStart : current;
      const end = maxDate < monthEnd ? maxDate : monthEnd;
      
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      result.push({
        label: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        days,
      });
      
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }
    
    return result;
  }, [minDate, maxDate]);
  
  // Calculate task position and width
  const getTaskStyle = (record: any) => {
    const start = new Date(record[startField]);
    const end = new Date(record[endField]);
    
    const startOffset = Math.max(0, (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading data</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex border-b border-border">
        {/* Task names column */}
        <div className="w-64 flex-shrink-0 p-4 font-semibold border-r border-border">
          Tasks
        </div>
        
        {/* Timeline header */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex">
            {months.map((month, index) => (
              <div
                key={index}
                className="px-4 py-4 border-r border-border text-sm font-medium text-center"
                style={{ width: `${(month.days / totalDays) * 100}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Task names */}
          <div className="w-64 flex-shrink-0 border-r border-border">
            {data.map(record => (
              <div
                key={record.id}
                className="
                  px-4 h-12 flex items-center
                  border-b border-border
                  hover:bg-muted
                  cursor-pointer
                  transition-colors
                "
                onClick={() => onRecordClick?.(record)}
              >
                <div className="flex items-center gap-2 truncate">
                  {milestoneField && record[milestoneField] && (
                    <Diamond className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span className="truncate">{record[titleField]}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline */}
          <div className="flex-1 relative">
            {/* Today indicator */}
            {(() => {
              const today = new Date();
              if (today >= minDate && today <= maxDate) {
                const offset = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
                return (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-destructive z-10"
                    style={{ left: `${offset}%` }}
                  />
                );
              }
              return null;
            })()}
            
            {/* Tasks */}
            {data.map(record => {
              const isMilestone = milestoneField && record[milestoneField];
              const progress = progressField ? record[progressField] : 0;
              const style = getTaskStyle(record);
              
              return (
                <div
                  key={record.id}
                  className="h-12 border-b border-border flex items-center px-2"
                >
                  <div
                    className="relative h-6 rounded cursor-pointer group"
                    style={style}
                    onClick={() => onRecordClick?.(record)}
                  >
                    {isMilestone ? (
                      <div className="
                        w-6 h-6 rotate-45
                        bg-primary
                        border-2 border-[var(--color-primary-foreground)]
                      " />
                    ) : (
                      <>
                        <div className="
                          absolute inset-0 rounded
                          bg-primary/20
                          border border-primary
                          group-hover:bg-primary/30
                          transition-colors
                        " />
                        {progress > 0 && (
                          <div
                            className="
                              absolute inset-0 rounded
                              bg-primary
                              transition-all
                            "
                            style={{ width: `${progress}%` }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

GanttView.displayName = 'GanttView';
