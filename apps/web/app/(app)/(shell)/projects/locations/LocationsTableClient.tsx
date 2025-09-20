'use client';


import { useEffect, useMemo, useState } from 'react';
import { Drawer, Button, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, FileText, Activity as ActivityIcon, MessageSquare, MapPin, Users } from 'lucide-react';

export type LocationRow = { 
  id: string; 
  name: string; 
  address: string | null; 
  city: string | null; 
  state: string | null; 
  country: string | null; 
  type: string; 
  capacity: number | null;
  project_id: string | null;
  project?: { name: string };
};

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  type: z.enum(['venue', 'office', 'warehouse', 'studio', 'outdoor', 'virtual', 'other']),
  capacity: z.number().optional(),
  notes: z.string().optional(),
});

export default function LocationsTableClient({ rows, orgId }: { rows: LocationRow[]; orgId: string }) {
  const t = useTranslations('locations');
  const sb = useMemo(() => createBrowserClient(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'details' | 'edit' | 'comments' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; body: string; created_at: string }>>([]);
  const [activity, setActivity] = useState<Array<{ action: string; occurred_at: string }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = rows.find(r => r.id === openId) || null;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: current ? { 
      name: current.name, 
      address: current.address || '',
      city: current.city || '',
      state: current.state || '',
      country: current.country || '',
      type: current.type as any,
      capacity: current.capacity || undefined,
      notes: ''
    } : { 
      name: '', 
      address: '',
      city: '',
      state: '',
      country: '',
      type: 'venue' as any,
      capacity: undefined,
      notes: ''
    },
    mode: 'onChange'
  });

  // Load comments
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingComments(true);
      const { data: cs } = await sb
        .from('comments')
        .select('id,body,created_at')
        .eq('organization_id', orgId)
        .eq('entity_type', 'location')
        .eq('entity_id', openId)
        .order('created_at', { ascending: false })
        .limit(50);
      setComments(cs ?? []);
      setLoadingComments(false);
    })();
  }, [openId, sb, orgId]);

  // Load activity
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setLoadingActivity(true);
      try {
        const res = await fetch(`/api/audit/${orgId}/locations/${openId}`);
        const json = await res.json();
        setActivity(json?.data ?? []);
      } catch (e) {
        setError(e?.message || 'Failed to load activity');
      } finally {
        setLoadingActivity(false);
      }
    })();
  }, [openId, orgId]);

  // Autosave
  useEffect(() => {
    if (!openId) return;
    const sub = form.watch(async (values, info) => {
      if (!info.name) return;
      setSaving(true);
      setError(null);
      try {
        const patch = {};
        if (info.name === 'name') patch.name = values.name;
        if (info.name === 'address') patch.address = values.address;
        if (info.name === 'city') patch.city = values.city;
        if (info.name === 'state') patch.state = values.state;
        if (info.name === 'country') patch.country = values.country;
        if (info.name === 'type') patch.type = values.type;
        if (info.name === 'capacity') patch.capacity = values.capacity;
        if (info.name === 'notes') patch.notes = values.notes;
        
        const { error: upErr } = await sb.from('locations').update(patch).eq('id', openId).eq('organization_id', orgId);
        if (upErr) throw upErr;
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('location.updated', { organization_id: orgId, location_id: openId, keys: Object.keys(patch) });
        }
      } catch (e) {
        setError(e?.message || 'Save failed');
      } finally {
        setSaving(false);
      }
    });
    return () => sub?.unsubscribe?.();
  }, [openId, form, sb, orgId]);

  async function addComment(formData: FormData) {
    const body = String(formData.get('body') || '').trim();
    if (!body || !openId) return;
    const { data, error: insErr } = await sb.from('comments').insert({ 
      organization_id: orgId, 
      entity_type: 'location', 
      entity_id: openId, 
      body 
    }).select('id,body,created_at').maybeSingle();
    if (!insErr && data) setComments((prev: any) => [data, ...prev]);
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'venue': return 'bg-secondary/10 color-secondary-foreground';
      case 'office': return 'bg-accent/10 color-accent-foreground';
      case 'warehouse': return 'bg-secondary/50 color-muted';
      case 'studio': return 'bg-accent/50 color-accent-foreground';
      case 'outdoor': return 'bg-success/10 color-success-foreground';
      case 'virtual': return 'bg-info/10 text-info-foreground';
      default: return 'bg-secondary/50 color-muted';
    }
  };

  const formatAddress = (location: LocationRow) => {
    const parts = [location.address, location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-sm text-left">Location</th>
            <th className="border-b p-sm text-left">Type</th>
            <th className="border-b p-sm text-left">Address</th>
            <th className="border-b p-sm text-left">Capacity</th>
            <th className="border-b p-sm text-left">Project</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => { setOpenId(r.id); setTab('details'); }}>
              <td className="border-b p-sm">
                <div className="flex items-center gap-sm">
                  <MapPin className="w-4 h-4 color-accent" />
                  {r.name}
                </div>
              </td>
              <td className="border-b p-sm">
                <Badge className={getTypeColor(r.type)}>
                  {r.type}
                </Badge>
              </td>
              <td className="border-b p-sm text-body-sm color-muted">
                {formatAddress(r)}
              </td>
              <td className="border-b p-sm">
                {r.capacity ? (
                  <div className="flex items-center gap-xs">
                    <Users className="w-3 h-3" />
                    {r.capacity}
                  </div>
                ) : '-'}
              </td>
              <td className="border-b p-sm">{r.project?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.name || 'Location Details'}
        description={saving ? 'Saving changes...' : undefined}
        width="xl"
      >
        <div className="flex items-center gap-sm border-b pb-sm mb-sm" role="tablist">
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='details'?'bg-accent':''}`} onClick={() => setTab('details')} role="tab" aria-selected={tab==='details'}><FileText className="h-4 w-4" /> Details</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='edit'?'bg-accent':''}`} onClick={() => setTab('edit')} role="tab" aria-selected={tab==='edit'}><Edit3 className="h-4 w-4" /> Edit</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='comments'?'bg-accent':''}`} onClick={() => setTab('comments')} role="tab" aria-selected={tab==='comments'}><MessageSquare className="h-4 w-4" /> Comments</button>
          <button className={`inline-flex items-center gap-sm rounded px-sm py-xs text-body-sm ${tab==='activity'?'bg-accent':''}`} onClick={() => setTab('activity')} role="tab" aria-selected={tab==='activity'}><ActivityIcon className="h-4 w-4" /> Activity</button>
        </div>

        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}

        {tab === 'details' && (
          <div className="stack-sm text-body-sm">
            <div><span className="form-label">Name:</span> {current?.name}</div>
            <div className="flex items-center gap-sm">
              <span className="form-label">Type:</span>
              <Badge className={getTypeColor(current?.type || '')}>
                {current?.type}
              </Badge>
            </div>
            <div><span className="form-label">Address:</span> {formatAddress(current!)}</div>
            <div><span className="form-label">Capacity:</span> {current?.capacity || 'Not specified'}</div>
            <div><span className="form-label">Project:</span> {current?.project?.name || 'No project assigned'}</div>
          </div>
        )}

        {tab === 'edit' && current && (
          <form className="stack-sm" onSubmit={(e: any) => e.preventDefault()} aria-live="polite">
            <div className="grid gap-xs">
              <label htmlFor="name" className="text-body-sm form-label">Location Name</label>
              <input 
                id="name" 
                name="name" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('name') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('name', e.target.value, { shouldDirty: true })} 
                aria-invalid={!!form.formState.errors.name} 
              />
              {form.formState.errors.name ? <div className="text-body-sm color-destructive">{String(form.formState.errors.name.message)}</div> : null}
            </div>
            
            <div className="grid gap-xs">
              <label htmlFor="type" className="text-body-sm form-label">Type</label>
              <select 
                id="type" 
                name="type" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('type') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('type', e.target.value as any, { shouldDirty: true })}
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

            <div className="grid gap-xs">
              <label htmlFor="address" className="text-body-sm form-label">Address</label>
              <input 
                id="address" 
                name="address" 
                className="rounded border  px-md py-xs" 
                value={form.getValues('address') || ''} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('address', e.target.value, { shouldDirty: true })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <div className="grid gap-xs">
                <label htmlFor="city" className="text-body-sm form-label">City</label>
                <input 
                  id="city" 
                  name="city" 
                  className="rounded border  px-md py-xs" 
                  value={form.getValues('city') || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('city', e.target.value, { shouldDirty: true })} 
                />
              </div>

              <div className="grid gap-xs">
                <label htmlFor="state" className="text-body-sm form-label">State/Province</label>
                <input 
                  id="state" 
                  name="state" 
                  className="rounded border  px-md py-xs" 
                  value={form.getValues('state') || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('state', e.target.value, { shouldDirty: true })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <div className="grid gap-xs">
                <label htmlFor="country" className="text-body-sm form-label">Country</label>
                <input 
                  id="country" 
                  name="country" 
                  className="rounded border  px-md py-xs" 
                  value={form.getValues('country') || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('country', e.target.value, { shouldDirty: true })} 
                />
              </div>

              <div className="grid gap-xs">
                <label htmlFor="capacity" className="text-body-sm form-label">Capacity</label>
                <input 
                  id="capacity" 
                  name="capacity" 
                  type="number"
                  className="rounded border  px-md py-xs" 
                  value={form.getValues('capacity') || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('capacity', e.target.value ? parseInt(e.target.value) : undefined, { shouldDirty: true })} 
                />
              </div>
            </div>

            <div className="text-body-sm opacity-70">{form.formState.isDirty ? 'Unsaved changes' : 'All changes saved'}</div>
          </form>
        )}

        {tab === 'comments' && (
          <div className="stack-sm">
            <form action={addComment} className="flex items-start gap-sm">
              <textarea name="body" className="min-h-16 w-full rounded border p-sm" placeholder="Add a comment..." />
              <Button variant="default">Post</Button>
            </form>
            {loadingComments ? <div className="text-body-sm opacity-70">Loading comments...</div> : (
              <ul className="stack-sm">
                {comments.map(c => (
                  <li key={c.id} className="rounded border p-sm">
                    <div className="text-body-sm whitespace-pre-wrap">{c.body}</div>
                    <div className="text-body-sm opacity-60">{new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="stack-sm text-body-sm">
            {loadingActivity ? 'Loading activity...' : (
              <ul className="stack-xs">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-md">
                    <div className="font-mono text-body-sm opacity-70">{new Date(a.occurred_at).toLocaleString()}</div>
                    <div className="flex-1">{a.action}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
