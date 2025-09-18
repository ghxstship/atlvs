'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer, Button, Input, Select, Textarea } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  jobId: z.string().min(1, 'Job ID is required'),
  assigneeUserId: z.string().optional(),
  assigneeType: z.enum(['internal', 'contractor', 'vendor']),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0, 'Hours must be positive').optional(),
  hourlyRate: z.number().min(0, 'Rate must be positive').optional(),
  currency: z.string().default('USD'),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
  notes: z.string().optional(),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

interface CreateAssignmentClientProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateAssignmentClient({ orgId, onSuccess }: CreateAssignmentClientProps) {
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
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    mode: 'onChange',
    defaultValues: {
      assigneeType: 'internal',
      status: 'pending',
      priority: 'medium',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: CreateAssignmentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      posthog?.capture('jobs_assignment_create_attempt', {
        organization_id: orgId,
        assignee_type: data.assigneeType,
        priority: data.priority,
      });

      const response = await fetch('/api/v1/jobs/assignments', {
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
        throw new Error(errorData.message || 'Failed to create assignment');
      }

      const result = await response.json();

      posthog?.capture('jobs_assignment_create_success', {
        organization_id: orgId,
        assignment_id: result.id,
        assignee_type: data.assigneeType,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'create',
        resource_type: 'assignment',
        resource_id: result.id,
        metadata: {
          title: data.title,
          assignee_type: data.assigneeType,
          priority: data.priority,
          estimated_hours: data.estimatedHours,
        },
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      posthog?.capture('jobs_assignment_create_error', {
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
        Create Assignment
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Create New Assignment"
        description="Assign work to team members, contractors, or vendors"
       
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
                form="create-assignment-form"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Assignment
              </Button>
            </div>
          </div>
        }
      >
        <form id="create-assignment-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-lg">
            <div>
              <label htmlFor="title" className="block text-body-sm form-label color-foreground mb-sm">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter assignment title"
               
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm form-label color-foreground mb-sm">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the assignment details"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="jobId" className="block text-body-sm form-label color-foreground mb-sm">
                  Job ID *
                </label>
                <Input
                  id="jobId"
                  {...register('jobId')}
                  placeholder="Enter associated job ID"
                 
                />
              </div>

              <div>
                <label htmlFor="assigneeUserId" className="block text-body-sm form-label color-foreground mb-sm">
                  Assignee User ID
                </label>
                <Input
                  id="assigneeUserId"
                  {...register('assigneeUserId')}
                  placeholder="Enter user ID to assign"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="assigneeType" className="block text-body-sm form-label color-foreground mb-sm">
                  Assignee Type *
                </label>
                <Select {...register('assigneeType')}>
                  <option value="internal">Internal</option>
                  <option value="contractor">Contractor</option>
                  <option value="vendor">Vendor</option>
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
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-body-sm form-label color-foreground mb-sm">
                Status
              </label>
              <Select {...register('status')}>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="startDate" className="block text-body-sm form-label color-foreground mb-sm">
                  Start Date
                </label>
                <Input
                  type="date"
                  {...register('startDate')}
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-body-sm form-label color-foreground mb-sm">
                  Due Date
                </label>
                <Input
                  type="date"
                  {...register('dueDate')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label htmlFor="estimatedHours" className="block text-body-sm form-label color-foreground mb-sm">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  step="0.5"
                  {...register('estimatedHours', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-body-sm form-label color-foreground mb-sm">
                  Hourly Rate
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('hourlyRate', { valueAsNumber: true })}
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

            <div>
              <label htmlFor="requirements" className="block text-body-sm form-label color-foreground mb-sm">
                Requirements
              </label>
              <Textarea
                {...register('requirements')}
                placeholder="List specific requirements for this assignment"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="deliverables" className="block text-body-sm form-label color-foreground mb-sm">
                Deliverables
              </label>
              <Textarea
                {...register('deliverables')}
                placeholder="Describe expected deliverables"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-body-sm form-label color-foreground mb-sm">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this assignment"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
}
