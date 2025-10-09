'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Badge, Card } from '@ghxstship/ui';
import { Shield, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  showTrustIndicators?: boolean;
  showFooter?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  badge,
  showTrustIndicators = true,
  showFooter = false
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(123,_97,_255,_0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(35,_182,_255,_0.12),_transparent_45%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="py-xl">
          <div className="mx-auto w-full max-w-md px-md text-center">
            <Link href="/" className="inline-flex items-center justify-center">
              <span className="text-heading-3 font-semibold tracking-tight text-gradient-accent">ATLVS</span>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-md pb-3xl">
          <Card className="w-full max-w-md border border-border/40 bg-card/95 p-xl shadow-lg shadow-primary/5">
            <div className="stack-lg text-center">
              {badge && (
                <Badge variant="secondary" className="mx-auto px-lg py-xs text-xs uppercase tracking-wide">
                  {badge}
                </Badge>
              )}
              <div className="stack-sm">
                <h2 className="text-heading-3 tracking-tight text-foreground">{title}</h2>
                <p className="text-body text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="my-xl">
              {children}
            </div>

            {showTrustIndicators && (
              <div className="border-t border-border/60 pt-lg">
                <div className="flex flex-col items-center gap-sm text-body-sm text-muted-foreground sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-xs">
                    <Shield className="h-3 w-3" />
                    <span>Enterprise grade security</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Users className="h-3 w-3" />
                    <span>Trusted by 50K+ teams</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>

        {showFooter && (
          <footer className="pb-xl">
            <div className="mx-auto w-full max-w-md px-md text-center text-body-sm text-muted-foreground">
              <p>
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-foreground underline-offset-4 transition hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-foreground underline-offset-4 transition hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
