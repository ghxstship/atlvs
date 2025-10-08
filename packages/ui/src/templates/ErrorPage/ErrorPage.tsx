/**
 * ErrorPage Template
 * Error page template for 404, 500, etc.
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

export interface ErrorPageProps {
  /** Error code */
  code?: string | number;
  
  /** Error title */
  title?: string;
  
  /** Error message */
  message?: string;
  
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * ErrorPage Template
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  code = '404',
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist.',
  action,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-20 h-20 text-destructive" />
        </div>
        
        <div className="text-6xl font-bold text-foreground mb-4">
          {code}
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {title}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {message}
        </p>
        
        {action ? (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        ) : (
          <Button onClick={() => window.location.href = '/'} size="lg" icon={Home}>
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

ErrorPage.displayName = 'ErrorPage';
