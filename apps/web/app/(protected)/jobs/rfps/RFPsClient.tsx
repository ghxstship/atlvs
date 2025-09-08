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

  useEffect(() => {
    loadRFPs();
  }, [orgId]);

  const loadRFPs = async () => {
    try {
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
  };

  const filteredRFPs = rfps.filter((rfp) => {
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
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'awarded':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-blue-100 text-blue-800';
      case 'products':
        return 'bg-green-100 text-green-800';
      case 'consulting':
        return 'bg-purple-100 text-purple-800';
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'technology':
        return 'bg-indigo-100 text-indigo-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (min?: number, max?: number, currency: string = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
          <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create RFP
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search RFPs..."
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
              <p className="text-sm font-medium text-foreground/70">Total RFPs</p>
              <p className="text-2xl font-bold text-foreground">{rfps.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Open</p>
              <p className="text-2xl font-bold text-green-600">
                {rfps.filter(r => r.status === 'open').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Published</p>
              <p className="text-2xl font-bold text-blue-600">
                {rfps.filter(r => r.status === 'published').length}
              </p>
            </div>
            <PaperAirplaneIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Awarded</p>
              <p className="text-2xl font-bold text-purple-600">
                {rfps.filter(r => r.status === 'awarded').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Total Responses</p>
              <p className="text-2xl font-bold text-orange-600">
                {rfps.reduce((sum, r) => sum + (r.responses_count || 0), 0)}
              </p>
            </div>
            <UsersIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* RFPs List */}
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
        ) : filteredRFPs.length > 0 ? (
          filteredRFPs.map((rfp) => {
            const StatusIcon = getStatusIcon(rfp.status);
            const isUrgent = isDeadlineApproaching(rfp.submission_deadline);
            const isLate = isOverdue(rfp.submission_deadline);

            return (
              <Card key={rfp.id} className={`p-6 hover:shadow-md transition-shadow ${isLate ? 'border-red-200 bg-red-50/30' : isUrgent ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-foreground/60" />
                          {rfp.title}
                          {(isUrgent || isLate) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${isLate ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>{rfp.issuer_organization}</span>
                          {rfp.responses_count !== undefined && (
                            <>
                              <span>•</span>
                              <span>{rfp.responses_count} responses</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(rfp.status)}>
                          {rfp.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(rfp.type)}>
                          {rfp.type}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                      {rfp.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-foreground/70 mb-3">
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>{formatBudget(rfp.budget_min, rfp.budget_max, rfp.currency)}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isLate ? 'text-red-600' : isUrgent ? 'text-yellow-600' : ''}`}>
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {isLate ? 'Overdue: ' : 'Deadline: '}
                          {new Date(rfp.submission_deadline).toLocaleDateString()}
                        </span>
                      </div>
                      {rfp.project_start_date && (
                        <div className="flex items-center gap-1">
                          <span>Start: {new Date(rfp.project_start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {rfp.project_duration && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{rfp.project_duration}</span>
                        </div>
                      )}
                    </div>

                    {rfp.requirements && rfp.requirements.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-foreground/70 mb-1 block">Key Requirements:</span>
                        <div className="space-y-1">
                          {rfp.requirements.slice(0, 3).map((req, index) => (
                            <div key={index} className="text-xs text-foreground/70 flex items-start gap-2">
                              <span className="text-foreground/40">•</span>
                              <span>{req}</span>
                            </div>
                          ))}
                          {rfp.requirements.length > 3 && (
                            <div className="text-xs text-foreground/50">
                              +{rfp.requirements.length - 3} more requirements
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {rfp.evaluation_criteria && rfp.evaluation_criteria.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-foreground/70 mb-1 block">Evaluation Criteria:</span>
                        <div className="flex flex-wrap gap-1">
                          {rfp.evaluation_criteria.slice(0, 4).map((criteria, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {criteria}
                            </Badge>
                          ))}
                          {rfp.evaluation_criteria.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rfp.evaluation_criteria.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-foreground/50">
                    Created: {new Date(rfp.created_at).toLocaleDateString()}
                    {rfp.published_at && (
                      <span> • Published: {new Date(rfp.published_at).toLocaleDateString()}</span>
                    )}
                    {rfp.contact_email && (
                      <span> • Contact: {rfp.contact_email}</span>
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
                    {rfp.document_url && (
                      <Button variant="ghost" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    {rfp.status === 'open' && (
                      <Button variant="ghost" size="sm">
                        <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No RFPs found</h3>
            <p className="text-sm text-foreground/70 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first RFP.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create RFP
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
