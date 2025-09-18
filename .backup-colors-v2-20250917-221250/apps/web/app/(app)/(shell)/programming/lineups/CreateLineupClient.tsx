'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users } from 'lucide-react';

const createLineupSchema = z.object({
  performer: z.string().min(2, 'Performer name is required'),
  role: z.string().optional(),
  stage: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  event_id: z.string().min(1, 'Event is required'),
});

export default function CreateLineupClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createLineupSchema>>({
    resolver: zodResolver(createLineupSchema),
    defaultValues: {
      performer: '',
      role: '',
      stage: '',
      status: 'confirmed',
      start_time: '',
      end_time: '',
      notes: '',
      event_id: '',
    },
  });

  // Load events when drawer opens
  const handleOpen = async () => {
    setOpen(true);
    try {
      const { data } = await sb
        .from('programming_events')
        .select('id, name')
        .eq('organization_id', orgId)
        .in('status', ['planning', 'confirmed', 'in_progress'])
        .order('name');
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof createLineupSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const lineupData = {
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_lineups')
        .insert(lineupData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.lineup.created', { 
          organization_id: orgId,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create lineup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-sm">
        <Plus className="w-4 h-4" />
        Add Performer
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Add Performer to Lineup"
        description="Add a new performer to an event lineup"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          {error && (
            <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-sm">
            <label htmlFor="event_id" className="text-body-sm form-label">
              Event *
            </label>
            <select
              id="event_id"
              className="rounded border px-sm py-sm"
              {...form.register('event_id')}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            {form.formState.errors.event_id && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.event_id.message}
              </div>
            )}
          </div>

          <div className="grid gap-sm">
            <label htmlFor="performer" className="text-body-sm form-label">
              Performer Name *
            </label>
            <input
              id="performer"
              type="text"
              className="rounded border px-sm py-sm"
              placeholder="Enter performer name..."
              {...form.register('performer')}
            />
            {form.formState.errors.performer && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.performer.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="role" className="text-body-sm form-label">
                Role
              </label>
              <input
                id="role"
                type="text"
                className="rounded border px-sm py-sm"
                placeholder="e.g., Lead Vocalist, DJ..."
                {...form.register('role')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="stage" className="text-body-sm form-label">
                Stage
              </label>
              <input
                id="stage"
                type="text"
                className="rounded border px-sm py-sm"
                placeholder="e.g., Main Stage, Studio A..."
                {...form.register('stage')}
              />
            </div>
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
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="start_time" className="text-body-sm form-label">
                Start Time
              </label>
              <input
                id="start_time"
                type="datetime-local"
                className="rounded border px-sm py-sm"
                {...form.register('start_time')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="end_time" className="text-body-sm form-label">
                End Time
              </label>
              <input
                id="end_time"
                type="datetime-local"
                className="rounded border px-sm py-sm"
                {...form.register('end_time')}
              />
            </div>
          </div>

          <div className="grid gap-sm">
            <label htmlFor="notes" className="text-body-sm form-label">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="rounded border px-sm py-sm"
              placeholder="Additional notes about the performer..."
              {...form.register('notes')}
            />
          </div>

          <div className="flex items-center justify-end gap-sm pt-md border-t">
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
              <Users className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Performer'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
