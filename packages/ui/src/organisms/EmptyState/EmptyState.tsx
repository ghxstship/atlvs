'use client';

import React, { useState } from 'react';
import { Button } from './atomic/Button';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  demoAction?: {
    label: string;
    onLoadDemo: () => Promise<void>;
    organizationId: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  demoAction,
  icon,
  className = ''
}: EmptyStateProps) {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleLoadDemo = async () => {
    if (!demoAction) return;
    
    setLoadingDemo(true);
    setDemoError(null);
    
    try {
      const response = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: demoAction.organizationId })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load demo data');
      }
      
      await demoAction.onLoadDemo();
      
      // Show success message
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('demo.loaded', {
          organization_id: demoAction.organizationId
        });
      }
    } catch (error: any) {
      setDemoError(error.message);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className={`text-center py-3xl ${className}`}>
      {icon && (
        <div className="flex justify-center mb-md text-muted-foreground">
          {icon}
        </div>
      )}
      
      <div className="text-lg font-medium mb-sm text-foreground">
        {title}
      </div>
      
      <div className="text-sm mb-lg text-muted-foreground max-w-md mx-auto">
        {description}
      </div>
      
      {demoError && (
        <div className="mb-md p-sm bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="text-sm text-destructive">{demoError}</div>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-x-sm">
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-x-xs"
            variant="default"
          >
            {primaryAction.icon || <Plus className="h-4 w-4" />}
            {primaryAction.label}
          </Button>
        )}
        
        {demoAction && (
          <Button
            onClick={handleLoadDemo}
            disabled={loadingDemo}
            className="inline-flex items-center gap-x-xs"
            variant="outline"
          >
            <Sparkles className="h-4 w-4" />
            {loadingDemo ? 'Loading Demo...' : demoAction.label}
          </Button>
        )}
      </div>
      
      {demoAction && (
        <div className="mt-sm text-xs text-muted-foreground">
          Demo includes pirate-themed sample data for immediate exploration
        </div>
      )}
    </div>
  );
}
