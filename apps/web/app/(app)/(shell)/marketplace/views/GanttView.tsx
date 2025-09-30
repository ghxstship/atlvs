import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { GitBranch, Calendar, Clock, User } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceProject } from '../types';

interface GanttViewProps {
  orgId: string;
}

export default function GanttView({ orgId }: GanttViewProps) {
  const { data: projectsResponse, isLoading, error } = useQuery({
    queryKey: ['marketplace-projects', orgId],
    queryFn: () => marketplaceService.getProjects(orgId),
    refetchInterval: 30000,
  });

  const projects = projectsResponse || [];

  // Calculate timeline bounds
  const timelineBounds = React.useMemo(() => {
    if (projects.length === 0) return null;

    const dates = projects.flatMap(project => [
      project.start_date ? new Date(project.start_date) : null,
      project.end_date ? new Date(project.end_date) : null,
    ]).filter(Boolean) as Date[];

    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Extend bounds by 30 days on each side
    minDate.setDate(minDate.getDate() - 30);
    maxDate.setDate(maxDate.getDate() + 30);

    return { minDate, maxDate };
  }, [projects]);

  // Generate month columns
  const monthColumns = React.useMemo(() => {
    if (!timelineBounds) return [];

    const columns = [];
    const current = new Date(timelineBounds.minDate);

    while (current <= timelineBounds.maxDate) {
      columns.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: new Date(current),
      });
      current.setMonth(current.getMonth() + 1);
    }

    return columns;
  }, [timelineBounds]);

  const getProjectPosition = (project: MarketplaceProject) => {
    if (!timelineBounds || !project.start_date || !project.end_date) return null;

    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const totalDays = (timelineBounds.maxDate.getTime() - timelineBounds.minDate.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (start.getTime() - timelineBounds.minDate.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 2)}%`,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'open': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="overflow-x-auto">
          <div className="min-w-[800px] space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load Gantt chart</h3>
        <p className="text-muted-foreground">
          Failed to load project timeline data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            Project Timeline
          </h2>
          <p className="text-muted-foreground">
            Visual project scheduling and timeline management
          </p>
        </div>
        <Badge variant="secondary">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects to display</h3>
            <p className="text-muted-foreground">
              Create projects with start and end dates to view the timeline
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project Gantt Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Month Header */}
                <div className="flex border-b mb-4">
                  <div className="w-64 p-3 font-medium border-r bg-muted/50">
                    Project
                  </div>
                  <div className="flex-1 flex">
                    {monthColumns.map((column, index) => (
                      <div
                        key={`${column.year}-${column.month}`}
                        className="flex-1 p-3 text-center font-medium border-r bg-muted/30 text-sm"
                      >
                        {column.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Rows */}
                <div className="space-y-2">
                  {projects.map((project) => {
                    const position = getProjectPosition(project);

                    return (
                      <div key={project.id} className="flex border rounded-lg hover:shadow-sm transition-shadow">
                        {/* Project Info */}
                        <div className="w-64 p-4 border-r">
                          <h3 className="font-medium line-clamp-1 mb-1">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {project.experience_level || 'Any level'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{project.client_id}</span>
                            </div>
                            {project.budget_max && (
                              <div className="flex items-center gap-1">
                                <span>${project.budget_max}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 relative p-4 min-h-[60px]">
                          {position ? (
                            <div
                              className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(project.status)} text-white text-xs flex items-center px-2 font-medium shadow-sm`}
                              style={{
                                left: position.left,
                                width: position.width,
                                minWidth: '60px',
                              }}
                              title={`${project.title} (${new Date(project.start_date!).toLocaleDateString()} - ${new Date(project.end_date!).toLocaleDateString()})`}
                            >
                              <span className="truncate">{project.title}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>No timeline set</span>
                              </div>
                            </div>
                          )}

                          {/* Month grid lines */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {monthColumns.map((_, index) => (
                              <div
                                key={index}
                                className="flex-1 border-r border-muted-foreground/20"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded" />
              <span className="text-sm">Draft</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
