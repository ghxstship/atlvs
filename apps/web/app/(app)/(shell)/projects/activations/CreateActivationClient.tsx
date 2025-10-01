'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Rocket } from 'lucide-react';

const createActivationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  activation_date: z.string().optional(),
  budget: z.number().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
});

export default function CreateActivationClient({ 
  orgId, 
  projects 
}: { 
  orgId: string; 
  projects: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations('activations');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createActivationSchema>>({
    resolver: zodResolver(createActivationSchema),
    defaultValues: {
      name: '',
      activation_date: '',
      budget: undefined,
      project_id: '',
      description: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof createActivationSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const activationData = {
        ...data,
        organization_id: orgId,
        project_id: data.project_id || null,
        activation_date: data.activation_date || null,
        budget: data.budget || null,
        status: 'planning',
      };

      const { error: insertError } = await sb
        .from('activations')
        .insert(activationData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('activation.created', { 
          organization_id: orgId,
          has_project: !!data.project_id,
          has_budget: !!data.budget
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Failed to create activation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-sm">
        <Plus className="w-icon-xs h-icon-xs" />
        Add Activation
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Activation"
        description="Plan a new project activation or launch process"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          {error && (
            <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-sm">
            <label htmlFor="name" className="text-body-sm form-label">
              Activation Name *
            </label>
            <input
              id="name"
              type="text"
              className="rounded border  px-md py-sm"
              placeholder="Enter activation name..."
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.name.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="activation_date" className="text-body-sm form-label">
                Activation Date & Time
              </label>
              <input
                id="activation_date"
                type="datetime-local"
                className="rounded border  px-md py-sm"
                {...form.register('activation_date')}
              />
            </div>

            <div className="grid gap-sm">
              <label htmlFor="budget" className="text-body-sm form-label">
                Budget ($)
              </label>
              <input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                className="rounded border  px-md py-sm"
                placeholder="0.00"
                {...form.register('budget', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-sm">
            <label htmlFor="project_id" className="text-body-sm form-label">
              Associated Project
            </label>
            <select
              id="project_id"
              className="rounded border  px-md py-sm"
              {...form.register('project_id')}
            >
              <option value="">No project (organization-wide activation)</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-sm">
            <label htmlFor="description" className="text-body-sm form-label">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="rounded border  px-md py-sm"
              placeholder="Describe the activation process, goals, and requirements..."
              {...form.register('description')}
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
              <Rocket className="w-icon-xs h-icon-xs" />
              {loading ? 'Creating...' : 'Create Activation'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
