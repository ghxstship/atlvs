"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTelemetry, trackSearchQuery } from "../../../lib/telemetry";

export type NavSection = { label: string; items: { label: string; href: string }[] };

type Command = {
  id: string;
  label: string;
  href: string;
  group: string;
};

export function CommandPalette({ navSections }: { navSections: NavSection[] }) {
  const router = useRouter();
  const { trackFeatureUsage } = useTelemetry();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const commands = React.useMemo<Command[]>(() => {
    const items: Command[] = [];
    for (const section of navSections) {
      for (const item of section.items) {
        items.push({
          id: `${section.label}:${item.label}`.toLowerCase().replace(/\s+/g, "-"),
          label: `${section.label} — ${item.label}`,
          href: item.href,
          group: section.label,
        });
      }
    }
    return items;
  }, [navSections]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  // Keyboard shortcut Cmd/Ctrl+K
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Telemetry for search queries
  React.useEffect(() => {
    trackSearchQuery('CommandPalette', query, filtered.length);
  }, [query, filtered.length]);

  const onSelect = (cmd: Command) => {
    trackFeatureUsage('CommandPalette', 'navigate', { href: cmd.href, label: cmd.label });
    setOpen(false);
    router.push(cmd.href as any);
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Command Palette" className="fixed inset-0 z-50 flex items-start justify-center p-md">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl rounded-xl bg-card shadow-popover border border-border overflow-hidden">
        <div className="p-sm border-b border-border">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="Search modules and pages (⌘K)"
            className="w-full bg-transparent outline-none text-sm  px-md py-xs"
            aria-label="Search commands"
          />
        </div>
        <div className="max-h-container-md overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-md text-sm text-muted-foreground">No results</div>
          ) : (
            <ul className="p-sm">
              {filtered.map(cmd => (
                <li key={cmd.id}>
                  <button
                    className="w-full text-left  px-md py-sm rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => onSelect(cmd)}
                  >
                    <div className="text-sm">{cmd.label}</div>
                    <div className="text-xs text-muted-foreground">{cmd.href}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
