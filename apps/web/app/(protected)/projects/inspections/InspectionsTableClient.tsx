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
  ClipboardCheck, 
  Calendar, 
  User, 
  Building, 
  MessageSquare, 
  Activity,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const editInspectionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['pre_event', 'post_event', 'safety', 'compliance', 'quality', 'other']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  scheduled_at: z.string().optional(),
  inspector_name: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
});

type InspectionRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
  project: { id: string; name: string } | null;
  inspector_name: string | null;
  created_at: string;
};

export default function InspectionsTableClient({ 
  orgId, 
  rows, 
  projects 
}: { 
  orgId: string; 
  rows: InspectionRow[]; 
  projects: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations('inspections');
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [activities, setActivities] = useState<Array<{ id: string; action: string; created_at: string }>>([]);

  const current = rows.find(r => r.id === openId) || null;

  const form = useForm<z.infer<typeof editInspectionSchema>>({
    resolver: zodResolver(editInspectionSchema),
    defaultValues: {
      title: '',
      type: 'pre_event',
      status: 'scheduled',
      scheduled_at: '',
      inspector_name: '',
      project_id: '',
      notes: '',
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'safety': return 'destructive';
      case 'compliance': return 'warning';
      case 'quality': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'cancelled': return AlertCircle;
      default: return Calendar;
    }
  };

  const onOpen = async (id: string) => {
    setOpenId(id);
    setActiveTab('details');
    const row = rows.find(r => r.id === id);
    if (row) {
      form.reset({
        title: row.title,
        type: row.type as any,
        status: row.status as any,
        scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString().slice(0, 16) : '',
        inspector_name: row.inspector_name || '',
        project_id: row.project?.id || '',
        notes: '',
      });

      // Load comments and activities
      const [commentsRes, activitiesRes] = await Promise.all([
        sb.from('comments')
          .select('id, content, created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'inspection')
          .eq('entity_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
        sb.from('activities')
          .select('id, action, created_at')
          .eq('organization_id', orgId)
          .eq('entity_type', 'inspection')
          .eq('entity_id', id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      setComments(commentsRes.data || []);
      setActivities(activitiesRes.data || []);
    }
  };

  const onSave = async (data: z.infer<typeof editInspectionSchema>) => {
    if (!openId) return;
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        ...data,
        project_id: data.project_id || null,
        scheduled_at: data.scheduled_at || null,
      };

      const { error: updateError } = await sb
        .from('inspections')
        .update(updateData)
        .eq('id', openId)
        .eq('organization_id', orgId);

      if (updateError) throw updateError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('inspection.updated', { 
          organization_id: orgId,
          inspection_id: openId,
          status: data.status
        });
      }

      router.refresh();
      setActiveTab('details');
    } catch (e: any) {
      setError(e?.message || 'Failed to update inspection');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!openId || !current) return;
    if (!confirm(`Delete inspection "${current.title}"? This action cannot be undone.`)) return;

    setSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await sb
        .from('inspections')
        .delete()
        .eq('id', openId)
        .eq('organization_id', orgId);

      if (deleteError) throw deleteError;

      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('inspection.deleted', { 
          organization_id: orgId,
          inspection_id: openId
        });
      }

      setOpenId(null);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete inspection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Inspection</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Project</th>
              <th className="text-left p-3 font-medium">Scheduled</th>
              <th className="text-left p-3 font-medium">Inspector</th>
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
                      <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{row.title}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getTypeColor(row.type)}>
                      {row.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <Badge variant={getStatusColor(row.status)}>
                        {row.status.replace('_', ' ')}
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
                    {row.scheduled_at ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(row.scheduled_at).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scheduled</span>
                    )}
                  </td>
                  <td className="p-3">
                    {row.inspector_name ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{row.inspector_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No inspections found. Create your first inspection to get started.
          </div>
        )}
      </div>

      <Drawer
        open={!!openId}
        onClose={() => {
          setOpenId(null);
          setError(null);
        }}
        title={current?.title || 'Inspection'}
        description={saving ? 'Saving...' : undefined}
       
      >
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
            {error}
          </div>
        )}

        <div className="flex border-b mb-4">
          {[
            { key: 'details', label: 'Details', icon: ClipboardCheck },
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
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1">
                  <Badge variant={getTypeColor(current.type)}>
                    {current.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(current.status)}>
                    {current.status.replace('_', ' ')}
                  </Badge>
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
                <label className="text-sm font-medium text-muted-foreground">Inspector</label>
                <div className="mt-1 text-sm">
                  {current.inspector_name || 'Unassigned'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Scheduled</label>
                <div className="mt-1 text-sm">
                  {current.scheduled_at 
                    ? new Date(current.scheduled_at).toLocaleString()
                    : 'Not scheduled'
                  }
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Completed</label>
                <div className="mt-1 text-sm">
                  {current.completed_at 
                    ? new Date(current.completed_at).toLocaleString()
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
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <input
                id="title"
                type="text"
                className="rounded border px-3 py-2"
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <div className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">Type *</label>
                <select
                  id="type"
                  className="rounded border px-3 py-2"
                  {...form.register('type')}
                >
                  <option value="pre_event">Pre-Event</option>
                  <option value="post_event">Post-Event</option>
                  <option value="safety">Safety</option>
                  <option value="compliance">Compliance</option>
                  <option value="quality">Quality</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">Status *</label>
                <select
                  id="status"
                  className="rounded border px-3 py-2"
                  {...form.register('status')}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="scheduled_at" className="text-sm font-medium">Scheduled Date</label>
                <input
                  id="scheduled_at"
                  type="datetime-local"
                  className="rounded border px-3 py-2"
                  {...form.register('scheduled_at')}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="inspector_name" className="text-sm font-medium">Inspector</label>
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
