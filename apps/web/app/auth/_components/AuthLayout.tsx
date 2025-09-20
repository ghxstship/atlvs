'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Badge } from '@ghxstship/ui';
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
    <div className="min-h-screen brand-ghostship bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="py-xl">
        <div className="content-width content-padding">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-heading-3 tracking-tight text-black">GHXSTSHIP</h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center content-padding pb-3xl">
        <div className="card w-full max-w-md p-xl">
          <div className="text-center stack-lg">
            {badge && (
              <Badge className="badge-secondary mx-auto">{badge}</Badge>
            )}
            <div className="stack-sm">
              <h2 className="text-heading-3 tracking-tight">{title}</h2>
              <p className="color-muted font-body">{subtitle}</p>
            </div>
          </div>

          <div className="my-xl">
            {children}
          </div>

          {/* Trust Indicators */}
          {showTrustIndicators && (
            <div className="pt-lg border-t border-muted">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-sm text-body-sm color-muted">
                <div className="cluster-xs flex items-center">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="cluster-xs flex items-center">
                  <Users className="h-3 w-3" />
                  <span>Trusted by 50K+ users</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="pb-xl">
          <div className="content-width content-padding">
            <div className="text-center">
              <p className="text-body-sm color-muted font-body">
                By continuing, you agree to our{' '}
                <Link href="/legal/terms" className="color-accent hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="color-accent hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
