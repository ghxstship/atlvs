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

const createSpaceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['stage', 'studio', 'green_room', 'dressing_room', 'meeting_room', 'storage', 'other']),
  capacity: z.number().min(0).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  amenities: z.string().optional(),
  availability_status: z.enum(['available', 'occupied', 'maintenance', 'reserved']),
  hourly_rate: z.number().min(0).optional(),
  currency: z.string().optional(),
});

export default function CreateSpaceClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createSpaceSchema>>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: '',
      type: 'studio',
      capacity: undefined,
      location: '',
      description: '',
      amenities: '',
      availability_status: 'available',
      hourly_rate: undefined,
      currency: 'USD',
    },
  });

  const onSubmit = async (data: z.infer<typeof createSpaceSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const spaceData = {
        ...data,
        organization_id: orgId,
        capacity: data.capacity || null,
        hourly_rate: data.hourly_rate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await sb
        .from('programming_spaces')
        .insert(spaceData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('programming.space.created', { 
          organization_id: orgId,
          type: data.type,
          availability_status: data.availability_status
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Space
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Space"
        description="Add a new venue space or room"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Space Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter space name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Space Type *
              </label>
              <select
                id="type"
                className="rounded border px-3 py-2"
                {...form.register('type')}
              >
                <option value="stage">Stage</option>
                <option value="studio">Studio</option>
                <option value="green_room">Green Room</option>
                <option value="dressing_room">Dressing Room</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="storage">Storage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="availability_status" className="text-sm font-medium">
                Availability *
              </label>
              <select
                id="availability_status"
                className="rounded border px-3 py-2"
                {...form.register('availability_status')}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="capacity" className="text-sm font-medium">
                Capacity
              </label>
              <input
                id="capacity"
                type="number"
                min="0"
                className="rounded border px-3 py-2"
                placeholder="Max occupancy..."
                {...form.register('capacity', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Building, floor, room..."
                {...form.register('location')}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Describe the space..."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="amenities" className="text-sm font-medium">
              Amenities
            </label>
            <textarea
              id="amenities"
              rows={2}
              className="rounded border px-3 py-2"
              placeholder="List available amenities..."
              {...form.register('amenities')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="hourly_rate" className="text-sm font-medium">
                Hourly Rate
              </label>
              <input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                className="rounded border px-3 py-2"
                placeholder="0.00"
                {...form.register('hourly_rate', { valueAsNumber: true })}
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
              {loading ? 'Creating...' : 'Create Space'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
