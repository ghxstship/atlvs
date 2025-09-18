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
        return 'bg-warning/10 color-warning';
      case 'qualified':
        return 'bg-primary/10 color-primary';
      case 'proposal':
        return 'bg-secondary/10 color-secondary';
      case 'negotiation':
        return 'bg-warning/10 color-warning';
      case 'won':
        return 'bg-success/10 color-success';
      case 'lost':
        return 'bg-destructive/10 color-destructive';
      default:
        return 'bg-secondary/50 color-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'construction':
        return 'bg-warning/10 color-warning';
      case 'technical':
        return 'bg-primary/10 color-primary';
      case 'creative':
        return 'bg-secondary/10 color-secondary';
      case 'logistics':
        return 'bg-success/10 color-success';
      case 'consulting':
        return 'bg-primary/10 color-primary';
      case 'other':
        return 'bg-secondary/50 color-muted';
      default:
        return 'bg-secondary/50 color-muted';
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
      <div className="stack-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="color-muted">{translations.subtitle}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Opportunity
          </Button>
        </div>

        <div className="flex gap-md mb-lg">
          <div className="flex-1">
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-md">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-5 w-5 bg-secondary rounded" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-4 w-full mb-sm" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-sm">
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
    <div className="stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
          <p className="color-muted">{translations.subtitle}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          + Create Opportunity
        </Button>
      </div>

      <div className="flex gap-md mb-lg">
        <div className="flex-1">
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {filteredOpportunities.length === 0 ? (
        <Card className="p-2xl text-center">
          <div className="h-12 w-12 bg-secondary rounded mx-auto mb-md" />
          <h3 className="text-body form-label color-foreground mb-sm">No opportunities found</h3>
          <p className="color-muted mb-md">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters to find opportunities.'
              : 'Get started by creating your first opportunity.'}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            + Create Opportunity
          </Button>
        </Card>
      ) : (
        <div className="grid gap-md">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-5 w-5 bg-secondary rounded" />
                    <h3 className="text-body text-heading-4 color-foreground">{opportunity.title}</h3>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {opportunity.status}
                    </Badge>
                    <Badge className={getTypeColor(opportunity.type)}>
                      {opportunity.type}
                    </Badge>
                  </div>

                  {opportunity.description && (
                    <p className="color-muted mb-md line-clamp-2">{opportunity.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-md text-body-sm">
                    {opportunity.clientName && (
                      <div className="flex items-center gap-sm">
                        <div className="h-4 w-4 bg-secondary rounded" />
                        <span className="color-muted">{opportunity.clientName}</span>
                      </div>
                    )}
                    {opportunity.estimatedValue && (
                      <div className="flex items-center gap-sm">
                        <div className="h-4 w-4 bg-secondary rounded" />
                        <span className="color-muted">
                          ${opportunity.estimatedValue.toLocaleString()} {opportunity.currency || 'USD'}
                        </span>
                      </div>
                    )}
                    {opportunity.expectedCloseDate && (
                      <div className="flex items-center gap-sm">
                        <div className="h-4 w-4 bg-secondary rounded" />
                        <span className="color-muted">
                          {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-md pt-md border-t border-border">
                    <div className="flex items-center gap-md text-body-sm color-muted">
                      {opportunity.createdAt && (
                        <span>Created {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                      )}
                      {opportunity.updatedAt && opportunity.updatedAt !== opportunity.createdAt && (
                        <span>Updated {new Date(opportunity.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-sm">
                      <Button
                        variant="outline"
                       
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
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
            <h3 className="text-body text-heading-4 mb-md">Create New Opportunity</h3>
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
              <div className="stack-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Title</label>
                  <Input />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Description</label>
                  <textarea className="w-full p-sm border border-border rounded bg-background" rows={3} />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Type</label>
                  <Select>
                    {TYPE_OPTIONS.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Client Name</label>
                  <Input />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Estimated Value</label>
                  <Input type="number" />
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
