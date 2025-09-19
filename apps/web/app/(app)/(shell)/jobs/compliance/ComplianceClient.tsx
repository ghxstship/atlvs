'use client';


import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, UnifiedInput, Skeleton } from '@ghxstship/ui';
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

  const filteredCompliance = compliance.filter((item: any) => {
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
        return 'bg-warning/10 color-warning';
      case 'in_progress':
        return 'bg-primary/10 color-primary';
      case 'compliant':
        return 'bg-success/10 color-success';
      case 'non_compliant':
        return 'bg-destructive/10 color-destructive';
      case 'expired':
        return 'bg-warning/10 color-warning';
      case 'waived':
        return 'bg-secondary color-muted';
      default:
        return 'bg-secondary color-muted';
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
        return 'bg-secondary color-muted';
      case 'medium':
        return 'bg-primary/10 color-primary';
      case 'high':
        return 'bg-warning/10 color-warning';
      case 'critical':
        return 'bg-destructive/10 color-destructive';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'regulatory':
        return 'bg-secondary/10 color-secondary';
      case 'safety':
        return 'bg-destructive/10 color-destructive';
      case 'quality':
        return 'bg-primary/10 color-primary';
      case 'security':
        return 'bg-primary/10 color-primary';
      case 'environmental':
        return 'bg-success/10 color-success';
      case 'legal':
        return 'bg-warning/10 color-warning';
      case 'financial':
        return 'bg-warning/10 color-warning';
      default:
        return 'bg-secondary color-muted';
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
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
          <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-sm" />
          Add Compliance Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1">
            <UnifiedInput               placeholder="Search compliance items..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-sm">
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
              className=" px-md py-sm border border-border rounded-md bg-background"
            >
              {STATUS_OPTIONS.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={kindFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKindFilter(e.target.value)}
              className=" px-md py-sm border border-border rounded-md bg-background"
            >
              {KIND_OPTIONS.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriorityFilter(e.target.value)}
              className=" px-md py-sm border border-border rounded-md bg-background"
            >
              {PRIORITY_OPTIONS.map((option: any) => (
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
              <p className="text-body-sm form-label color-foreground/70">Total Items</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{compliance.length}</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 color-primary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Compliant</p>
              <p className="text-heading-3 text-heading-3 color-success">
                {compliance.filter(c => c.status === 'compliant').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 color-success" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Non-Compliant</p>
              <p className="text-heading-3 text-heading-3 color-destructive">
                {compliance.filter(c => c.status === 'non_compliant').length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 color-destructive" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Overdue</p>
              <p className="text-heading-3 text-heading-3 color-warning">
                {compliance.filter(c => isOverdue(c.due_at)).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 color-warning" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Critical</p>
              <p className="text-heading-3 text-heading-3 color-secondary">
                {compliance.filter(c => c.priority === 'critical').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 color-secondary" />
          </div>
        </Card>
      </div>

      {/* Compliance List */}
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
        ) : filteredCompliance.length > 0 ? (
          filteredCompliance.map((item: any) => {
            const StatusIcon = getStatusIcon(item.status);
            const isLate = isOverdue(item.due_at);
            const isDue = isDueSoon(item.due_at);

            return (
              <Card key={item.id} className={`p-lg hover:shadow-elevated transition-shadow ${isLate ? 'border-destructive/20 bg-destructive/5' : isDue ? 'border-warning/20 bg-warning/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-sm">
                      <div>
                        <h3 className="text-body text-heading-4 color-foreground mb-xs flex items-center gap-sm">
                          <StatusIcon className="h-5 w-5 color-foreground/60" />
                          {item.title}
                          {(isDue || isLate) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${isLate ? 'color-destructive' : 'color-warning'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-sm text-body-sm color-foreground/70">
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
                      <div className="flex gap-sm">
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

                    <p className="text-body-sm color-foreground/80 mb-sm line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-lg text-body-sm color-foreground/70 mb-sm">
                      {item.due_at && (
                        <div className={`flex items-center gap-xs ${isLate ? 'color-destructive' : isDue ? 'color-warning' : ''}`}>
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {isLate ? 'Overdue: ' : 'Due: '}
                            {new Date(item.due_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {item.completed_at && (
                        <div className="flex items-center gap-xs color-success">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Completed: {new Date(item.completed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.reviewer && (
                        <div className="flex items-center gap-xs">
                          <span>Reviewer: {item.reviewer}</span>
                        </div>
                      )}
                    </div>

                    {item.requirements && item.requirements.length > 0 && (
                      <div className="mb-sm">
                        <span className="text-body-sm form-label color-foreground/70 mb-xs block">Requirements:</span>
                        <div className="stack-md">
                          {item.requirements.slice(0, 3).map((req, index) => (
                            <div key={index} className="text-body-sm color-foreground/70 flex items-start gap-sm">
                              <span className="color-foreground/40">•</span>
                              <span>{req}</span>
                            </div>
                          ))}
                          {item.requirements.length > 3 && (
                            <div className="text-body-sm color-foreground/50">
                              +{item.requirements.length - 3} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-sm p-sm bg-accent rounded-md">
                        <p className="text-body-sm color-foreground/70">
                          <strong>Notes:</strong> {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                  <div className="text-body-sm color-foreground/50">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                    {item.updated_at !== item.created_at && (
                      <span> • Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
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
                    {item.evidence_url && (
                      <Button>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-xs" />
                        Evidence
                      </Button>
                    )}
                    <Button>
                      <DocumentCheckIcon className="h-4 w-4 mr-xs" />
                      Audit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-2xl text-center">
            <ShieldCheckIcon className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">No compliance items found</h3>
            <p className="text-body-sm color-foreground/70 mb-md">
              {searchTerm || statusFilter !== 'all' || kindFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first compliance requirement.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-sm" />
              Add Compliance Item
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
