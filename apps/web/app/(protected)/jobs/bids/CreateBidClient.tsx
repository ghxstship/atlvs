'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer, Button, Input, Select, Textarea } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const createBidSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  jobId: z.string().optional(),
  type: z.enum(['fixed_price', 'hourly', 'milestone_based', 'retainer']),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('USD'),
  estimatedDuration: z.string().optional(),
  responseDeadline: z.string().optional(),
  notes: z.string().optional(),
});

type CreateBidFormData = z.infer<typeof createBidSchema>;

interface CreateBidClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateBidClient({ orgId, onSuccess }: CreateBidClientProps) {
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
  } = useForm<CreateBidFormData>({
    resolver: zodResolver(createBidSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'fixed_price',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: CreateBidFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_bid_create_attempt', {
        organization_id: orgId,
        bid_type: data.type,
        amount: data.amount,
      });

      const response = await fetch('/api/v1/jobs/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          ...data,
          organization_id: orgId,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create bid');
      }

      const result = await response.json();

      posthog?.capture('jobs_bid_create_success', {
        organization_id: orgId,
        bid_id: result.id,
        bid_type: data.type,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'bid',
        resource_id: result.id,
        metadata: {
          title: data.title,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
        },
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_bid_create_error', {
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
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create Bid
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Bid"
        description="Submit a proposal for an opportunity or job"
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {error && (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{error}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                form="create-bid-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Bid
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-bid-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter bid title"
                error={errors.title?.message}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your proposal"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="opportunityId" className="block text-sm font-medium text-foreground mb-2">
                  Opportunity ID *
                </label>
                <Input
                  id="opportunityId"
                  {...register('opportunityId')}
                  placeholder="Enter opportunity ID"
                  error={errors.opportunityId?.message}
                />
              </div>

              <div>
                <label htmlFor="jobId" className="block text-sm font-medium text-foreground mb-2">
                  Job ID (Optional)
                </label>
                <Input
                  id="jobId"
                  {...register('jobId')}
                  placeholder="Enter job ID if applicable"
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                Bid Type *
              </label>
              <Select {...register('type')} error={errors.type?.message}>
                <option value="fixed_price">Fixed Price</option>
                <option value="hourly">Hourly</option>
                <option value="milestone_based">Milestone Based</option>
                <option value="retainer">Retainer</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                  Amount *
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0.00"
                  error={errors.amount?.message}
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-foreground mb-2">
                  Estimated Duration
                </label>
                <Input
                  id="estimatedDuration"
                  {...register('estimatedDuration')}
                  placeholder="e.g., 2 weeks, 3 months"
                />
              </div>

              <div>
                <label htmlFor="responseDeadline" className="block text-sm font-medium text-foreground mb-2">
                  Response Deadline
                </label>
                <Input
                  id="responseDeadline"
                  type="datetime-local"
                  {...register('responseDeadline')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes or terms for this bid"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
