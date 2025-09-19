"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from '@ghxstship/ui';
import { useTelemetry, trackSearchQuery } from "../../../lib/telemetry";

export type NavSection = { label: string; items: { label: string; href: string }[] };

export function SidebarClient({ navSections }: { navSections: NavSection[] }) {
  const router = useRouter();
  const { trackFeatureUsage } = useTelemetry();
  const [initialPins, setInitialPins] = React.useState<string[] | undefined>(undefined);

  // Fetch initial pins on mount
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/user/pins', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setInitialPins(Array.isArray(json?.pins) ? json.pins : []);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNavigate = React.useCallback((href: string) => {
    trackFeatureUsage("Navigation", "navigate", { source: "sidebar", href });
    router.push(href as any);
  }, [router, trackFeatureUsage]);

  const handleSearchChange = React.useCallback((query: string, resultsCount: number) => {
    trackSearchQuery('Navigation', query, resultsCount);
  }, []);

  const handleToggleExpand = React.useCallback((itemId: string, expanded: boolean) => {
    trackFeatureUsage('Navigation', expanded ? 'expand' : 'collapse', { itemId });
  }, [trackFeatureUsage]);

  const handleTogglePin = React.useCallback(async (itemId: string, pinned: boolean) => {
    trackFeatureUsage('Navigation', pinned ? 'pin' : 'unpin', { itemId });
    try {
      // If initialPins is still undefined, fetch the latest before updating
      const currentPins = initialPins ?? [];
      const next = new Set(currentPins);
      if (pinned) next.add(itemId); else next.delete(itemId);
      const body = { pins: Array.from(next) };
      await fetch('/api/v1/user/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setInitialPins(body.pins);
    } catch {}
  }, [initialPins, trackFeatureUsage]);

  return (
    <Sidebar
      title="ATLVS"
      LinkComponent={Link as any}
      navSections={navSections}
      onNavigate={handleNavigate}
      onSearchChange={handleSearchChange}
      onToggleExpand={handleToggleExpand}
      onTogglePin={handleTogglePin}
      initialPinnedIds={initialPins}
    />
  );
}
