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
    refetchInterval: 30000
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
        date: new Date(current)
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
      width: `${Math.max((duration / totalDays) * 100, 2)}%`
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
      <div className="space-y-md">
        <div className="h-icon-lg bg-muted animate-pulse rounded" />
        <div className="overflow-x-auto">
          <div className="min-w-content-xlarge space-y-xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-icon-2xl bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-xsxl">
        <GitBranch className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load Gantt chart</h3>
        <p className="text-muted-foreground">
          Failed to load project timeline data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-xs">
            <GitBranch className="h-icon-md w-icon-md" />
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
          <CardContent className="text-center py-xsxl">
            <GitBranch className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
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
              <div className="min-w-content-xlarge">
                {/* Month Header */}
                <div className="flex border-b mb-4">
                  <div className="w-container-sm p-sm font-medium border-r bg-muted/50">
                    Project
                  </div>
                  <div className="flex-1 flex">
                    {monthColumns.map((column, index) => (
                      <div
                        key={`${column.year}-${column.month}`}
                        className="flex-1 p-sm text-center font-medium border-r bg-muted/30 text-sm"
                      >
                        {column.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Rows */}
                <div className="space-y-xs">
                  {projects.map((project) => {
                    const position = getProjectPosition(project);

                    return (
                      <div key={project.id} className="flex border rounded-lg hover:shadow-sm transition-shadow">
                        {/* Project Info */}
                        <div className="w-container-sm p-md border-r">
                          <h3 className="font-medium line-clamp-xs mb-1">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-xs mb-2">
                            <Badge variant="outline" className="text-xs">
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {project.experience_level || 'Any level'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-sm text-xs text-muted-foreground">
                            <div className="flex items-center gap-xs">
                              <User className="h-3 w-3" />
                              <span>{project.client_id}</span>
                            </div>
                            {project.budget_max && (
                              <div className="flex items-center gap-xs">
                                <span>${project.budget_max}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 relative p-md min-h-toolbar">
                          {position ? (
                            <div
                              className={`absolute top-xs/2 transform -translate-y-1/2 h-icon-md rounded ${getStatusColor(project.status)} text-white text-xs flex items-center px-xs font-medium shadow-sm`}
                              style={{
                                left: position.left,
                                width: position.width,
                                minWidth: '60px'
                              }}
                              title={`${project.title} (${new Date(project.start_date!).toLocaleDateString()} - ${new Date(project.end_date!).toLocaleDateString()})`}
                            >
                              <span className="truncate">{project.title}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                              <div className="flex items-center gap-xs">
                                <Clock className="h-icon-xs w-icon-xs" />
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
          <div className="flex flex-wrap gap-md">
            <div className="flex items-center gap-xs">
              <div className="w-icon-xs h-icon-xs bg-green-500 rounded" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-icon-xs h-icon-xs bg-blue-500 rounded" />
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-icon-xs h-icon-xs bg-yellow-500 rounded" />
              <span className="text-sm">Open</span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-icon-xs h-icon-xs bg-gray-500 rounded" />
              <span className="text-sm">Draft</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
