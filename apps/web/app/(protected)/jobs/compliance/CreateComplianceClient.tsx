'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer, Button, Input, Select, Textarea } from '@ghxstship/ui';
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
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create Compliance
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Compliance Record"
        description="Track compliance requirements and certifications for jobs"
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
                form="create-compliance-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Compliance
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-compliance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter compliance requirement title"
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
                placeholder="Describe the compliance requirement"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobId" className="block text-sm font-medium text-foreground mb-2">
                  Job ID *
                </label>
                <Input
                  id="jobId"
                  {...register('jobId')}
                  placeholder="Enter associated job ID"
                  error={errors.jobId?.message}
                />
              </div>

              <div>
                <label htmlFor="kind" className="block text-sm font-medium text-foreground mb-2">
                  Compliance Type *
                </label>
                <Select {...register('kind')} error={errors.kind?.message}>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
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
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueAt" className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  {...register('dueAt')}
                />
              </div>

              <div>
                <label htmlFor="completedAt" className="block text-sm font-medium text-foreground mb-2">
                  Completed Date
                </label>
                <Input
                  id="completedAt"
                  type="datetime-local"
                  {...register('completedAt')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reviewedBy" className="block text-sm font-medium text-foreground mb-2">
                  Reviewed By
                </label>
                <Input
                  id="reviewedBy"
                  {...register('reviewedBy')}
                  placeholder="Enter reviewer name or ID"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  id="certificationRequired"
                  type="checkbox"
                  {...register('certificationRequired')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="certificationRequired" className="text-sm font-medium text-foreground">
                  Certification Required
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="documentationUrl" className="block text-sm font-medium text-foreground mb-2">
                Documentation URL
              </label>
              <Input
                id="documentationUrl"
                type="url"
                {...register('documentationUrl')}
                placeholder="https://example.com/compliance-docs.pdf"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-2">
                Requirements
              </label>
              <Textarea
                id="requirements"
                {...register('requirements')}
                placeholder="List specific compliance requirements"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="findings" className="block text-sm font-medium text-foreground mb-2">
                Findings
              </label>
              <Textarea
                id="findings"
                {...register('findings')}
                placeholder="Document compliance findings or issues"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="remediation" className="block text-sm font-medium text-foreground mb-2">
                Remediation Plan
              </label>
              <Textarea
                id="remediation"
                {...register('remediation')}
                placeholder="Describe remediation steps if non-compliant"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <Textarea
                id="notes"
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
