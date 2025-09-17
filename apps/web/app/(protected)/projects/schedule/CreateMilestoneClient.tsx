'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, CheckCircle } from 'lucide-react';

const createMilestoneSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  due_at: z.string().min(1, 'Due date is required'),
  project_id: z.string().min(1, 'Project is required'),
});

export default function CreateMilestoneClient({ orgId }: { orgId: string }) {
  const t = useTranslations('milestones');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createMilestoneSchema>>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      due_at: '',
      project_id: '',
    },
  });

  // Load projects when drawer opens
  const handleOpen = async () => {
    setOpen(true);
    try {
      const { data } = await sb
        .from('projects')
        .select('id, name')
        .eq('organization_id', orgId)
        .in('status', ['planning', 'active'])
        .order('name');
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof createMilestoneSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const milestoneData = {
        ...data,
        organization_id: orgId,
        status: 'pending',
        due_at: new Date(data.due_at).toISOString(),
      };

      const { error: insertError } = await sb
        .from('milestones')
        .insert(milestoneData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('milestone.created', { 
          organization_id: orgId,
          project_id: data.project_id
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Milestone
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Milestone"
        description="Add a new milestone to track project progress"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="project_id" className="text-body-sm form-label">
              Project *
            </label>
            <select
              id="project_id"
              className="rounded border px-3 py-2"
              {...form.register('project_id')}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {form.formState.errors.project_id && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.project_id.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="title" className="text-body-sm form-label">
              Milestone Title *
            </label>
            <input
              id="title"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter milestone title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.title.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-body-sm form-label">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Describe the milestone..."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="due_at" className="text-body-sm form-label">
              Due Date *
            </label>
            <input
              id="due_at"
              type="date"
              className="rounded border px-3 py-2"
              {...form.register('due_at')}
            />
            {form.formState.errors.due_at && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.due_at.message}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                form.reset();
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
