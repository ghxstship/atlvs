import React from 'react';
import { Badge, BadgeProps } from './Badge';
import { Button, ButtonProps } from './Button';
import { Card, CardProps } from './Card';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Subway Line Types
export type SubwayLine = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'grey';

// Subway Line Configuration
const subwayLineConfig: Record<SubwayLine, {
  name: string;
  variant: string;
  meaning: string;
  examples: string[];
}> = {
  red: {
    name: 'Red Line',
    variant: 'subway-red',
    meaning: 'Destructive actions, urgent alerts, critical errors',
    examples: ['Delete', 'Error', 'Critical', 'Urgent', 'Stop']
  },
  blue: {
    name: 'Blue Line', 
    variant: 'subway-blue',
    meaning: 'Primary actions, navigation, main CTAs',
    examples: ['Save', 'Continue', 'Primary', 'Navigate', 'Proceed']
  },
  green: {
    name: 'Green Line',
    variant: 'subway-green', 
    meaning: 'Success states, completed actions, positive feedback',
    examples: ['Success', 'Complete', 'Approved', 'Active', 'Go']
  },
  orange: {
    name: 'Orange Line',
    variant: 'subway-orange',
    meaning: 'Warning states, pending actions, caution',
    examples: ['Warning', 'Pending', 'Review', 'Caution', 'Wait']
  },
  purple: {
    name: 'Purple Line',
    variant: 'subway-purple',
    meaning: 'Accent highlights, secondary actions, special features',
    examples: ['Feature', 'Accent', 'Special', 'Highlight', 'Premium']
  },
  yellow: {
    name: 'Yellow Line',
    variant: 'subway-yellow',
    meaning: 'Alternative warnings, notifications, attention',
    examples: ['Notify', 'Alert', 'Attention', 'Info', 'Update']
  },
  grey: {
    name: 'Grey Line',
    variant: 'subway-grey',
    meaning: 'Neutral states, disabled elements, inactive items',
    examples: ['Disabled', 'Inactive', 'Neutral', 'Draft', 'Paused']
  }
};

// Subway Badge Component
interface SubwayBadgeProps extends Omit<BadgeProps, 'variant'> {
  line: SubwayLine;
  stationName?: string;
}

export const SubwayBadge = React.forwardRef<HTMLDivElement, SubwayBadgeProps>(
  ({ line, stationName, children, className, ...props }, ref) => {
    const config = subwayLineConfig[line];
    
    return (
      <Badge
        ref={ref}
        variant={config.variant as any}
        className={twMerge(
          clsx(
            'font-mono uppercase tracking-wide',
            'border-2 border-current',
            'shadow-sm',
            className
          )
        )}
        title={`${config.name}: ${config.meaning}`}
        {...props}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-current opacity-80" />
          {stationName || children || line.toUpperCase()}
        </div>
      </Badge>
    );
  }
);

SubwayBadge.displayName = 'SubwayBadge';

// Subway Button Component
interface SubwayButtonProps extends Omit<ButtonProps, 'variant'> {
  line: SubwayLine;
}

export const SubwayButton = React.forwardRef<HTMLButtonElement, SubwayButtonProps>(
  ({ line, children, className, ...props }, ref) => {
    const config = subwayLineConfig[line];
    
    return (
      <Button
        ref={ref}
        variant={config.variant as any}
        className={twMerge(
          clsx(
            'font-mono uppercase tracking-wider',
            'border-2 border-current/20',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-200',
            className
          )
        )}
        title={config.meaning}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

SubwayButton.displayName = 'SubwayButton';

// Subway Card Component
interface SubwayCardProps extends Omit<CardProps, 'variant' | 'subwayLine'> {
  line: SubwayLine;
  station?: string;
}

export const SubwayCard = React.forwardRef<HTMLDivElement, SubwayCardProps>(
  ({ line, station, children, className, ...props }, ref) => {
    const config = subwayLineConfig[line];
    
    return (
      <Card
        ref={ref}
        variant="subway-accent"
        subwayLine={line}
        className={twMerge(
          clsx(
            'relative',
            'border-l-4',
            className
          )
        )}
        {...props}
      >
        {station && (
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
            <SubwayBadge line={line} stationName={station} size="sm" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              {config.name}
            </span>
          </div>
        )}
        {children}
      </Card>
    );
  }
);

SubwayCard.displayName = 'SubwayCard';

// Subway Status Indicator
interface SubwayStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  line: SubwayLine;
  status: 'operational' | 'delayed' | 'service-change' | 'not-operational';
  message?: string;
}

export const SubwayStatus = React.forwardRef<HTMLDivElement, SubwayStatusProps>(
  ({ line, status, message, className, ...props }, ref) => {
    const config = subwayLineConfig[line];
    
    const statusConfig = {
      operational: { color: 'text-success', icon: '●', label: 'Good Service' },
      delayed: { color: 'text-warning', icon: '◐', label: 'Delays' },
      'service-change': { color: 'text-info', icon: '◑', label: 'Service Change' },
      'not-operational': { color: 'text-destructive', icon: '○', label: 'No Service' }
    };
    
    const statusInfo = statusConfig[status];
    
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-card border border-border/50',
            className
          )
        )}
        {...props}
      >
        <SubwayBadge line={line} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={clsx('text-lg', statusInfo.color)}>
              {statusInfo.icon}
            </span>
            <span className="font-medium text-sm">
              {statusInfo.label}
            </span>
          </div>
          {message && (
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SubwayStatus.displayName = 'SubwayStatus';

// Subway Map Component (Visual representation)
interface SubwayMapProps extends React.HTMLAttributes<HTMLDivElement> {
  lines: Array<{
    line: SubwayLine;
    stations: string[];
    status?: 'operational' | 'delayed' | 'service-change' | 'not-operational';
  }>;
}

export const SubwayMap = React.forwardRef<HTMLDivElement, SubwayMapProps>(
  ({ lines, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'p-6 bg-card rounded-xl border border-border/50',
            'space-y-4',
            className
          )
        )}
        {...props}
      >
        <h3 className="font-display text-lg uppercase tracking-wide mb-4">
          System Status
        </h3>
        
        <div className="space-y-sm">
          {lines.map(({ line, stations, status = 'operational' }) => (
            <SubwayStatus
              key={line}
              line={line}
              status={status}
              message={`${stations.length} stations`}
            />
          ))}
        </div>
        
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }
);

SubwayMap.displayName = 'SubwayMap';

// Utility Functions
export const getSubwayLineConfig = (line: SubwayLine) => subwayLineConfig[line];

export const getSubwayLineForAction = (action: 'save' | 'delete' | 'warning' | 'success' | 'info' | 'neutral'): SubwayLine => {
  const actionMap: Record<string, SubwayLine> = {
    save: 'blue',
    delete: 'red', 
    warning: 'orange',
    success: 'green',
    info: 'purple',
    neutral: 'grey'
  };
  
  return actionMap[action] || 'grey';
};

export { subwayLineConfig };
