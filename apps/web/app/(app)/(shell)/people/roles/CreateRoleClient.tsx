'use client';
import { Button, Drawer, Input } from '@ghxstship/ui';


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Briefcase, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  department: z.string().optional(),
  level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']).default('mid'),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  salaryRange: z.string().optional(),
  isActive: z.boolean().default(true)
});

type RoleFormData = z.infer<typeof roleSchema>;

interface CreateRoleClientProps {
  orgId: string;
  onRoleCreated?: () => void;
}

export default function CreateRoleClient({ orgId, onRoleCreated }: CreateRoleClientProps) {
  const t = useTranslations('people');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    mode: 'onChange',
    defaultValues: {
      level: 'mid',
      isActive: true
    }
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/people/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }

      const result = await response.json();

      // Track role creation
      posthog?.capture('people_role_created', {
        role_id: result.data.id,
        name: data.name,
        department: data.department,
        level: data.level,
        organization_id: orgId
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'role',
        resource_id: result.data.id,
        details: {
          name: data.name,
          department: data.department,
          level: data.level
        }
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onRoleCreated?.();

    } catch (error) {
      console.error('Error creating role:', error);
      posthog?.capture('people_role_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organization_id: orgId
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
        Add Role
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Role"
       
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
              form="role-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="stack-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="p-sm bg-success/10 rounded-lg">
              <Briefcase className="h-icon-sm w-icon-sm color-success" />
            </div>
            <div>
              <h3 className="form-label">Role Information</h3>
              <p className="text-body-sm color-foreground/70">
                Define a new role within your organization
              </p>
            </div>
          </div>

          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">
                Role Name *
              </label>
              <Input                 {...register('name')}
                placeholder="e.g., Production Manager, Lighting Designer"
                error={errors.name?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Department
                </label>
                <Input                   {...register('department')}
                  placeholder="e.g., Production, Technical, Creative"
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-sm">
                  Level
                </label>
                <select
                  {...register('level')}
                  className="w-full  px-md py-sm border border-input rounded-md bg-background"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                  <option value="director">Director</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Brief overview of the role"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Key Responsibilities
              </label>
              <textarea
                {...register('responsibilities')}
                placeholder="Main duties and responsibilities for this role"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Requirements
              </label>
              <textarea
                {...register('requirements')}
                placeholder="Skills, experience, and qualifications required"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Salary Range
              </label>
              <Input                 {...register('salaryRange')}
                placeholder="e.g., $50,000 - $70,000 annually"
              />
            </div>

            <div className="flex items-center gap-sm">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-icon-xs h-icon-xs"
              />
              <label className="text-body-sm form-label">
                Role is currently active for hiring
              </label>
            </div>
          </div>

          <div className="bg-success/5 p-md rounded-lg">
            <h4 className="form-label color-success mb-sm">Role Guidelines</h4>
            <ul className="text-body-sm color-success/80 stack-xs">
              <li>• Use clear, descriptive role names that reflect actual responsibilities</li>
              <li>• Define specific requirements to help with candidate evaluation</li>
              <li>• Include both technical and soft skill requirements</li>
              <li>• Keep salary ranges competitive and realistic for your market</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
