'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { UserPlus, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const onboardingTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.enum(['documentation', 'training', 'equipment', 'access', 'orientation', 'compliance', 'other']).default('documentation'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigneeRole: z.string().optional(),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute'),
  durationUnit: z.enum(['minutes', 'hours', 'days']).default('hours'),
  prerequisites: z.string().optional(),
  instructions: z.string().optional(),
  resources: z.string().optional(),
  completionCriteria: z.string().optional(),
  automated: z.boolean().default(false),
  mandatory: z.boolean().default(true),
  order: z.number().min(1, 'Order must be at least 1').default(1),
});

type OnboardingTaskFormData = z.infer<typeof onboardingTaskSchema>;

interface CreateOnboardingTaskClientProps {
  orgId: string;
  onTaskCreated?: () => void;
}

export default function CreateOnboardingTaskClient({ orgId, onTaskCreated }: CreateOnboardingTaskClientProps) {
  const t = useTranslations('pipeline');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<OnboardingTaskFormData>({
    resolver: zodResolver(onboardingTaskSchema),
    mode: 'onChange',
    defaultValues: {
      category: 'documentation',
      priority: 'medium',
      durationUnit: 'hours',
      estimatedDuration: 1,
      automated: false,
      mandatory: true,
      order: 1,
    }
  });

  const automated = watch('automated');

  const onSubmit = async (data: OnboardingTaskFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/pipeline/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create onboarding task');
      }

      const result = await response.json();

      // Track onboarding task creation
      posthog?.capture('pipeline_onboarding_task_created', {
        task_id: result.task.id,
        title: data.title,
        category: data.category,
        priority: data.priority,
        mandatory: data.mandatory,
        automated: data.automated,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'onboarding_task',
        resource_id: result.task.id,
        details: {
          title: data.title,
          category: data.category,
          priority: data.priority,
          mandatory: data.mandatory,
          automated: data.automated,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onTaskCreated?.();

    } catch (error) {
      console.error('Error creating onboarding task:', error);
      posthog?.capture('pipeline_onboarding_task_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organization_id: orgId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-icon-xs w-icon-xs" />
        Add Onboarding Task
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Onboarding Task"
        width="xl"
        footer={
          <div className="flex justify-end gap-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-icon-xs w-icon-xs mr-sm" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="onboarding-task-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        }
      >
        <form id="onboarding-task-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-secondary/10 rounded-lg">
              <UserPlus className="h-icon-sm w-icon-sm color-secondary" />
            </div>
            <div>
              <h3 className="form-label">Onboarding Task Information</h3>
              <p className="text-body-sm color-foreground/70">
                Create a new task for the onboarding process
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">
                Task Title *
              </label>
              <UnifiedInput                 {...register('title')}
                placeholder="e.g., Complete Safety Orientation, Setup IT Equipment"
                error={errors.title?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="documentation">Documentation</option>
                  <option value="training">Training</option>
                  <option value="equipment">Equipment</option>
                  <option value="access">Access & Permissions</option>
                  <option value="orientation">Orientation</option>
                  <option value="compliance">Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Estimated Duration *
                </label>
                <UnifiedInput                   {...register('estimatedDuration', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="1"
                  error={errors.estimatedDuration?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Duration Unit
                </label>
                <select
                  {...register('durationUnit')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Order
                </label>
                <UnifiedInput                   {...register('order', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="1"
                  error={errors.order?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Assignee Role
              </label>
              <UnifiedInput                 {...register('assigneeRole')}
                placeholder="e.g., HR Manager, IT Administrator, Direct Supervisor"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Detailed description of the onboarding task"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Instructions
              </label>
              <Textarea
                {...register('instructions')}
                placeholder="Step-by-step instructions for completing this task"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Prerequisites
              </label>
              <Textarea
                {...register('prerequisites')}
                placeholder="Tasks or requirements that must be completed before this task"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Resources
              </label>
              <Textarea
                {...register('resources')}
                placeholder="Links, documents, or tools needed to complete this task"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Completion Criteria
              </label>
              <Textarea
                {...register('completionCriteria')}
                placeholder="How to verify that this task has been completed successfully"
                rows={2}
              />
            </div>

            <div className="stack-sm">
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  {...register('mandatory')}
                  className="w-icon-xs h-icon-xs"
                />
                <label className="text-body-sm form-label">
                  This task is mandatory for all new hires
                </label>
              </div>

              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  {...register('automated')}
                  className="w-icon-xs h-icon-xs"
                />
                <label className="text-body-sm form-label">
                  This task can be completed automatically
                </label>
              </div>
            </div>
          </div>

          <div className="bg-secondary/5 p-md rounded-lg">
            <h4 className="form-label color-secondary mb-sm">Onboarding Guidelines</h4>
            <ul className="text-body-sm color-secondary/80 stack-xs">
              <li>• Structure tasks in logical order from most critical to least critical</li>
              <li>• Provide clear instructions and completion criteria</li>
              <li>• Include all necessary resources and prerequisites</li>
              <li>• Mark mandatory tasks that apply to all new hires</li>
              <li>• Consider automation for routine administrative tasks</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
