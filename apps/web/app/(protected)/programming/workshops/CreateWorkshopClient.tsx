'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, GraduationCap } from 'lucide-react';

const createWorkshopSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'open_registration', 'full', 'in_progress', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  instructor: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  project_id: z.string().optional(),
});

export default function CreateWorkshopClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createWorkshopSchema>>({
    resolver: zodResolver(createWorkshopSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      location: '',
      capacity: undefined,
      skill_level: 'beginner',
      instructor: '',
      price: undefined,
      currency: 'USD',
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
        .eq('status', 'active')
        .order('name');
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof createWorkshopSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const workshopData = {
        ...data,
        kind: 'workshop' as const,
        organization_id: orgId,
        project_id: data.project_id || null,
        capacity: data.capacity || null,
        price: data.price || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_events')
        .insert(workshopData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.workshop.created', { 
          organization_id: orgId,
          skill_level: data.skill_level,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create workshop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Workshop
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Workshop"
        description="Add a new workshop event"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="name" className="text-body-sm form-label">
              Workshop Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter workshop name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.name.message}
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
              placeholder="Describe the workshop..."
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-body-sm form-label">
                Status *
              </label>
              <select
                id="status"
                className="rounded border px-3 py-2"
                {...form.register('status')}
              >
                <option value="planning">Planning</option>
                <option value="open_registration">Open Registration</option>
                <option value="full">Full</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="skill_level" className="text-body-sm form-label">
                Skill Level *
              </label>
              <select
                id="skill_level"
                className="rounded border px-3 py-2"
                {...form.register('skill_level')}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="start_date" className="text-body-sm form-label">
                Start Date
              </label>
              <input
                id="start_date"
                type="datetime-local"
                className="rounded border px-3 py-2"
                {...form.register('start_date')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="end_date" className="text-body-sm form-label">
                End Date
              </label>
              <input
                id="end_date"
                type="datetime-local"
                className="rounded border px-3 py-2"
                {...form.register('end_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="location" className="text-body-sm form-label">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Workshop location..."
                {...form.register('location')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="instructor" className="text-body-sm form-label">
                Instructor
              </label>
              <input
                id="instructor"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Instructor name..."
                {...form.register('instructor')}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="capacity" className="text-body-sm form-label">
                Capacity
              </label>
              <input
                id="capacity"
                type="number"
                min="0"
                className="rounded border px-3 py-2"
                placeholder="Max participants..."
                {...form.register('capacity', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="price" className="text-body-sm form-label">
                Price
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                className="rounded border px-3 py-2"
                placeholder="0.00"
                {...form.register('price', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="currency" className="text-body-sm form-label">
                Currency
              </label>
              <select
                id="currency"
                className="rounded border px-3 py-2"
                {...form.register('currency')}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="project_id" className="text-body-sm form-label">
              Associated Project
            </label>
            <select
              id="project_id"
              className="rounded border px-3 py-2"
              {...form.register('project_id')}
            >
              <option value="">No project association</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
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
              <GraduationCap className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Workshop'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
