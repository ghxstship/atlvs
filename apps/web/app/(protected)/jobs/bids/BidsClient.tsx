'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, Button, Badge, Input, Skeleton } from '@ghxstship/ui';

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
          'Content-Type': 'application/json',
        },
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

  const filteredBids = bids.filter((bid) => {
    const matchesSearch = bid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bid.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
    const matchesType = typeFilter === 'all' || bid.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fixed_price':
        return 'bg-blue-100 text-blue-800';
      case 'hourly':
        return 'bg-green-100 text-green-800';
      case 'milestone_based':
        return 'bg-purple-100 text-purple-800';
      case 'retainer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const createBid = async (data: Partial<Bid>) => {
    try {
      const response = await fetch('/api/v1/jobs/bids', {
        method: 'POST',
        headers: {
          'x-org-id': orgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{translations.title}</h1>
            <p className="text-gray-600">{translations.subtitle}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Bid
          </Button>
        </div>

        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-5 w-5 bg-gray-200 rounded" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{translations.title}</h1>
          <p className="text-gray-600">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          + Create Bid
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search bids..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
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
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filteredBids.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters to find bids.'
              : 'Get started by creating your first bid.'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Bid
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBids.map((bid) => (
            <Card key={bid.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-5 w-5 bg-gray-200 rounded" />
                    <h3 className="text-lg font-semibold text-gray-900">{bid.title}</h3>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                    <Badge className={getTypeColor(bid.type)}>
                      {bid.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {bid.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{bid.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded" />
                      <span className="font-medium">${bid.amount.toLocaleString()} {bid.currency}</span>
                    </div>
                    {bid.estimatedDuration && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                        <span>{bid.estimatedDuration}</span>
                      </div>
                    )}
                    {bid.responseDeadline && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                        <span>{new Date(bid.responseDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {bid.createdAt && (
                        <span>Created {new Date(bid.createdAt).toLocaleDateString()}</span>
                      )}
                      {bid.submittedAt && (
                        <span>Submitted {new Date(bid.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        View
                      </Button>
                      <Button size="sm">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Bid</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createBid({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                status: 'draft',
                amount: Number(formData.get('amount')),
                currency: 'USD',
                opportunityId: formData.get('opportunityId') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input name="title" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" className="w-full p-2 border rounded" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="type" className="w-full p-2 border rounded" required>
                    {TYPE_OPTIONS.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <Input name="amount" type="number" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Opportunity ID</label>
                  <Input name="opportunityId" required />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
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
