'use client';


import { Card, CardContent  } from '@ghxstship/ui';
import { LucideIcon } from 'lucide-react';
// import { typography } from '../../../../(marketing)/lib/typography';
import { cn } from '../lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  label?: string; // e.g., ATLVS or OPENDECK
  gradient?: string;
  className?: string;
  variant?: 'default' | 'hover' | 'compact';
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  label,
  gradient = 'from-primary to-secondary',
  className,
  variant = 'default'
}: FeatureCardProps) {
  const variants = {
    default: '',
    hover: 'group hover:shadow-floating transition-all duration-300 hover:-translate-y-1',
    compact: '',
  };

  return (
    <Card className={cn(variants[variant], className)}>
      <CardContent className="p-lg">
        {Icon && (
          <div className={cn(
            'inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg mb-sm',
            `bg-gradient-to-r ${gradient}`
          )}>
            <Icon className="h-icon-md w-icon-md text-background" />
          </div>
        )}
        
        {label && (
          <div className="mb-xs text-body-xs uppercase tracking-wide text-foreground/70">
            {label}
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-sm">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface StatsCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatsCard({
  value,
  label,
  icon: Icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <Card className={cn('text-center', className)}>
      <CardContent className="p-lg">
        {Icon && (
          <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg bg-accent/10 mb-sm">
            <Icon className="h-icon-md w-icon-md color-accent" />
          </div>
        )}
        
        <div className="text-2xl font-bold mb-xs">
          {value}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
        
        {trend && (
          <div className={cn(
            'text-body-sm form-label mt-xs',
            trend.direction === 'up' ? 'color-success' : 'color-destructive'
          )}>
            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  className
}: TestimonialCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-lg">
        <blockquote className="text-body mb-md italic">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center gap-xl">
          {avatar && (
            <img
              src={avatar}
              alt={author}
              className="w-icon-2xl h-icon-2xl rounded-full object-cover"
            />
          )}
          
          <div>
            <div className="text-body-sm">{author}</div>
            <div className="text-body-sm color-muted">
              {role}{company && ` at ${company}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
