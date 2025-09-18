import React from "react";
"use client";

import { AlertCircle, X } from 'lucide-react';

interface AuthErrorProps {
  error: string | null;
  variant?: 'inline' | 'banner';
  onDismiss?: () => void;
}

export function AuthError({ error, variant = 'inline', onDismiss }: AuthErrorProps) {
  if (!error) return null;

  if (variant === 'banner') {
    return (
      <div className="mb-md p-md bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-md">
        <AlertCircle className="h-5 w-5 color-destructive flex-shrink-0" />
        <p className="text-body-sm color-destructive flex-1">{error}</p>
        {onDismiss && (
          <button aria-label="button"
            role="button" tabIndex={0} onClick={onDismiss}
            className="color-destructive hover:color-destructive/80 transition-colors focus:outline-none focus:ring-primary focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <p className="mt-sm text-body-sm color-destructive" role="alert">
      {error}
    </p>
  );
}
