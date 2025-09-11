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
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="event_id" className="text-sm font-medium">
              Event *
            </label>
            <select
              id="event_id"
              className="rounded border px-3 py-2"
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
              <div className="text-xs text-destructive">
                {form.formState.errors.event_id.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="performer" className="text-sm font-medium">
              Performer Name *
            </label>
            <input
              id="performer"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter performer name..."
              {...form.register('performer')}
            />
            {form.formState.errors.performer && (
              <div className="text-xs text-destructive">
                {form.formState.errors.performer.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <input
                id="role"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="e.g., Lead Vocalist, DJ..."
                {...form.register('role')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="stage" className="text-sm font-medium">
                Stage
              </label>
              <input
                id="stage"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="e.g., Main Stage, Studio A..."
                {...form.register('stage')}
              />
            </div>
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
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="start_time" className="text-sm font-medium">
                Start Time
              </label>
              <input
                id="start_time"
                type="datetime-local"
                className="rounded border px-3 py-2"
                {...form.register('start_time')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="end_time" className="text-sm font-medium">
                End Time
              </label>
              <input
                id="end_time"
                type="datetime-local"
                className="rounded border px-3 py-2"
                {...form.register('end_time')}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Additional notes about the performer..."
              {...form.register('notes')}
            />
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
              <Users className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Performer'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
