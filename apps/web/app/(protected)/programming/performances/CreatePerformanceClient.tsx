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
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Performance Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter performance name..."
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
              placeholder="Describe the performance..."
              {...form.register('description')}
            />
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
              <option value="rehearsal">Rehearsal</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                placeholder="Performance location..."
                {...form.register('location')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="venue" className="text-sm font-medium">
                Venue
              </label>
              <input
                id="venue"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Venue name..."
                {...form.register('venue')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="stage" className="text-sm font-medium">
                Stage
              </label>
              <input
                id="stage"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Stage name..."
                {...form.register('stage')}
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
                placeholder="Max audience..."
                {...form.register('capacity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="ticket_price" className="text-sm font-medium">
                Ticket Price
              </label>
              <input
                id="ticket_price"
                type="number"
                min="0"
                step="0.01"
                className="rounded border px-3 py-2"
                placeholder="0.00"
                {...form.register('ticket_price', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="currency" className="text-sm font-medium">
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
              <Music className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Performance'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
