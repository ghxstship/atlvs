'use client';

import { useState } from 'react';
import { Badge, Button } from '@ghxstship/ui';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ScheduleData {
  projects: Array<{ 
    id: string; 
    name: string; 
    status: string; 
    starts_at: string | null; 
    ends_at: string | null;
    budget: number;
  }>;
  milestones: Array<{ 
    id: string; 
    title: string; 
    due_at: string; 
    status: string; 
    project_id: string;
    project?: { name: string };
  }>;
  tasks: Array<{ 
    id: string; 
    title: string; 
    status: string; 
    due_at: string | null; 
    project_id: string;
    project?: { name: string };
  }>;
}

export default function ScheduleClient({ data, orgId }: { data: ScheduleData; orgId: string }) {
  const [view, setView] = useState<'timeline' | 'calendar' | 'list'>('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'in_progress': case 'pending': return 'bg-primary/10 color-primary';
      case 'completed': case 'done': return 'bg-success/10 color-success';
      case 'on_hold': case 'blocked': return 'bg-warning/10 color-warning';
      case 'cancelled': return 'bg-destructive/10 color-destructive';
      default: return 'bg-secondary/50 color-muted';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredData = {
    projects: selectedProject === 'all' ? data.projects : data.projects.filter(p => p.id === selectedProject),
    milestones: selectedProject === 'all' ? data.milestones : data.milestones.filter(m => m.project_id === selectedProject),
    tasks: selectedProject === 'all' ? data.tasks : data.tasks.filter(t => t.project_id === selectedProject)
  };

  const upcomingItems = [
    ...filteredData.milestones.map(m => ({ ...m, type: 'milestone', date: m.due_at })),
    ...filteredData.tasks.map(t => ({ ...t, type: 'task', date: t.due_at }))
  ]
    .filter(item => item.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 10);

  return (
    <div className="stack-lg">
      {/* Controls */}
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <Filter className="w-4 h-4 color-muted" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded border px-sm py-xs text-body-sm"
          >
            <option value="all">All Projects</option>
            {data.projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-sm">
          <Button
            variant={view === 'timeline' ? 'primary' : 'outline'}
           
            onClick={() => setView('timeline')}
          >
            <BarChart3 className="w-4 h-4 mr-xs" />
            Timeline
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
           
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4 mr-xs" />
            Calendar
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
           
            onClick={() => setView('list')}
          >
            <Clock className="w-4 h-4 mr-xs" />
            List
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="stack-md">
          <h3 className="text-body text-heading-4">Project Timeline</h3>
          <div className="stack-sm">
            {filteredData.projects.map(project => (
              <div key={project.id} className="border rounded-lg p-md">
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <h4 className="form-label">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-body-sm color-muted">
                    {formatCurrency(project.budget)}
                  </div>
                </div>
                
                {project.starts_at && project.ends_at && (
                  <div className="flex items-center gap-md text-body-sm color-muted mb-sm">
                    <span>Start: {new Date(project.starts_at).toLocaleDateString()}</span>
                    <span>End: {new Date(project.ends_at).toLocaleDateString()}</span>
                    <span>
                      Duration: {Math.ceil((new Date(project.ends_at).getTime() - new Date(project.starts_at).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}

                {/* Project milestones */}
                <div className="stack-sm">
                  {filteredData.milestones
                    .filter(m => m.project_id === project.id)
                    .map(milestone => (
                      <div key={milestone.id} className="flex items-center gap-sm p-sm bg-secondary/50 rounded">
                        <CheckCircle className="w-4 h-4 color-primary" />
                        <span className="flex-1">{milestone.title}</span>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                        <span className={`text-body-sm ${isOverdue(milestone.due_at) ? 'color-destructive' : 'color-muted'}`}>
                          {new Date(milestone.due_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="stack-md">
          <div className="flex items-center justify-between">
            <h3 className="text-body text-heading-4">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-sm">
              <Button
                variant="outline"
               
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
               
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
               
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-xs text-center text-body-sm form-label color-muted mb-sm">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-xs">
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay() + i);
              
              const dayItems = upcomingItems.filter(item => 
                item.date && new Date(item.date).toDateString() === startDate.toDateString()
              );

              const isCurrentMonth = startDate.getMonth() === currentMonth.getMonth();
              const isToday = startDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`min-h-20 p-xs border rounded ${
                    isCurrentMonth ? 'bg-background' : 'bg-secondary/50'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`text-body-sm ${isCurrentMonth ? 'color-foreground' : 'color-muted'}`}>
                    {startDate.getDate()}
                  </div>
                  <div className="stack-xs">
                    {dayItems.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className={`text-body-sm p-xs rounded truncate ${
                          item.type === 'milestone' ? 'bg-primary/10 color-primary' : 'bg-success/10 color-success'
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-body-sm color-muted">+{dayItems.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="stack-md">
          <h3 className="text-body text-heading-4">Upcoming Items</h3>
          <div className="stack-sm">
            {upcomingItems.map((item, index) => (
              <div key={index} className="flex items-center gap-md p-sm border rounded-lg hover:bg-secondary/50">
                <div className="flex items-center gap-sm">
                  {item.type === 'milestone' ? (
                    <CheckCircle className="w-4 h-4 color-primary" />
                  ) : (
                    <Clock className="w-4 h-4 color-success" />
                  )}
                  <span className="text-body-sm form-label capitalize">{item.type}</span>
                </div>
                
                <div className="flex-1">
                  <div className="form-label">{item.title}</div>
                  <div className="text-body-sm color-muted">{item.project?.name}</div>
                </div>

                <div className="flex items-center gap-sm">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <div className={`text-body-sm ${isOverdue(item.date!) ? 'color-destructive form-label' : 'color-muted'}`}>
                    {isOverdue(item.date!) && <AlertCircle className="w-4 h-4 inline mr-xs" />}
                    {new Date(item.date!).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md pt-lg border-t">
        <div className="text-center">
          <div className="text-heading-3 text-heading-3 color-primary">{filteredData.projects.length}</div>
          <div className="text-body-sm color-muted">Active Projects</div>
        </div>
        <div className="text-center">
          <div className="text-heading-3 text-heading-3 color-success">{filteredData.milestones.length}</div>
          <div className="text-body-sm color-muted">Milestones</div>
        </div>
        <div className="text-center">
          <div className="text-heading-3 text-heading-3 color-warning">{filteredData.tasks.length}</div>
          <div className="text-body-sm color-muted">Scheduled Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-heading-3 text-heading-3 color-destructive">
            {upcomingItems.filter(item => isOverdue(item.date!)).length}
          </div>
          <div className="text-body-sm color-muted">Overdue Items</div>
        </div>
      </div>
    </div>
  );
}
