'use client';


import { CalendarIcon, Download, Edit } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import {
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
  UnifiedInput
} from "@ghxstship/ui";
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
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface RFPsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface RFP {
  id: string;
  title: string;
  description: string;
  issuer_organization: string;
  status: 'draft' | 'published' | 'open' | 'closed' | 'awarded' | 'cancelled';
  type: 'services' | 'products' | 'consulting' | 'construction' | 'technology' | 'other';
  budget_min?: number;
  budget_max?: number;
  currency: string;
  submission_deadline: string;
  project_start_date?: string;
  project_duration?: string;
  requirements?: string[];
  evaluation_criteria?: string[];
  contact_email?: string;
  document_url?: string;
  responses_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'services', label: 'Services' },
  { value: 'products', label: 'Products' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'construction', label: 'Construction' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

export function RFPsClient({ user, orgId, translations }: RFPsClientProps) {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createBrowserClient();

  const loadRFPs = useCallback(async () => {
    try {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setLoading(true);
      
      const { data, error } = await supabase
        .from('rfps')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRfps(data || []);
    } catch (error) {
      console.error('Error loading RFPs:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId, supabase]);

  useEffect(() => {
    loadRFPs();
  }, [loadRFPs]);

  const filteredRFPs = rfps.filter((rfp: any) => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfp.issuer_organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfp.status === statusFilter;
    const matchesType = typeFilter === 'all' || rfp.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-secondary color-muted';
      case 'published':
        return 'bg-accent/10 color-accent';
      case 'open':
        return 'bg-success/10 color-success';
      case 'closed':
        return 'bg-warning/10 color-warning';
      case 'awarded':
        return 'bg-secondary/10 color-secondary';
      case 'cancelled':
        return 'bg-destructive/10 color-destructive';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return DocumentTextIcon;
      case 'published':
        return PaperAirplaneIcon;
      case 'open':
        return CheckCircleIcon;
      case 'closed':
        return ClockIcon;
      case 'awarded':
        return CheckCircleIcon;
      case 'cancelled':
        return XCircleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'services':
        return 'bg-accent/10 color-accent';
      case 'products':
        return 'bg-success/10 color-success';
      case 'consulting':
        return 'bg-secondary/10 color-secondary';
      case 'construction':
        return 'bg-warning/10 color-warning';
      case 'technology':
        return 'bg-accent/10 color-accent';
      case 'other':
        return 'bg-secondary color-muted';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const formatBudget = (min?: number, max?: number, currency: string = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    if (max) return `Up to ${formatter.format(max)}`;
    return 'Budget not specified';
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
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
          <PlusIcon className="h-icon-xs w-icon-xs mr-sm" />
          Create RFP
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1">
            <Input               placeholder="Search RFPs..."
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
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeFilter(e.target.value)}
              className=" px-md py-sm border border-border rounded-md bg-background"
            >
              {TYPE_OPTIONS.map((option: any) => (
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
              <p className="text-body-sm form-label color-foreground/70">Total RFPs</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{rfps.length}</p>
            </div>
            <DocumentTextIcon className="h-icon-lg w-icon-lg color-accent" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Open</p>
              <p className="text-heading-3 text-heading-3 color-success">
                {rfps.filter(r => r.status === 'open').length}
              </p>
            </div>
            <CheckCircleIcon className="h-icon-lg w-icon-lg color-success" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Published</p>
              <p className="text-heading-3 text-heading-3 color-accent">
                {rfps.filter(r => r.status === 'published').length}
              </p>
            </div>
            <PaperAirplaneIcon className="h-icon-lg w-icon-lg color-accent" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Awarded</p>
              <p className="text-heading-3 text-heading-3 color-secondary">
                {rfps.filter(r => r.status === 'awarded').length}
              </p>
            </div>
            <CheckCircleIcon className="h-icon-lg w-icon-lg color-secondary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Total Responses</p>
              <p className="text-heading-3 text-heading-3 color-warning">
                {rfps.reduce((sum, r) => sum + (r.responses_count || 0), 0)}
              </p>
            </div>
            <UsersIcon className="h-icon-lg w-icon-lg color-warning" />
          </div>
        </Card>
      </div>

      {/* RFPs List */}
      <div className="stack-md">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-icon-sm w-container-sm mb-sm" />
                  <Skeleton className="h-icon-xs w-component-xl mb-sm" />
                  <Skeleton className="h-icon-xs w-full mb-sm" />
                  <Skeleton className="h-icon-xs w-3/4" />
                </div>
                <div className="flex gap-sm">
                  <Skeleton className="h-icon-md w-component-md" />
                  <Skeleton className="h-icon-md w-component-lg" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredRFPs.length > 0 ? (
          filteredRFPs.map((rfp: any) => {
            const StatusIcon = getStatusIcon(rfp.status);
            const isUrgent = isDeadlineApproaching(rfp.submission_deadline);
            const isLate = isOverdue(rfp.submission_deadline);

            return (
              <Card key={rfp.id} className={`p-lg hover:shadow-elevated transition-shadow ${isLate ? 'border-destructive/20 bg-destructive/5' : isUrgent ? 'border-warning/20 bg-warning/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-sm">
                      <div>
                        <h3 className="text-body text-heading-4 color-foreground mb-xs flex items-center gap-sm">
                          <StatusIcon className="h-icon-sm w-icon-sm color-foreground/60" />
                          {rfp.title}
                          {(isUrgent || isLate) && (
                            <ExclamationTriangleIcon className={`h-icon-xs w-icon-xs ${isLate ? 'color-destructive' : 'color-warning'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-sm text-body-sm color-foreground/70">
                          <BuildingOfficeIcon className="h-icon-xs w-icon-xs" />
                          <span>{rfp.issuer_organization}</span>
                          {rfp.responses_count !== undefined && (
                            <>
                              <span>•</span>
                              <span>{rfp.responses_count} responses</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        <Badge className={getStatusColor(rfp.status)}>
                          {rfp.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(rfp.type)}>
                          {rfp.type}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-body-sm color-foreground/80 mb-sm line-clamp-xs">
                      {rfp.description}
                    </p>

                    <div className="flex items-center gap-lg text-body-sm color-foreground/70 mb-sm">
                      <div className="flex items-center gap-xs">
                        <CurrencyDollarIcon className="h-icon-xs w-icon-xs" />
                        <span>{formatBudget(rfp.budget_min, rfp.budget_max, rfp.currency)}</span>
                      </div>
                      <div className={`flex items-center gap-xs ${isLate ? 'color-destructive' : isUrgent ? 'color-warning' : ''}`}>
                        <CalendarIcon className="h-icon-xs w-icon-xs" />
                        <span>
                          {isLate ? 'Overdue: ' : 'Deadline: '}
                          {new Date(rfp.submission_deadline).toLocaleDateString()}
                        </span>
                      </div>
                      {rfp.project_start_date && (
                        <div className="flex items-center gap-xs">
                          <span>Start: {new Date(rfp.project_start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {rfp.project_duration && (
                        <div className="flex items-center gap-xs">
                          <ClockIcon className="h-icon-xs w-icon-xs" />
                          <span>{rfp.project_duration}</span>
                        </div>
                      )}
                    </div>

                    {rfp.requirements && rfp.requirements.length > 0 && (
                      <div className="mb-sm">
                        <span className="text-body-sm form-label color-foreground/70 mb-xs block">Key Requirements:</span>
                        <div className="stack-md">
                          {rfp.requirements.slice(0, 3).map((req, index) => (
                            <div key={index} className="text-body-sm color-foreground/70 flex items-start gap-sm">
                              <span className="color-foreground/40">•</span>
                              <span>{req}</span>
                            </div>
                          ))}
                          {rfp.requirements.length > 3 && (
                            <div className="text-body-sm color-foreground/50">
                              +{rfp.requirements.length - 3} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {rfp.evaluation_criteria && rfp.evaluation_criteria.length > 0 && (
                      <div className="mb-sm">
                        <span className="text-body-sm form-label color-foreground/70 mb-xs block">Evaluation Criteria:</span>
                        <div className="flex flex-wrap gap-xs">
                          {rfp.evaluation_criteria.slice(0, 4).map((criteria, index) => (
                            <Badge key={index} variant="secondary">
                              {criteria}
                            </Badge>
                          ))}
                          {rfp.evaluation_criteria.length > 4 && (
                            <Badge variant="secondary">
                              +{rfp.evaluation_criteria.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                  <div className="text-body-sm color-foreground/50">
                    Created: {new Date(rfp.created_at).toLocaleDateString()}
                    {rfp.published_at && (
                      <span> • Published: {new Date(rfp.published_at).toLocaleDateString()}</span>
                    )}
                    {rfp.contact_email && (
                      <span> • Contact: {rfp.contact_email}</span>
                    )}
                  </div>
                  <div className="flex gap-sm">
                    <Button>
                      <EyeIcon className="h-icon-xs w-icon-xs mr-xs" />
                      View
                    </Button>
                    <Button>
                      <PencilIcon className="h-icon-xs w-icon-xs mr-xs" />
                      Edit
                    </Button>
                    {rfp.document_url && (
                      <Button>
                        <ArrowDownTrayIcon className="h-icon-xs w-icon-xs mr-xs" />
                        Download
                      </Button>
                    )}
                    {rfp.status === 'open' && (
                      <Button>
                        <PaperAirplaneIcon className="h-icon-xs w-icon-xs mr-xs" />
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-xsxl text-center">
            <DocumentTextIcon className="h-icon-2xl w-icon-2xl color-foreground/30 mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">No RFPs found</h3>
            <p className="text-body-sm color-foreground/70 mb-md">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first RFP.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-icon-xs w-icon-xs mr-sm" />
              Create RFP
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
