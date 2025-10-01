'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MapPin } from 'lucide-react';

const createItinerarySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['travel', 'daily', 'event', 'tour']),
  status: z.enum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  transportation_type: z.enum(['flight', 'car', 'train', 'bus', 'ship', 'walking']).optional(),
  total_cost: z.number().min(0).optional(),
  currency: z.string().optional(),
  participants_count: z.number().min(0).optional(),
  project_id: z.string().optional(),
  event_id: z.string().optional(),
});

export default function CreateItineraryClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createItinerarySchema>>({
    resolver: zodResolver(createItinerarySchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'travel',
      status: 'draft',
      start_date: '',
      end_date: '',
      location: '',
      transportation_type: undefined,
      total_cost: undefined,
      currency: 'USD',
      participants_count: undefined,
      project_id: '',
      event_id: '',
    },
  });

  // Load projects and events when drawer opens
  const handleOpen = async () => {
    setOpen(true);
    try {
      const [projectsData, eventsData] = await Promise.all([
        sb.from('projects').select('id, name').eq('organization_id', orgId).eq('status', 'active').order('name'),
        sb.from('programming_events').select('id, name').eq('organization_id', orgId).in('status', ['planning', 'confirmed', 'in_progress']).order('name')
      ]);
      
      setProjects(projectsData.data || []);
      setEvents(eventsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof createItinerarySchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const itineraryData = {
        ...data,
        organization_id: orgId,
        project_id: data.project_id || null,
        event_id: data.event_id || null,
        total_cost: data.total_cost || null,
        participants_count: data.participants_count || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_itineraries')
        .insert(itineraryData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.itinerary.created', { 
          organization_id: orgId,
          type: data.type,
          status: data.status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Failed to create itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-sm">
        <Plus className="w-icon-xs h-icon-xs" />
        Add Itinerary
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Itinerary"
        description="Create a travel or daily schedule itinerary"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          {error && (
            <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-sm">
            <label htmlFor="name" className="text-body-sm form-label">
              Itinerary Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border  px-md py-sm"
              placeholder="Enter itinerary name..."
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
              className="rounded border  px-md py-sm"
              placeholder="Describe the itinerary..."
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="type" className="text-body-sm form-label">
                Type *
              </label>
              <select
                id="type"
                className="rounded border  px-md py-sm"
                {...form.register('type')}
              >
                <option value="travel">Travel</option>
                <option value="daily">Daily Schedule</option>
                <option value="event">Event Schedule</option>
                <option value="tour">Tour</option>
              </select>
            </div>

            <div className="grid gap-sm">
              <label htmlFor="status" className="text-body-sm form-label">
                Status *
              </label>
              <select
                id="status"
                className="rounded border  px-md py-sm"
                {...form.register('status')}
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="start_date" className="text-body-sm form-label">
                Start Date *
              </label>
              <input
                id="start_date"
                type="datetime-local"
                className="rounded border  px-md py-sm"
                {...form.register('start_date')}
              />
              {form.formState.errors.start_date && (
                <div className="text-body-sm color-destructive">
                  {form.formState.errors.start_date.message}
                </div>
              )}
            </div>

            <div className="grid gap-sm">
              <label htmlFor="end_date" className="text-body-sm form-label">
                End Date *
              </label>
              <input
                id="end_date"
                type="datetime-local"
                className="rounded border  px-md py-sm"
                {...form.register('end_date')}
              />
              {form.formState.errors.end_date && (
                <div className="text-body-sm color-destructive">
                  {form.formState.errors.end_date.message}
                </div>
              )}
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
                className="rounded border  px-md py-sm"
                placeholder="Primary location..."
                {...form.register('location')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="transportation_type" className="text-body-sm form-label">
                Transportation
              </label>
              <select
                id="transportation_type"
                className="rounded border  px-md py-sm"
                {...form.register('transportation_type')}
              >
                <option value="">Select transportation</option>
                <option value="flight">Flight</option>
                <option value="car">Car</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="ship">Ship</option>
                <option value="walking">Walking</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="total_cost" className="text-body-sm form-label">
                Total Cost
              </label>
              <input
                id="total_cost"
                type="number"
                min="0"
                step="0.01"
                className="rounded border  px-md py-sm"
                placeholder="0.00"
                {...form.register('total_cost', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="currency" className="text-body-sm form-label">
                Currency
              </label>
              <select
                id="currency"
                className="rounded border  px-md py-sm"
                {...form.register('currency')}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div className="grid gap-sm">
              <label htmlFor="participants_count" className="text-body-sm form-label">
                Participants
              </label>
              <input
                id="participants_count"
                type="number"
                min="0"
                className="rounded border  px-md py-sm"
                placeholder="0"
                {...form.register('participants_count', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="project_id" className="text-body-sm form-label">
                Associated Project
              </label>
              <select
                id="project_id"
                className="rounded border  px-md py-sm"
                {...form.register('project_id')}
              >
                <option value="">No project association</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-sm">
              <label htmlFor="event_id" className="text-body-sm form-label">
                Associated Event
              </label>
              <select
                id="event_id"
                className="rounded border  px-md py-sm"
                {...form.register('event_id')}
              >
                <option value="">No event association</option>
                {events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
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
              <MapPin className="w-icon-xs h-icon-xs" />
              {loading ? 'Creating...' : 'Create Itinerary'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
