'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar } from 'lucide-react';

const createEventSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  kind: z.enum(['performance', 'activation', 'workshop']),
  status: z.enum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  project_id: z.string().optional(),
});

export default function CreateEventClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      description: '',
      kind: 'performance',
      status: 'planning',
      start_date: '',
      end_date: '',
      location: '',
      capacity: undefined,
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

  const onSubmit = async (data: z.infer<typeof createEventSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const eventData = {
        ...data,
        organization_id: orgId,
        project_id: data.project_id || null,
        capacity: data.capacity || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_events')
        .insert(eventData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.event.created', { 
          organization_id: orgId,
          kind: data.kind,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Event
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Event"
        description="Add a new programming event"
        width="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Event Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter event name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Describe the event..."
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="kind" className="text-sm font-medium">
                Event Type *
              </label>
              <select
                id="kind"
                className="rounded border px-3 py-2"
                {...form.register('kind')}
              >
                <option value="performance">Performance</option>
                <option value="activation">Activation</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status *
              </label>
              <select
                id="status"
                className="rounded border px-3 py-2"
                {...form.register('status')}
              >
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="start_date" className="text-sm font-medium">
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
              <label htmlFor="end_date" className="text-sm font-medium">
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
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Event location..."
                {...form.register('location')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="capacity" className="text-sm font-medium">
                Capacity
              </label>
              <input
                id="capacity"
                type="number"
                min="0"
                className="rounded border px-3 py-2"
                placeholder="Max attendees..."
                {...form.register('capacity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="project_id" className="text-sm font-medium">
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
              <Calendar className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
