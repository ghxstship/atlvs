'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@ghxstship/ui/components/DropdownMenu';
import { Button } from '@ghxstship/ui/components/atomic/Button';
import { Breadcrumbs } from '@ghxstship/ui';
import { ChevronDown } from 'lucide-react';

import { routeRegistry, findByPath, RouteNode } from '../../../lib/navigation/routeRegistry';

type SelectorOption = {
  id: string;
  label: string;
  href: string;
};

function resolveClickablePath(node: RouteNode | undefined): string | undefined {
  if (!node) return undefined;
  if (node.path) return node.path;
  const overview = node.children?.find((c: RouteNode) => c.label === 'Overview' && c.path);
  return overview?.path;
}

function toSelectorOptions(nodes: RouteNode[] | undefined): SelectorOption[] {
  if (!nodes) return [];
  return nodes
    .filter((child) => child.path)
    .map((child) => ({
      id: child.id,
      label: child.label,
      href: child.path!,
    }));
}

export function BreadcrumbsNav() {
  const pathname = usePathname();
  const router = useRouter();

  const trail = findByPath(pathname, routeRegistry);

  const segments = useMemo(() => {
    if (trail.length > 0) {
      return trail.map((node: RouteNode) => ({
        label: node.label,
        href: resolveClickablePath(node) ?? '#',
        node,
      }));
    }

    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, idx) => ({
      label: decodeURIComponent(part.charAt(0).toUpperCase() + part.slice(1)),
      href: '/' + parts.slice(0, idx + 1).join('/'),
      node: undefined,
    }));
  }, [pathname, trail]);

  const selectorConfigs = segments.slice(0, Math.max(segments.length - 1, 0));
  const breadcrumbSegments = segments.map(({ label, href }) => ({ label, href }));

  const LinkAdapter = React.useCallback(
    ({ href, className, children }: { href: string; className?: string; children?: React.ReactNode }) => (
      <Link href={href} className={className}>
        {children}
      </Link>
    ),
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-sm">
      {selectorConfigs.map(({ label, href, node }) => {
        const childrenOptions = node?.children ? toSelectorOptions(node.children) : [];
        if (childrenOptions.length === 0) {
          return (
            <Button key={href} asChild variant="ghost" size="sm" className="text-sm font-medium">
              <Link href={href}>{label}</Link>
            </Button>
          );
        }

        return (
          <DropdownMenu key={href}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-xs text-sm font-medium">
                <span>{label}</span>
                <ChevronDown className="h-icon-2xs w-icon-2xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[220px]">
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {childrenOptions.map((option) => (
                <DropdownMenuItem key={option.id} onSelect={() => router.push(option.href)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push(href)}>
                Open {label}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
      <Breadcrumbs segments={breadcrumbSegments} LinkComponent={LinkAdapter} />
    </div>
  );
}
