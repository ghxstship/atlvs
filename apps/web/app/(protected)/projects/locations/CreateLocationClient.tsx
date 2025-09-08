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

const createLocationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  type: z.enum(['venue', 'office', 'warehouse', 'studio', 'outdoor', 'virtual', 'other']),
  capacity: z.number().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
});

export default function CreateLocationClient({ orgId }: { orgId: string }) {
  const t = useTranslations('locations');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createLocationSchema>>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      type: 'venue',
      capacity: undefined,
      project_id: '',
      notes: '',
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

  const onSubmit = async (data: z.infer<typeof createLocationSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const locationData = {
        ...data,
        organization_id: orgId,
        project_id: data.project_id || null,
        capacity: data.capacity || null,
      };

      const { error: insertError } = await sb
        .from('locations')
        .insert(locationData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('location.created', { 
          organization_id: orgId,
          type: data.type,
          has_project: !!data.project_id
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Location
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Location"
        description="Add a new location for projects and events"
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
              Location Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter location name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">
              Location Type *
            </label>
            <select
              id="type"
              className="rounded border px-3 py-2"
              {...form.register('type')}
            >
              <option value="venue">Venue</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="studio">Studio</option>
              <option value="outdoor">Outdoor</option>
              <option value="virtual">Virtual</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <input
              id="address"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Street address..."
              {...form.register('address')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <input
                id="city"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="City..."
                {...form.register('city')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="state" className="text-sm font-medium">
                State/Province
              </label>
              <input
                id="state"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="State or province..."
                {...form.register('state')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="country" className="text-sm font-medium">
                Country
              </label>
              <input
                id="country"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Country..."
                {...form.register('country')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="capacity" className="text-sm font-medium">
                Capacity
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                className="rounded border px-3 py-2"
                placeholder="Max capacity..."
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
              <option value="">No project (organization-wide location)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Additional notes about this location..."
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
              <MapPin className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
