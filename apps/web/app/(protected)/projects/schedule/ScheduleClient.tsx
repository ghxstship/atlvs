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
      case 'active': case 'in_progress': case 'todo': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'done': return 'bg-green-100 text-green-800';
      case 'on_hold': case 'blocked': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded border px-3 py-1 text-sm"
          >
            <option value="all">All Projects</option>
            {data.projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'timeline' ? 'primary' : 'outline'}
           
            onClick={() => setView('timeline')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Timeline
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
           
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Calendar
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
           
            onClick={() => setView('list')}
          >
            <Clock className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <div className="space-y-3">
            {filteredData.projects.map(project => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(project.budget)}
                  </div>
                </div>
                
                {project.starts_at && project.ends_at && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>Start: {new Date(project.starts_at).toLocaleDateString()}</span>
                    <span>End: {new Date(project.ends_at).toLocaleDateString()}</span>
                    <span>
                      Duration: {Math.ceil((new Date(project.ends_at).getTime() - new Date(project.starts_at).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}

                {/* Project milestones */}
                <div className="space-y-2">
                  {filteredData.milestones
                    .filter(m => m.project_id === project.id)
                    .map(milestone => (
                      <div key={milestone.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="flex-1">{milestone.title}</span>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                        <span className={`text-sm ${isOverdue(milestone.due_at) ? 'text-red-600' : 'text-gray-600'}`}>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
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
                  className={`min-h-20 p-1 border rounded ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {startDate.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${
                          item.type === 'milestone' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayItems.length - 2} more</div>
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upcoming Items</h3>
          <div className="space-y-2">
            {upcomingItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {item.type === 'milestone' ? (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium capitalize">{item.type}</span>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.project?.name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <div className={`text-sm ${isOverdue(item.date!) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {isOverdue(item.date!) && <AlertCircle className="w-4 h-4 inline mr-1" />}
                    {new Date(item.date!).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredData.projects.length}</div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{filteredData.milestones.length}</div>
          <div className="text-sm text-gray-600">Milestones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{filteredData.tasks.length}</div>
          <div className="text-sm text-gray-600">Scheduled Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {upcomingItems.filter(item => isOverdue(item.date!)).length}
          </div>
          <div className="text-sm text-gray-600">Overdue Items</div>
        </div>
      </div>
    </div>
  );
}
