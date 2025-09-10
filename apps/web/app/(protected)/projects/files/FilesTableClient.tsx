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
    setTags((p) => p.filter((t) => t.id !== tagId));
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
    } catch (e: any) {
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
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="sticky top-0">
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-left">Type</th>
            <th className="border-b p-2 text-left">Size</th>
            <th className="border-b p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-accent/20 cursor-pointer" onClick={() => onOpen(r.id)}>
              <td className="border-b p-2">{r.name}</td>
              <td className="border-b p-2">{r.mime_type || 'file'}</td>
              <td className="border-b p-2">{(((r.size ?? 0) / 1024) | 0)} KB</td>
              <td className="border-b p-2">{new Date(r.created_at).toLocaleString()}</td>
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
        {error ? <div role="alert" className="mb-2 text-sm text-red-600">{error}</div> : null}
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <div className="text-xs opacity-70">{current?.path}</div>
        </div>
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium"><Tag className="h-4 w-4" /> {t('tags.title')}</div>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tg) => (
              <span key={tg.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
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
                className="px-2 py-1 text-xs outline-none"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button onClick={addTag}>{t('tags.add')}</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm">Name</label>
          <input id="name" className="rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <Button variant="outline" onClick={onSave}><FileEdit className="mr-1 h-4 w-4" /> Save</Button>
          <Button variant="ghost" onClick={onDelete} title="Delete"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
        </div>
      </Drawer>
    </div>
  );
}
