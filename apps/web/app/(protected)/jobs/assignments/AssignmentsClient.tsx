'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Input, Skeleton } from '@ghxstship/ui';
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
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-purple-100 text-purple-800';
      case 'contributor':
        return 'bg-blue-100 text-blue-800';
      case 'reviewer':
        return 'bg-green-100 text-green-800';
      case 'consultant':
        return 'bg-orange-100 text-orange-800';
      case 'specialist':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
          <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
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
              className="px-3 py-2 border border-border rounded-md bg-background"
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Total Assignments</p>
              <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Completed</p>
              <p className="text-2xl font-bold text-purple-600">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Avg Utilization</p>
              <p className="text-2xl font-bold text-indigo-600">
                {assignments.length > 0 
                  ? Math.round(assignments
                      .map(a => calculateUtilization(a.estimated_hours, a.actual_hours))
                      .filter(u => u !== null)
                      .reduce((sum, u) => sum + (u || 0), 0) / 
                    assignments.filter(a => calculateUtilization(a.estimated_hours, a.actual_hours) !== null).length) || 0
                  : 0}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-indigo-500" />
          </div>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-64 mb-2" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
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
              <Card key={assignment.id} className={`p-6 hover:shadow-md transition-shadow ${isLate ? 'border-red-200 bg-red-50/30' : isDue ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-foreground/60" />
                          {assignment.job_title}
                          {(isDue || isLate) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${isLate ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <div className="flex items-center gap-1">
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
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(assignment.assignment_type)}>
                          {assignment.assignment_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground/70 mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(assignment.start_date).toLocaleDateString()}
                          {assignment.end_date && ` - ${new Date(assignment.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                      {assignment.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            Est: {assignment.estimated_hours}h
                            {assignment.actual_hours && ` / Actual: ${assignment.actual_hours}h`}
                          </span>
                        </div>
                      )}
                      {assignment.hourly_rate && (
                        <div className="flex items-center gap-1">
                          <span>{formatHourlyRate(assignment.hourly_rate)}/hr</span>
                        </div>
                      )}
                    </div>

                    {/* Workload and Utilization */}
                    <div className="flex items-center gap-6 mb-3">
                      {assignment.workload_percentage && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground/70">Workload</span>
                            <span className="text-xs text-foreground/70">{assignment.workload_percentage}%</span>
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(assignment.workload_percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {utilization !== null && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground/70">Utilization</span>
                            <span className="text-xs text-foreground/70">{utilization}%</span>
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                utilization > 110 ? 'bg-red-500' : 
                                utilization > 100 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {assignment.skills_required && assignment.skills_required.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-foreground/70 mb-1 block">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {assignment.skills_required.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {assignment.skills_required.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{assignment.skills_required.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {assignment.notes && (
                      <div className="mt-3 p-2 bg-accent rounded-md">
                        <p className="text-xs text-foreground/70">
                          <strong>Notes:</strong> {assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-foreground/50">
                    Created: {new Date(assignment.created_at).toLocaleDateString()}
                    {assignment.updated_at !== assignment.created_at && (
                      <span> • Updated: {new Date(assignment.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button>
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      Track Time
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <UsersIcon className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No assignments found</h3>
            <p className="text-sm text-foreground/70 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first assignment.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
