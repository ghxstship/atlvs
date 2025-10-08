'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@ghxstship/ui';

import { routeRegistry, findByPath, RouteNode } from '../../../lib/navigation/routeRegistry';

function resolveClickablePath(node: RouteNode | undefined): string | undefined {
  if (!node) return undefined;
  if (node.path) return node.path;
  const overview = node.children?.find((c: RouteNode) => c.label === 'Overview' && c.path);
  return overview?.path;
}

export function BreadcrumbsNav() {
  const pathname = usePathname();

  const trail = findByPath(pathname, routeRegistry);

  const items = useMemo(() => {
    if (trail.length > 0) {
      return trail.map((node: RouteNode) => ({
        label: node.label,
        href: resolveClickablePath(node)
      }));
    }

    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, idx) => ({
      label: decodeURIComponent(part.charAt(0).toUpperCase() + part.slice(1)),
      href: '/' + parts.slice(0, idx + 1).join('/')
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, trail]);

  return <Breadcrumb items={items} showHome />;
}
