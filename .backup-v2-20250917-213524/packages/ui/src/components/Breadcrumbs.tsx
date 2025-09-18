import * as React from 'react';

export function Breadcrumbs({
  segments,
  LinkComponent,
}: {
  segments: { label: string; href: string }[];
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}) {
  const A: any = LinkComponent || 'a';
  const crumbs = segments;
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <A href="/">Home</A>
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-2">
          <span>/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-zinc-900 dark:text-zinc-100">{c.label}</span>
          ) : (
            <A href={c.href}>{c.label}</A>
          )}
        </span>
      ))}
    </div>
  );
}
