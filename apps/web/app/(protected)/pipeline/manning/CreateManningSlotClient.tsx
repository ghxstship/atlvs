'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { Users, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const manningSlotSchema = z.object({
  projectId: z.string().min(1, 'Project selection is required'),
  role: z.string().min(1, 'Role is required'),
  requiredCount: z.number().min(1, 'Required count must be at least 1'),
  description: z.string().optional(),
  skillRequirements: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ManningSlotFormData = z.infer<typeof manningSlotSchema>;

interface Project {
  id: string;
  name: string;
  status: string;
}

interface CreateManningSlotClientProps {
  orgId: string;
  onSlotCreated?: () => void;
}

export default function CreateManningSlotClient({ orgId, onSlotCreated }: CreateManningSlotClientProps) {
  const t = useTranslations('pipeline');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ManningSlotFormData>({
    resolver: zodResolver(manningSlotSchema),
    mode: 'onChange',
    defaultValues: {
      priority: 'medium',
      requiredCount: 1,
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, orgId]);

  const loadProjects = async () => {
    try {
      const { data: projects } = await sb
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId)
        .in('status', ['active', 'planning', 'in_progress'])
        .order('name');

      setProjects(projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onSubmit = async (data: ManningSlotFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/pipeline/manning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create manning slot');
      }

      const result = await response.json();

      // Track manning slot creation
      posthog?.capture('pipeline_manning_slot_created', {
        slot_id: result.slot.id,
        project_id: data.projectId,
        role: data.role,
        required_count: data.requiredCount,
        priority: data.priority,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'manning_slot',
        resource_id: result.slot.id,
        details: {
          project_id: data.projectId,
          role: data.role,
          required_count: data.requiredCount,
          priority: data.priority,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onSlotCreated?.();

    } catch (error) {
      console.error('Error creating manning slot:', error);
      posthog?.capture('pipeline_manning_slot_creation_failed', {
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
        Add Manning Slot
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Manning Slot"
       
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
              form="manning-slot-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Slot'}
            </Button>
          </div>
        }
      >
        <form id="manning-slot-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Manning Slot Information</h3>
              <p className="text-sm text-foreground/70">
                Define staffing requirements for a project role
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project *
              </label>
              <select
                {...register('projectId')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-sm text-destructive mt-1">{errors.projectId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <Input
                  {...register('role')}
                  placeholder="e.g., Production Manager, Rigger, etc."
                  error={errors.role?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Count *
                </label>
                <Input
                  {...register('requiredCount', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="1"
                  error={errors.requiredCount?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Input
                  {...register('startDate')}
                  type="date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  {...register('endDate')}
                  type="date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of the role and responsibilities"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skill Requirements
              </label>
              <Textarea
                {...register('skillRequirements')}
                placeholder="Required skills, certifications, experience, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-medium text-primary-foreground mb-2">Manning Guidelines</h4>
            <ul className="text-sm text-primary/80 space-y-1">
              <li>• Define clear role requirements and skill expectations</li>
              <li>• Set realistic required counts based on project scope</li>
              <li>• Use priority levels to focus recruitment efforts</li>
              <li>• Include start/end dates for time-sensitive positions</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
