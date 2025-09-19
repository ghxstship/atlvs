'use client';


import { useMemo, useState } from 'react';
import { Drawer, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { Trash2, FileEdit, FileText, Tag, X as XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type FileRow = { id: string; name: string; path: string; mime_type: string | null; size: number | null; created_at: string };

export default function FilesTableClient({ rows, orgId }: { rows: FileRow[]; orgId: string }) {
  const t = useTranslations('files');
  const sb = useMemo(() => createBrowserClient(), []);
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Array<{ id: string; tag: string }>>([]);
  const [tagInput, setTagInput] = useState('');

  const current = rows.find(r => r.id === openId) || null;

  function onOpen(id: string) {
    setOpenId(id);
    const row = rows.find(r => r.id === id);
    setName(row?.name || '');
    // Load tags
    (async () => {
      const { data } = await sb
        .from('tags')
        .select('id,tag')
        .eq('organization_id', orgId)
        .eq('entity_type', 'file')
        .eq('entity_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      setTags(data ?? []);
    })();
  }

  async function addTag() {
    if (!openId) return;
    const value = tagInput.trim();
    if (!value) return;
    const optimistic = { id: `tmp-${Date.now()}`, tag: value };
    setTags((prev: any) => [optimistic, ...prev]);
    setTagInput('');
    const { data, error } = await sb
      .from('tags')
      .insert({ organization_id: orgId, entity_type: 'file', entity_id: openId, tag: value })
      .select('id,tag')
      .maybeSingle();
    if (error) {
      // rollback
      setTags((prev: any) => prev.filter((t: any) => t.id !== optimistic.id));
    } else if (data) {
      setTags((prev: any) => [data, ...prev.filter((t: any) => t.id !== optimistic.id)]);
    }
  }

  async function removeTag(tagId: string) {
    if (!openId) return;
    const prev = tags.slice();
    setTags((p: any) => p.filter((t: any) => t.id !== tagId));
    const { error } = await sb
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('entity_type', 'file')
      .eq('entity_id', openId)
      .eq('organization_id', orgId);
    if (error) setTags((prev: any) => prev); // rollback
  }

  async function onSave() {
    if (!openId) return;
    setSaving(true);
    setError(null);
    try {
      const { error: upErr } = await sb
        .from('files')
        .update({ name })
        .eq('id', openId)
        .eq('organization_id', orgId);
      if (upErr) throw upErr;
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('file.renamed', { organization_id: orgId, file_id: openId });
      }
      await sb.from('user_notifications').insert({
        organization_id: orgId,
        title: 'File updated',
        body: `${name} updated`,
        href: '/projects/files'
      });
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!openId || !current) return;
    if (!confirm('Delete this file permanently? This will remove the stored object as well.')) return;
    setSaving(true);
    setError(null);
    try {
      const path = current.path;
      const { error: delObjErr } = await sb.storage.from('attachments').remove([path]);
      if (delObjErr) throw delObjErr;
      const { error: delErr } = await sb.from('files').delete().eq('id', openId).eq('organization_id', orgId);
      if (delErr) throw delErr;
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('file.deleted', { organization_id: orgId, file_id: openId, path });
      }
      await sb.from('user_notifications').insert({
        organization_id: orgId,
        title: 'File deleted',
        body: `${current.name} deleted`,
        href: '/projects/files'
      });
      setOpenId(null);
      router.refresh();
    } catch (e) {
      setError(e?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-sm text-left">Name</th>
            <th className="border-b p-sm text-left">Type</th>
            <th className="border-b p-sm text-left">Size</th>
            <th className="border-b p-sm text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => onOpen(r.id)}>
              <td className="border-b p-sm">{r.name}</td>
              <td className="border-b p-sm">{r.mime_type || 'file'}</td>
              <td className="border-b p-sm">{(((r.size ?? 0) / 1024) | 0)} KB</td>
              <td className="border-b p-sm">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={current?.name || t('title')}
        description={saving ? 'Saving…' : undefined}
       
      >
        {error ? <div role="alert" className="mb-sm text-body-sm color-destructive">{error}</div> : null}
        <div className="mb-sm flex items-center gap-sm">
          <FileText className="h-4 w-4" />
          <div className="text-body-sm opacity-70">{current?.path}</div>
        </div>
        <div className="mb-sm">
          <div className="mb-xs flex items-center gap-sm text-body-sm form-label"><Tag className="h-4 w-4" /> {t('tags.title')}</div>
          <div className="flex flex-wrap items-center gap-sm">
            {tags.map((tg: any) => (
              <span key={tg.id} className="inline-flex items-center gap-xs rounded-full border  px-md py-0.5 text-body-sm">
                {tg.tag}
                <button type="button" className="opacity-60 hover:opacity-100" aria-label={t('tags.remove')} title={t('tags.remove')} onClick={() => removeTag(tg.id)}>
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-stretch overflow-hidden rounded border">
              <input
                aria-label={t('tags.addPlaceholder')}
                placeholder={t('tags.addPlaceholder')}
                className=" px-md py-xs text-body-sm outline-none"
                value={tagInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button onClick={addTag}>{t('tags.add')}</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-xs">
          <label htmlFor="name" className="text-body-sm">Name</label>
          <input id="name" className="rounded border  px-md py-xs" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        </div>
        <div className="mt-sm flex items-center justify-between gap-sm border-t pt-sm">
          <Button variant="outline" onClick={onSave}><FileEdit className="mr-xs h-4 w-4" /> Save</Button>
          <Button variant="ghost" onClick={onDelete} title="Delete"><Trash2 className="mr-xs h-4 w-4" /> Delete</Button>
        </div>
      </Drawer>
    </div>
  );
}
