'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer, Badge } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Rocket, 
  Calendar, 
  DollarSign, 
  Building, 
  MessageSquare, 
  Activity,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Play
} from 'lucide-react';

const editActivationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  status: z.enum(['planning', 'ready', 'active', 'completed', 'cancelled']),
  activation_date: z.string().optional(),
  completion_date: z.string().optional(),
  budget: z.number().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
});

type ActivationRow = {
  id: string;
  name: string;
  status: string;
  activation_date: string | null;
  completion_date: string | null;
  project: { id: string; name: string } | null;
  budget: number | null;
  created_at: string;
};

export default function ActivationsTableClient({ 
  orgId, 
  rows, 
  projects 
}: { 
  orgId: string; 
  rows: ActivationRow[]; 
  projects: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations('activations');
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [activities, setActivities] = useState<Array<{ id: string; action: string; created_at: string }>>([]);

  const current = rows.find(r => r.id === openId) || null;

  const form = useForm<z.infer<typeof editActivationSchema>>({
    resolver: zodResolver(editActivationSchema),
    defaultValues: {
      name: '',
      status: 'planning',
      activation_date: '',
      completion_date: '',
      budget: undefined,
      project_id: '',
      description: '',
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'warning';
      case 'ready': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'active': return Play;
      case 'ready': return Rocket;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const onOpen = async (id: string) => {
    setOpenId(id);
    setActiveTab('details');
    const row = rows.find(r => r.id === id);
    if (row) {
      form.reset({
        name: row.name,
        status: row.status as any,
        activation_date: row.activation_date ? new Date(row.activation_date).toISOString().slice(0, 16) : '',
        completion_date: row.completion_date ? new Date(row.completion_date).toISOString().slice(0, 16) : '',
        budget: row.budget || undefined,
        project_id: row.project?.id || '',
        description: '',
      });

      // Load comments and activities
      const [commentsRes, activitiesRes] = await Promise.all([
        sb.from('comments')
          .select('id, content, created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'activation')
          .eq('entity_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
        sb.from('activities')
          .select('id, action, created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'activation')
          .eq('entity_id', id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      setComments(commentsRes.data || []);
      setActivities(activitiesRes.data || []);
    }
  };

  const onSave = async (data: z.infer<typeof editActivationSchema>) => {
    if (!openId) return;
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        ...data,
        project_id: data.project_id || null,
        activation_date: data.activation_date || null,
        completion_date: data.completion_date || null,
        budget: data.budget || null,
      };

      const { error: updateError } = await sb
        .from('activations')
        .update(updateData)
        .eq('id', openId)
        .eq('organization_id', orgId);

      if (updateError) throw updateError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('activation.updated', { 
          organization_id: orgId,
          activation_id: openId,
          status: data.status
        });
      }

      router.refresh();
      setActiveTab('details');
    } catch (e: any) {
      setError(e?.message || 'Failed to update activation');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!openId || !current) return;
    if (!confirm(`Delete activation "${current.name}"? This action cannot be undone.`)) return;

    setSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await sb
        .from('activations')
        .delete()
        .eq('id', openId)
        .eq('organization_id', orgId);

      if (deleteError) throw deleteError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('activation.deleted', { 
          organization_id: orgId,
          activation_id: openId
        });
      }

      setOpenId(null);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete activation');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'No budget';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Activation</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Project</th>
              <th className="text-left p-3 font-medium">Activation Date</th>
              <th className="text-left p-3 font-medium">Budget</th>
              <th className="text-left p-3 font-medium">Completion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const StatusIcon = getStatusIcon(row.status);
              return (
                <tr 
                  key={row.id} 
                  className="border-b hover:bg-accent/50 cursor-pointer"
                  onClick={() => onOpen(row.id)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <Badge variant={getStatusColor(row.status)}>
                        {row.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3">
                    {row.project ? (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{row.project.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No project</span>
                    )}
                  </td>
                  <td className="p-3">
                    {row.activation_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(row.activation_date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{formatCurrency(row.budget)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {row.completion_date ? (
                      <span>{new Date(row.completion_date).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-muted-foreground">Ongoing</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No activations found. Create your first activation to get started.
          </div>
        )}
      </div>

      <Drawer
        open={!!openId}
        onClose={() => {
          setOpenId(null);
          setError(null);
        }}
        title={current?.name || 'Activation'}
        description={saving ? 'Saving...' : undefined}
       
      >
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
            {error}
          </div>
        )}

        <div className="flex border-b mb-4">
          {[
            { key: 'details', label: 'Details', icon: Rocket },
            { key: 'edit', label: 'Edit', icon: Edit },
            { key: 'comments', label: 'Comments', icon: MessageSquare },
            { key: 'activity', label: 'Activity', icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'details' && current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(current.status)}>
                    {current.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget</label>
                <div className="mt-1 text-sm">
                  {formatCurrency(current.budget)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project</label>
                <div className="mt-1 text-sm">
                  {current.project?.name || 'No project assigned'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div className="mt-1 text-sm">
                  {new Date(current.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Activation Date</label>
                <div className="mt-1 text-sm">
                  {current.activation_date 
                    ? new Date(current.activation_date).toLocaleString()
                    : 'Not scheduled'
                  }
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                <div className="mt-1 text-sm">
                  {current.completion_date 
                    ? new Date(current.completion_date).toLocaleString()
                    : 'Not completed'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name *</label>
              <input
                id="name"
                type="text"
                className="rounded border px-3 py-2"
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
                <label htmlFor="status" className="text-sm font-medium">Status *</label>
                <select
                  id="status"
                  className="rounded border px-3 py-2"
                  {...form.register('status')}
                >
                  <option value="planning">Planning</option>
                  <option value="ready">Ready</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="budget" className="text-sm font-medium">Budget ($)</label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  className="rounded border px-3 py-2"
                  placeholder="0.00"
                  {...form.register('budget', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="activation_date" className="text-sm font-medium">Activation Date</label>
                <input
                  id="activation_date"
                  type="datetime-local"
                  className="rounded border px-3 py-2"
                  {...form.register('activation_date')}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="completion_date" className="text-sm font-medium">Completion Date</label>
                <input
                  id="completion_date"
                  type="datetime-local"
                  className="rounded border px-3 py-2"
                  {...form.register('completion_date')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="project_id" className="text-sm font-medium">Project</label>
              <select
                id="project_id"
                className="rounded border px-3 py-2"
                {...form.register('project_id')}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Comments functionality would be implemented here
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Activity log functionality would be implemented here
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
