'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Drawer, UnifiedInput, Textarea, Select, Card, Badge } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

// Form validation schema
const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  kind: z.enum(['performance', 'activation', 'workshop', 'meeting', 'rehearsal', 'setup', 'breakdown']),
  project_id: z.string().uuid('Please select a project'),
  start_at: z.string().min(1, 'Start time is required'),
  end_at: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('draft')
});

type CreateEventForm = z.infer<typeof createEventSchema>;

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function CreateCalendarClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  const posthog = usePostHog();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      description: '',
      kind: 'performance',
      project_id: '',
      start_at: '',
      end_at: '',
      location: '',
      capacity: undefined,
      status: 'draft'
    }
  });

  // Load projects when drawer opens
  useEffect(() => {
    if (isOpen && projects.length === 0) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await sb
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const onSubmit = async (data: CreateEventForm) => {
    setIsLoading(true);
    try {
      const { error } = await sb
        .from('events')
        .insert({
          ...data,
          organization_id: orgId,
          capacity: data.capacity || null
        });

      if (error) throw error;

      // Track event creation
      posthog?.capture('programming_event_created', {
        event_kind: data.kind,
        project_id: data.project_id,
        organization_id: orgId
      });

      // Reset form and close drawer
      form.reset();
      setIsOpen(false);
      
      // Refresh the page to show new event
      window.location.reload();
    } catch (error) {
      console.error('Error creating event:', error);
      // Error handling implemented
      alert('An error occurred while creating the event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const eventKindOptions = [
    { value: 'performance', label: 'Performance' },
    { value: 'activation', label: 'Activation' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'setup', label: 'Setup' },
    { value: 'breakdown', label: 'Breakdown' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-sm"
       
      >
        <Plus className="h-4 w-4" />
        Create Event
      </Button>

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Event"
        description="Add a new event to the programming calendar"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-md">
            <UnifiedInput               label="Event Name"
              placeholder="Enter event name"
              {...form.register('name')}
             
              required
            />

            <Textarea
              label="Description"
              placeholder="Enter event description (optional)"
              {...form.register('description')}
             
              rows={3}
            />

            <div className="grid grid-cols-2 gap-md">
              <Select
                {...form.register('kind')}
              >
                <option value="">Select type</option>
                {eventKindOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                {...form.register('status')}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              {...form.register('project_id')}
              disabled={loadingProjects}
            >
              <option value="">
                {loadingProjects ? 'Loading projects...' : 'Select project'}
              </option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-md">
              <UnifiedInput                 label="Start Time"
                type="datetime-local"
                {...form.register('start_at')}
               
                required
              />

              <UnifiedInput                 label="End Time"
                type="datetime-local"
                {...form.register('end_at')}
               
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <UnifiedInput                 label="Location"
                placeholder="Enter location (optional)"
                {...form.register('location')}
               
              />

              <UnifiedInput                 label="Capacity"
                type="number"
                placeholder="Enter capacity (optional)"
                {...form.register('capacity', { valueAsNumber: true })}
               
                min={0}
              />
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              className="flex items-center gap-sm"
            >
              <Calendar className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
