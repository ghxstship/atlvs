'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { List, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const shortlistSchema = z.object({
  name: z.string().min(1, 'Shortlist name is required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'closed', 'archived']).default('active'),
  maxMembers: z.number().min(1, 'Max members must be at least 1').optional(),
  tags: z.string().optional(),
});

type ShortlistFormData = z.infer<typeof shortlistSchema>;

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Role {
  id: string;
  name: string;
  department?: string;
}

interface CreateShortlistClientProps {
  orgId: string;
  onShortlistCreated?: () => void;
}

export default function CreateShortlistClient({ orgId, onShortlistCreated }: CreateShortlistClientProps) {
  const t = useTranslations('people');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ShortlistFormData>({
    resolver: zodResolver(shortlistSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'active',
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadRoles();
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

  const loadRoles = async () => {
    try {
      const { data: roles } = await sb
        .from('people_roles')
        .select('id, name, department')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name');

      setRoles(roles || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const onSubmit = async (data: ShortlistFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Convert tags string to array
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const response = await fetch('/api/v1/people/shortlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          ...data,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shortlist');
      }

      const result = await response.json();

      // Track shortlist creation
      posthog?.capture('people_shortlist_created', {
        shortlist_id: result.data.id,
        name: data.name,
        project_id: data.projectId,
        role_id: data.roleId,
        status: data.status,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'shortlist',
        resource_id: result.data.id,
        details: {
          name: data.name,
          project_id: data.projectId,
          role_id: data.roleId,
          status: data.status,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onShortlistCreated?.();

    } catch (error) {
      console.error('Error creating shortlist:', error);
      posthog?.capture('people_shortlist_creation_failed', {
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
        Add Shortlist
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Shortlist"
       
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
              form="shortlist-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Shortlist'}
            </Button>
          </div>
        }
      >
        <form id="shortlist-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Shortlist Information</h3>
              <p className="text-sm text-foreground/70">
                Create a curated list of candidates for a specific role or project
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Shortlist Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Sound Engineers - Festival 2024"
                error={errors.name?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project
                </label>
                <select
                  {...register('projectId')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select project (optional)...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  {...register('roleId')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select role (optional)...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.department && `(${role.department})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Members
                </label>
                <Input
                  {...register('maxMembers', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Purpose and criteria for this shortlist"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <Input
                {...register('tags')}
                placeholder="e.g., urgent, experienced, local (comma separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter tags separated by commas
              </p>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Shortlist Guidelines</h4>
            <ul className="text-sm text-primary/80 space-y-1">
              <li>• Use descriptive names that clearly indicate the purpose</li>
              <li>• Link to specific projects and roles when applicable</li>
              <li>• Set realistic maximum member limits</li>
              <li>• Use tags to categorize and filter shortlists effectively</li>
              <li>• Keep descriptions clear about selection criteria</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}
