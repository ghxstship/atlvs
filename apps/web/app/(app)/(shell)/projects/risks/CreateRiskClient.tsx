'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, AlertTriangle } from 'lucide-react';

const createRiskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  impact: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  project_id: z.string().optional(),
});

export default function CreateRiskClient({ orgId }: { orgId: string }) {
  const t = useTranslations('risks');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const sb = createBrowserClient();

  const form = useForm<z.infer<typeof createRiskSchema>>({
    resolver: zodResolver(createRiskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      impact: 'medium',
      probability: 'medium',
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

  const onSubmit = async (data: z.infer<typeof createRiskSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const riskData = {
        ...data,
        organization_id: orgId,
        status: 'identified',
        project_id: data.project_id || null,
      };

      const { error: insertError } = await sb
        .from('risks')
        .insert(riskData);

      if (insertError) throw insertError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('risk.created', { 
          organization_id: orgId,
          category: data.category,
          impact: data.impact,
          probability: data.probability
        });
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Failed to create risk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="inline-flex items-center gap-sm">
        <Plus className="w-4 h-4" />
        Add Risk
      </Button>

      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          form.reset();
          setError(null);
        }}
        title="Create New Risk"
        description="Add a new risk to the risk register"
       
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          {error && (
            <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-sm">
            <label htmlFor="title" className="text-body-sm form-label">
              Risk Title *
            </label>
            <input
              id="title"
              type="text"
              className="rounded border  px-md py-sm"
              placeholder="Enter risk title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.title.message}
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
              placeholder="Describe the risk in detail..."
              {...form.register('description')}
            />
          </div>

          <div className="grid gap-sm">
            <label htmlFor="category" className="text-body-sm form-label">
              Category *
            </label>
            <select
              id="category"
              className="rounded border  px-md py-sm"
              {...form.register('category')}
            >
              <option value="">Select category</option>
              <option value="technical">Technical</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="strategic">Strategic</option>
              <option value="compliance">Compliance</option>
              <option value="security">Security</option>
              <option value="environmental">Environmental</option>
              <option value="legal">Legal</option>
            </select>
            {form.formState.errors.category && (
              <div className="text-body-sm color-destructive">
                {form.formState.errors.category.message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-sm">
              <label htmlFor="impact" className="text-body-sm form-label">
                Impact *
              </label>
              <select
                id="impact"
                className="rounded border  px-md py-sm"
                {...form.register('impact')}
              >
                <option value="very_low">Very Low</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </div>

            <div className="grid gap-sm">
              <label htmlFor="probability" className="text-body-sm form-label">
                Probability *
              </label>
              <select
                id="probability"
                className="rounded border  px-md py-sm"
                {...form.register('probability')}
              >
                <option value="very_low">Very Low</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
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
              <option value="">No project (organization-wide risk)</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
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
              <AlertTriangle className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Risk'}
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
