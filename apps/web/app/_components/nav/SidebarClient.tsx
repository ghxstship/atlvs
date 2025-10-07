"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from '@ghxstship/ui';
import { useTelemetry, trackSearchQuery } from "../../../lib/telemetry";
import { ProductToggle } from "./ProductToggle";

export type NavSection = { label: string; items: { label: string; href: string }[] };

export function SidebarClient({
  navSections,
  userId,
  entitlements,
  organizationName,
  productSwitcher,
  subtitleOverride,
}: {
  navSections: NavSection[];
  userId?: string;
  entitlements?: { feature_atlvs: boolean; feature_opendeck: boolean };
  organizationName?: string | null;
  productSwitcher?: React.ReactNode;
  subtitleOverride?: string;
}) {
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
    router.push(href);
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
    } catch (error) {
      console.error('Failed to persist pinned items', error);
    }
  }, [initialPins, trackFeatureUsage]);

  return (
    <Sidebar
      title="ATLVS"
      subtitle={subtitleOverride ?? organizationName ?? 'Command Center'}
      navSections={navSections}
      onNavigate={handleNavigate}
      onSearchChange={handleSearchChange}
      onToggleExpand={handleToggleExpand}
      onTogglePin={handleTogglePin}
      initialPinnedIds={initialPins}
      userId={userId}
      productSwitcher={productSwitcher ?? (
        entitlements ? (
          <ProductToggle
            atlvsEnabled={entitlements.feature_atlvs}
            opendeckEnabled={entitlements.feature_opendeck}
          />
        ) : null
      )}
    />
  );
}
