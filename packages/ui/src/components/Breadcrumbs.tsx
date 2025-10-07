import * as React from 'react';

type BreadcrumbSegment = {
  label: string;
  href: string;
};

type BreadcrumbLinkProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
  LinkComponent?: React.ComponentType<BreadcrumbLinkProps>;
}

const DefaultLink: React.FC<BreadcrumbLinkProps> = ({ href, className, children }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export function Breadcrumbs({ segments, LinkComponent }: BreadcrumbsProps) {
  const LinkElement = LinkComponent ?? DefaultLink;

  return (
    <div className="flex items-center gap-sm text-sm text-muted-foreground/60">
      <LinkElement href="/">Home</LinkElement>
      {segments.map((segment, index) => (
        <span key={segment.href} className="flex items-center gap-sm">
          <span>/</span>
          {index === segments.length - 1 ? (
            <span className="text-foreground dark:text-muted-foreground/20">{segment.label}</span>
          ) : (
            <LinkElement href={segment.href}>{segment.label}</LinkElement>
          )}
        </span>
      ))}
    </div>
  );
}
