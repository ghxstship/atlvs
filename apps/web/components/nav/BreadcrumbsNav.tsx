'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@ghxstship/ui';
import { routeRegistry, findByPath, RouteNode } from '../../lib/navigation/routeRegistry';

function resolveClickablePath(node: RouteNode | undefined): string | undefined {
  if (!node) return undefined;
  if (node.path) return node.path;
  const overview = node.children?.find((c: RouteNode) => c.label === 'Overview' && c.path);
  return overview?.path;
}

export function BreadcrumbsNav() {
  const pathname = usePathname();

  // Try to build breadcrumbs from centralized route registry
  const trail = findByPath(pathname, routeRegistry);
  let segments: { label: string; href: string }[] = [];

  if (trail.length > 0) {
    segments = trail.map((node: RouteNode) => ({
      label: node.label,
      href: resolveClickablePath(node) ?? '#',
    }));
  } else {
    // Fallback: split by path segments
    const parts = pathname.split('/').filter(Boolean);
    segments = parts.map((part, idx) => ({
      label: decodeURIComponent(part.charAt(0).toUpperCase() + part.slice(1)),
      href: '/' + parts.slice(0, idx + 1).join('/'),
    }));
  }

  return <Breadcrumbs segments={segments} LinkComponent={Link as any} />;
}
