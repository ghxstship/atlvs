'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, ClipboardCheck } from 'lucide-react';

const createInspectionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['pre_event', 'post_event', 'safety', 'compliance', 'quality', 'other']),
  scheduled_at: z.string().optional(),
  inspector_name: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
});

export default function CreateInspectionClient({ 
  orgId, 
  projects 
}: { 
  orgId: string; 
  projects: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations('inspections');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createInspectionSchema>>({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      title: '',
      type: 'pre_event',
      scheduled_at: '',
      inspector_name: '',
      project_id: '',
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof createInspectionSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const inspectionData = {
        ...data,
        organization_id: orgId,
        project_id: data.project_id || null,
        scheduled_at: data.scheduled_at || null,
        status: 'scheduled',
      };

      const { error: insertError } = await sb
        .from('inspections')
        .insert(inspectionData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('inspection.created', { 
          organization_id: orgId,
          type: data.type,
          has_project: !!data.project_id
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Inspection
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Inspection"
        description="Schedule a new inspection for quality, safety, or compliance"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="title" className="text-body-sm form-label">
              Inspection Title *
            </label>
            <input
              id="title"
              type="text"
              className="rounded border px-3 py-2"
              placeholder="Enter inspection title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.title.message}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="text-body-sm form-label">
              Inspection Type *
            </label>
            <select
              id="type"
              className="rounded border px-3 py-2"
              {...form.register('type')}
            >
              <option value="pre_event">Pre-Event Inspection</option>
              <option value="post_event">Post-Event Inspection</option>
              <option value="safety">Safety Inspection</option>
              <option value="compliance">Compliance Inspection</option>
              <option value="quality">Quality Inspection</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="scheduled_at" className="text-body-sm form-label">
                Scheduled Date & Time
              </label>
              <input
                id="scheduled_at"
                type="datetime-local"
                className="rounded border px-3 py-2"
                {...form.register('scheduled_at')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="inspector_name" className="text-body-sm form-label">
                Inspector Name
              </label>
              <input
                id="inspector_name"
                type="text"
                className="rounded border px-3 py-2"
                placeholder="Inspector name..."
                {...form.register('inspector_name')}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="project_id" className="text-body-sm form-label">
              Associated Project
            </label>
            <select
              id="project_id"
              className="rounded border px-3 py-2"
              {...form.register('project_id')}
            >
              <option value="">No project (organization-wide inspection)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-body-sm form-label">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="rounded border px-3 py-2"
              placeholder="Additional notes about this inspection..."
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
              <ClipboardCheck className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Inspection'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
