/**
 * LoadingPage Template
 * Full-page loading screen
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Spinner } from '../../atoms/Spinner/Spinner';

export interface LoadingPageProps {
  /** Loading message */
  message?: string;
}

/**
 * LoadingPage Template
 */
export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-background)]">
      <Spinner size="xl" variant="primary" />
      <p className="mt-4 text-[var(--color-foreground-secondary)]">
        {message}
      </p>
    </div>
  );
};

LoadingPage.displayName = 'LoadingPage';
