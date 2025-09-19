import { Github, Linkedin, Youtube } from 'lucide-react';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { icon: XIcon, href: 'https://x.com/ghxstship_xyz', label: 'X' },
  { icon: Linkedin, href: 'https://linkedin.com/company/ghxstship', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/ghxstship', label: 'GitHub' },
  { icon: Youtube, href: 'https://youtube.com/@ghxstship', label: 'YouTube' },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-md">
      {socialLinks.map((social: any) => {
        const Icon = social.icon;
        return (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="color-muted hover:color-foreground transition-colors"
            aria-label={social.label}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
