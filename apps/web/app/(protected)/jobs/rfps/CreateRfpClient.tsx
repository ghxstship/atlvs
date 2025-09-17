'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer, Button, Input, Select, Textarea } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const createRfpSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  projectId: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).default('draft'),
  category: z.enum(['construction', 'consulting', 'technology', 'services', 'supplies', 'other']).default('services'),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  currency: z.string().default('USD'),
  publishedAt: z.string().optional(),
  submissionDeadline: z.string().optional(),
  evaluationCriteria: z.string().optional(),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
  timeline: z.string().optional(),
  contactEmail: z.string().email('Invalid email format').optional(),
  contactName: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
  isPublic: z.boolean().default(false),
  allowQuestions: z.boolean().default(true),
  questionsDeadline: z.string().optional(),
  minimumQualifications: z.string().optional(),
  preferredQualifications: z.string().optional(),
  notes: z.string().optional(),
});

type CreateRfpFormData = z.infer<typeof createRfpSchema>;

interface CreateRfpClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateRfpClient({ orgId, onSuccess }: CreateRfpClientProps) {
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
  } = useForm<CreateRfpFormData>({
    resolver: zodResolver(createRfpSchema),
    mode: 'onChange',
    defaultValues: {
      organizationId: orgId,
      status: 'draft',
      category: 'services',
      currency: 'USD',
      isPublic: false,
      allowQuestions: true,
    },
  });

  const onSubmit = async (data: CreateRfpFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_rfp_create_attempt', {
        organization_id: orgId,
        category: data.category,
        budget: data.budget,
      });

      const response = await fetch('/api/v1/jobs/rfps', {
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
        throw new Error(errorData.message || 'Failed to create RFP');
      }

      const result = await response.json();

      posthog?.capture('jobs_rfp_create_success', {
        organization_id: orgId,
        rfp_id: result.id,
        category: data.category,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'rfp',
        resource_id: result.id,
        metadata: {
          title: data.title,
          category: data.category,
          budget: data.budget,
          status: data.status,
        },
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_rfp_create_error', {
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
        Create RFP
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New RFP"
        description="Create a Request for Proposal to solicit bids from vendors"
       
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-body-sm color-muted">
              {error && (
                <>
                  <AlertCircle className="h-4 w-4 color-destructive" />
                  <span className="color-destructive">{error}</span>
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
                form="create-rfp-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create RFP
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-rfp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-body-sm form-label color-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter RFP title"
               
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm form-label color-foreground mb-2">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Provide a detailed description of the RFP"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-body-sm form-label color-foreground mb-2">
                  Category *
                </label>
                <Select {...register('category')}>
                  <option value="construction">Construction</option>
                  <option value="consulting">Consulting</option>
                  <option value="technology">Technology</option>
                  <option value="services">Services</option>
                  <option value="supplies">Supplies</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label htmlFor="status" className="block text-body-sm form-label color-foreground mb-2">
                  Status
                </label>
                <Select {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                  <option value="awarded">Awarded</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-body-sm form-label color-foreground mb-2">
                  Budget
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="0.00"
                 
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-body-sm form-label color-foreground mb-2">
                  Currency
                </label>
                <Select {...register('currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="projectId" className="block text-body-sm form-label color-foreground mb-2">
                Associated Project ID
              </label>
              <Input
                {...register('projectId')}
                placeholder="Enter project ID if applicable"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="submissionDeadline" className="block text-body-sm form-label color-foreground mb-2">
                  Submission Deadline
                </label>
                <Input
                  type="datetime-local"
                  {...register('submissionDeadline')}
                />
              </div>

              <div>
                <label htmlFor="questionsDeadline" className="block text-body-sm form-label color-foreground mb-2">
                  Questions Deadline
                </label>
                <Input
                  type="datetime-local"
                  {...register('questionsDeadline')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-body-sm form-label color-foreground mb-2">
                  Contact Name
                </label>
                <Input
                  {...register('contactName')}
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-body-sm form-label color-foreground mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  {...register('contactEmail')}
                  placeholder="contact@example.com"
                 
                />
              </div>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-body-sm form-label color-foreground mb-2">
                Requirements
              </label>
              <Textarea
                {...register('requirements')}
                placeholder="List specific requirements for vendors"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="deliverables" className="block text-body-sm form-label color-foreground mb-2">
                Deliverables
              </label>
              <Textarea
                {...register('deliverables')}
                placeholder="Describe expected deliverables"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-body-sm form-label color-foreground mb-2">
                Timeline
              </label>
              <Textarea
                {...register('timeline')}
                placeholder="Describe project timeline and milestones"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="evaluationCriteria" className="block text-body-sm form-label color-foreground mb-2">
                Evaluation Criteria
              </label>
              <Textarea
                {...register('evaluationCriteria')}
                placeholder="Describe how proposals will be evaluated"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="minimumQualifications" className="block text-body-sm form-label color-foreground mb-2">
                Minimum Qualifications
              </label>
              <Textarea
                {...register('minimumQualifications')}
                placeholder="List minimum vendor qualifications"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="preferredQualifications" className="block text-body-sm form-label color-foreground mb-2">
                Preferred Qualifications
              </label>
              <Textarea
                {...register('preferredQualifications')}
                placeholder="List preferred vendor qualifications"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('isPublic')}
                  className="h-4 w-4 color-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="isPublic" className="text-body-sm form-label color-foreground">
                  Public RFP
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('allowQuestions')}
                  className="h-4 w-4 color-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="allowQuestions" className="text-body-sm form-label color-foreground">
                  Allow Questions
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-body-sm form-label color-foreground mb-2">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this RFP"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
