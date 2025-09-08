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
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ComplianceClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface JobCompliance {
  id: string;
  job_id: string;
  kind: 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'compliant' | 'non_compliant' | 'expired' | 'waived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_at?: string;
  completed_at?: string;
  evidence_url?: string;
  notes?: string;
  requirements?: string[];
  responsible_party?: string;
  reviewer?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  // Related data
  job_title?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
  { value: 'expired', label: 'Expired' },
  { value: 'waived', label: 'Waived' },
];

const KIND_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'safety', label: 'Safety' },
  { value: 'quality', label: 'Quality' },
  { value: 'security', label: 'Security' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'legal', label: 'Legal' },
  { value: 'financial', label: 'Financial' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function ComplianceClient({ user, orgId, translations }: ComplianceClientProps) {
  const [compliance, setCompliance] = useState<JobCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadCompliance();
  }, [orgId]);

  const loadCompliance = async () => {
    try {
      setLoading(true);
      
      // Load compliance items with related job data
      const { data, error } = await supabase
        .from('job_compliance')
        .select(`
          *,
          jobs (
            title
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to flatten relationships
      const transformedCompliance = (data || []).map((item: any) => ({
        ...item,
        job_title: item.jobs?.title || 'Unknown Job',
      }));

      setCompliance(transformedCompliance);
    } catch (error) {
      console.error('Error loading compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompliance = compliance.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.job_title && item.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesKind = kindFilter === 'all' || item.kind === kindFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesKind && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'waived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'in_progress':
        return DocumentTextIcon;
      case 'compliant':
        return CheckCircleIcon;
      case 'non_compliant':
        return XCircleIcon;
      case 'expired':
        return ExclamationTriangleIcon;
      case 'waived':
        return DocumentCheckIcon;
      default:
        return ClockIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'regulatory':
        return 'bg-purple-100 text-purple-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'quality':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-indigo-100 text-indigo-800';
      case 'environmental':
        return 'bg-green-100 text-green-800';
      case 'legal':
        return 'bg-yellow-100 text-yellow-800';
      case 'financial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
          Add Compliance Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search compliance items..."
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
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {PRIORITY_OPTIONS.map((option) => (
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
              <p className="text-sm font-medium text-foreground/70">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{compliance.length}</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Compliant</p>
              <p className="text-2xl font-bold text-green-600">
                {compliance.filter(c => c.status === 'compliant').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600">
                {compliance.filter(c => c.status === 'non_compliant').length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">
                {compliance.filter(c => isOverdue(c.due_at)).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Critical</p>
              <p className="text-2xl font-bold text-purple-600">
                {compliance.filter(c => c.priority === 'critical').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Compliance List */}
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
        ) : filteredCompliance.length > 0 ? (
          filteredCompliance.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            const isLate = isOverdue(item.due_at);
            const isDue = isDueSoon(item.due_at);

            return (
              <Card key={item.id} className={`p-6 hover:shadow-md transition-shadow ${isLate ? 'border-red-200 bg-red-50/30' : isDue ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-foreground/60" />
                          {item.title}
                          {(isDue || isLate) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${isLate ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>{item.job_title}</span>
                          {item.responsible_party && (
                            <>
                              <span>•</span>
                              <span>Responsible: {item.responsible_party}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getKindColor(item.kind)}>
                          {item.kind}
                        </Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-foreground/70 mb-3">
                      {item.due_at && (
                        <div className={`flex items-center gap-1 ${isLate ? 'text-red-600' : isDue ? 'text-yellow-600' : ''}`}>
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {isLate ? 'Overdue: ' : 'Due: '}
                            {new Date(item.due_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {item.completed_at && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Completed: {new Date(item.completed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.reviewer && (
                        <div className="flex items-center gap-1">
                          <span>Reviewer: {item.reviewer}</span>
                        </div>
                      )}
                    </div>

                    {item.requirements && item.requirements.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-foreground/70 mb-1 block">Requirements:</span>
                        <div className="space-y-1">
                          {item.requirements.slice(0, 3).map((req, index) => (
                            <div key={index} className="text-xs text-foreground/70 flex items-start gap-2">
                              <span className="text-foreground/40">•</span>
                              <span>{req}</span>
                            </div>
                          ))}
                          {item.requirements.length > 3 && (
                            <div className="text-xs text-foreground/50">
                              +{item.requirements.length - 3} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-3 p-2 bg-accent rounded-md">
                        <p className="text-xs text-foreground/70">
                          <strong>Notes:</strong> {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-foreground/50">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                    {item.updated_at !== item.created_at && (
                      <span> • Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {item.evidence_url && (
                      <Button variant="ghost" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Evidence
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <DocumentCheckIcon className="h-4 w-4 mr-1" />
                      Audit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No compliance items found</h3>
            <p className="text-sm text-foreground/70 mb-4">
              {searchTerm || statusFilter !== 'all' || kindFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first compliance requirement.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Compliance Item
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
