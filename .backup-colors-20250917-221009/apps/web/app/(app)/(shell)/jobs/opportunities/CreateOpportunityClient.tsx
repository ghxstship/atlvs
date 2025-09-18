'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer, Button, Input, Select, Textarea } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  type: z.enum(['construction', 'technical', 'creative', 'logistics', 'consulting', 'other']),
  status: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('lead'),
  estimatedValue: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('USD'),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;

interface CreateOpportunityClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateOpportunityClient({ orgId, onSuccess }: CreateOpportunityClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    mode: 'onChange',
    defaultValues: {
      type: 'other',
      status: 'lead',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: CreateOpportunityFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_opportunity_create_attempt', {
        organization_id: orgId,
        opportunity_type: data.type,
        estimated_value: data.estimatedValue,
      });

      const response = await fetch('/api/v1/jobs/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          ...data,
          organization_id: orgId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create opportunity');
      }

      const result = await response.json();

      posthog?.capture('jobs_opportunity_create_success', {
        organization_id: orgId,
        opportunity_id: result.id,
        opportunity_type: data.type,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'opportunity',
        resource_id: result.id,
        metadata: {
          title: data.title,
          type: data.type,
          estimated_value: data.estimatedValue,
        },
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_opportunity_create_error', {
        organization_id: orgId,
        error: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      reset();
      setError(null);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-sm">
        <Plus className="h-4 w-4" />
        Create Opportunity
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Opportunity"
        description="Add a new business opportunity to track potential revenue"
       
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-sm text-body-sm color-muted">
              {error && (
                <>
                  <AlertCircle className="h-4 w-4 color-destructive" />
                  <span className="color-destructive">{error}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-sm">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-opportunity-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Opportunity
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-opportunity-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-lg">
            <div>
              <label htmlFor="title" className="block text-body-sm form-label color-foreground mb-sm">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter opportunity title"
               
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm form-label color-foreground mb-sm">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the opportunity details"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="type" className="block text-body-sm form-label color-foreground mb-sm">
                  Type *
                </label>
                <Select {...register('type')}>
                  <option value="construction">Construction</option>
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                  <option value="logistics">Logistics</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label htmlFor="status" className="block text-body-sm form-label color-foreground mb-sm">
                  Status
                </label>
                <Select {...register('status')}>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="estimatedValue" className="block text-body-sm form-label color-foreground mb-sm">
                  Estimated Value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('estimatedValue', { valueAsNumber: true })}
                  placeholder="0.00"
                 
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-body-sm form-label color-foreground mb-sm">
                  Currency
                </label>
                <Select {...register('currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="probability" className="block text-body-sm form-label color-foreground mb-sm">
                  Probability (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { valueAsNumber: true })}
                  placeholder="50"
                 
                />
              </div>

              <div>
                <label htmlFor="expectedCloseDate" className="block text-body-sm form-label color-foreground mb-sm">
                  Expected Close Date
                </label>
                <Input
                  type="date"
                  {...register('expectedCloseDate')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="clientName" className="block text-body-sm form-label color-foreground mb-sm">
                  Client Name
                </label>
                <Input
                  {...register('clientName')}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label htmlFor="clientContact" className="block text-body-sm form-label color-foreground mb-sm">
                  Client Contact
                </label>
                <Input
                  {...register('clientContact')}
                  placeholder="Enter contact information"
                />
              </div>
            </div>

            <div>
              <label htmlFor="source" className="block text-body-sm form-label color-foreground mb-sm">
                Source
              </label>
              <Input
                {...register('source')}
                placeholder="How did you find this opportunity?"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-body-sm form-label color-foreground mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this opportunity"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
