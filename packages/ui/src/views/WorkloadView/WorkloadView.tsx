/**
 * WorkloadView Component — Resource Scheduling
 * Resource allocation and workload visualization
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useMemo } from 'react';
import { Users, Calendar } from 'lucide-react';
import type { ViewProps, WorkloadResource, WorkloadAssignment } from '../types';

export interface WorkloadViewProps extends ViewProps {
  /** Resources */
  resources: WorkloadResource[];
  
  /** Resource ID field */
  resourceField: string;
  
  /** Start date field */
  startField: string;
  
  /** End date field */
  endField: string;
  
  /** Effort field (hours) */
  effortField: string;
  
  /** Title field */
  titleField: string;
  
  /** Custom className */
  className?: string;
}

/**
 * WorkloadView Component
 */
export function WorkloadView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  resources,
  resourceField,
  startField,
  endField,
  effortField,
  titleField,
  className = '',
}: WorkloadViewProps) {
  // Calculate timeline range
  const { minDate, maxDate, weeks } = useMemo(() => {
    if (data.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        weeks: 4,
      };
    }
    
    const dates = data.flatMap(record => [
      new Date(record[startField]),
      new Date(record[endField]),
    ]);
    
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Round to week boundaries
    min.setDate(min.getDate() - min.getDay());
    max.setDate(max.getDate() + (6 - max.getDay()));
    
    const weekCount = Math.ceil((max.getTime() - min.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return { minDate: min, maxDate: max, weeks: weekCount };
  }, [data, startField, endField]);
  
  // Group assignments by resource
  const assignmentsByResource = useMemo(() => {
    const grouped: Record<string, typeof data> = {};
    resources.forEach(resource => {
      grouped[resource.id] = [];
    });
    
    data.forEach(record => {
      const resourceId = record[resourceField];
      if (grouped[resourceId]) {
        grouped[resourceId].push(record);
      }
    });
    
    return grouped;
  }, [data, resources, resourceField]);
  
  // Calculate utilization
  const getUtilization = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return 0;
    
    const assignments = assignmentsByResource[resourceId] || [];
    const totalEffort = assignments.reduce((sum, a) => sum + (a[effortField] || 0), 0);
    
    return (totalEffort / resource.capacity) * 100;
  };
  
  // Get assignment position
  const getAssignmentStyle = (record: any) => {
    const start = new Date(record[startField]);
    const end = new Date(record[endField]);
    
    const startOffset = (start.getTime() - minDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const duration = (end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000);
    
    const left = (startOffset / weeks) * 100;
    const width = (duration / weeks) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[var(--color-error)] font-medium">Error loading workload</p>
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex border-b border-[var(--color-border)]">
        {/* Resources column */}
        <div className="w-64 flex-shrink-0 p-4 font-semibold border-r border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Resources
          </div>
        </div>
        
        {/* Timeline header */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex">
            {Array.from({ length: weeks }, (_, i) => {
              const weekStart = new Date(minDate);
              weekStart.setDate(weekStart.getDate() + i * 7);
              
              return (
                <div
                  key={i}
                  className="flex-1 px-2 py-4 border-r border-[var(--color-border)] text-center"
                  style={{ minWidth: '100px' }}
                >
                  <div className="text-xs font-medium">
                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Resources */}
          <div className="w-64 flex-shrink-0 border-r border-[var(--color-border)]">
            {resources.map(resource => {
              const utilization = getUtilization(resource.id);
              const overAllocated = utilization > 100;
              
              return (
                <div
                  key={resource.id}
                  className="h-20 px-4 py-3 border-b border-[var(--color-border)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium truncate">{resource.name}</span>
                    <span
                      className={`
                        text-xs font-medium
                        ${overAllocated ? 'text-[var(--color-error)]' : 'text-[var(--color-foreground-secondary)]'}
                      `}
                    >
                      {utilization.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-muted)] overflow-hidden">
                    <div
                      className={`
                        h-full rounded-full transition-all
                        ${overAllocated ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'}
                      `}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Timeline */}
          <div className="flex-1 relative">
            {resources.map(resource => {
              const assignments = assignmentsByResource[resource.id] || [];
              
              return (
                <div
                  key={resource.id}
                  className="h-20 border-b border-[var(--color-border)] relative"
                >
                  {/* Week grid */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: weeks }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-[var(--color-border)]"
                        style={{ minWidth: '100px' }}
                      />
                    ))}
                  </div>
                  
                  {/* Assignments */}
                  <div className="absolute inset-0 p-2">
                    {assignments.map(assignment => {
                      const style = getAssignmentStyle(assignment);
                      const effort = assignment[effortField] || 0;
                      
                      return (
                        <div
                          key={assignment.id}
                          className="
                            absolute h-8 px-2 rounded
                            bg-[var(--color-primary)]
                            text-[var(--color-primary-foreground)]
                            border border-[var(--color-primary)]
                            hover:opacity-90
                            cursor-pointer
                            transition-opacity
                            flex items-center
                            text-xs font-medium
                            truncate
                          "
                          style={style}
                          onClick={() => onRecordClick?.(assignment)}
                          title={`${assignment[titleField]} (${effort}h)`}
                        >
                          {assignment[titleField]}
                        </div>
                      );
                    })}
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

WorkloadView.displayName = 'WorkloadView';
