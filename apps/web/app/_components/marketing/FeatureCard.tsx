'use client';


import { Card, CardContent  } from '@ghxstship/ui';
import { Badge  } from '@ghxstship/ui';
import { LucideIcon } from 'lucide-react';
// import { typography } from '../../../../(marketing)/lib/typography';
import { cn } from '../lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  gradient?: string;
  className?: string;
  variant?: 'default' | 'hover' | 'compact';
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  gradient = 'from-primary to-accent',
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
            'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-sm',
            `bg-gradient-to-r ${gradient}`
          )}>
            <Icon className="h-6 w-6 text-background" />
          </div>
        )}
        
        {badge && (
          <Badge variant="secondary" className="mb-sm">
            {badge}
          </Badge>
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-sm">
            <Icon className="h-6 w-6 color-primary" />
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
            trend.direction === 'up' ? 'color-success' : 'color-error'
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
              className="w-12 h-12 rounded-full object-cover"
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
