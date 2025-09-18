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
    <div>
      <h4 className={`${typography.cardTitle} mb-sm text-body-sm uppercase tracking-wide`}>
        {title}
      </h4>
      <div className="flex flex-col">
        {/* Always visible first 4 items */}
        <ul className="stack-xs flex-shrink-0">
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
          <div className="mt-xs">
            <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <ul className="stack-xs pr-2">
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
