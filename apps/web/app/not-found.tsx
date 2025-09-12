'use client';

import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>404</h1>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Page Not Found</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
