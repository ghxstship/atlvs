'use client';


import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, Button, Badge, UnifiedInput, Skeleton } from '@ghxstship/ui';

interface BidsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Bid {
  id: string;
  organizationId: string;
  opportunityId: string;
  jobId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  type: 'fixed_price' | 'hourly' | 'milestone_based' | 'retainer';
  amount: number;
  currency: string;
  proposalDocumentUrl?: string;
  submittedAt?: string;
  responseDeadline?: string;
  estimatedDuration?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  opportunity_title?: string;
  client_name?: string;
  assignee_name?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'milestone_based', label: 'Milestone Based' },
  { value: 'retainer', label: 'Retainer' },
];

export function BidsClient({ user, orgId, translations }: BidsClientProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadBids();
  }, [orgId]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/jobs/bids', {
        headers: {
          'x-org-id': orgId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load bids');
      }

      const data = await response.json();
      setBids(data.items || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBids = bids.filter((bid: any) => {
    const matchesSearch = bid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bid.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
    const matchesType = typeFilter === 'all' || bid.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-secondary color-muted';
      case 'submitted':
        return 'bg-accent/10 color-accent';
      case 'under_review':
        return 'bg-warning/10 color-warning';
      case 'accepted':
        return 'bg-success/10 color-success';
      case 'rejected':
        return 'bg-destructive/10 color-destructive';
      case 'withdrawn':
        return 'bg-secondary/10 color-secondary-foreground';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fixed_price':
        return 'bg-accent/10 color-accent';
      case 'hourly':
        return 'bg-success/10 color-success';
      case 'milestone_based':
        return 'bg-secondary/10 color-secondary-foreground';
      case 'retainer':
        return 'bg-accent/10 color-accent-foreground';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const createBid = async (data: Partial<Bid>) => {
    try {
      const response = await fetch('/api/v1/jobs/bids', {
        method: 'POST',
        headers: {
          'x-org-id': orgId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create bid');
      }

      await loadBids();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating bid:', error);
    }
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="color-muted">{translations.subtitle}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Bid
          </Button>
        </div>

        <div className="grid gap-md">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-icon-sm w-icon-sm bg-secondary rounded" />
                    <Skeleton className="h-icon-sm w-container-xs" />
                  </div>
                  <Skeleton className="h-icon-xs w-full mb-sm" />
                  <Skeleton className="h-icon-xs w-3/4" />
                </div>
                <div className="flex gap-sm">
                  <Skeleton className="h-icon-md w-component-md" />
                  <Skeleton className="h-icon-md w-component-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
          <p className="color-muted">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          + Create Bid
        </Button>
      </div>

      <div className="flex gap-md mb-lg">
        <div className="flex-1">
          <UnifiedInput             placeholder="Search bids..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
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

      {filteredBids.length === 0 ? (
        <Card className="p-xsxl text-center">
          <div className="h-icon-2xl w-icon-2xl bg-secondary rounded mx-auto mb-md" />
          <h3 className="text-body form-label color-foreground mb-sm">No bids found</h3>
          <p className="color-muted mb-md">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters to find bids.'
              : 'Get started by creating your first bid.'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Bid
          </Button>
        </Card>
      ) : (
        <div className="grid gap-md">
          {filteredBids.map((bid: any) => (
            <Card key={bid.id} className="p-lg hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-icon-sm w-icon-sm bg-secondary rounded" />
                    <h3 className="text-body text-heading-4 color-foreground">{bid.title}</h3>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                    <Badge className={getTypeColor(bid.type)}>
                      {bid.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {bid.description && (
                    <p className="color-muted mb-md line-clamp-xs">{bid.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-md text-body-sm mb-md">
                    <div className="flex items-center gap-sm">
                      <div className="h-icon-xs w-icon-xs bg-secondary rounded" />
                      <span className="form-label">${bid.amount.toLocaleString()} {bid.currency}</span>
                    </div>
                    {bid.estimatedDuration && (
                      <div className="flex items-center gap-sm">
                        <div className="h-icon-xs w-icon-xs bg-secondary rounded" />
                        <span>{bid.estimatedDuration}</span>
                      </div>
                    )}
                    {bid.responseDeadline && (
                      <div className="flex items-center gap-sm">
                        <div className="h-icon-xs w-icon-xs bg-secondary rounded" />
                        <span>{new Date(bid.responseDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-md border-t">
                    <div className="flex items-center gap-md text-body-sm color-muted">
                      {bid.createdAt && (
                        <span>Created {new Date(bid.createdAt).toLocaleDateString()}</span>
                      )}
                      {bid.submittedAt && (
                        <span>Submitted {new Date(bid.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-sm">
                      <Button>
                        View
                      </Button>
                      <Button>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-md z-50">
          <div className="bg-background rounded-lg p-lg w-full max-w-md">
            <h3 className="text-body text-heading-4 mb-md">Create New Bid</h3>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createBid({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                status: 'draft',
                amount: Number(formData.get('amount')),
                currency: 'USD',
                opportunityId: formData.get('opportunityId') as string
              });
            }}>
              <div className="stack-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Title</label>
                  <UnifiedInput name="title" required />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Description</label>
                  <textarea name="description" className="w-full p-sm border border-border rounded bg-background" rows={3} />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Type</label>
                  <select name="type" className="w-full p-sm border border-border rounded bg-background" required>
                    {TYPE_OPTIONS.slice(1).map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Amount</label>
                  <UnifiedInput name="amount" type="number" required />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Opportunity ID</label>
                  <UnifiedInput name="opportunityId" required />
                </div>
              </div>
              <div className="flex gap-sm mt-lg">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
