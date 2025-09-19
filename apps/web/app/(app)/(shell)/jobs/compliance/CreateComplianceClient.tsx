'use client';


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const createComplianceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  jobId: z.string().min(1, 'Job ID is required'),
  kind: z.enum(['safety', 'legal', 'regulatory', 'quality', 'environmental', 'financial', 'other']),
  status: z.enum(['pending', 'in_review', 'compliant', 'non_compliant', 'waived']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  dueAt: z.string().optional(),
  completedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  certificationRequired: z.boolean().default(false),
  documentationUrl: z.string().optional(),
  requirements: z.string().optional(),
  findings: z.string().optional(),
  remediation: z.string().optional(),
  notes: z.string().optional(),
});

type CreateComplianceFormData = z.infer<typeof createComplianceSchema>;

interface CreateComplianceClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateComplianceClient({ orgId, onSuccess }: CreateComplianceClientProps) {
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
  } = useForm<CreateComplianceFormData>({
    resolver: zodResolver(createComplianceSchema),
    mode: 'onChange',
    defaultValues: {
      kind: 'safety',
      status: 'pending',
      priority: 'medium',
      certificationRequired: false,
    },
  });

  const onSubmit = async (data: CreateComplianceFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_compliance_create_attempt', {
        organization_id: orgId,
        compliance_kind: data.kind,
        priority: data.priority,
      });

      const response = await fetch('/api/v1/jobs/compliance', {
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
        throw new Error(errorData.message || 'Failed to create compliance record');
      }

      const result = await response.json();

      posthog?.capture('jobs_compliance_create_success', {
        organization_id: orgId,
        compliance_id: result.id,
        compliance_kind: data.kind,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'compliance',
        resource_id: result.id,
        metadata: {
          title: data.title,
          kind: data.kind,
          priority: data.priority,
          certification_required: data.certificationRequired,
        },
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_compliance_create_error', {
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
        Create Compliance
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Compliance Record"
        description="Track compliance requirements and certifications for jobs"
       
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
                form="create-compliance-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Compliance
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-compliance-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-lg">
            <div>
              <label htmlFor="title" className="block text-body-sm form-label color-foreground mb-sm">
                Title *
              </label>
              <UnifiedInput                 id="title"
                {...register('title')}
                placeholder="Enter compliance requirement title"
               
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm form-label color-foreground mb-sm">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the compliance requirement"
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
                <label htmlFor="kind" className="block text-body-sm form-label color-foreground mb-sm">
                  Compliance Type *
                </label>
                <Select {...register('kind')}>
                  <option value="safety">Safety</option>
                  <option value="legal">Legal</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="quality">Quality</option>
                  <option value="environmental">Environmental</option>
                  <option value="financial">Financial</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="status" className="block text-body-sm form-label color-foreground mb-sm">
                  Status
                </label>
                <Select {...register('status')}>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="compliant">Compliant</option>
                  <option value="non_compliant">Non-Compliant</option>
                  <option value="waived">Waived</option>
                </Select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-body-sm form-label color-foreground mb-sm">
                  Priority
                </label>
                <Select {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="dueAt" className="block text-body-sm form-label color-foreground mb-sm">
                  Due Date
                </label>
                <UnifiedInput                   type="datetime-local"
                  {...register('dueAt')}
                />
              </div>

              <div>
                <label htmlFor="completedAt" className="block text-body-sm form-label color-foreground mb-sm">
                  Completed Date
                </label>
                <UnifiedInput                   type="datetime-local"
                  {...register('completedAt')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="reviewedBy" className="block text-body-sm form-label color-foreground mb-sm">
                  Reviewed By
                </label>
                <UnifiedInput                   {...register('reviewedBy')}
                  placeholder="Enter reviewer name or ID"
                />
              </div>

              <div className="flex items-center cluster-sm pt-xl">
                <input
                  type="checkbox"
                  {...register('certificationRequired')}
                  className="h-4 w-4 color-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="certificationRequired" className="text-body-sm form-label color-foreground">
                  Certification Required
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="documentationUrl" className="block text-body-sm form-label color-foreground mb-sm">
                Documentation URL
              </label>
              <UnifiedInput                 type="url"
                {...register('documentationUrl')}
                placeholder="https://example.com/compliance-docs.pdf"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-body-sm form-label color-foreground mb-sm">
                Requirements
              </label>
              <Textarea
                {...register('requirements')}
                placeholder="List specific compliance requirements"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="findings" className="block text-body-sm form-label color-foreground mb-sm">
                Findings
              </label>
              <Textarea
                {...register('findings')}
                placeholder="Document compliance findings or issues"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="remediation" className="block text-body-sm form-label color-foreground mb-sm">
                Remediation Plan
              </label>
              <Textarea
                {...register('remediation')}
                placeholder="Describe remediation steps if non-compliant"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-body-sm form-label color-foreground mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this compliance record"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
