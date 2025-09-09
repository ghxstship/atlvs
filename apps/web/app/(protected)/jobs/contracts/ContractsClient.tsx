'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Button, Card, Input, Badge, Skeleton } from '@ghxstship/ui';
import { PlusIcon, DocumentTextIcon, PencilIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, CurrencyDollarIcon, CalendarIcon, BuildingOfficeIcon, EyeIcon, ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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

export default function ContractsClient({ user }: ContractsClientProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return DocumentTextIcon;
      case 'pending_review': return ClockIcon;
      case 'approved': return CheckCircleIcon;
      case 'active': return CheckCircleIcon;
      case 'completed': return CheckCircleIcon;
      case 'terminated': return XCircleIcon;
      case 'cancelled': return XCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'msa': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sow': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'amendment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'termination': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
          <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search contracts..."
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
              <p className="text-sm font-medium text-foreground/70">Total Contracts</p>
              <p className="text-2xl font-bold text-foreground">{contracts.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {contracts.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">
                {contracts.filter(c => isExpiringSoon(c.end_date)).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/70">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatAmount(contracts.reduce((sum, c) => sum + c.value, 0))}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Contracts List */}
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
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => {
            const StatusIcon = getStatusIcon(contract.status);
            const isExpiring = isExpiringSoon(contract.end_date);
            const hasExpired = isExpired(contract.end_date);
            const progress = calculateProgress(contract.milestones);

            return (
              <Card key={contract.id} className={`p-6 hover:shadow-md transition-shadow ${hasExpired ? 'border-red-200 bg-red-50/30' : isExpiring ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-foreground/60" />
                          {contract.title}
                          {(isExpiring || hasExpired) && (
                            <ExclamationTriangleIcon className={`h-4 w-4 ${hasExpired ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>{contract.job_title || 'N/A'}</span>
                          <span>•</span>
                          <span>{contract.company_name || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(contract.contract_type || contract.contractType)}>
                          {(contract.contract_type || contract.contractType).toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                      {contract.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-foreground/70 mb-3">
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span className="font-medium">{formatAmount(contract.value, contract.currency)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(contract.start_date || contract.startDate).toLocaleDateString()}
                          {(contract.end_date || contract.endDate) && ` - ${new Date(contract.end_date || contract.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      {contract.paymentTerms && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{contract.paymentTerms}</span>
                        </div>
                      )}
                    </div>

                    {/* Milestones Progress */}
                    {contract.milestones && contract.milestones.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground/70">
                            Milestones Progress
                          </span>
                          <span className="text-xs text-foreground/70">
                            {contract.milestones.filter(m => m.status === 'completed').length} of {contract.milestones.length} completed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-foreground/70 mt-1">
                          {progress}% complete
                        </div>
                      </div>
                    )}

                    {contract.notes && (
                      <div className="mt-3 p-2 bg-accent rounded-md">
                        <p className="text-xs text-foreground/70">
                          <strong>Notes:</strong> {contract.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-foreground/50">
                    Created: {new Date(contract.created_at || contract.createdAt || '').toLocaleDateString()}
                    {(contract.signed_at || contract.signedAt) && (
                      <span> • Signed: {new Date(contract.signed_at || contract.signedAt).toLocaleDateString()}</span>
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
                    {(contract.document_url || contract.documentUrl) && (
                      <Button variant="ghost" size="sm">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    {contract.milestones && contract.milestones.length > 0 && (
                      <Button variant="ghost" size="sm">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Milestones
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
            <h3 className="text-lg font-medium text-foreground mb-2">No contracts found</h3>
            <p className="text-sm text-foreground/70 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first contract.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
