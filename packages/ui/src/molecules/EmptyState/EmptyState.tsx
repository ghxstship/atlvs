/**
 * EmptyState Component — Empty State Display
 * Display when no data is available
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  /** Icon */
  icon?: LucideIcon;
  
  /** Title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Action button */
  action?: React.ReactNode;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState Component
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages"
 *   description="You don't have any messages yet"
 *   action={<Button>Send Message</Button>}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
    },
  };
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size].container}`}>
      {Icon && (
        <Icon className={`${sizeClasses[size].icon} text-muted-foreground mb-4`} />
      )}
      
      <h3 className={`font-semibold mb-2 ${sizeClasses[size].title}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-muted-foreground mb-6 max-w-md ${sizeClasses[size].description}`}>
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
