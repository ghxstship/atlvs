import { typography } from '../../lib/typography';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

export function FooterSection({ title, links }: FooterSectionProps) {
  const visibleLinks = links.slice(0, 4);
  const overflowLinks = links.slice(4);
  const hasOverflow = overflowLinks.length > 0;

  return (
    <div className="h-full">
      <h4 className={`${typography.cardTitle} mb-4 text-body-sm uppercase tracking-wide`}>
        {title}
      </h4>
      <div className="h-32 flex flex-col">
        {/* Always visible first 4 items */}
        <ul className="space-y-3 flex-shrink-0">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-body-sm color-muted hover:color-foreground transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        
        {/* Scrollable overflow items */}
        {hasOverflow && (
          <div className="flex-1 min-h-0 mt-3">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <ul className="space-y-3 pr-2">
                {overflowLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-body-sm color-muted hover:color-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
