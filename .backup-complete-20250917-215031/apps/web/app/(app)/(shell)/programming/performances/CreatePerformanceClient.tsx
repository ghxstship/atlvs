'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Music } from 'lucide-react';

const createPerformanceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'rehearsal', 'live', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  venue: z.string().optional(),
  stage: z.string().optional(),
  ticket_price: z.number().min(0).optional(),
  currency: z.string().optional(),
  project_id: z.string().optional(),
});

export default function CreatePerformanceClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createPerformanceSchema>>({
    resolver: zodResolver(createPerformanceSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      location: '',
      capacity: undefined,
      venue: '',
      stage: '',
      ticket_price: undefined,
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

  const onSubmit = async (data: z.infer<typeof createPerformanceSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const performanceData = {
        ...data,
        kind: 'performance' as const,
        organization_id: orgId,
        project_id: data.project_id || null,
        capacity: data.capacity || null,
        ticket_price: data.ticket_price || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_events')
        .insert(performanceData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.performance.created', { 
          organization_id: orgId,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create performance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-sm">
        <Plus className="w-4 h-4" />
        Add Performance
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Performance"
        description="Add a new performance event"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          {error && (
            <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-sm">
            <label htmlFor="name" className="text-body-sm form-label">
              Performance Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-sm py-sm"
              placeholder="Enter performance name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.name.message}
              </div>
            )}
          </div>

          <div className="grid gap-sm">
            <label htmlFor="description" className="text-body-sm form-label">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded border px-sm py-sm"
              placeholder="Describe the performance..."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-sm">
            <label htmlFor="status" className="text-body-sm form-label">
              Status *
            </label>
            <select
              id="status"
              className="rounded border px-sm py-sm"
              {...form.register('status')}
            >
              <option value="planning">Planning</option>
              <option value="rehearsal">Rehearsal</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="start_date" className="text-body-sm form-label">
                Start Date
              </label>
              <input
                id="start_date"
                type="datetime-local"
                className="rounded border px-sm py-sm"
                {...form.register('start_date')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="end_date" className="text-body-sm form-label">
                End Date
              </label>
              <input
                id="end_date"
                type="datetime-local"
                className="rounded border px-sm py-sm"
                {...form.register('end_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="location" className="text-body-sm form-label">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="rounded border px-sm py-sm"
                placeholder="Performance location..."
                {...form.register('location')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="venue" className="text-body-sm form-label">
                Venue
              </label>
              <input
                id="venue"
                type="text"
                className="rounded border px-sm py-sm"
                placeholder="Venue name..."
                {...form.register('venue')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="stage" className="text-body-sm form-label">
                Stage
              </label>
              <input
                id="stage"
                type="text"
                className="rounded border px-sm py-sm"
                placeholder="Stage name..."
                {...form.register('stage')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="capacity" className="text-body-sm form-label">
                Capacity
              </label>
              <input
                id="capacity"
                type="number"
                min="0"
                className="rounded border px-sm py-sm"
                placeholder="Max audience..."
                {...form.register('capacity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="ticket_price" className="text-body-sm form-label">
                Ticket Price
              </label>
              <input
                id="ticket_price"
                type="number"
                min="0"
                step="0.01"
                className="rounded border px-sm py-sm"
                placeholder="0.00"
                {...form.register('ticket_price', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="currency" className="text-body-sm form-label">
                Currency
              </label>
              <select
                id="currency"
                className="rounded border px-sm py-sm"
                {...form.register('currency')}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="grid gap-sm">
            <label htmlFor="project_id" className="text-body-sm form-label">
              Associated Project
            </label>
            <select
              id="project_id"
              className="rounded border px-sm py-sm"
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

          <div className="flex items-center justify-end gap-sm pt-4 border-t">
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
              className="inline-flex items-center gap-sm"
            >
              <Music className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Performance'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
