'use client';


import { useEffect, useMemo, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Badge } from '@ghxstship/ui';

export default function NotificationsBell() {
  const sb = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: string; title: string; body?: string | null; href?: string | null; read: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await sb
      .from('user_notifications')
      .select('id,title,body,href,read,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const unread = items.filter(i => !i.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center rounded-md p-sm hover:bg-accent"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center badge badge-error px-xs text-[10px] rounded-full">
            {unread}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications" description="Your latest alerts">
        <div className="stack-sm">
          {loading ? (
            <div className="text-body-sm opacity-80">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-body-sm opacity-80">You're all caught up.</div>
          ) : (
            <ul className="stack-sm">
              {items.map((n: any) => (
                <li key={n.id} className="rounded border p-sm">
                  <div className="flex items-start justify-between gap-sm">
                    <div>
                      <div className="form-label">{n.title}</div>
                      {n.body ? <div className="text-body-sm opacity-80">{n.body}</div> : null}
                      {n.href ? (
                        <a href={n.href} className="text-body-sm color-accent underline underline-offset-2">View</a>
                      ) : null}
                    </div>
                    {!n.read ? <Check className="h-4 w-4 opacity-50" aria-hidden /> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-sm border-t">
            <Button>Refresh</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
