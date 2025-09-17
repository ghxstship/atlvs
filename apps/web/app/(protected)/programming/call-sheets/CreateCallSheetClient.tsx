'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, FileText } from 'lucide-react';

const createCallSheetSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  call_date: z.string().min(1, 'Call date is required'),
  call_time: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['draft', 'sent', 'confirmed', 'cancelled']),
  notes: z.string().optional(),
  event_id: z.string().min(1, 'Event is required'),
});

export default function CreateCallSheetClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createCallSheetSchema>>({
    resolver: zodResolver(createCallSheetSchema),
    defaultValues: {
      title: '',
      call_date: '',
      call_time: '',
      location: '',
      status: 'draft',
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

  const onSubmit = async (data: z.infer<typeof createCallSheetSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const callSheetData = {
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_call_sheets')
        .insert(callSheetData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.call_sheet.created', { 
          organization_id: orgId,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create call sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Call Sheet
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Call Sheet"
        description="Create a call sheet for an event"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="event_id" className="text-body-sm form-label">
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
              <div className="text-body-sm color-destructive">
                {form.formState.errors.event_id.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="title" className="text-body-sm form-label">
              Call Sheet Title *
            </label>
            <input
              id="title"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter call sheet title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.title.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="call_date" className="text-body-sm form-label">
                Call Date *
              </label>
              <input
                id="call_date"
                type="date"
                className="rounded border px-3 py-2"
                {...form.register('call_date')}
              />
              {form.formState.errors.call_date && (
                <div className="text-body-sm color-destructive">
                  {form.formState.errors.call_date.message}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="call_time" className="text-body-sm form-label">
                Call Time
              </label>
              <input
                id="call_time"
                type="time"
                className="rounded border px-3 py-2"
                {...form.register('call_time')}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="location" className="text-body-sm form-label">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Meeting location..."
              {...form.register('location')}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="status" className="text-body-sm form-label">
              Status *
            </label>
            <select
              id="status"
              className="rounded border px-3 py-2"
              {...form.register('status')}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-body-sm form-label">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              className="rounded border px-3 py-2"
              placeholder="Additional notes or instructions..."
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
              <FileText className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Call Sheet'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
