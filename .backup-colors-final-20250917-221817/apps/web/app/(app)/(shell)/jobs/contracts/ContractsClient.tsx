'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button, Card, Input, Badge, Skeleton } from '@ghxstship/ui';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Building,
  AlertTriangle,
  Eye,
  Download,
  Edit,
  BarChart3
} from 'lucide-react';

// Domain interface for JobContract
interface JobContract {
  id: string;
  organizationId: string;
  jobId: string;
  companyId: string;
  contractType: 'msa' | 'sow' | 'amendment' | 'termination';
  title: string;
  description?: string;
  status: 'draft' | 'pending_review' | 'approved' | 'active' | 'completed' | 'terminated' | 'cancelled';
  startDate: string;
  endDate?: string;
  value: number;
  currency: string;
  paymentTerms?: string;
  documentUrl?: string;
  signedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  milestones?: JobContractMilestone[];
  jobs?: { title: string };
  companies?: { name: string };
  end_date?: string;
  contract_type?: string;
  job_title?: string;
  company_name?: string;
  start_date?: string;
  signed_at?: string;
  created_at?: string;
  document_url?: string;
}

interface JobContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  completedAt?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

interface ContractsClientProps {
  user: User;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'msa', label: 'MSA' },
  { value: 'sow', label: 'SOW' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'termination', label: 'Termination' },
];

const translations = {
  title: 'Contracts',
  subtitle: 'Manage job contracts and agreements'
};

function ContractsClient({ user }: ContractsClientProps) {
  const [contracts, setContracts] = useState<JobContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch contracts from API
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const orgId = user.user_metadata?.organizationId;
      if (!orgId) return;

      const response = await fetch('/api/v1/jobs/contracts', {
        headers: {
          'x-org-id': orgId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts based on search term, status, and type
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.contractType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper functions for formatting and status
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText;
      case 'pending': return Clock;
      case 'active': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'terminated': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'expired': return XCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary color-muted border-border';
      case 'pending_review': return 'bg-warning/10 color-warning border-warning/20';
      case 'approved': return 'bg-primary/10 color-primary border-primary/20';
      case 'active': return 'bg-success/10 color-success border-success/20';
      case 'completed': return 'bg-success/10 color-success border-success/20';
      case 'terminated': return 'bg-destructive/10 color-destructive border-destructive/20';
      case 'cancelled': return 'bg-destructive/10 color-destructive border-destructive/20';
      default: return 'bg-secondary color-muted border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'msa': return 'bg-secondary/10 color-secondary border-secondary/20';
      case 'sow': return 'bg-primary/10 color-primary border-primary/20';
      case 'amendment': return 'bg-warning/10 color-warning border-warning/20';
      case 'termination': return 'bg-destructive/10 color-destructive border-destructive/20';
      default: return 'bg-secondary color-muted border-border';
    }
  };

  const calculateProgress = (milestones?: JobContractMilestone[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const isExpiringSoon = (endDate?: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
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
          <Plus className="h-4 w-4 mr-sm" />
          Create Contract
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1">
            <Input
              placeholder="Search contracts..."
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
              <p className="text-body-sm form-label color-foreground/70">Total Contracts</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{contracts.length}</p>
            </div>
            <FileText className="h-8 w-8 color-primary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Active</p>
              <p className="text-heading-3 text-heading-3 color-success">
                {contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 color-success" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Completed</p>
              <p className="text-heading-3 text-heading-3 color-primary">
                {contracts.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 color-primary" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Expiring Soon</p>
              <p className="text-heading-3 text-heading-3 color-warning">
                {contracts.filter(c => isExpiringSoon(c.end_date)).length}
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 color-warning" />
          </div>
        </Card>
        <Card className="p-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-foreground/70">Total Value</p>
              <p className="text-heading-3 text-heading-3 color-secondary">
                {formatAmount(contracts.reduce((sum, c) => sum + c.value, 0))}
              </p>
            </div>
            <DollarSign className="h-5 w-5 color-success" />
          </div>
        </Card>
      </div>

      {/* Contracts List */}
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
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => {
            const StatusIcon = getStatusIcon(contract.status);
            const isExpiring = isExpiringSoon(contract.end_date);
            const hasExpired = isExpired(contract.end_date);
            const progress = calculateProgress(contract.milestones);

            return (
              <Card key={contract.id} className={`p-lg hover:shadow-elevated transition-shadow ${hasExpired ? 'border-destructive/20 bg-destructive/5' : isExpiring ? 'border-warning/20 bg-warning/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-sm">
                      <div>
                        <h3 className="text-body text-heading-4 color-foreground mb-xs flex items-center gap-sm">
                          <StatusIcon className="h-5 w-5 color-foreground/60" />
                          {contract.title}
                          {(isExpiring || hasExpired) && (
                            <AlertTriangle className={`h-4 w-4 ${hasExpired ? 'color-destructive' : 'color-warning'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-sm text-body-sm color-foreground/70">
                          <Building className="h-4 w-4" />
                          <span>{contract.job_title || 'N/A'}</span>
                          <span>•</span>
                          <span>{contract.company_name || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(contract.contract_type || contract.contractType)}>
                          {(contract.contract_type || contract.contractType).toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-body-sm color-foreground/80 mb-sm line-clamp-2">
                      {contract.description}
                    </p>

                    <div className="flex items-center gap-lg text-body-sm color-foreground/70 mb-sm">
                      <div className="flex items-center gap-xs">
                        <DollarSign className="h-4 w-4" />
                        <span className="form-label">{formatAmount(contract.value, contract.currency)}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(contract.start_date || contract.startDate)}
                          {(contract.end_date || contract.endDate) && ` - ${formatDate(contract.end_date || contract.endDate)}`}
                        </span>
                      </div>
                      {contract.paymentTerms && (
                        <div className="flex items-center gap-xs">
                          <Clock className="h-4 w-4" />
                          <span>{contract.paymentTerms}</span>
                        </div>
                      )}
                    </div>

                    {/* Milestones Progress */}
                    {contract.milestones && contract.milestones.length > 0 && (
                      <div className="mb-sm">
                        <div className="flex items-center justify-between mb-xs">
                          <span className="text-body-sm form-label color-foreground/70">
                            Milestones Progress
                          </span>
                          <span className="text-body-sm color-foreground/70">
                            {contract.milestones.filter(m => m.status === 'completed').length} of {contract.milestones.length} completed
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-success h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-body-sm color-foreground/70 mt-xs">
                          {progress}% complete
                        </div>
                      </div>
                    )}

                    {contract.notes && (
                      <div className="mt-sm p-sm bg-accent rounded-md">
                        <p className="text-body-sm color-foreground/70">
                          <strong>Notes:</strong> {contract.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                  <div className="text-body-sm color-foreground/50">
                    Created: {formatDate(contract.created_at || contract.createdAt)}
                    {(contract.signed_at || contract.signedAt) && (
                      <span> • Signed: {formatDate(contract.signed_at || contract.signedAt)}</span>
                    )}
                  </div>
                  <div className="flex gap-sm">
                    <Button>
                      <Eye className="h-4 w-4" /> 
                      View
                    </Button>
                    <Button>
                      <Edit className="h-4 w-4" /> 
                      Edit
                    </Button>
                    {(contract.document_url || contract.documentUrl) && (
                      <Button>
                        <Download className="h-4 w-4" /> 
                        Download
                      </Button>
                    )}
                    {contract.milestones && contract.milestones.length > 0 && (
                      <Button>
                        <BarChart3 className="h-4 w-4" /> 
                        Milestones
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-2xl text-center">
            <FileText className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">No contracts found</h3>
            <p className="text-body-sm color-foreground/70 mb-md">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first contract.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-sm" />
              Create Contract
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ContractsClient;
