'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, Button, Badge, Input, Select, Skeleton } from '@ghxstship/ui';

interface OpportunitiesClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Opportunity {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  type: 'construction' | 'technical' | 'creative' | 'logistics' | 'consulting' | 'other';
  status: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  estimatedValue?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  clientName?: string;
  clientContact?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'construction', label: 'Construction' },
  { value: 'technical', label: 'Technical' },
  { value: 'creative', label: 'Creative' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

export function OpportunitiesClient({ user, orgId, translations }: OpportunitiesClientProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, [orgId]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/jobs/opportunities', {
        headers: {
          'x-org-id': orgId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load opportunities');
      }

      const data = await response.json();
      setOpportunities(data.items || []);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opportunity.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || opportunity.status === statusFilter;
    const matchesType = typeFilter === 'all' || opportunity.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'creative':
        return 'bg-purple-100 text-purple-800';
      case 'logistics':
        return 'bg-green-100 text-green-800';
      case 'consulting':
        return 'bg-indigo-100 text-indigo-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const createOpportunity = async (data: Partial<Opportunity>) => {
    try {
      const response = await fetch('/api/v1/jobs/opportunities', {
        method: 'POST',
        headers: {
          'x-org-id': orgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create opportunity');
      }

      await loadOpportunities();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating opportunity:', error);
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
            + Create Opportunity
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
          + Create Opportunity
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {filteredOpportunities.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters to find opportunities.'
              : 'Get started by creating your first opportunity.'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Opportunity
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-5 w-5 bg-gray-200 rounded" />
                    <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {opportunity.status}
                    </Badge>
                    <Badge className={getTypeColor(opportunity.type)}>
                      {opportunity.type}
                    </Badge>
                  </div>

                  {opportunity.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {opportunity.clientName && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                        <span className="text-gray-600">{opportunity.clientName}</span>
                      </div>
                    )}
                    {opportunity.estimatedValue && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                        <span className="text-gray-600">
                          ${opportunity.estimatedValue.toLocaleString()} {opportunity.currency || 'USD'}
                        </span>
                      </div>
                    )}
                    {opportunity.expectedCloseDate && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                        <span className="text-gray-600">
                          {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {opportunity.createdAt && (
                        <span>Created {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                      )}
                      {opportunity.updatedAt && opportunity.updatedAt !== opportunity.createdAt && (
                        <span>Updated {new Date(opportunity.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        View
                      </Button>
                      <Button variant="outline" size="sm">
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
            <h3 className="text-lg font-semibold mb-4">Create New Opportunity</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createOpportunity({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                status: 'lead',
                clientName: formData.get('clientName') as string,
                estimatedValue: formData.get('estimatedValue') ? Number(formData.get('estimatedValue')) : undefined,
                currency: 'USD',
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
                  <Select name="type" required>
                    {TYPE_OPTIONS.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <Input name="clientName" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Value</label>
                  <Input name="estimatedValue" type="number" />
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
