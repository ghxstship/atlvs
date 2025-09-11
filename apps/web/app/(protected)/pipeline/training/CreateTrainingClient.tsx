'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { GraduationCap, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const trainingSchema = z.object({
  title: z.string().min(1, 'Training title is required'),
  description: z.string().optional(),
  type: z.enum(['safety', 'technical', 'compliance', 'leadership', 'other']).default('technical'),
  provider: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location: z.string().optional(),
  format: z.enum(['in_person', 'virtual', 'hybrid']).default('in_person'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  cost: z.number().min(0, 'Cost cannot be negative').optional(),
  currency: z.string().default('USD'),
  prerequisites: z.string().optional(),
  certification: z.boolean().default(false),
  certificationBody: z.string().optional(),
  validityPeriod: z.number().optional(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface CreateTrainingClientProps {
  orgId: string;
  onTrainingCreated?: () => void;
}

export default function CreateTrainingClient({ orgId, onTrainingCreated }: CreateTrainingClientProps) {
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
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'technical',
      format: 'in_person',
      currency: 'USD',
      certification: false,
      duration: 8,
      capacity: 20,
    }
  });

  const certification = watch('certification');

  const onSubmit = async (data: TrainingFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/pipeline/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create training');
      }

      const result = await response.json();

      // Track training creation
      posthog?.capture('pipeline_training_created', {
        training_id: result.training.id,
        title: data.title,
        type: data.type,
        format: data.format,
        duration: data.duration,
        certification: data.certification,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'training',
        resource_id: result.training.id,
        details: {
          title: data.title,
          type: data.type,
          format: data.format,
          duration: data.duration,
          certification: data.certification,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onTrainingCreated?.();

    } catch (error) {
      console.error('Error creating training:', error);
      posthog?.capture('pipeline_training_creation_failed', {
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
        className="flex items-center gap-2"
       
      >
        <Plus className="h-4 w-4" />
        Add Training
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Training Program"
        width="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="training-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Training'}
            </Button>
          </div>
        }
      >
        <form id="training-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-medium">Training Program Information</h3>
              <p className="text-sm text-foreground/70">
                Create a new training program for your organization
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Training Title *
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., Safety Orientation, Technical Skills Workshop"
                error={errors.title?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="safety">Safety</option>
                  <option value="technical">Technical</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Format
                </label>
                <select
                  {...register('format')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="in_person">In Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (hours) *
                </label>
                <Input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="8"
                  error={errors.duration?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacity *
                </label>
                <Input
                  {...register('capacity', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="20"
                  error={errors.capacity?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cost
                </label>
                <Input
                  {...register('cost', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.cost?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date *
                </label>
                <Input
                  {...register('startDate')}
                  type="datetime-local"
                  error={errors.startDate?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  {...register('endDate')}
                  type="datetime-local"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Provider/Instructor
                </label>
                <Input
                  {...register('provider')}
                  placeholder="Training provider or instructor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  {...register('location')}
                  placeholder="Training venue or online platform"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Detailed description of the training program"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prerequisites
              </label>
              <Textarea
                {...register('prerequisites')}
                placeholder="Required skills, experience, or prior training"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('certification')}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  This training provides certification
                </label>
              </div>

              {certification && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Certification Body
                    </label>
                    <Input
                      {...register('certificationBody')}
                      placeholder="e.g., OSHA, NFPA, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Validity Period (months)
                    </label>
                    <Input
                      {...register('validityPeriod', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      placeholder="12"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-success/5 p-4 rounded-lg">
            <h4 className="font-medium text-success mb-2">Training Guidelines</h4>
            <ul className="text-sm text-success/80 space-y-1">
              <li>• Ensure training aligns with organizational safety and compliance requirements</li>
              <li>• Set realistic capacity limits based on venue and format</li>
              <li>• Include detailed prerequisites to ensure participant readiness</li>
              <li>• For certification programs, specify validity periods and renewal requirements</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
