'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
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
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-4 w-4" />
        Add Manning Slot
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Manning Slot"
       
        footer={
          <div className="flex justify-end gap-sm">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-sm" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="manning-slot-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Slot'}
            </Button>
          </div>
        }
      >
        <form id="manning-slot-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 color-accent" />
            </div>
            <div>
              <h3 className="form-label">Manning Slot Information</h3>
              <p className="text-body-sm color-foreground/70">
                Define staffing requirements for a project role
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">
                Project *
              </label>
              <select
                {...register('projectId')}
                className="w-full  px-md py-sm border border-input rounded-md bg-background"
              >
                <option value="">Select project...</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-body-sm color-destructive mt-xs">{errors.projectId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Role *
                </label>
                <UnifiedInput                   {...register('role')}
                  placeholder="e.g., Production Manager, Rigger, etc."
                  error={errors.role?.message}
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Required Count *
                </label>
                <UnifiedInput                   {...register('requiredCount', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="1"
                  error={errors.requiredCount?.message}
                />
              </div>
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

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Start Date
                </label>
                <UnifiedInput                   {...register('startDate')}
                  type="date"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  End Date
                </label>
                <UnifiedInput                   {...register('endDate')}
                  type="date"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of the role and responsibilities"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Skill Requirements
              </label>
              <Textarea
                {...register('skillRequirements')}
                placeholder="Required skills, certifications, experience, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="bg-accent/10 p-md rounded-lg">
            <h4 className="form-label color-accent-foreground mb-sm">Manning Guidelines</h4>
            <ul className="text-body-sm color-accent/80 stack-xs">
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
