'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Input, Skeleton } from '@ghxstship/ui';
import { ProgressBar } from "../../../../_components/ui"
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface AssignmentsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface JobAssignment {
  id: string;
  job_id: string;
  assignee_user_id: string;
  assignment_type: 'lead' | 'contributor' | 'reviewer' | 'consultant' | 'specialist';
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined' | 'cancelled';
  start_date: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  notes?: string;
  skills_required?: string[];
  workload_percentage?: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
  // Related data
  job_title?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'lead', label: 'Lead' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'specialist', label: 'Specialist' },
];

export function AssignmentsClient({ user, orgId, translations }: AssignmentsClientProps) {
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadAssignments();
  }, [orgId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      
      // Load assignments with related job and user data
      const { data, error } = await supabase
        .from('job_assignments')
        .select(`
          *,
          jobs (
            title
          ),
          user_profiles!job_assignments_assignee_user_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to flatten relationships
      const transformedAssignments = (data || []).map((assignment: any) => ({
        ...assignment,
        job_title: assignment.jobs?.title || 'Unknown Job',
        assignee_name: assignment.user_profiles?.full_name || 'Unknown User',
        assignee_email: assignment.user_profiles?.email,
        assignee_avatar: assignment.user_profiles?.avatar_url,
      }));

      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = (assignment.job_title && assignment.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (assignment.assignee_name && assignment.assignee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (assignment.notes && assignment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesType = typeFilter === 'all' || assignment.assignment_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 color-warning';
      case 'accepted':
        return 'bg-primary/10 color-primary';
      case 'active':
        return 'bg-success/10 color-success';
      case 'completed':
        return 'bg-secondary/10 color-secondary';
      case 'declined':
        return 'bg-destructive/10 color-destructive';
      case 'cancelled':
        return 'bg-secondary color-muted';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'accepted':
        return CheckCircleIcon;
      case 'active':
        return CheckCircleIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'declined':
        return XCircleIcon;
      case 'cancelled':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-secondary/10 color-secondary';
      case 'contributor':
        return 'bg-primary/10 color-primary';
      case 'reviewer':
        return 'bg-success/10 color-success';
      case 'consultant':
        return 'bg-warning/10 color-warning';
      case 'specialist':
        return 'bg-primary/10 color-primary';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const formatHourlyRate = (rate?: number) => {
    if (!rate) return 'Rate not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(rate);
  };

  const calculateUtilization = (estimatedHours?: number, actualHours?: number) => {
    if (!estimatedHours || !actualHours) return null;
    return Math.round((actualHours / estimatedHours) * 100);
  };

  const isOverdue = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isDueSoon = (endDate?: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
          <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-sm" />
          Create Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-sm py-sm border border-border rounded-md bg-background"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-sm py-sm border border-border rounded-md bg-background"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-md">
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Total Assignments</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{assignments.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 color-primary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Active</p>
              <p className="text-heading-3 text-heading-3 color-success">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 color-success" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Pending</p>
              <p className="text-heading-3 text-heading-3 color-warning">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 color-warning" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Completed</p>
              <p className="text-heading-3 text-heading-3 color-secondary">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 color-secondary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Avg Utilization</p>
              <p className="text-heading-3 text-heading-3 color-primary">
                {assignments.length > 0 
                  ? Math.round(assignments
                      .map(a => calculateUtilization(a.estimated_hours, a.actual_hours))
                      .filter(u => u !== null)
                      .reduce((sum, u) => sum + (u || 0), 0) / 
                    assignments.filter(a => calculateUtilization(a.estimated_hours, a.actual_hours) !== null).length) || 0
                  : 0}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 color-primary" />
          </div>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="stack-md">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-64 mb-sm" />
                  <Skeleton className="h-4 w-32 mb-sm" />
                  <Skeleton className="h-4 w-full mb-sm" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-sm">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const StatusIcon = getStatusIcon(assignment.status);
            const isLate = isOverdue(assignment.end_date);
            const isDue = isDueSoon(assignment.end_date);
            const utilization = calculateUtilization(assignment.estimated_hours, assignment.actual_hours);

            return (
              <Card key={assignment.id} className={`p-lg hover:shadow-md transition-shadow ${isLate ? 'border-destructive/20 bg-destructive/5' : isDue ? 'border-warning/20 bg-warning/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-sm">
                      <div>
                        <h3 className="text-body text-heading-4 color-foreground mb-xs flex items-center gap-sm">
                          <StatusIcon className="h-5 w-5 color-foreground/60" />
                          {assignment.job_title}
                          {(isDue || isLate) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${isLate ? 'color-destructive' : 'color-warning'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-sm text-body-sm color-foreground/70">
                          <div className="flex items-center gap-xs">
                            {assignment.assignee_avatar ? (
                              <img 
                                src={assignment.assignee_avatar} 
                                alt={assignment.assignee_name}
                                className="h-4 w-4 rounded-full"
                              />
                            ) : (
                              <UserIcon className="h-4 w-4" />
                            )}
                            <span>{assignment.assignee_name}</span>
                          </div>
                          {assignment.assignee_email && (
                            <>
                              <span>•</span>
                              <span>{assignment.assignee_email}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(assignment.assignment_type)}>
                          {assignment.assignment_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-body-sm color-foreground/70 mb-sm">
                      <div className="flex items-center gap-xs">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(assignment.start_date).toLocaleDateString()}
                          {assignment.end_date && ` - ${new Date(assignment.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {assignment.estimated_hours && (
                        <div className="flex items-center gap-xs">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            Est: {assignment.estimated_hours}h
                            {assignment.actual_hours && ` / Actual: ${assignment.actual_hours}h`}
                          </span>
                        </div>
                      )}
                      {assignment.hourly_rate && (
                        <div className="flex items-center gap-xs">
                          <span>{formatHourlyRate(assignment.hourly_rate)}/hr</span>
                        </div>
                      )}
                    </div>

                    {/* Workload and Utilization */}
                    <div className="flex items-center gap-lg mb-sm">
                      {assignment.workload_percentage && (
                        <div>
                          <div className="flex items-center justify-between mb-xs">
                            <span className="text-body-sm form-label color-foreground/70">Workload</span>
                            <span className="text-body-sm color-foreground/70">{assignment.workload_percentage}%</span>
                          </div>
                          <ProgressBar 
                            percentage={assignment.workload_percentage || 0}
                            variant="info"
                            size="md"
                            className="w-24"
                          />
                        </div>
                      )}
                      {utilization !== null && (
                        <div>
                          <div className="flex items-center justify-between mb-xs">
                            <span className="text-body-sm form-label color-foreground/70">Utilization</span>
                            <span className="text-body-sm color-foreground/70">{utilization}%</span>
                          </div>
                          <ProgressBar 
                            percentage={utilization}
                            variant={utilization > 100 ? 'warning' : 'success'}
                            size="md"
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>

                    {assignment.skills_required && assignment.skills_required.length > 0 && (
                      <div className="mb-sm">
                        <span className="text-body-sm form-label color-foreground/70 mb-xs block">Required Skills:</span>
                        <div className="flex flex-wrap gap-xs">
                          {assignment.skills_required.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-body-sm">
                              {skill}
                            </Badge>
                          ))}
                          {assignment.skills_required.length > 5 && (
                            <Badge variant="secondary" className="text-body-sm">
                              +{assignment.skills_required.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {assignment.notes && (
                      <div className="mt-sm p-sm bg-accent rounded-md">
                        <p className="text-body-sm color-foreground/70">
                          <strong>Notes:</strong> {assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                  <div className="text-body-sm color-foreground/50">
                    Created: {new Date(assignment.created_at).toLocaleDateString()}
                    {assignment.updated_at !== assignment.created_at && (
                      <span> • Updated: {new Date(assignment.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-sm">
                    <Button>
                      <EyeIcon className="h-4 w-4 mr-xs" />
                      View
                    </Button>
                    <Button>
                      <PencilIcon className="h-4 w-4 mr-xs" />
                      Edit
                    </Button>
                    <Button>
                      <ChartBarIcon className="h-4 w-4 mr-xs" />
                      Track Time
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-2xl text-center">
            <UsersIcon className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">No assignments found</h3>
            <p className="text-body-sm color-foreground/70 mb-md">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first assignment.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-sm" />
              Create Assignment
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
