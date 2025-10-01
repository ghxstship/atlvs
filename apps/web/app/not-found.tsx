'use client';


import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-md" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-md mx-auto text-center">
        <div className="mb-md">
          <h1 className="text-display text-heading-3 mb-sm" style={{ color: 'hsl(var(--foreground))' }}>404</h1>
          <h2 className="text-heading-3 text-heading-4 mb-xs" style={{ color: 'hsl(var(--foreground))' }}>Page Not Found</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-sm">
              <Home className="h-icon-xs w-icon-xs" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-icon-xs w-icon-xs mr-sm" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
