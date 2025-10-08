'use client';


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';import { Button, UnifiedInput, Select, Textarea, Drawer } from '@ghxstship/ui';
import { Button, Select, Textarea, Drawer } from '@ghxstship/ui';

import { usePostHog } from 'posthog-js/react';

const createContractSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  jobId: z.string().min(1, 'Job ID is required'),
  companyId: z.string().optional(),
  type: z.enum(['employment', 'freelance', 'nda', 'vendor', 'service']),
  status: z.enum(['draft', 'pending_review', 'active', 'completed', 'terminated', 'expired']).default('draft'),
  value: z.number().min(0, 'Value must be positive').optional(),
  currency: z.string().default('USD'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  terms: z.string().optional(),
  documentUrl: z.string().optional(),
  notes: z.string().optional()
});

type CreateContractFormData = z.infer<typeof createContractSchema>;

interface CreateContractClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateContractClient({ orgId, onSuccess }: CreateContractClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<CreateContractFormData>({
    resolver: zodResolver(createContractSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'employment',
      status: 'draft',
      currency: 'USD'
    }
  });

  const onSubmit = async (data: CreateContractFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_contract_create_attempt', {
        organization_id: orgId,
        contract_type: data.type,
        value: data.value
      });

      const response = await fetch('/api/v1/jobs/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId
        },
        body: JSON.stringify({
          ...data,
          organization_id: orgId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create contract');
      }

      const result = await response.json();

      posthog?.capture('jobs_contract_create_success', {
        organization_id: orgId,
        contract_id: result.id,
        contract_type: data.type
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'contract',
        resource_id: result.id,
        metadata: {
          title: data.title,
          type: data.type,
          value: data.value,
          currency: data.currency
        }
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_contract_create_error', {
        organization_id: orgId,
        error: errorMessage
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
        <Plus className="h-icon-xs w-icon-xs" />
        Create Contract
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Contract"
        description="Create a new contract for employment, services, or agreements"
       
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-sm text-body-sm color-muted">
              {error && (
                <>
                  <AlertCircle className="h-icon-xs w-icon-xs color-destructive" />
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
                form="create-contract-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-sm"
              >
                {isSubmitting && <Loader2 className="h-icon-xs w-icon-xs animate-spin" />}
                Create Contract
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-contract-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-lg">
            <div>
              <label htmlFor="title" className="block text-body-sm form-label color-foreground mb-sm">
                Title *
              </label>
              <UnifiedInput                 id="title"
                {...register('title')}
                placeholder="Enter contract title"
               
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm form-label color-foreground mb-sm">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the contract purpose and scope"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="jobId" className="block text-body-sm form-label color-foreground mb-sm">
                  Job ID *
                </label>
                <UnifiedInput                   id="jobId"
                  {...register('jobId')}
                  placeholder="Enter associated job ID"
                 
                />
              </div>

              <div>
                <label htmlFor="companyId" className="block text-body-sm form-label color-foreground mb-sm">
                  Company ID (Optional)
                </label>
                <UnifiedInput                   id="companyId"
                  {...register('companyId')}
                  placeholder="Enter company ID if applicable"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="type" className="block text-body-sm form-label color-foreground mb-sm">
                  Contract Type *
                </label>
                <Select {...register('type')}>
                  <option value="employment">Employment</option>
                  <option value="freelance">Freelance</option>
                  <option value="nda">NDA</option>
                  <option value="vendor">Vendor</option>
                  <option value="service">Service</option>
                </Select>
              </div>

              <div>
                <label htmlFor="status" className="block text-body-sm form-label color-foreground mb-sm">
                  Status
                </label>
                <Select {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                  <option value="expired">Expired</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="value" className="block text-body-sm form-label color-foreground mb-sm">
                  Contract Value
                </label>
                <UnifiedInput                   type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
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
                <label htmlFor="startDate" className="block text-body-sm form-label color-foreground mb-sm">
                  Start Date
                </label>
                <UnifiedInput                   type="date"
                  {...register('startDate')}
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-body-sm form-label color-foreground mb-sm">
                  End Date
                </label>
                <UnifiedInput                   type="date"
                  {...register('endDate')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="documentUrl" className="block text-body-sm form-label color-foreground mb-sm">
                Document URL
              </label>
              <UnifiedInput                 type="url"
                {...register('documentUrl')}
                placeholder="https://example.com/contract.pdf"
              />
            </div>

            <div>
              <label htmlFor="terms" className="block text-body-sm form-label color-foreground mb-sm">
                Terms & Conditions
              </label>
              <Textarea
                {...register('terms')}
                placeholder="Enter key terms and conditions"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-body-sm form-label color-foreground mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this contract"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
