'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Calendar, ChevronRight } from 'lucide-react';

interface GanttViewProps {
  data?: unknown[];
}

export default function GanttView({ data = [] }: GanttViewProps) {
  const projects = Array.isArray(data) ? data : [];

  // Calculate timeline range
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 3);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const months = [];
  let currentMonth = new Date(startDate);
  while (currentMonth <= endDate) {
    months.push(new Date(currentMonth));
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  const getProjectPosition = (project: any) => {
    const projectStart = project.startsAt ? new Date(project.startsAt) : startDate;
    const projectEnd = project.endsAt ? new Date(project.endsAt) : endDate;

    const startOffset = Math.max(0, (projectStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'planning':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'on_hold':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5" />
          Gantt Timeline
        </h3>
        <div className="text-sm text-muted-foreground">
          {projects.length} projects
        </div>
      </div>

      <Card className="p-6 overflow-x-auto">
        {/* Timeline Header */}
        <div className="mb-4">
          <div className="flex border-b pb-2">
            <div className="w-48 flex-shrink-0 font-semibold">Project</div>
            <div className="flex-1 flex">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center text-sm font-medium border-l px-2"
                >
                  {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No projects to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project: any, idx) => {
              const position = getProjectPosition(project);
              const name = typeof project.name === 'string' ? project.name : 'Untitled Project';
              const status = typeof project.status === 'string' ? project.status : 'unknown';

              return (
                <div key={project.id || idx} className="flex items-center group">
                  {/* Project Name */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{name}</span>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8 bg-muted/30 rounded">
                    <div
                      className={`absolute h-6 top-1 rounded ${getStatusColor(status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                      style={{
                        left: position.left,
                        width: position.width
                      }}
                      title={`${name} - ${status}`}
                    >
                      <div className="h-full flex items-center justify-center text-xs text-white font-medium px-2 truncate">
                        {name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex items-center gap-4 text-sm">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>Planning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>On Hold</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
